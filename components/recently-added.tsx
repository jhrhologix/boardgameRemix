import GameCard from "./game-card"
import { getUserVotes, getFavoriteStatus } from "@/lib/actions"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"

export default async function RecentlyAdded() {
  // This would normally come from your database
  const recentGames = [
    {
      id: "5",
      title: "Clue-opoly: Clue + Monopoly",
      description: "Solve a mystery while buying properties in this mashup of deduction and real estate.",
      imageSrc: "/placeholder.svg?height=300&width=500",
      tags: ["Clue", "Monopoly"],
      difficulty: "Medium" as const,
      upvotes: 42,
      downvotes: 8,
    },
    {
      id: "6",
      title: "Sequence Shuffle: Sequence + Cards",
      description: "A new twist on Sequence using standard playing cards to determine placement strategy.",
      imageSrc: "/placeholder.svg?height=300&width=500",
      tags: ["Sequence", "Playing Cards"],
      difficulty: "Easy" as const,
      upvotes: 28,
      downvotes: 3,
    },
    {
      id: "7",
      title: "Ticket to Catan: Ticket to Ride + Catan",
      description: "Build routes and collect resources in this strategic combination of two beloved games.",
      imageSrc: "/placeholder.svg?height=300&width=500",
      tags: ["Ticket to Ride", "Catan"],
      difficulty: "Hard" as const,
      upvotes: 35,
      downvotes: 12,
    },
  ]

  // Check if user is authenticated
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  let isAuthenticated = false

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    isAuthenticated = !!session
  } catch (error) {
    console.error("Error checking authentication:", error)
  }

  // Get user votes and favorite status
  let userVotes = {}
  let favoriteStatus = {}

  try {
    const remixIds = recentGames.map((game) => game.id)
    ;[userVotes, favoriteStatus] = await Promise.all([getUserVotes(remixIds), getFavoriteStatus(remixIds)])
  } catch (error) {
    console.error("Error getting user votes or favorites:", error)
  }

  return (
    <section className="py-16 container mx-auto px-4 bg-[#FFF8F0]">
      <div className="mb-10 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-[#004E89] mb-4">Recently Added</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Fresh game remixes hot off the press. Check back often as our community adds new creations regularly.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recentGames.map((game) => (
          <GameCard
            key={game.id}
            {...game}
            userVote={userVotes?.[game.id]}
            isFavorited={favoriteStatus?.[game.id]}
            isAuthenticated={isAuthenticated}
          />
        ))}
      </div>
    </section>
  )
}
