import GameCard from "./game-card"
import SortOptions from "./sort-options"
import { getUserVotes, getFavoriteStatus } from "@/lib/actions"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"

export default async function FeaturedRemixes() {
  // This would normally come from your database
  const featuredGames = [
    {
      id: "1",
      title: "Tactical Tower: Chess + Jenga",
      description:
        "A strategic game where each Jenga piece represents a chess piece. Remove pieces strategically without compromising your position.",
      imageSrc: "/placeholder.svg?height=300&width=500",
      tags: ["Chess", "Jenga"],
      difficulty: "Medium" as const,
      upvotes: 124,
      downvotes: 12,
    },
    {
      id: "2",
      title: "Monopoly Mayhem: Monopoly + Uno",
      description: "Use Uno cards to determine movement and property actions in this fast-paced Monopoly variant.",
      imageSrc: "/placeholder.svg?height=300&width=500",
      tags: ["Monopoly", "Uno"],
      difficulty: "Easy" as const,
      upvotes: 87,
      downvotes: 5,
    },
    {
      id: "3",
      title: "Risk & Reward: Risk + Poker",
      description:
        "Combine territory control with poker hands to determine battle outcomes in this game of chance and strategy.",
      imageSrc: "/placeholder.svg?height=300&width=500",
      tags: ["Risk", "Playing Cards"],
      difficulty: "Hard" as const,
      upvotes: 56,
      downvotes: 23,
    },
    {
      id: "4",
      title: "Scrabble Quest: Scrabble + Catan",
      description: "Build words to collect resources and expand your vocabulary empire across the board.",
      imageSrc: "/placeholder.svg?height=300&width=500",
      tags: ["Scrabble", "Catan"],
      difficulty: "Medium" as const,
      upvotes: 142,
      downvotes: 18,
    },
  ]

  const cookieStore = await cookies()
  const supabase = await createClient()
  
  let isAuthenticated = false
  try {
    const { data: { session } } = await supabase.auth.getSession()
    isAuthenticated = !!session
  } catch (error) {
    console.error("Error checking authentication:", error)
  }

  // Get user votes and favorite status
  const remixIds = featuredGames.map((game) => game.id)
  const [userVotes, favoriteStatus] = await Promise.all([
    getUserVotes(remixIds),
    getFavoriteStatus(remixIds)
  ])

  return (
    <section className="py-16 container mx-auto px-4">
      <div className="mb-10 flex flex-col sm:flex-row justify-between items-center">
        <div className="text-center sm:text-left mb-4 sm:mb-0">
          <h2 className="text-3xl md:text-4xl font-bold text-[#004E89] mb-4">Featured Remixes</h2>
          <p className="text-gray-600 max-w-2xl">
            Check out these popular game remixes created by our community. Each one offers a fresh way to play with
            games you already own.
          </p>
        </div>
        <SortOptions />
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
      </div>
    </section>
  )
}
