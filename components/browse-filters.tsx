'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Check, ChevronsUpDown, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BrowseFiltersProps {
  allGames: { id: string; name: string }[]
  allTags: string[]
  initialFilters?: {
    creator?: string
    games?: string[]
    tags?: string[]
    difficulty?: string
    minPlayers?: number
    maxPlayers?: number
  }
}

export default function BrowseFilters({ allGames, allTags, initialFilters = {} }: BrowseFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [creator, setCreator] = useState(initialFilters.creator || '')
  const [selectedGames, setSelectedGames] = useState<string[]>(initialFilters.games || [])
  const [selectedTags, setSelectedTags] = useState<string[]>(initialFilters.tags || [])
  const [difficulty, setDifficulty] = useState(initialFilters.difficulty || 'any')
  const [minPlayers, setMinPlayers] = useState(initialFilters.minPlayers?.toString() || '')
  const [maxPlayers, setMaxPlayers] = useState(initialFilters.maxPlayers?.toString() || '')
  const [openGames, setOpenGames] = useState(false)
  const [openTags, setOpenTags] = useState(false)

  const handleSearch = () => {
    const filters = {
      creator,
      games: selectedGames,
      tags: selectedTags,
      difficulty,
      minPlayers: minPlayers ? parseInt(minPlayers) : undefined,
      maxPlayers: maxPlayers ? parseInt(maxPlayers) : undefined,
    }

    // Update URL with filters
    const params = new URLSearchParams(searchParams.toString())
    
    // Handle creator
    if (filters.creator) {
      params.set('creator', filters.creator)
    } else {
      params.delete('creator')
    }

    // Handle games array
    if (filters.games && filters.games.length > 0) {
      params.set('games', filters.games.join(','))
    } else {
      params.delete('games')
    }

    // Handle tags array
    if (filters.tags && filters.tags.length > 0) {
      params.set('tags', filters.tags.join(','))
    } else {
      params.delete('tags')
    }

    // Handle difficulty
    if (filters.difficulty && filters.difficulty !== 'any') {
      params.set('difficulty', filters.difficulty)
    } else {
      params.delete('difficulty')
    }

    // Handle players
    if (filters.minPlayers) {
      params.set('minPlayers', filters.minPlayers.toString())
    } else {
      params.delete('minPlayers')
    }

    if (filters.maxPlayers) {
      params.set('maxPlayers', filters.maxPlayers.toString())
    } else {
      params.delete('maxPlayers')
    }

    // Preserve other query parameters
    const currentParams = new URLSearchParams(searchParams.toString())
    for (const [key, value] of currentParams.entries()) {
      if (!['creator', 'games', 'tags', 'difficulty', 'minPlayers', 'maxPlayers'].includes(key)) {
        params.set(key, value)
      }
    }

    router.push(`/browse?${params.toString()}`)
  }

  const handleClearFilters = () => {
    setCreator('')
    setSelectedGames([])
    setSelectedTags([])
    setDifficulty('any')
    setMinPlayers('')
    setMaxPlayers('')
    
    // Navigate to browse page without any filters
    router.push('/browse')
  }

  // Initialize filters from URL on mount
  useEffect(() => {
    setCreator(initialFilters.creator || '')
    setSelectedGames(initialFilters.games || [])
    setSelectedTags(initialFilters.tags || [])
    setDifficulty(initialFilters.difficulty || 'any')
    setMinPlayers(initialFilters.minPlayers?.toString() || '')
    setMaxPlayers(initialFilters.maxPlayers?.toString() || '')
  }, [initialFilters])

  return (
    <div className="space-y-4 p-4 bg-gray-900 rounded-lg">
      <div>
        <Label htmlFor="creator">Creator Username</Label>
        <Input
          id="creator"
          value={creator}
          onChange={(e) => setCreator(e.target.value)}
          placeholder="Search by creator..."
          className="mt-1"
        />
      </div>

      <div>
        <Label>Games</Label>
        <Popover open={openGames} onOpenChange={setOpenGames}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openGames}
              className="w-full justify-between mt-1"
            >
              {selectedGames.length > 0
                ? `${selectedGames.length} games selected`
                : "Select games..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0 bg-white border border-gray-200">
            <Command className="bg-white">
              <CommandInput placeholder="Search games..." className="bg-white" />
              <CommandEmpty className="bg-white text-gray-500">No game found.</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto bg-white">
                {allGames.map((game) => (
                  <CommandItem
                    key={game.id}
                    className="bg-white hover:bg-gray-100 text-gray-900"
                    onSelect={() => {
                      setSelectedGames((prev) =>
                        prev.includes(game.name)
                          ? prev.filter((item) => item !== game.name)
                          : [...prev, game.name]
                      )
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedGames.includes(game.name) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {game.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <Label>Tags</Label>
        <Popover open={openTags} onOpenChange={setOpenTags}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openTags}
              className="w-full justify-between mt-1"
            >
              {selectedTags.length > 0
                ? `${selectedTags.length} tags selected`
                : "Select tags..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0 bg-white border border-gray-200">
            <Command className="bg-white">
              <CommandInput placeholder="Search tags..." className="bg-white" />
              <CommandEmpty className="bg-white text-gray-500">No tag found.</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto bg-white">
                {allTags.map((tag) => (
                  <CommandItem
                    key={tag}
                    className="bg-white hover:bg-gray-100 text-gray-900"
                    onSelect={() => {
                      setSelectedTags((prev) =>
                        prev.includes(tag)
                          ? prev.filter((item) => item !== tag)
                          : [...prev, tag]
                      )
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedTags.includes(tag) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {tag}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <Label htmlFor="difficulty">Difficulty</Label>
        <Select
          value={difficulty}
          onValueChange={(value) => setDifficulty(value)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select difficulty" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200">
            <SelectItem value="any" className="bg-white hover:bg-gray-100 text-gray-900">Any</SelectItem>
            <SelectItem value="Easy" className="bg-white hover:bg-gray-100 text-gray-900">Easy</SelectItem>
            <SelectItem value="Medium" className="bg-white hover:bg-gray-100 text-gray-900">Medium</SelectItem>
            <SelectItem value="Hard" className="bg-white hover:bg-gray-100 text-gray-900">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="minPlayers">Min Players</Label>
          <Input
            id="minPlayers"
            type="number"
            min="1"
            value={minPlayers}
            onChange={(e) => setMinPlayers(e.target.value)}
            placeholder="Min"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="maxPlayers">Max Players</Label>
          <Input
            id="maxPlayers"
            type="number"
            min="1"
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(e.target.value)}
            placeholder="Max"
            className="mt-1"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button 
          onClick={handleSearch}
          className="flex-1 bg-[#FF6B35] hover:bg-[#e55a2a] text-white"
        >
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
        <Button 
          onClick={handleClearFilters}
          variant="outline"
          className="bg-white text-gray-900 border-gray-300 hover:bg-gray-100"
        >
          <X className="w-4 h-4 mr-2" />
          Clear
        </Button>
      </div>
    </div>
  )
} 