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

interface Game {
  id: string
  name: string
  bgg_id?: string
  image_url?: string
  bgg_url?: string
}

interface Remix {
  id: string
  title: string
  description: string
  difficulty: "Easy" | "Medium" | "Hard"
  upvotes: number
  downvotes: number
  created_at: string
  bgg_games: Game[]
  hashtags?: string[]
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
  searchParams: { sort?: string; q?: string; game?: string; hashtag?: string }
}) {
  const cookieStore = cookies()
  const supabase = await createClient()

  // Get search parameters
  const sort = searchParams?.sort || "popular"
  const query = searchParams?.q || ""
  const gameFilter = searchParams?.game || ""
  const hashtagFilter = searchParams?.hashtag || ""

  // Initialize remixes as an empty array
  let remixes: Remix[] = []

  try {
    let remixesQuery = supabase
      .from("remixes")
      .select(`
        *,
        bgg_games (id, name, bgg_id, image_url, bgg_url),
        remix_hashtags (hashtag)
      `)

    // Apply game filter if provided
    if (gameFilter) {
      const { data: filteredRemixIds } = await supabase.rpc("search_remixes_by_game", { search_term: gameFilter })

      if (filteredRemixIds && filteredRemixIds.length > 0) {
        const ids = filteredRemixIds.map((r: any) => r.id)
        remixesQuery = remixesQuery.in("id", ids)
      }
    }

    // Apply hashtag filter if provided
    if (hashtagFilter) {
      try {
        const { data: filteredRemixIds } = await supabase.rpc("search_remixes_by_hashtag", {
          search_term: hashtagFilter,
        })

        if (filteredRemixIds && filteredRemixIds.length > 0) {
          const ids = filteredRemixIds.map((r: any) => r.id)
          remixesQuery = remixesQuery.in("id", ids)
        }
      } catch (error) {
        console.error("Error searching by hashtag:", error)
      }
    }

    // Apply general search if provided
    if (query) {
      remixesQuery = remixesQuery.or(`title.ilike.%${query}%, description.ilike.%${query}%`)
    }

    // Execute the query
    const { data, error } = await remixesQuery
    if (error) throw error
    remixes = data || []
  } catch (error) {
    console.error("Error fetching remixes:", error)
    remixes = []
  }

  // Sort remixes based on the sort parameter
  const sortedRemixes = [...remixes].sort((a, b) => {
    switch (sort) {
      case "upvotes":
        return (b.upvotes || 0) - (a.upvotes || 0)
      case "controversial":
        const aRatio = Math.min(a.upvotes || 0, a.downvotes || 0) / Math.max(a.upvotes || 1, a.downvotes || 1)
        const bRatio = Math.min(b.upvotes || 0, b.downvotes || 0) / Math.max(b.upvotes || 1, b.downvotes || 1)
        return bRatio - aRatio
      case "newest":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case "oldest":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case "popular":
      default:
        return (b.upvotes || 0) - (b.downvotes || 0) - ((a.upvotes || 0) - (a.downvotes || 0))
    }
  })

  // Get all unique tags for filtering
  let allTags: any[] = []
  try {
    const { data } = await supabase.from("tags").select("*")
    allTags = data || []
  } catch (error) {
    console.error("Error fetching tags:", error)
  }

  // Get popular hashtags
  let popularHashtags: any[] = []
  try {
    const { data } = await supabase.from("hashtags").select("name, remix_hashtags(id)").order("name").limit(10)
    popularHashtags = data || []
  } catch (error) {
    console.error("Error fetching popular hashtags:", error)
    popularHashtags = []
  }

  // Check authentication status
  let isAuthenticated = false
  try {
    const { data: { user } } = await supabase.auth.getUser()
    isAuthenticated = !!user
  } catch (error) {
    console.error("Error checking authentication:", error)
  }

  // Get user votes and favorite status
  const remixIds = sortedRemixes.map((remix) => remix.id)
  let userVotes: VoteStatus = {}
  let favoriteStatus: FavoriteStatus = {}

  try {
    [userVotes, favoriteStatus] = await Promise.all([getUserVotes(remixIds), getFavoriteStatus(remixIds)])
  } catch (error) {
    console.error("Error getting user votes or favorites:", error)
  }

  // Format remixes for display
  const formattedRemixes = sortedRemixes.map((remix) => {
    const bggGames: BGGGame[] = remix.bgg_games?.map((game: Game) => ({
      name: game.name,
      id: game.id,
      bggUrl: game.bgg_url || `https://boardgamegeek.com/boardgame/${game.bgg_id || '0'}/${game.name.toLowerCase().replace(/\s+/g, '-')}`,
      image: game.image_url || "/placeholder.svg"
    })) || []

    return {
      ...remix,
      tags: remix.bgg_games?.map((game: Game) => game.name) || [],
      games: bggGames,
      hashtags: remix.hashtags || [],
      userVote: userVotes[remix.id],
      isFavorited: favoriteStatus[remix.id],
      isAuthenticated
    }
  })

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#FF6B35] mb-4">Browse Remixes</h1>
          <p className="text-gray-300">
            Discover creative board game remixes from our community. Filter by game, sort by popularity, or search for specific ideas.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters Section */}
          <aside className="w-full md:w-64 space-y-6 bg-black p-4 rounded-lg shadow-sm border border-[#004E89]/20">
            <SearchInput defaultValue={query} />

            <div>
              <h3 className="font-semibold mb-2 text-[#FF6B35]">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {popularHashtags.map((tag) => (
                  <Link
                    key={tag.name}
                    href={`/browse?hashtag=${tag.name}`}
                    className={`inline-flex items-center text-sm px-3 py-1 rounded-full ${
                      hashtagFilter === tag.name
                        ? "bg-[#004E89] text-white"
                        : "bg-black border border-[#004E89]/20 text-[#FF6B35] hover:bg-[#004E89]/20"
                    }`}
                  >
                    <Hash className="w-3 h-3 mr-1" />
                    {tag.name}
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <div className="mb-6 flex justify-between items-center bg-black p-4 rounded-lg shadow-sm border border-[#004E89]/20">
              <p className="text-gray-300">{formattedRemixes.length} remixes found</p>
              <SortOptions />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {formattedRemixes.map((remix) => (
                <GameCard
                  key={remix.id}
                  {...remix}
                />
              ))}
              {formattedRemixes.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">No remixes found. Try adjusting your search criteria.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
