"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { BGGGame } from "@/lib/bgg-api"
import BGGGameSearch from "./bgg-game-search"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types'
import { AlertCircle, Loader2, X, Hash, Check, Plus } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface SubmitRemixFormProps {
  userId: string
  remixId?: string
}

export default function SubmitRemixForm({ userId, remixId }: SubmitRemixFormProps) {
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [difficulty, setDifficulty] = useState<string>("")
  const [selectedGames, setSelectedGames] = useState<BGGGame[]>([])
  const [rules, setRules] = useState("")
  const [setupInstructions, setSetupInstructions] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [maxPlayers, setMaxPlayers] = useState("")

  // Tag state
  const [hashtag, setHashtag] = useState("")
  const [hashtags, setHashtags] = useState<string[]>([])
  const [existingTags, setExistingTags] = useState<string[]>([])
  const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false)

  // Load existing remix data if editing
  useEffect(() => {
    async function loadRemixData() {
      if (!remixId) return

      console.log('Loading remix data for ID:', remixId)

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
        console.error('Error loading remix:', remixError.message, remixError.details)
        setError(`Failed to load remix data: ${remixError.message}`)
        return
      }

      if (!remix) {
        console.error('No remix found with ID:', remixId)
        setError('Remix not found')
        return
      }

      console.log('Loaded remix data:', remix)

      try {
        setTitle(remix.title || '')
        setDescription(remix.description || '')
        setDifficulty(remix.difficulty || '')
        setRules(remix.rules || '')
        setSetupInstructions(remix.setup_instructions || '')
        setYoutubeUrl(remix.youtube_url || '')
        setMaxPlayers(remix.max_players?.toString() || '')
        
        // Set selected games
        const games = remix.bgg_games
          .filter(gameRel => gameRel.game) // Filter out any null game references
          .map(gameRel => ({
            id: gameRel.game.bgg_id,
            name: gameRel.game.name,
            yearPublished: gameRel.game.year_published,
            image: gameRel.game.image_url,
            bggUrl: gameRel.game.bgg_url,
            thumbnail: gameRel.game.image_url // Add thumbnail for consistency
          }))
        console.log('Processed games:', games)
        setSelectedGames(games)

        // Set hashtags
        const tags = remix.hashtags
          .filter(hashtagRel => hashtagRel.hashtag) // Filter out any null hashtag references
          .map(hashtagRel => hashtagRel.hashtag.name)
        console.log('Processed hashtags:', tags)
        setHashtags(tags)
      } catch (err) {
        console.error('Error processing remix data:', err)
        setError('Error processing remix data')
      }
    }

    loadRemixData()
  }, [remixId, supabase])

  // Fetch existing tags on component mount
  useEffect(() => {
    async function fetchExistingTags() {
      console.log('Fetching tags...')
      const { data: tags, error } = await supabase
        .from('tags')
        .select('name')
        .order('name')

      if (error) {
        console.error('Error fetching tags:', error)
        return
      }

      if (tags) {
        console.log('Fetched tags:', tags)
        setExistingTags(tags.map(tag => tag.name))
      } else {
        console.log('No tags found')
      }
    }

    fetchExistingTags()
  }, [supabase])

  // Filter tags based on input
  const filteredTags = existingTags.filter(tag => 
    tag.toLowerCase().includes(hashtag.toLowerCase()) && 
    !hashtags.includes(tag)
  )

  const handleSelectTag = (tag: string) => {
    if (!hashtags.includes(tag)) {
      setHashtags([...hashtags, tag])
    }
    setHashtag("")
    setIsTagPopoverOpen(false)
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setHashtags(hashtags.filter((tag) => tag !== tagToRemove))
  }

  const handleSelectGame = (game: BGGGame) => {
    if (!selectedGames.some((g) => g.id === game.id)) {
      setSelectedGames([...selectedGames, game])
    }
  }

  const handleRemoveGame = (gameId: string) => {
    setSelectedGames(selectedGames.filter((game) => game.id !== gameId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate required fields
    if (!title.trim()) {
      setError("Title is required")
      return
    }

    if (!description.trim()) {
      setError("Description is required")
      return
    }

    if (!difficulty) {
      setError("Difficulty level is required")
      return
    }

    if (!rules.trim()) {
      setError("Game rules are required")
      return
    }

    if (!setupInstructions.trim()) {
      setError("Setup instructions are required")
      return
    }

    if (selectedGames.length < 2) {
      setError("Please select at least 2 board games for your remix")
      return
    }

    if (maxPlayers && isNaN(Number(maxPlayers))) {
      setError("Maximum players must be a number")
      return
    }

    setIsSubmitting(true)

    try {
      // Verify user is still authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error("Session error:", sessionError)
        throw new Error("Authentication error. Please try logging in again.")
      }

      if (!session) {
        throw new Error("Your session has expired. Please log in again.")
      }

      const remixData = {
        title: title.trim(),
        description: description.trim(),
        difficulty,
        user_id: userId,
        rules: rules.trim(),
        setup_instructions: setupInstructions.trim(),
        youtube_url: youtubeUrl.trim() || null,
        max_players: maxPlayers ? parseInt(maxPlayers) : null,
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

        if (updateError) {
          throw new Error(updateError.message || "Failed to update remix")
        }
        remix = updatedRemix
      } else {
        // Create new remix
        const { data: newRemix, error: insertError } = await supabase
          .from("remixes")
          .insert(remixData)
          .select()
          .single()

        if (insertError) {
          throw new Error(insertError.message || "Failed to create remix")
        }
        remix = newRemix
      }

      if (!remix) {
        throw new Error("No remix data returned")
      }

      // If editing, first delete existing relationships
      if (remixId) {
        await Promise.all([
          supabase.from("remix_games").delete().eq('remix_id', remixId),
          supabase.from("remix_hashtags").delete().eq('remix_id', remixId),
          supabase.from("remix_tags").delete().eq('remix_id', remixId)
        ])
      }

      // 2. Insert or get the BGG games and create relationships
      for (const game of selectedGames) {
        // First, check if the game already exists
        const { data: existingGame, error: existingGameError } = await supabase
          .from("bgg_games")
          .select()
          .eq("bgg_id", game.id)
          .single()

        let bggGameId: string

        if (existingGame) {
          // Game exists, use its ID
          bggGameId = existingGame.id
        } else {
          // Game doesn't exist, insert it
          const { data: newGame, error: insertError } = await supabase
            .from("bgg_games")
            .insert({
              bgg_id: game.id,
              name: game.name,
              year_published: game.yearPublished,
              image_url: game.image || game.thumbnail || null,
              bgg_url: game.bggUrl
            })
            .select()
            .single()

          if (insertError) {
            console.error("Error inserting BGG game:", insertError)
            throw new Error(`Failed to add BGG game: ${insertError.message}`)
          }

          if (!newGame) {
            throw new Error("Failed to get inserted game data")
          }

          bggGameId = newGame.id
        }

        // Create the relationship in the junction table
        const { error: relationError } = await supabase
          .from("remix_games")
          .insert({
            remix_id: remix.id,
            bgg_game_id: bggGameId
          })

        if (relationError) {
          console.error("Error creating remix-game relationship:", relationError)
          throw new Error(`Failed to link game to remix: ${relationError.message}`)
        }
      }

      // 3. Create tags from game names
      const gameNames = selectedGames.map((game) => game.name)

      for (const name of gameNames) {
        try {
          // First try to get existing tag
          const { data: existingTag, error: selectError } = await supabase
            .from("tags")
            .select("id")
            .eq("name", name)
            .single()

          let tagId: string

          if (existingTag) {
            tagId = existingTag.id
          } else {
            // Create new tag if it doesn't exist
            const { data: newTag, error: insertError } = await supabase
              .from("tags")
              .insert({ name })
              .select()
              .single()

            if (insertError) {
              console.error("Error creating tag:", name, insertError)
              continue // Skip this tag but continue with others
            }

            if (!newTag) {
              console.error("No tag data returned after insert:", name)
              continue
            }

            tagId = newTag.id
          }

          // Link tag to remix
          const { error: linkError } = await supabase
            .from("remix_tags")
            .insert({ remix_id: remix.id, tag_id: tagId })

          if (linkError) {
            console.error("Error linking tag to remix:", name, linkError)
          }
        } catch (error) {
          console.error("Error processing tag:", name, error)
        }
      }

      // 4. Process hashtags
      for (const tagName of hashtags) {
        try {
          // First try to get existing hashtag
          const { data: existingHashtag, error: selectError } = await supabase
            .from("hashtags")
            .select("id")
            .eq("name", tagName.toLowerCase())
            .single()

          let hashtagId: string

          if (existingHashtag) {
            hashtagId = existingHashtag.id
          } else {
            // Create new hashtag if it doesn't exist
            const { data: newHashtag, error: insertError } = await supabase
              .from("hashtags")
              .insert({ name: tagName.toLowerCase() })
              .select()
              .single()

            if (insertError) {
              console.error("Error creating hashtag:", tagName, insertError)
              continue // Skip this hashtag but continue with others
            }

            if (!newHashtag) {
              console.error("No hashtag data returned after insert:", tagName)
              continue
            }

            hashtagId = newHashtag.id
          }

          // Link hashtag to remix
          const { error: linkError } = await supabase
            .from("remix_hashtags")
            .insert({
              remix_id: remix.id,
              hashtag_id: hashtagId
            })

          if (linkError) {
            console.error("Error linking hashtag to remix:", tagName, linkError)
          }
        } catch (error) {
          console.error("Error processing hashtag:", tagName, error)
        }
      }

      router.push('/my-remixes')
      router.refresh()
    } catch (err) {
      console.error("Full error object:", err)
      setError(
        err instanceof Error 
          ? err.message 
          : "Failed to submit your remix. Please check the console for details."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="title" className="text-gray-900">Remix Title</Label>
        <Input
          id="title"
          placeholder="e.g., Tactical Tower: Chess + Jenga"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="bg-white text-gray-900 border-gray-200"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-gray-900">Brief Description</Label>
        <Textarea
          id="description"
          placeholder="Describe your game remix in a few sentences..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
          className="bg-white text-gray-900 border-gray-200"
        />
      </div>

      <BGGGameSearch onSelectGame={handleSelectGame} selectedGames={selectedGames} onRemoveGame={handleRemoveGame} />

      <div className="space-y-2">
        <Label htmlFor="difficulty" className="text-gray-900">Difficulty Level</Label>
        <Select value={difficulty} onValueChange={setDifficulty} required>
          <SelectTrigger id="difficulty" className="bg-white text-gray-900 border-gray-200">
            <SelectValue placeholder="Select difficulty" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="easy" className="text-gray-900">Easy</SelectItem>
            <SelectItem value="medium" className="text-gray-900">Medium</SelectItem>
            <SelectItem value="hard" className="text-gray-900">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Hashtags section */}
      <div className="space-y-2">
        <Label htmlFor="hashtags" className="text-gray-900">Hashtags</Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Hash size={16} className="text-gray-400" />
          </div>
          <Input
            id="hashtags"
            value={hashtag}
            onChange={(e) => {
              setHashtag(e.target.value)
              setIsTagPopoverOpen(true)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && hashtag.trim()) {
                e.preventDefault()
                handleSelectTag(hashtag.trim())
              }
            }}
            placeholder="Add hashtags (e.g., strategy, family, quick)"
            className="pl-9 bg-white text-gray-900 border-gray-200"
          />
          {(hashtag.trim() || isTagPopoverOpen) && (
            <div className="absolute w-full mt-1 bg-white rounded-md border shadow-lg z-50">
              <Command className="rounded-lg border shadow-md">
                <CommandInput 
                  placeholder="Search tags..." 
                  value={hashtag}
                  onValueChange={setHashtag}
                  className="text-gray-900"
                />
                <CommandEmpty className="p-2 text-sm text-gray-600">No tags found.</CommandEmpty>
                <CommandGroup className="max-h-64 overflow-auto">
                  {filteredTags.length > 0 ? (
                    filteredTags.map((tag) => (
                      <CommandItem
                        key={tag}
                        value={tag}
                        onSelect={() => handleSelectTag(tag)}
                        className="cursor-pointer text-gray-900 hover:bg-gray-100"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            hashtags.includes(tag) ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {tag}
                      </CommandItem>
                    ))
                  ) : (
                    hashtag.trim() && (
                      <CommandItem 
                        onSelect={() => handleSelectTag(hashtag.trim())}
                        className="cursor-pointer text-gray-900 hover:bg-gray-100"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add "{hashtag.trim()}"
                      </CommandItem>
                    )
                  )}
                </CommandGroup>
              </Command>
            </div>
          )}
        </div>

        {hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {hashtags.map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="flex items-center gap-1 px-3 py-1.5 bg-[#004E89] text-white"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 text-white hover:text-red-200"
                >
                  <X size={14} />
                </button>
              </Badge>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Select from existing tags or add new ones. Press Enter or click to add.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="rules" className="text-gray-900">Game Rules</Label>
        <Textarea
          id="rules"
          placeholder="Explain the rules of your game remix..."
          value={rules}
          onChange={(e) => setRules(e.target.value)}
          required
          rows={6}
          className="bg-white text-gray-900 border-gray-200"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="setup" className="text-gray-900">Setup Instructions</Label>
        <Textarea
          id="setup"
          placeholder="Explain how to set up the game..."
          value={setupInstructions}
          onChange={(e) => setSetupInstructions(e.target.value)}
          required
          rows={4}
          className="bg-white text-gray-900 border-gray-200"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxPlayers" className="text-gray-900">Maximum Players</Label>
        <Input
          id="maxPlayers"
          type="number"
          placeholder="e.g., 4"
          value={maxPlayers}
          onChange={(e) => setMaxPlayers(e.target.value)}
          min="1"
          className="bg-white text-gray-900 border-gray-200"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="youtubeUrl" className="text-gray-900">YouTube Tutorial URL (optional)</Label>
        <Input
          id="youtubeUrl"
          type="url"
          placeholder="e.g., https://youtube.com/watch?v=..."
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          className="bg-white text-gray-900 border-gray-200"
        />
        <p className="text-xs text-gray-500">Add a video tutorial to help others learn your remix</p>
      </div>

      <Button type="submit" className="w-full bg-[#FF6B35] hover:bg-[#e55a2a] text-white" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Remix"
        )}
      </Button>
    </form>
  )
}
