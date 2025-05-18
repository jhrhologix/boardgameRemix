"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Search, X, ExternalLink, Plus } from "lucide-react"
import type { BGGGame } from "@/lib/bgg-api"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface BGGGameSearchProps {
  onSelectGame: (game: BGGGame) => void
  selectedGames: BGGGame[]
  onRemoveGame: (gameId: string) => void
}

export default function BGGGameSearch({ onSelectGame, selectedGames, onRemoveGame }: BGGGameSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [searchResults, setSearchResults] = useState<BGGGame[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debug logging for state changes
  useEffect(() => {
    console.log('State update:', {
      isOpen,
      query,
      searchResultsCount: searchResults.length,
      isLoading,
      error,
      searchResults
    })
  }, [isOpen, query, searchResults, isLoading, error])

  useEffect(() => {
    const searchGames = async () => {
      if (!query || query.length < 2) {
        setSearchResults([])
        setError(null)
        return
      }

      setIsLoading(true)
      setError(null)
      
      try {
        console.log('Sending search request for:', query)
        const response = await fetch(`/api/bgg/search?q=${encodeURIComponent(query)}`)
        const data = await response.json()
        console.log('Raw API response:', data)

        if (!response.ok) {
          throw new Error(data.error || data.details || 'Failed to search games')
        }
        
        if (data.error) {
          throw new Error(data.error)
        }

        if (!Array.isArray(data.results)) {
          console.error('Invalid results format:', data)
          throw new Error('Invalid response format from server')
        }

        console.log('Setting search results:', data.results)
        setSearchResults(data.results)
        setIsOpen(true)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to search games'
        console.error("Error searching games:", errorMessage)
        setError(errorMessage)
        setSearchResults([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchGames, 300)
    return () => clearTimeout(debounceTimer)
  }, [query])

  const handleSelectGame = (game: BGGGame) => {
    console.log('Selecting game:', game)
    onSelectGame(game)
    setIsOpen(false)
    setQuery("")
    setSearchResults([])
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <label className="block text-sm font-medium text-gray-900 mb-1">Required Board Games</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedGames.map((game) => (
            <Badge
              key={game.id}
              variant="secondary"
              className="flex items-center gap-1 px-3 py-1.5 bg-[#004E89] text-white"
            >
              {game.name}
              {game.yearPublished && <span className="text-xs">({game.yearPublished})</span>}
              <button
                type="button"
                onClick={() => onRemoveGame(game.id)}
                className="ml-1 text-white hover:text-red-200"
              >
                <X size={14} />
              </button>
            </Badge>
          ))}
          {selectedGames.length === 0 && (
            <p className="text-sm text-gray-600">No games selected yet. Add games from BoardGameGeek.</p>
          )}
        </div>

        <div className="relative">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search BoardGameGeek..."
              value={query}
              onChange={(e) => {
                console.log('Search input changed:', e.target.value)
                setQuery(e.target.value)
              }}
              onClick={() => setIsOpen(true)}
              className="w-full px-4 py-2 border rounded-md text-gray-900 placeholder:text-gray-500"
            />
            <Button
              variant="outline"
              className="bg-white text-gray-900 border-gray-200"
              onClick={() => setIsOpen(true)}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {isOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200">
              <div className="max-h-[300px] overflow-y-auto p-2">
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ) : error ? (
                  <p className="text-red-500 p-2">{error}</p>
                ) : query.length < 2 ? (
                  <p className="text-gray-500 p-2">Type at least 2 characters to search...</p>
                ) : searchResults.length === 0 ? (
                  <p className="text-gray-500 p-2">No games found.</p>
                ) : (
                  <div className="space-y-1">
                    {searchResults.map((game) => (
                      <button
                        key={game.id}
                        onClick={() => handleSelectGame(game)}
                        className="w-full flex items-center justify-between p-2 hover:bg-gray-100 rounded-md"
                      >
                        <div>
                          <span className="text-gray-900">{game.name}</span>
                          {game.yearPublished && (
                            <span className="ml-2 text-xs text-gray-500">({game.yearPublished})</span>
                          )}
                        </div>
                        <a
                          href={game.bggUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#004E89] hover:text-[#003e6e]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink size={14} />
                        </a>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
