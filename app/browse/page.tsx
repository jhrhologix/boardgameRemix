import Header from "@/components/header"
import Footer from "@/components/footer"
import GameCard from "@/components/game-card"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { getUserVotes, getFavoriteStatus } from "@/lib/actions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import SortOptions from "@/components/sort-options"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Hash } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: { sort?: string; q?: string; game?: string; hashtag?: string }
}) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const sort = searchParams.sort || "popular"
  const query = searchParams.q || ""
  const gameFilter = searchParams.game || ""
  const hashtagFilter = searchParams.hashtag || ""

  // Initialize remixes as an empty array
  let remixes: any[] = []

  try {
    let remixesQuery = supabase.from("remixes").select(`
      *,
      bgg_games (id, name, bgg_id, image_url, bgg_url)
    `)

    // Apply game filter if provided
    if (gameFilter) {
      const { data: filteredRemixIds } = await supabase.rpc("search_remixes_by_game", { search_term: gameFilter })

      if (filteredRemixIds && filteredRemixIds.length > 0) {
        const ids = filteredRemixIds.map((r: any) => r.id)
        remixesQuery = remixesQuery.in("id", ids)
      } else {
        // No matches, return empty array
        remixes = []
      }
    }

    // Apply hashtag filter if provided
    if (hashtagFilter && remixes.length !== 0) {
      try {
        const { data: filteredRemixIds } = await supabase.rpc("search_remixes_by_hashtag", {
          search_term: hashtagFilter,
        })

        if (filteredRemixIds && filteredRemixIds.length > 0) {
          const ids = filteredRemixIds.map((r: any) => r.id)
          remixesQuery = remixesQuery.in("id", ids)
        } else {
          // No matches, return empty array
          remixes = []
        }
      } catch (error) {
        console.error("Error searching by hashtag:", error)
        // Continue with current query
      }
    }

    // Apply general search if provided
    if (query && remixes.length !== 0) {
      remixesQuery = remixesQuery.or(`title.ilike.%${query}%, description.ilike.%${query}%`)
    }

    // Execute the query if we haven't already set remixes to empty
    if (remixes.length !== 0) {
      const { data } = await remixesQuery
      remixes = data || []
    }
  } catch (error) {
    console.error("Error fetching remixes:", error)
    remixes = []
  }

  // If no remixes found in database, use mock data for demo
  if (remixes.length === 0) {
    // Mock data for demonstration
    remixes = [
      {
        id: "1",
        title: "Tactical Tower: Chess + Jenga",
        description:
          "A strategic game where each Jenga piece represents a chess piece. Remove pieces strategically without compromising your position.",
        difficulty: "Medium",
        upvotes: 124,
        downvotes: 12,
        created_at: new Date().toISOString(),
        bgg_games: [
          { id: "bg1", name: "Chess" },
          { id: "bg2", name: "Jenga" },
        ],
      },
      {
        id: "2",
        title: "Monopoly Mayhem: Monopoly + Uno",
        description: "Use Uno cards to determine movement and property actions in this fast-paced Monopoly variant.",
        difficulty: "Easy",
        upvotes: 87,
        downvotes: 5,
        created_at: new Date().toISOString(),
        bgg_games: [
          { id: "bg3", name: "Monopoly" },
          { id: "bg4", name: "Uno" },
        ],
      },
      {
        id: "3",
        title: "Risk & Reward: Risk + Poker",
        description:
          "Combine territory control with poker hands to determine battle outcomes in this game of chance and strategy.",
        difficulty: "Hard",
        upvotes: 56,
        downvotes: 23,
        created_at: new Date().toISOString(),
        bgg_games: [
          { id: "bg5", name: "Risk" },
          { id: "bg6", name: "Poker" },
        ],
      },
    ]
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

  // Get all unique tags for filtering - handle potential errors
  let allTags: any[] = []
  try {
    const { data } = await supabase.from("tags").select("*")
    allTags = data || []
  } catch (error) {
    console.error("Error fetching tags:", error)
  }

  // Get popular hashtags - handle potential errors
  let popularHashtags: any[] = []
  try {
    const { data } = await supabase.from("hashtags").select("name, remix_hashtags(id)").order("name").limit(10)

    popularHashtags = data || []
  } catch (error) {
    console.error("Error fetching popular hashtags:", error)
    // For demo purposes, add some mock hashtags
    popularHashtags = [
      { name: "strategy" },
      { name: "family" },
      { name: "quick" },
      { name: "party" },
      { name: "kids" },
      { name: "advanced" },
      { name: "cards" },
      { name: "dice" },
      { name: "2player" },
      { name: "cooperative" },
    ]
  }

  // Get user votes and favorite status
  const remixIds = sortedRemixes.map((remix) => remix.id)
  let userVotes = {}
  let favoriteStatus = {}

  try {
    ;[userVotes, favoriteStatus] = await Promise.all([getUserVotes(remixIds), getFavoriteStatus(remixIds)])
  } catch (error) {
    console.error("Error getting user votes or favorites:", error)
  }

  // Format remixes for display
  const formattedRemixes = sortedRemixes.map((remix) => {
    // Extract tags from bgg_games
    const tags = remix.bgg_games?.map((game: any) => game.name) || []

    // Mock hashtags for demo purposes
    const demoHashtags =
      remix.id === "1"
        ? ["strategy", "dexterity", "2player"]
        : remix.id === "2"
          ? ["family", "cards", "quick"]
          : ["strategy", "cards", "advanced"]

    return {
      id: remix.id,
      title: remix.title,
      description: remix.description,
      imageSrc: "/placeholder.svg?height=300&width=500", // You could use a game image here
      tags,
      difficulty: remix.difficulty,
      upvotes: remix.upvotes || 0,
      downvotes: remix.downvotes || 0,
      userVote: userVotes?.[remix.id],
      isFavorited: favoriteStatus?.[remix.id],
      hashtags: demoHashtags,
    }
  })

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FFF8F0] py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[#004E89] mb-6">Browse Game Remixes</h1>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <form className="flex-1" action="/browse" method="GET">
                <div className="flex gap-2">
                  <Input name="q" placeholder="Search remixes..." defaultValue={query} className="flex-1" />
                  <Button type="submit" className="bg-[#FF6B35] hover:bg-[#e55a2a]">
                    Search
                  </Button>
                </div>
              </form>

              <form className="flex-1" action="/browse" method="GET">
                <div className="flex gap-2">
                  <Input
                    name="game"
                    placeholder="Filter by board game..."
                    defaultValue={gameFilter}
                    className="flex-1"
                  />
                  <Button type="submit" className="bg-[#004E89] hover:bg-[#003e6e]">
                    Filter
                  </Button>
                </div>
              </form>

              <div className="md:w-48">
                <SortOptions className="w-full" />
              </div>
            </div>

            {/* Popular hashtags */}
            {popularHashtags.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-medium text-[#004E89] mb-2">Popular Hashtags:</h2>
                <div className="flex flex-wrap gap-2">
                  {popularHashtags.map((hashtag: any) => (
                    <Link href={`/browse?hashtag=${encodeURIComponent(hashtag.name)}`} key={hashtag.name}>
                      <Badge
                        className={`
                          cursor-pointer
                          ${
                            hashtagFilter === hashtag.name
                              ? "bg-[#FF6B35] text-white"
                              : "bg-gray-200 text-gray-800 hover:bg-[#FF6B35] hover:text-white"
                          }
                        `}
                      >
                        <Hash size={14} className="mr-1" />
                        {hashtag.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {(query || gameFilter || hashtagFilter) && (
              <div className="mb-4">
                <p className="text-gray-600">
                  {formattedRemixes.length} results found
                  {query && ` for "${query}"`}
                  {gameFilter && ` with game "${gameFilter}"`}
                  {hashtagFilter && ` with hashtag "#${hashtagFilter}"`}
                </p>
                <a href="/browse" className="text-[#FF6B35] hover:underline">
                  Clear filters
                </a>
              </div>
            )}
          </div>

          <Tabs defaultValue="all" className="mb-8">
            <TabsList>
              <TabsTrigger value="all">All Remixes</TabsTrigger>
              <TabsTrigger value="easy">Easy</TabsTrigger>
              <TabsTrigger value="medium">Medium</TabsTrigger>
              <TabsTrigger value="hard">Hard</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              {formattedRemixes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {formattedRemixes.map((remix) => (
                    <GameCard key={remix.id} {...remix} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h2 className="text-2xl font-medium text-gray-700 mb-4">No remixes found</h2>
                  <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="easy" className="mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {formattedRemixes
                  .filter((remix) => remix.difficulty === "Easy")
                  .map((remix) => (
                    <GameCard key={remix.id} {...remix} />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="medium" className="mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {formattedRemixes
                  .filter((remix) => remix.difficulty === "Medium")
                  .map((remix) => (
                    <GameCard key={remix.id} {...remix} />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="hard" className="mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {formattedRemixes
                  .filter((remix) => remix.difficulty === "Hard")
                  .map((remix) => (
                    <GameCard key={remix.id} {...remix} />
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
