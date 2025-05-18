import GameCard from "./game-card"
import { getUserVotes, getFavoriteStatus } from "@/lib/actions"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"

export default async function RecentlyAdded() {
  const supabase = await createClient()
  
  let isAuthenticated = false
  try {
    const { data: { session } } = await supabase.auth.getSession()
    isAuthenticated = !!session
  } catch (error) {
    console.error("Error checking authentication:", error)
  }

  // Get user votes and favorite status
  const remixIds: string[] = [] // Your remix IDs logic here
  const [userVotes, favoriteStatus] = await Promise.all([
    getUserVotes(remixIds),
    getFavoriteStatus(remixIds)
  ])

  return (
    <section className="py-16 container mx-auto px-4 bg-[#FFF8F0]">
      <div className="mb-10 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-[#004E89] mb-4">Recently Added</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Fresh game remixes hot off the press. Check back often as our community adds new creations regularly.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* recentGames.map((game) => (
          <GameCard
            key={game.id}
            {...game}
            userVote={userVotes?.[game.id]}
            isFavorited={favoriteStatus?.[game.id]}
            isAuthenticated={isAuthenticated}
          />
        )) */}
      </div>
    </section>
  )
}
