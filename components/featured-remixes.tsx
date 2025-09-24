import GameCard from "./game-card"
import SortOptions from "./sort-options"
import { getUserVotes, getFavoriteStatus } from "@/lib/actions"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

interface RemixData {
  id: string
  title: string
  description: string
  difficulty: "Easy" | "Medium" | "Hard"
  upvotes: number
  downvotes: number
  user_id: string
  creator_username: string
  games: Array<{
    name: string
    id: string
    bggUrl: string
    image: string
  }>
  tags: string[]
  hashtags: string[]
}

interface SupabaseResponse {
  id: string
  title: string
  description: string
  difficulty: string
  upvotes: number
  downvotes: number
  user_id: string
  created_at: string
  creator: {
    username: string | null
  } | null
  bgg_games: Array<{
    game: {
      name: string
      bgg_id: string
      image_url: string | null
      bgg_url: string | null
    }
  }>
  remix_hashtags: Array<{
    hashtag_id: {
      name: string
    }
  }>
}

interface VoteStatus {
  [key: string]: string | undefined
}

interface FavoriteStatus {
  [key: string]: boolean
}

export default async function FeaturedRemixes() {
  const cookieStore = cookies()
  const supabase = await createClient()
  
  let isAuthenticated = false
  let featuredGames: RemixData[] = []

  try {
    // Skip auth check in development to avoid rate limits
    // Authentication will be handled by client-side components
    isAuthenticated = false

    // Fetch featured remixes (those with most upvotes)
    const { data: remixesData, error } = await supabase
      .from('remixes')
      .select(`
        id,
        title,
        description,
        difficulty,
        user_id,
        upvotes,
        downvotes,
        created_at,
        creator:profiles!user_id(username),
        bgg_games:remix_games!inner (
          game:bgg_game_id (
            name,
            bgg_id,
            image_url,
            bgg_url
          )
        ),
        remix_hashtags (
          hashtag_id (
            name
          )
        )
      `)
      .order('upvotes', { ascending: false })
      .limit(8)

    if (error) {
      console.error("Error fetching featured remixes:", error)
      throw error
    }

    // Type cast and transform the data
    featuredGames = (remixesData as any[] || []).map(remix => {
      // Ensure proper difficulty type casting
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
        games: remix.bgg_games.map(g => ({
          name: g.game.name,
          id: g.game.bgg_id,
          bggUrl: g.game.bgg_url || `https://boardgamegeek.com/boardgame/${g.game.bgg_id}/${g.game.name.toLowerCase().replace(/\s+/g, '-')}`,
          image: g.game.image_url || "/placeholder.svg"
        })),
        tags: remix.bgg_games.map(g => g.game.name),
        hashtags: remix.remix_hashtags
          .filter(h => h && h.hashtag_id)
          .map(h => h.hashtag_id.name)
      }
    })
  } catch (error) {
    console.error("Error in FeaturedRemixes:", error)
    featuredGames = []
  }

  // Get user votes and favorite status
  const remixIds = featuredGames.map((game) => game.id)
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
    <section className="py-16 container mx-auto px-4 bg-black">
      <div className="mb-10 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-[#FF6B35] mb-4">Featured Remixes</h2>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Check out some of our most popular game remixes, voted by the community.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuredGames.map((game) => (
          <GameCard
            key={game.id}
            {...game}
            userVote={userVotes?.[game.id]}
            isFavorited={favoriteStatus?.[game.id]}
            isAuthenticated={isAuthenticated}
          />
        ))}
        {featuredGames.length === 0 && (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">No featured remixes available.</p>
          </div>
        )}
      </div>
      <div className="flex justify-end mt-8">
        <Link 
          href="/browse?sort=upvotes" 
          className="inline-flex items-center gap-2 text-[#FF6B35] hover:text-[#e55a2a] font-semibold transition-colors"
        >
          View More Popular Remixes
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </Link>
      </div>
    </section>
  )
}
