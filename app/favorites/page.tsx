import Header from "@/components/header"
import Footer from "@/components/footer"
import GameCard from "@/components/game-card"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getUserVotes } from "@/lib/actions"

export default async function FavoritesPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login?callbackUrl=/favorites")
  }

  // This would normally be a database query to get the user's favorites
  // For demo purposes, we'll use mock data
  const favoriteGames = [
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
  ]

  // Get user votes
  const remixIds = favoriteGames.map((game) => game.id)
  const userVotes = await getUserVotes(remixIds)

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FFF8F0] py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-[#004E89] mb-6">My Favorite Remixes</h1>

          {favoriteGames.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-medium text-gray-700 mb-4">You haven't saved any favorites yet</h2>
              <p className="text-gray-600 mb-6">
                Browse remixes and click the heart icon to save them to your favorites.
              </p>
              <a href="/browse" className="text-[#FF6B35] font-medium hover:underline">
                Browse Remixes →
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteGames.map((game) => (
                <GameCard key={game.id} {...game} userVote={userVotes?.[game.id]} isFavorited={true} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
