import Header from "@/components/header"
import Footer from "@/components/footer"
import GameCard from "@/components/game-card"
import SortOptions from "@/components/sort-options"
import { getUserVotes, getFavoriteStatus } from "@/lib/actions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/server"

export default async function PopularPage({ searchParams }: { searchParams: Promise<{ sort?: string }> }) {
  const params = await searchParams
  const sortBy = params.sort || "popular"
  
  const supabase = await createClient()
  let isAuthenticated = false
  let popularGames: any[] = []

  try {
    // Get authentication status
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    isAuthenticated = !!user

    // Fetch real remixes from database sorted by popularity
    let query = supabase
      .from('remixes')
      .select(`
        *,
        creator:profiles!user_id(username),
        remix_games(
          game:bgg_game_id(
            bgg_id,
            name,
            image_url,
            bgg_url
          )
        ),
        remix_hashtags(
          hashtag:hashtag_id(
            name
          )
        )
      `)

    // Apply sorting based on sortBy parameter
    switch (sortBy) {
      case 'upvotes':
        query = query.order('upvotes', { ascending: false })
        break
      case 'controversial':
        query = query.order('downvotes', { ascending: false })
        break
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      default: // 'popular' - sort by upvotes minus downvotes
        query = query.order('upvotes', { ascending: false })
    }

    const { data: remixesData, error } = await query.limit(12) // Show top 12

    if (error) {
      console.error("Error fetching popular remixes:", error)
      throw error
    }

    // Transform data to match expected format
    popularGames = (remixesData || []).map(remix => {
      const difficulty = remix.difficulty.charAt(0).toUpperCase() + remix.difficulty.slice(1).toLowerCase()
      
      return {
        id: remix.id,
        title: remix.title,
        description: remix.description,
        difficulty: difficulty as "Easy" | "Medium" | "Hard",
        upvotes: remix.upvotes || 0,
        downvotes: remix.downvotes || 0,
        user_id: remix.user_id,
        creator_username: (remix.creator as any)?.username || 'Unknown User',
        created_at: remix.created_at,
        games: (remix.remix_games as any[])
          .filter((g) => g && g.game && g.game.name)
          .map((g) => ({
            name: g.game.name,
            id: g.game.bgg_id,
            bggUrl: g.game.bgg_url || `https://boardgamegeek.com/boardgame/${g.game.bgg_id}`,
            image: g.game.image_url || "/placeholder.svg"
          })),
        tags: (remix.remix_games as any[])
          .filter((g) => g && g.game && g.game.name)
          .map((g) => g.game.name),
        hashtags: (remix.remix_hashtags as any[])
          .filter((h) => h && h.hashtag)
          .map((h) => h.hashtag.name)
      }
    })

  } catch (error) {
    console.error("Error in PopularPage:", error)
    popularGames = []
  }

  // Get user votes and favorite status
  const remixIds = popularGames.map(remix => remix.id)
  let userVotes: any = {}
  let favoriteStatus: any = {}

  try {
    [userVotes, favoriteStatus] = await Promise.all([
      getUserVotes(remixIds),
      getFavoriteStatus(remixIds)
    ])
  } catch (error) {
    console.error("Error getting user votes or favorites:", error)
  }

  // Sorting is handled in the database query above

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
                {popularGames.map((remix) => (
                  <GameCard
                    key={remix.id}
                    {...remix}
                    userVote={userVotes?.[remix.id]}
                    isFavorited={favoriteStatus?.[remix.id]}
                    isAuthenticated={isAuthenticated}
                  />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="strategy" className="mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {popularGames
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
                {popularGames
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
                {popularGames
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
                {popularGames
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
