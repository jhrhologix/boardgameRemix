"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Search, X, ExternalLink, Plus } from "lucide-react"
import type { BGGGame } from "@/lib/bgg-api"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface BGGGameSearchProps {
  onSelectGame: (game: BGGGame) => void
  selectedGames: BGGGame[]
  onRemoveGame: (gameId: string) => void
}

export default function BGGGameSearch({ onSelectGame, selectedGames, onRemoveGame }: BGGGameSearchProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [searchResults, setSearchResults] = useState<BGGGame[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const searchGames = async () => {
      if (!query || query.length < 2) {
        setSearchResults([])
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`/api/bgg/search?q=${encodeURIComponent(query)}`)
        const data = await response.json()
        setSearchResults(data.results || [])
      } catch (error) {
        console.error("Error searching games:", error)
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchGames, 300)
    return () => clearTimeout(debounceTimer)
  }, [query])

  const handleSelectGame = (game: BGGGame) => {
    onSelectGame(game)
    setOpen(false)
    setQuery("")
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Required Board Games</label>
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
            <p className="text-sm text-gray-500">No games selected yet. Add games from BoardGameGeek.</p>
          )}
        </div>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
              <div className="flex items-center">
                <Search className="mr-2 h-4 w-4" />
                <span>{selectedGames.length > 0 ? "Add another game" : "Search for board games"}</span>
              </div>
              <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search BoardGameGeek..." value={query} onValueChange={setQuery} />
              <CommandList>
                <CommandEmpty>
                  {isLoading ? (
                    <div className="p-2">
                      <Skeleton className="h-8 w-full mb-2" />
                      <Skeleton className="h-8 w-full mb-2" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  ) : (
                    "No games found."
                  )}
                </CommandEmpty>
                <CommandGroup>
                  {searchResults.map((game) => (
                    <CommandItem
                      key={game.id}
                      value={game.id}
                      onSelect={() => handleSelectGame(game)}
                      className="flex justify-between"
                    >
                      <div>
                        <span>{game.name}</span>
                        {game.yearPublished && (
                          <span className="ml-2 text-xs text-gray-500">({game.yearPublished})</span>
                        )}
                      </div>
                      <a
                        href={game.bggUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink size={14} />
                      </a>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
