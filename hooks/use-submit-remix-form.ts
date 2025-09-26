import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase' // Use singleton client
import type { BGGGame } from '@/lib/bgg-api'
import { useContentModeration } from './use-content-moderation'
import { useAuth } from '@/lib/auth'
import { createRemix, updateRemix } from '@/lib/actions-remix'

export interface FormData {
  title: string
  description: string
  difficulty: string
  selectedGames: BGGGame[]
  rules: string
  setupInstructions: string
  youtubeUrl: string
  maxPlayers: string
  hashtags: string[]
}

export interface FormState {
  data: FormData
  isSubmitting: boolean
  error: string | null
  captchaToken: string | null
  captchaError: string | null
  moderationStatus: 'pending' | 'approved' | 'rejected' | 'escalated' | null
  moderationMessage: string | null
}

export function useSubmitRemixForm(userId: string, remixId?: string) {
  const router = useRouter()
  const { moderateContent, loading: moderationLoading, error: moderationError } = useContentModeration()
  const { user } = useAuth()
  
  const [formState, setFormState] = useState<FormState>({
    data: {
      title: '',
      description: '',
      difficulty: '',
      selectedGames: [],
      rules: '',
      setupInstructions: '',
      youtubeUrl: '',
      maxPlayers: '',
      hashtags: [],
    },
    isSubmitting: false,
    error: null,
    captchaToken: null,
    captchaError: null,
    moderationStatus: null,
    moderationMessage: null,
  })

  const [existingTags, setExistingTags] = useState<string[]>([])
  const recaptchaRef = useRef<any>(null)

  // Check if reCAPTCHA is properly configured
  const hasValidRecaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && 
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY !== 'your_site_key_here' &&
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY.length > 10

  // Debug reCAPTCHA configuration
  console.log('reCAPTCHA Debug:', {
    hasKey: !!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
    keyLength: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.length,
    keyPrefix: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.substring(0, 10),
    hasValidKey: hasValidRecaptchaKey
  })

  // Load existing remix data if editing
  useEffect(() => {
    async function loadExistingHashtags() {
      try {
        const { data: hashtags, error } = await supabase
          .from('hashtags')
          .select('name')
          .order('name')
          .limit(50)
        
        if (!error && hashtags) {
          setExistingTags(hashtags.map(h => h.name))
        }
      } catch (error) {
        console.error('Error loading existing hashtags:', error)
      }
    }

    loadExistingHashtags()
  }, [])

  useEffect(() => {
    if (!remixId) return

    async function loadRemixData() {
      try {
        const { data: remix, error: remixError } = await supabase
          .from('remixes')
          .select(`
            *,
            bgg_games:remix_games (
              game:bgg_game_id (
                bgg_id,
                name,
                image_url,
                year_published,
                bgg_url
              )
            ),
            hashtags:remix_hashtags (
              hashtag:hashtag_id (
                id,
                name
              )
            )
          `)
          .eq('id', remixId)
          .single()

        if (remixError) {
          console.error('Error loading remix:', remixError)
          setFormState(prev => ({ ...prev, error: 'Failed to load remix data' }))
          return
        }

        if (remix) {
          setFormState(prev => ({
            ...prev,
            data: {
              title: remix.title || '',
              description: remix.description || '',
              difficulty: remix.difficulty || '',
              selectedGames: remix.bgg_games?.map((g: any) => ({
                id: g.game.bgg_id,
                name: g.game.name,
                image: g.game.image_url,
                yearPublished: g.game.year_published,
                bggUrl: g.game.bgg_url,
              })) || [],
              rules: remix.rules || '',
              setupInstructions: remix.setup_instructions || '',
              youtubeUrl: remix.youtube_url || '',
              maxPlayers: remix.max_players?.toString() || '',
              hashtags: remix.hashtags?.map((h: any) => h.hashtag.name) || [],
            }
          }))
        }
      } catch (error) {
        console.error('Error in loadRemixData:', error)
        setFormState(prev => ({ ...prev, error: 'Failed to load remix data' }))
      }
    }

    loadRemixData()
  }, [remixId, supabase])

  // Load existing hashtags
  useEffect(() => {
    async function loadHashtags() {
      try {
        const { data: tags, error } = await supabase
          .from('hashtags')
          .select('name')
          .order('name')

        if (error) {
          console.error('Error loading hashtags:', error)
          return
        }

        setExistingTags(tags?.map(t => t.name) || [])
      } catch (error) {
        console.error('Error in loadHashtags:', error)
      }
    }

    loadHashtags()
  }, [supabase])

  // Form validation
  const validateForm = (): string | null => {
    const { data } = formState

    if (!data.title.trim()) return "Title is required"
    if (!data.description.trim()) return "Description is required"
    if (!data.difficulty) return "Difficulty level is required"
    if (!data.rules.trim()) return "Game rules are required"
    if (!data.setupInstructions.trim()) return "Setup instructions are required"
    if (data.selectedGames.length < 1) return "Please select at least 1 board game for your remix"
    if (data.maxPlayers && isNaN(Number(data.maxPlayers))) return "Maximum players must be a number"
    
    if (hasValidRecaptchaKey && !formState.captchaToken) {
      return "Please verify that you are human"
    }

    return null
  }

  // Update form data
  const updateFormData = (updates: Partial<FormData>) => {
    setFormState(prev => ({
      ...prev,
      data: { ...prev.data, ...updates }
    }))
  }

  // Update form state
  const updateFormState = (updates: Partial<FormState>) => {
    setFormState(prev => ({ ...prev, ...updates }))
  }

  // Submit form
  const submitForm = async () => {
    const validationError = validateForm()
    if (validationError) {
      setFormState(prev => ({ ...prev, error: validationError }))
      return false
    }

    // Validate userId before proceeding
    if (!userId || userId.trim() === '') {
      setFormState(prev => ({ ...prev, error: "User ID is missing. Please refresh the page and try again." }))
      return false
    }

    setFormState(prev => ({ ...prev, isSubmitting: true, error: null, moderationStatus: null, moderationMessage: null }))

    try {
      // Verify user is still authenticated
      if (!user) {
        throw new Error("Authentication error. Please try logging in again.")
      }

      // Double-check that the user ID matches
      if (user.id !== userId) {
        throw new Error("User ID mismatch. Please refresh the page and try again.")
      }

      const remixData = {
        title: formState.data.title.trim(),
        description: formState.data.description.trim(),
        difficulty: formState.data.difficulty,
        rules: formState.data.rules.trim(),
        setup_instructions: formState.data.setupInstructions.trim(),
        youtube_url: formState.data.youtubeUrl.trim() || undefined,
        max_players: formState.data.maxPlayers ? parseInt(formState.data.maxPlayers) : undefined,
      }

      // Prepare relationships data
      const games = formState.data.selectedGames.map(game => ({
        bgg_game_id: game.id
      }))

      const hashtags = formState.data.hashtags.map(hashtag => ({
        name: hashtag
      }))

      const tags: { name: string }[] = [] // Add tags if needed

      let result
      
      if (remixId) {
        // Update existing remix
        result = await updateRemix(remixId, remixData, games, hashtags, tags, userId)
      } else {
        // Create new remix
        result = await createRemix(remixData, games, hashtags, tags, userId)
      }

      if (!result.success || !result.remix) {
        throw new Error("Failed to save remix")
      }

      const remix = result.remix

      // Run content moderation
      const moderationResult = await moderateContent({
        contentType: 'remix',
        contentId: remix.id,
        title: formState.data.title.trim(),
        description: formState.data.description.trim(),
        rules: formState.data.rules.trim(),
        imageUrls: [] // TODO: Add image URLs when available
      })

      if (moderationResult) {
        if (moderationResult.approved) {
          // Content approved, proceed normally
          setFormState(prev => ({ 
            ...prev, 
            isSubmitting: false,
            moderationStatus: 'approved',
            moderationMessage: moderationResult.bypassed ? 'Admin/Moderator bypass' : 'Content approved'
          }))

          // Reset reCAPTCHA
          if (recaptchaRef.current) {
            recaptchaRef.current.reset()
          }

          // Redirect to the remix page
          router.push(`/remixes/${remix.id}`)
          return true
        } else {
          // Content needs moderation
          setFormState(prev => ({ 
            ...prev, 
            isSubmitting: false,
            moderationStatus: moderationResult.escalated ? 'escalated' : 'pending',
            moderationMessage: moderationResult.message || 'Content is under review'
          }))
          return false
        }
      } else {
        // Moderation failed, show error
        setFormState(prev => ({ 
          ...prev, 
          isSubmitting: false,
          error: moderationError || 'Moderation failed. Please try again.'
        }))
        return false
      }

    } catch (error) {
      console.error('Error submitting remix:', error)
      setFormState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to submit remix',
        isSubmitting: false 
      }))
      return false
    }
  }


  return {
    formState,
    existingTags,
    hasValidRecaptchaKey,
    recaptchaRef,
    updateFormData,
    updateFormState,
    submitForm,
  }
}
