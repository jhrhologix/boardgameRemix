import GameCard from "./game-card"
import { getUserVotes, getFavoriteStatus } from "@/lib/actions"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import type { Database } from "@/lib/database.types"
import Link from "next/link"

interface Game {
  name: string
  id: string
  bggUrl: string
  image: string
}

interface Remix {
  id: string
  title: string
  description: string
  difficulty: "Easy" | "Medium" | "Hard"
  upvotes: number
  downvotes: number
  games: Game[]
  tags: string[]
  hashtags: string[]
}

interface VoteStatus {
  [key: string]: string | undefined
}

interface FavoriteStatus {
  [key: string]: boolean
}

export default async function RecentlyAdded() {
  const supabase = await createClient()
  
  let isAuthenticated = false
  let recentRemixes: Remix[] = []

  try {
    // Get authentication status
    const { data: { user } } = await supabase.auth.getUser()
    isAuthenticated = !!user

    // Fetch the 4 most recent remixes with their related games and hashtags
    const { data: remixes, error } = await supabase
      .from('remixes')
      .select(`
        id,
        title,
        description,
        difficulty,
        upvotes,
        downvotes,
        created_at,
        remix_games!inner (
          bgg_game_id (
            name,
            bgg_id,
            bgg_url,
            image_url
          )
        ),
        remix_hashtags!inner (
          hashtag_id (
            name
          )
        )
      `)
      .order('created_at', { ascending: false })
      .limit(4)

    if (error) {
      console.error("Database error:", error)
      throw error
    }

    if (!remixes) {
      console.log("No remixes found")
      return []
    }

    // Ensure we're creating plain objects for each remix
    recentRemixes = remixes.map(remix => ({
      id: String(remix.id),
      title: String(remix.title),
      description: String(remix.description),
      difficulty: String(remix.difficulty) as "Easy" | "Medium" | "Hard",
      upvotes: Number(remix.upvotes) || 0,
      downvotes: Number(remix.downvotes) || 0,
      games: (remix.remix_games || [])
        .filter((g: any) => g && g.bgg_game_id)
        .map((g: any) => ({
          name: String(g.bgg_game_id.name),
          id: String(g.bgg_game_id.bgg_id),
          bggUrl: String(g.bgg_game_id.bgg_url),
          image: String(g.bgg_game_id.image_url || "/placeholder.svg")
        })),
      tags: (remix.remix_games || [])
        .filter((g: any) => g && g.bgg_game_id)
        .map((g: any) => String(g.bgg_game_id.name)),
      hashtags: (remix.remix_hashtags || [])
        .filter((h: any) => h && h.hashtag_id)
        .map((h: any) => String(h.hashtag_id.name))
    }))
  } catch (error) {
    console.error("Error fetching recent remixes:", error)
    recentRemixes = []
  }

  // Get user votes and favorite status
  const remixIds = recentRemixes.map(remix => remix.id)
  let userVotes: VoteStatus = {}
  let favoriteStatus: FavoriteStatus = {}

  try {
    const [votes, favorites] = await Promise.all([
      getUserVotes(remixIds),
      getFavoriteStatus(remixIds)
    ])
    
    // Ensure we're creating plain objects
    userVotes = Object.fromEntries(
      Object.entries(votes || {}).map(([key, value]) => [String(key), String(value)])
    )
    favoriteStatus = Object.fromEntries(
      Object.entries(favorites || {}).map(([key, value]) => [String(key), Boolean(value)])
    )
  } catch (error) {
    console.error("Error getting user votes or favorites:", error)
  }

  return (
    <section className="py-16 container mx-auto px-4 bg-black">
      <div className="mb-10 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-[#FF6B35] mb-4">Recently Added</h2>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Fresh game remixes hot off the press. Check back often as our community adds new creations regularly.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recentRemixes.map((remix) => (
          <GameCard
            key={remix.id}
            {...remix}
            userVote={userVotes?.[remix.id]}
            isFavorited={favoriteStatus?.[remix.id]}
            isAuthenticated={isAuthenticated}
          />
        ))}
        {recentRemixes.length === 0 && (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">No remixes have been added yet.</p>
          </div>
        )}
      </div>
      <div className="flex justify-end mt-8">
        <Link 
          href="/browse?sort=newest" 
          className="inline-flex items-center gap-2 text-[#FF6B35] hover:text-[#e55a2a] font-semibold transition-colors"
        >
          View More Recent Remixes
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
