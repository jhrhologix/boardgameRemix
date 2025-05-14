import Header from "@/components/header"
import Footer from "@/components/footer"
import GameCard from "@/components/game-card"
import SortOptions from "@/components/sort-options"
import { getUserVotes, getFavoriteStatus } from "@/lib/actions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function PopularPage({ searchParams }: { searchParams: { sort?: string } }) {
  const sortBy = searchParams.sort || "popular"

  // This would normally be a database query with sorting
  // For demo purposes, we'll use mock data
  const popularGames = [
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
      id: "4",
      title: "Scrabble Quest: Scrabble + Catan",
      description: "Build words to collect resources and expand your vocabulary empire across the board.",
      imageSrc: "/placeholder.svg?height=300&width=500",
      tags: ["Scrabble", "Catan"],
      difficulty: "Medium" as const,
      upvotes: 142,
      downvotes: 18,
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
      id: "8",
      title: "Pandemic Poker: Pandemic + Poker",
      description: "Use poker hands to determine your actions in fighting global diseases.",
      imageSrc: "/placeholder.svg?height=300&width=500",
      tags: ["Pandemic", "Playing Cards"],
      difficulty: "Hard" as const,
      upvotes: 98,
      downvotes: 14,
    },
    {
      id: "9",
      title: "Dominion Dice: Dominion + Yahtzee",
      description: "Roll dice to determine which cards you can buy in this deck-building game.",
      imageSrc: "/placeholder.svg?height=300&width=500",
      tags: ["Dominion", "Yahtzee"],
      difficulty: "Medium" as const,
      upvotes: 76,
      downvotes: 8,
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

  // Sort games based on the sort parameter
  const sortedGames = [...popularGames].sort((a, b) => {
    switch (sortBy) {
      case "upvotes":
        return b.upvotes - a.upvotes
      case "controversial":
        // Sort by most controversial (closest upvote/downvote ratio to 1:1)
        const aRatio = Math.min(a.upvotes, a.downvotes) / Math.max(a.upvotes, a.downvotes)
        const bRatio = Math.min(b.upvotes, b.downvotes) / Math.max(b.upvotes, b.downvotes)
        return bRatio - aRatio
      case "newest":
        // In a real app, we'd sort by date
        return 0
      case "oldest":
        // In a real app, we'd sort by date
        return 0
      case "popular":
      default:
        // Sort by net votes (upvotes - downvotes)
        return b.upvotes - b.downvotes - (a.upvotes - a.downvotes)
    }
  })

  // Get user votes and favorite status
  const remixIds = sortedGames.map((game) => game.id)
  const [userVotes, favoriteStatus] = await Promise.all([getUserVotes(remixIds), getFavoriteStatus(remixIds)])

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FFF8F0] py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[#004E89] mb-4 sm:mb-0">Popular Remixes</h1>
            <SortOptions />
          </div>

          <Tabs defaultValue="all" className="mb-8">
            <TabsList>
              <TabsTrigger value="all">All Games</TabsTrigger>
              <TabsTrigger value="strategy">Strategy</TabsTrigger>
              <TabsTrigger value="family">Family</TabsTrigger>
              <TabsTrigger value="card">Card Games</TabsTrigger>
              <TabsTrigger value="party">Party Games</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedGames.map((game) => (
                  <GameCard
                    key={game.id}
                    {...game}
                    userVote={userVotes?.[game.id]}
                    isFavorited={favoriteStatus?.[game.id]}
                  />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="strategy" className="mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedGames
                  .filter((game) => game.tags.some((tag) => ["Chess", "Risk", "Catan"].includes(tag)))
                  .map((game) => (
                    <GameCard
                      key={game.id}
                      {...game}
                      userVote={userVotes?.[game.id]}
                      isFavorited={favoriteStatus?.[game.id]}
                    />
                  ))}
              </div>
            </TabsContent>
            <TabsContent value="family" className="mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedGames
                  .filter((game) => game.tags.some((tag) => ["Monopoly", "Yahtzee", "Scrabble"].includes(tag)))
                  .map((game) => (
                    <GameCard
                      key={game.id}
                      {...game}
                      userVote={userVotes?.[game.id]}
                      isFavorited={favoriteStatus?.[game.id]}
                    />
                  ))}
              </div>
            </TabsContent>
            <TabsContent value="card" className="mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedGames
                  .filter((game) => game.tags.some((tag) => ["Playing Cards", "Uno", "Dominion"].includes(tag)))
                  .map((game) => (
                    <GameCard
                      key={game.id}
                      {...game}
                      userVote={userVotes?.[game.id]}
                      isFavorited={favoriteStatus?.[game.id]}
                    />
                  ))}
              </div>
            </TabsContent>
            <TabsContent value="party" className="mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedGames
                  .filter((game) => game.difficulty === "Easy")
                  .map((game) => (
                    <GameCard
                      key={game.id}
                      {...game}
                      userVote={userVotes?.[game.id]}
                      isFavorited={favoriteStatus?.[game.id]}
                    />
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </>
  )
}
