import Header from "@/components/header"
import Footer from "@/components/footer"
import GameCard from "@/components/game-card"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { getUserVotes, getFavoriteStatus } from "@/lib/actions"
import SearchInput from "@/components/search-input"
import { Button } from "@/components/ui/button"
import SortOptions from "@/components/sort-options"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Hash } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import type { BGGGame } from "@/lib/bgg-api"
import BrowseFilters from "@/components/browse-filters"

interface Game {
  name: string
  id: string
  bggUrl: string
  image: string
}

interface HashtagRelation {
  hashtag: {
    name: string
  }
}

interface Remix {
  id: string
  title: string
  description: string
  difficulty: "Easy" | "Medium" | "Hard"
  upvotes: number
  downvotes: number
  user_id: string
  creator_username: string
  created_at: string
  games: Game[]
  tags: string[]
  hashtags: string[]
}

interface SupabaseGame {
  game: {
    name: string
    bgg_id: string
    image_url: string | null
    bgg_url: string | null
  }
}

interface SupabaseHashtag {
  hashtags: {
    name: string
  }
}

interface SupabaseRemix {
  id: string
  title: string
  description: string
  difficulty: string
  upvotes: number
  downvotes: number
  user_id: string
  creator: {
    username: string | null
  } | null
  created_at: string
  remix_games: Array<{
    game: {
      name: string
      bgg_id: string
      image_url: string | null
      bgg_url: string | null
    }
  }>
  remix_hashtags: Array<{
    hashtag: {
      name: string
    }
  }>
}

interface VoteStatus {
  [key: string]: "upvote" | "downvote" | undefined
}

interface FavoriteStatus {
  [key: string]: boolean
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: { 
    sort?: string; 
    q?: string; 
    game?: string; 
    hashtag?: string;
    creator?: string;
    games?: string;
    tags?: string;
    difficulty?: string;
    minPlayers?: string;
    maxPlayers?: string;
  }
}) {
  const supabase = await createClient()

  // Get search params directly - properly awaited
  const params = await Promise.resolve(searchParams)
  const gameFilter = params.game
  const hashtagFilter = params.hashtag
  const sortFilter = params.sort
  const searchQuery = params.q
  const creatorFilter = params.creator
  const gamesFilter = params.games?.split(',') || []
  const tagsFilter = params.tags?.split(',') || []
  const difficultyFilter = params.difficulty
  const minPlayersFilter = params.minPlayers ? parseInt(params.minPlayers) : undefined
  const maxPlayersFilter = params.maxPlayers ? parseInt(params.maxPlayers) : undefined

  let isAuthenticated = false
  let remixes: Remix[] = []
  let allGames: { id: string; name: string }[] = []
  let allTags: string[] = []

  try {
    // Get authentication status using getUser
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    isAuthenticated = !!user

    // Fetch all games for the filter
    const { data: gamesData } = await supabase
      .from('bgg_games')
      .select('bgg_id, name')
      .order('name')

    if (gamesData) {
      allGames = gamesData.map(g => ({ id: g.bgg_id, name: g.name }))
    }

    // Fetch all hashtags for the filter
    const { data: tagsData } = await supabase
      .from('hashtags')
      .select('name')
      .order('name')

    if (tagsData) {
      allTags = tagsData.map(t => t.name)
    }

    let query = supabase
      .from('remixes')
      .select(`
        *,
        creator:profiles!user_id(username),
        remix_games!inner(
          game:bgg_game_id(
            bgg_id,
            name,
            image_url,
            bgg_url,
            min_players,
            max_players
          )
        ),
        remix_hashtags(
          hashtag:hashtag_id(
            name
          )
        )
      `)

    // Apply filters
    if (gameFilter) {
      query = query.filter('remix_games.game.name', 'ilike', `%${gameFilter}%`)
    }

    if (hashtagFilter) {
      query = query.filter('remix_hashtags.hashtag.name', 'ilike', `%${hashtagFilter}%`)
    }

    if (creatorFilter) {
      query = query.filter('creator.username', 'ilike', `%${creatorFilter}%`)
    }

    if (gamesFilter && gamesFilter.length > 0 && gamesFilter[0] !== '') {
      query = query.filter('remix_games.game.name', 'overlaps', gamesFilter)
    }

    if (tagsFilter && tagsFilter.length > 0 && tagsFilter[0] !== '') {
      query = query.filter('remix_hashtags.hashtag.name', 'overlaps', tagsFilter)
    }

    if (difficultyFilter && difficultyFilter !== 'any') {
      query = query.filter('difficulty', 'eq', difficultyFilter.toLowerCase())
    }

    if (minPlayersFilter) {
      query = query.filter('remix_games.game.min_players', 'gte', minPlayersFilter)
    }

    if (maxPlayersFilter) {
      query = query.filter('remix_games.game.max_players', 'lte', maxPlayersFilter)
    }

    // Apply sorting
    switch (sortFilter) {
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      case 'oldest':
        query = query.order('created_at', { ascending: true })
        break
      case 'upvotes':
        query = query.order('upvotes', { ascending: false })
        break
      case 'controversial':
        query = query.order('downvotes', { ascending: false })
        break
      default:
        // Default to newest
        query = query.order('created_at', { ascending: false })
    }

    // Apply search query if present
    if (searchQuery) {
      query = query.filter('title', 'ilike', `%${searchQuery}%`)
    }

    const { data: remixesData, error } = await query

    if (error) {
      console.error("Error fetching remixes:", error)
      throw error
    }

    // Transform data
    remixes = (remixesData as SupabaseRemix[] || []).map(remix => {
      const difficulty = remix.difficulty.charAt(0).toUpperCase() + remix.difficulty.slice(1).toLowerCase()
      if (!['Easy', 'Medium', 'Hard'].includes(difficulty)) {
        throw new Error(`Invalid difficulty value: ${difficulty}`)
      }

      return {
        id: remix.id,
        title: remix.title,
        description: remix.description,
        difficulty: difficulty as "Easy" | "Medium" | "Hard",
        upvotes: remix.upvotes || 0,
        downvotes: remix.downvotes || 0,
        user_id: remix.user_id,
        creator_username: remix.creator?.username || 'Unknown User',
        created_at: remix.created_at,
        games: remix.remix_games.map((g) => ({
          name: g.game.name,
          id: g.game.bgg_id,
          bggUrl: g.game.bgg_url || `https://boardgamegeek.com/boardgame/${g.game.bgg_id}/${g.game.name.toLowerCase().replace(/\s+/g, '-')}`,
          image: g.game.image_url || "/placeholder.svg"
        })),
        tags: remix.remix_games.map((g) => g.game.name),
        hashtags: remix.remix_hashtags
          .filter((h) => h && h.hashtag)
          .map((h) => h.hashtag.name)
      }
    })
  } catch (error) {
    console.error("Error in BrowsePage:", error)
    remixes = []
  }

  // Get user votes and favorite status
  const remixIds = remixes.map(remix => remix.id)
  let userVotes: VoteStatus = {}
  let favoriteStatus: FavoriteStatus = {}

  try {
    [userVotes, favoriteStatus] = await Promise.all([
      getUserVotes(remixIds),
      getFavoriteStatus(remixIds)
    ])
  } catch (error) {
    console.error("Error getting user votes or favorites:", error)
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-black py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h1 className="text-3xl font-bold text-[#FF6B35]">Browse Remixes</h1>
              <div className="flex items-center gap-4">
                <SortOptions />
                <Link href="/submit">
                  <Button className="bg-[#FF6B35] hover:bg-[#e55a2a] text-white">
                    Submit a Remix
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <BrowseFilters
                  allGames={allGames}
                  allTags={allTags}
                  initialFilters={{
                    creator: creatorFilter,
                    games: gamesFilter,
                    tags: tagsFilter,
                    difficulty: difficultyFilter,
                    minPlayers: minPlayersFilter,
                    maxPlayers: maxPlayersFilter
                  }}
                />
              </div>
              <div className="lg:col-span-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {remixes.map((remix) => (
                    <GameCard
                      key={remix.id}
                      {...remix}
                      userVote={userVotes[remix.id]}
                      isFavorited={favoriteStatus[remix.id]}
                      isAuthenticated={isAuthenticated}
                    />
                  ))}
                  {remixes.length === 0 && (
                    <div className="col-span-full text-center py-8">
                      <p className="text-gray-500">No remixes found.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
