"use client"

import React, { useState } from "react"
import { useSubmitRemixForm } from "@/hooks/use-submit-remix-form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import BGGGameSearch from "./bgg-game-search"
import { AlertCircle, Loader2, X, Hash, Check, Plus } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import ReCAPTCHA from "react-google-recaptcha"
import SetupImageUpload from "./setup-image-upload"

interface SubmitRemixFormProps {
  userId: string
  remixId?: string
}

export default function SubmitRemixForm({ userId, remixId }: SubmitRemixFormProps) {
  const {
    formState,
    existingTags,
    hasValidRecaptchaKey,
    recaptchaRef,
    updateFormData,
    updateFormState,
    submitForm,
  } = useSubmitRemixForm(userId, remixId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitForm()
  }

  const addHashtag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase()
    if (trimmedTag && !formState.data.hashtags.includes(trimmedTag)) {
      updateFormData({
        hashtags: [...formState.data.hashtags, trimmedTag]
      })
    }
  }

  const removeHashtag = (tagToRemove: string) => {
    updateFormData({
      hashtags: formState.data.hashtags.filter(tag => tag !== tagToRemove)
    })
  }

  // State for hashtag input and suggestions
  const [hashtagInput, setHashtagInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Filter suggestions based on input
  const filteredSuggestions = existingTags.filter(tag => 
    tag.toLowerCase().includes(hashtagInput.toLowerCase()) && 
    !formState.data.hashtags.includes(tag) &&
    hashtagInput.length > 0
  )

  const addGame = (game: any) => {
    updateFormData({
      selectedGames: [...formState.data.selectedGames, game]
    })
  }

  const removeGame = (gameId: string) => {
    updateFormData({
      selectedGames: formState.data.selectedGames.filter(game => game.id !== gameId)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formState.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{formState.error}</AlertDescription>
        </Alert>
      )}

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-gray-900">Remix Title *</Label>
        <Input
          id="title"
          value={formState.data.title}
          onChange={(e) => updateFormData({ title: e.target.value })}
          placeholder="Enter a catchy title for your remix"
          required
          className="bg-white text-gray-900 placeholder:text-gray-500"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-gray-900">Description *</Label>
        <Textarea
          id="description"
          value={formState.data.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
          placeholder="Describe what makes this remix special"
          rows={3}
          required
          className="bg-white text-gray-900 placeholder:text-gray-500"
        />
      </div>

      {/* Difficulty */}
      <div className="space-y-2">
        <Label htmlFor="difficulty" className="text-gray-900">Difficulty Level *</Label>
        <Select
          value={formState.data.difficulty}
          onValueChange={(value) => updateFormData({ difficulty: value })}
        >
          <SelectTrigger className="bg-white text-gray-900">
            <SelectValue placeholder="Select difficulty" />
          </SelectTrigger>
          <SelectContent className="bg-white text-gray-900">
            <SelectItem value="easy" className="bg-white text-gray-900 hover:bg-gray-100">Easy</SelectItem>
            <SelectItem value="medium" className="bg-white text-gray-900 hover:bg-gray-100">Medium</SelectItem>
            <SelectItem value="hard" className="bg-white text-gray-900 hover:bg-gray-100">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Games Selection */}
      <div className="space-y-2">
        <Label className="text-gray-900">Board Games * (Select at least 2)</Label>
        <BGGGameSearch
          onSelectGame={addGame}
          selectedGames={formState.data.selectedGames}
          onRemoveGame={removeGame}
        />
        {formState.data.selectedGames.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formState.data.selectedGames.map((game) => (
              <Badge key={game.id} variant="secondary" className="flex items-center gap-1">
                {game.name}
                <button
                  type="button"
                  onClick={() => removeGame(game.id)}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Rules */}
      <div className="space-y-2">
        <Label htmlFor="rules" className="text-gray-900">Game Rules *</Label>
        <Textarea
          id="rules"
          value={formState.data.rules}
          onChange={(e) => updateFormData({ rules: e.target.value })}
          placeholder="Explain how to play your remix"
          rows={6}
          required
          className="bg-white text-gray-900 placeholder:text-gray-500"
        />
      </div>

      {/* Setup Instructions */}
      <div className="space-y-2">
        <Label htmlFor="setup" className="text-gray-900">Setup Instructions *</Label>
        <Textarea
          id="setup"
          value={formState.data.setupInstructions}
          onChange={(e) => updateFormData({ setupInstructions: e.target.value })}
          placeholder="How to set up the games for your remix"
          rows={4}
          required
          className="bg-white text-gray-900 placeholder:text-gray-500"
        />
      </div>

      {/* Setup Images */}
      <SetupImageUpload
        remixId={remixId || 'temp-' + Date.now()} // Use temp ID for new remixes
        isNewRemix={!remixId} // True if this is a new remix
        onImagesChange={(images) => {
          // Optional: Store images in form state if needed
          console.log('Setup images updated:', images)
        }}
      />

      {/* YouTube URL */}
      <div className="space-y-2">
        <Label htmlFor="youtube" className="text-gray-900">YouTube Video (Optional)</Label>
        <Input
          id="youtube"
          type="url"
          value={formState.data.youtubeUrl}
          onChange={(e) => updateFormData({ youtubeUrl: e.target.value })}
          placeholder="https://youtube.com/watch?v=..."
          className="bg-white text-gray-900 placeholder:text-gray-500"
        />
      </div>

      {/* Max Players */}
      <div className="space-y-2">
        <Label htmlFor="maxPlayers" className="text-gray-900">Maximum Players (Optional)</Label>
        <Input
          id="maxPlayers"
          type="number"
          value={formState.data.maxPlayers}
          onChange={(e) => updateFormData({ maxPlayers: e.target.value })}
          placeholder="e.g., 8"
          className="bg-white text-gray-900 placeholder:text-gray-500"
        />
      </div>

      {/* Hashtags */}
      <div className="space-y-2">
        <Label className="text-gray-900">Hashtags (Optional)</Label>
        <div className="relative">
          <div className="flex gap-2">
            <Input
              placeholder="Add a hashtag"
              value={hashtagInput}
              onChange={(e) => {
                setHashtagInput(e.target.value)
                setShowSuggestions(e.target.value.length > 0)
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  if (hashtagInput.trim()) {
                    addHashtag(hashtagInput)
                    setHashtagInput('')
                    setShowSuggestions(false)
                  }
                }
              }}
              onFocus={() => setShowSuggestions(hashtagInput.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="bg-white text-gray-900 placeholder:text-gray-500"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (hashtagInput.trim()) {
                  addHashtag(hashtagInput)
                  setHashtagInput('')
                  setShowSuggestions(false)
                }
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Real-time suggestions dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
              {filteredSuggestions.slice(0, 8).map((tag) => (
                <div
                  key={tag}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-gray-900 border-b border-gray-100 last:border-b-0"
                  onClick={() => {
                    addHashtag(tag)
                    setHashtagInput('')
                    setShowSuggestions(false)
                  }}
                >
                  #{tag}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Existing hashtag suggestions */}
        {existingTags.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-gray-900">Popular hashtags (click to add):</p>
            <div className="flex flex-wrap gap-2">
              {existingTags
                .filter(tag => !formState.data.hashtags.includes(tag))
                .slice(0, 12)
                .map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="cursor-pointer hover:bg-[#FF6B35] hover:text-white transition-colors bg-white text-gray-900 border-gray-300"
                  onClick={() => addHashtag(tag)}
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {formState.data.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formState.data.hashtags.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                #{tag}
                <button
                  type="button"
                  onClick={() => removeHashtag(tag)}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* reCAPTCHA */}
      {hasValidRecaptchaKey && (
        <div className="flex justify-center">
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
            onChange={(token) => updateFormState({ captchaToken: token })}
          />
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={formState.isSubmitting || (hasValidRecaptchaKey && !formState.captchaToken) || false}
        className="w-full bg-[#FF6B35] hover:bg-[#e55a2a] text-white"
      >
        {formState.isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {remixId ? 'Updating Remix...' : 'Creating Remix...'}
          </>
        ) : (
          remixId ? 'Update Remix' : 'Submit Remix'
        )}
      </Button>
    </form>
  )
}