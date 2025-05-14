"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { BGGGame } from "@/lib/bgg-api"
import BGGGameSearch from "./bgg-game-search"
import { createClient } from "@/lib/supabase/client"
import { AlertCircle, Loader2, X, Hash } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

interface SubmitRemixFormProps {
  userId: string
}

export default function SubmitRemixForm({ userId }: SubmitRemixFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [difficulty, setDifficulty] = useState<string>("")
  const [selectedGames, setSelectedGames] = useState<BGGGame[]>([])
  const [rules, setRules] = useState("")
  const [setupInstructions, setSetupInstructions] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // New state for hashtags
  const [hashtag, setHashtag] = useState("")
  const [hashtags, setHashtags] = useState<string[]>([])

  const handleSelectGame = (game: BGGGame) => {
    if (!selectedGames.some((g) => g.id === game.id)) {
      setSelectedGames([...selectedGames, game])
    }
  }

  const handleRemoveGame = (gameId: string) => {
    setSelectedGames(selectedGames.filter((game) => game.id !== gameId))
  }

  // Handle adding a hashtag
  const handleAddHashtag = (e: React.FormEvent) => {
    e.preventDefault()

    if (!hashtag.trim()) return

    // Remove # if user added it
    let tag = hashtag.trim()
    if (tag.startsWith("#")) {
      tag = tag.substring(1)
    }

    // Don't add duplicates
    if (!hashtags.includes(tag) && tag.length > 0) {
      setHashtags([...hashtags, tag])
    }

    setHashtag("")
  }

  // Remove a hashtag
  const handleRemoveHashtag = (tagToRemove: string) => {
    setHashtags(hashtags.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (selectedGames.length < 2) {
      setError("Please select at least 2 board games for your remix")
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = createClient()

      // 1. Insert the remix
      const { data: remix, error: remixError } = await supabase
        .from("remixes")
        .insert({
          title,
          description,
          difficulty,
          user_id: userId,
          rules,
          setup_instructions: setupInstructions,
        })
        .select()
        .single()

      if (remixError) throw remixError

      // 2. Insert the BGG games
      const bggGamesData = selectedGames.map((game) => ({
        remix_id: remix.id,
        bgg_id: game.id,
        name: game.name,
        year_published: game.yearPublished,
        image_url: game.image || game.thumbnail || null,
        bgg_url: game.bggUrl,
      }))

      const { error: bggGamesError } = await supabase.from("bgg_games").insert(bggGamesData)

      if (bggGamesError) throw bggGamesError

      // 3. Create tags from game names
      const gameNames = selectedGames.map((game) => game.name)

      for (const name of gameNames) {
        // Check if tag exists
        const { data: existingTag } = await supabase.from("tags").select("id").eq("name", name).single()

        let tagId

        if (existingTag) {
          tagId = existingTag.id
        } else {
          // Create new tag
          const { data: newTag, error: tagError } = await supabase.from("tags").insert({ name }).select().single()

          if (tagError) throw tagError
          tagId = newTag.id
        }

        // Link tag to remix
        await supabase.from("remix_tags").insert({ remix_id: remix.id, tag_id: tagId })
      }

      // 4. Process hashtags
      for (const tagName of hashtags) {
        // Check if hashtag exists
        const { data: existingHashtag } = await supabase
          .from("hashtags")
          .select("id")
          .eq("name", tagName.toLowerCase())
          .single()

        let hashtagId

        if (existingHashtag) {
          hashtagId = existingHashtag.id
        } else {
          // Create new hashtag
          const { data: newHashtag, error: hashtagError } = await supabase
            .from("hashtags")
            .insert({ name: tagName.toLowerCase() })
            .select()
            .single()

          if (hashtagError) throw hashtagError
          hashtagId = newHashtag.id
        }

        // Link hashtag to remix
        await supabase.from("remix_hashtags").insert({
          remix_id: remix.id,
          hashtag_id: hashtagId,
        })
      }

      router.push(`/remixes/${remix.id}`)
      router.refresh()
    } catch (err) {
      console.error("Error submitting remix:", err)
      setError("Failed to submit your remix. Please try again.")
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
        <Label htmlFor="title">Remix Title</Label>
        <Input
          id="title"
          placeholder="e.g., Tactical Tower: Chess + Jenga"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Brief Description</Label>
        <Textarea
          id="description"
          placeholder="Describe your game remix in a few sentences..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
        />
      </div>

      <BGGGameSearch onSelectGame={handleSelectGame} selectedGames={selectedGames} onRemoveGame={handleRemoveGame} />

      <div className="space-y-2">
        <Label htmlFor="difficulty">Difficulty Level</Label>
        <Select value={difficulty} onValueChange={setDifficulty} required>
          <SelectTrigger id="difficulty">
            <SelectValue placeholder="Select difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Easy">Easy</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Hashtags section */}
      <div className="space-y-2">
        <Label htmlFor="hashtags">Hashtags</Label>
        <div className="flex gap-2 mb-2">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Hash size={16} className="text-gray-400" />
            </div>
            <Input
              id="hashtags"
              placeholder="Add hashtags (e.g., strategy, family, quick)"
              value={hashtag}
              onChange={(e) => setHashtag(e.target.value)}
              className="pl-9"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddHashtag(e)
                }
              }}
            />
          </div>
          <Button type="button" onClick={handleAddHashtag} variant="secondary">
            Add
          </Button>
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
                  onClick={() => handleRemoveHashtag(tag)}
                  className="ml-1 text-white hover:text-red-200"
                >
                  <X size={14} />
                </button>
              </Badge>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Add relevant hashtags to help others find your remix. Press Enter or click Add after each hashtag.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="rules">Game Rules</Label>
        <Textarea
          id="rules"
          placeholder="Explain the rules of your game remix..."
          value={rules}
          onChange={(e) => setRules(e.target.value)}
          required
          rows={6}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="setup">Setup Instructions</Label>
        <Textarea
          id="setup"
          placeholder="Explain how to set up the game..."
          value={setupInstructions}
          onChange={(e) => setSetupInstructions(e.target.value)}
          required
          rows={4}
        />
      </div>

      <Button type="submit" className="w-full bg-[#FF6B35] hover:bg-[#e55a2a]" disabled={isSubmitting}>
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
