"use client"

import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import type { BGGGame } from "@/lib/bgg-api"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

export default function HeroSection() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [searchResults, setSearchResults] = useState<BGGGame[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedGames, setSelectedGames] = useState<BGGGame[]>([])

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
        const response = await fetch(`/api/bgg/search?q=${encodeURIComponent(query)}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || data.details || 'Failed to search games')
        }
        
        if (data.error) {
          throw new Error(data.error)
        }

        setSearchResults(data.results || [])
        setIsOpen(true)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to search games'
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
    if (!selectedGames.some(g => g.id === game.id)) {
      setSelectedGames([...selectedGames, game])
    }
    setQuery("")
    setIsOpen(false)
  }

  const handleRemoveGame = (gameId: string) => {
    setSelectedGames(selectedGames.filter(game => game.id !== gameId))
  }

  const handleSearch = () => {
    if (selectedGames.length > 0) {
      const gameNames = selectedGames.map(game => encodeURIComponent(game.name))
      router.push(`/browse?game=${gameNames.join(',')}`)
    }
  }

  return (
    <section className="relative bg-[#004E89] text-white py-16 md:py-24">
      {/* Background image with overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/A%20high-resolution%20im.png-heMY7xTWJUCXOkv7K4uUUQ5FL98gIY.jpeg')",
          backgroundPosition: "center 30%",
        }}
      >
        {/* Dark overlay to ensure text readability */}
        <div className="absolute inset-0 bg-black opacity-50 z-0"></div>
      </div>

      <div className="container mx-auto px-4 relative z-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-shadow-lg">
            <strong>Creative Board Game Combinations</strong> & <strong>Custom Variants</strong>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-[#FFBC42] font-semibold text-shadow-md">
            Discover <strong>innovative board game remixes</strong> using games you already own. Join the largest community of <strong>creative gamers</strong> sharing unique <strong>tabletop game combinations</strong>.
          </p>

          <div className="relative max-w-2xl mx-auto mb-4">
            {/* Selected Games */}
            {selectedGames.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedGames.map((game) => (
                  <Badge
                    key={game.id}
                    variant="secondary"
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#004E89] text-white border border-white/20"
                  >
                    {game.name}
                    {game.yearPublished && <span className="text-xs">({game.yearPublished})</span>}
                    <button
                      type="button"
                      onClick={() => handleRemoveGame(game.id)}
                      className="ml-1 text-white hover:text-red-200"
                    >
                      <X size={14} />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Search Input */}
            <div className="flex items-center bg-white rounded-lg overflow-hidden shadow-lg">
              <input
                type="text"
                placeholder="Search for board games you own..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onClick={() => setIsOpen(true)}
                className="flex-grow px-4 py-3 text-[#2A2B2A] focus:outline-none"
              />
              <Button 
                variant="default"
                className="m-0 rounded-none"
                onClick={handleSearch}
                disabled={selectedGames.length === 0}
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>

            {/* Search Results Dropdown */}
            {isOpen && query.length >= 2 && (
              <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200">
                <div className="max-h-[300px] overflow-y-auto p-2">
                  {isLoading ? (
                    <div className="text-gray-500 p-2">Searching...</div>
                  ) : error ? (
                    <p className="text-red-500 p-2">{error}</p>
                  ) : searchResults.length === 0 ? (
                    <p className="text-gray-500 p-2">No games found.</p>
                  ) : (
                    <div className="space-y-1">
                      {searchResults.map((game) => (
                        <button
                          key={game.id}
                          onClick={() => handleSelectGame(game)}
                          className="w-full flex items-center justify-between p-2 hover:bg-gray-100 rounded-md text-left"
                        >
                          <div>
                            <span className="text-gray-900">{game.name}</span>
                            {game.yearPublished && (
                              <span className="ml-2 text-xs text-gray-500">({game.yearPublished})</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <Button 
            variant="default"
            className="px-8 py-6 text-lg shadow-lg transition-all"
            onClick={() => router.push('/browse')}
          >
            Browse All Remixes
          </Button>
        </div>
      </div>
    </section>
  )
}
