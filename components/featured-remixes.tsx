import GameCard from "./game-card"
import SortOptions from "./sort-options"
import { getUserVotes, getFavoriteStatus } from "@/lib/actions"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

export default async function FeaturedRemixes() {
  // This would normally come from your database
  const featuredGames = [
    {
      id: "1",
      title: "Tactical Tower: Chess + Jenga",
      description:
        "A strategic game where each Jenga piece represents a chess piece. Remove pieces strategically without compromising your position.",
      tags: ["Chess", "Jenga"],
      difficulty: "Medium" as const,
      upvotes: 124,
      downvotes: 12,
      games: [
        {
          name: "Chess",
          id: "chess",
          bggUrl: "https://boardgamegeek.com/boardgame/171/chess",
          image: "/placeholder.svg"
        },
        {
          name: "Jenga",
          id: "jenga",
          bggUrl: "https://boardgamegeek.com/boardgame/2452/jenga",
          image: "/placeholder.svg"
        }
      ],
      hashtags: ["strategy", "dexterity", "abstract", "puzzle", "2player"]
    },
    {
      id: "2",
      title: "Monopoly Mayhem: Monopoly + Uno",
      description: "Use Uno cards to determine movement and property actions in this fast-paced Monopoly variant.",
      tags: ["Monopoly", "Uno"],
      difficulty: "Easy" as const,
      upvotes: 87,
      downvotes: 5,
      games: [
        {
          name: "Monopoly",
          id: "monopoly",
          bggUrl: "https://boardgamegeek.com/boardgame/1406/monopoly",
          image: "/placeholder.svg"
        },
        {
          name: "Uno",
          id: "uno",
          bggUrl: "https://boardgamegeek.com/boardgame/2223/uno",
          image: "/placeholder.svg"
        }
      ],
      hashtags: ["family", "card", "quick", "economic", "party"]
    },
    {
      id: "3",
      title: "Risk & Reward: Risk + Poker",
      description:
        "Combine territory control with poker hands to determine battle outcomes in this game of chance and strategy.",
      tags: ["Risk", "Playing Cards"],
      difficulty: "Hard" as const,
      upvotes: 56,
      downvotes: 23,
      games: [
        {
          name: "Risk",
          id: "risk",
          bggUrl: "https://boardgamegeek.com/boardgame/181/risk",
          image: "/placeholder.svg"
        },
        {
          name: "Poker",
          id: "poker",
          bggUrl: "https://boardgamegeek.com/boardgame/1115/poker",
          image: "/placeholder.svg"
        }
      ],
      hashtags: ["strategy", "card", "bluffing", "war", "area control"]
    },
    {
      id: "4",
      title: "Scrabble Quest: Scrabble + Catan",
      description: "Build words to collect resources and expand your vocabulary empire across the board.",
      tags: ["Scrabble", "Catan"],
      difficulty: "Medium" as const,
      upvotes: 142,
      downvotes: 18,
      games: [
        {
          name: "Scrabble",
          id: "scrabble",
          bggUrl: "https://boardgamegeek.com/boardgame/320/scrabble",
          image: "/placeholder.svg"
        },
        {
          name: "Catan",
          id: "catan",
          bggUrl: "https://boardgamegeek.com/boardgame/13/catan",
          image: "/placeholder.svg"
        }
      ],
      hashtags: ["word", "resource", "strategy", "tile", "competitive"]
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
      <div className="flex justify-end mt-8">
        <Link 
          href="/browse?sort=popular" 
          className="inline-flex items-center gap-2 text-[#004E89] hover:text-[#FF6B35] font-semibold transition-colors"
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
