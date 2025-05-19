import { useState } from 'react'
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
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BrowseFiltersProps {
  allGames: { id: string; name: string }[]
  allTags: string[]
  onFiltersChange: (filters: any) => void
}

export default function BrowseFilters({ allGames, allTags, onFiltersChange }: BrowseFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [creator, setCreator] = useState(searchParams.get('creator') || '')
  const [selectedGames, setSelectedGames] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [difficulty, setDifficulty] = useState(searchParams.get('difficulty') || '')
  const [minPlayers, setMinPlayers] = useState(searchParams.get('minPlayers') || '')
  const [maxPlayers, setMaxPlayers] = useState(searchParams.get('maxPlayers') || '')
  const [openGames, setOpenGames] = useState(false)
  const [openTags, setOpenTags] = useState(false)

  const handleFiltersChange = () => {
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
    Object.entries(filters).forEach(([key, value]) => {
      if (value && (typeof value === 'string' || Array.isArray(value))) {
        if (Array.isArray(value)) {
          params.set(key, value.join(','))
        } else {
          params.set(key, value.toString())
        }
      } else {
        params.delete(key)
      }
    })

    router.push(`/browse?${params.toString()}`)
    onFiltersChange(filters)
  }

  return (
    <div className="space-y-4 p-4 bg-gray-900 rounded-lg">
      <div>
        <Label htmlFor="creator">Creator Username</Label>
        <Input
          id="creator"
          value={creator}
          onChange={(e) => {
            setCreator(e.target.value)
            handleFiltersChange()
          }}
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
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search games..." />
              <CommandEmpty>No game found.</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {allGames.map((game) => (
                  <CommandItem
                    key={game.id}
                    onSelect={() => {
                      setSelectedGames((prev) =>
                        prev.includes(game.name)
                          ? prev.filter((item) => item !== game.name)
                          : [...prev, game.name]
                      )
                      handleFiltersChange()
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
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search tags..." />
              <CommandEmpty>No tag found.</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {allTags.map((tag) => (
                  <CommandItem
                    key={tag}
                    onSelect={() => {
                      setSelectedTags((prev) =>
                        prev.includes(tag)
                          ? prev.filter((item) => item !== tag)
                          : [...prev, tag]
                      )
                      handleFiltersChange()
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
          onValueChange={(value) => {
            setDifficulty(value)
            handleFiltersChange()
          }}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Any</SelectItem>
            <SelectItem value="Easy">Easy</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Hard">Hard</SelectItem>
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
            onChange={(e) => {
              setMinPlayers(e.target.value)
              handleFiltersChange()
            }}
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
            onChange={(e) => {
              setMaxPlayers(e.target.value)
              handleFiltersChange()
            }}
            placeholder="Max"
            className="mt-1"
          />
        </div>
      </div>
    </div>
  )
} 