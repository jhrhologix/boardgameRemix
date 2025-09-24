import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase' // Use singleton client
import type { BGGGame } from '@/lib/bgg-api'

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
}

export function useSubmitRemixForm(userId: string, remixId?: string) {
  const router = useRouter()
  
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

    setFormState(prev => ({ ...prev, isSubmitting: true, error: null }))

    try {
      // Verify user is still authenticated
      const { data: { user }, error: sessionError } = await supabase.auth.getUser()
      
      if (sessionError || !user) {
        throw new Error("Authentication error. Please try logging in again.")
      }

      const remixData = {
        title: formState.data.title.trim(),
        description: formState.data.description.trim(),
        difficulty: formState.data.difficulty,
        user_id: userId,
        rules: formState.data.rules.trim(),
        setup_instructions: formState.data.setupInstructions.trim(),
        youtube_url: formState.data.youtubeUrl.trim() || null,
        max_players: formState.data.maxPlayers ? parseInt(formState.data.maxPlayers) : null,
      }

      let remix
      
      if (remixId) {
        // Update existing remix
        const { data: updatedRemix, error: updateError } = await supabase
          .from("remixes")
          .update(remixData)
          .eq('id', remixId)
          .select()
          .single()

        if (updateError) throw new Error(updateError.message || "Failed to update remix")
        remix = updatedRemix
      } else {
        // Create new remix
        const { data: newRemix, error: insertError } = await supabase
          .from("remixes")
          .insert(remixData)
          .select()
          .single()

        if (insertError) throw new Error(insertError.message || "Failed to create remix")
        remix = newRemix
      }

      if (!remix) throw new Error("No remix data returned")

      // Handle relationships (games, hashtags, tags)
      await handleRemixRelationships(remix.id)

      // Reset reCAPTCHA
      if (recaptchaRef.current) {
        recaptchaRef.current.reset()
      }

      // Redirect to the remix page
      router.push(`/remixes/${remix.id}`)
      return true

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

  // Handle remix relationships (games, hashtags, tags)
  const handleRemixRelationships = async (remixId: string) => {
    // If editing, first delete existing relationships
    if (remixId) {
      await Promise.all([
        supabase.from("remix_games").delete().eq('remix_id', remixId),
        supabase.from("remix_hashtags").delete().eq('remix_id', remixId),
        supabase.from("remix_tags").delete().eq('remix_id', remixId)
      ])
    }

    // Handle games
    for (const game of formState.data.selectedGames) {
      // Insert or get the BGG game
      const { data: bggGame, error: bggError } = await supabase
        .from("bgg_games")
        .upsert({
          bgg_id: game.id,
          name: game.name,
          image_url: game.image,
          year_published: game.yearPublished,
          bgg_url: game.bggUrl || `https://boardgamegeek.com/boardgame/${game.id}`,
        }, {
          onConflict: 'bgg_id'
        })
        .select()
        .single()

      if (bggError) throw new Error(`Failed to save game: ${bggError.message}`)

      // Create remix-game relationship
      const { error: relationError } = await supabase
        .from("remix_games")
        .insert({
          remix_id: remixId,
          bgg_game_id: bggGame.id
        })

      if (relationError) throw new Error(`Failed to link game: ${relationError.message}`)
    }

    // Handle hashtags
    for (const hashtagName of formState.data.hashtags) {
      // Insert or get the hashtag
      const { data: hashtag, error: hashtagError } = await supabase
        .from("hashtags")
        .upsert({
          name: hashtagName.toLowerCase().trim()
        }, {
          onConflict: 'name'
        })
        .select()
        .single()

      if (hashtagError) throw new Error(`Failed to save hashtag: ${hashtagError.message}`)

      // Create remix-hashtag relationship
      const { error: relationError } = await supabase
        .from("remix_hashtags")
        .insert({
          remix_id: remixId,
          hashtag_id: hashtag.id
        })

      if (relationError) throw new Error(`Failed to link hashtag: ${relationError.message}`)
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
