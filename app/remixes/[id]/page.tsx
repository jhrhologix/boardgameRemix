import Header from "@/components/header"
import Footer from "@/components/footer"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import VoteButtons from "@/components/vote-buttons"
import FavoriteButton from "@/components/favorite-button"
import { getUserVotes, getFavoriteStatus } from "@/lib/actions"
import { ExternalLink, Hash } from "lucide-react"
import Link from "next/link"
import AmazonAffiliateLink from "@/components/amazon-affiliate-link"
import TipJar from "@/components/tip-jar"

// Generate some static params to ensure the page exists during build time
export function generateStaticParams() {
  return [{ id: "1" }, { id: "2" }, { id: "3" }, { id: "4" }]
}

export default async function RemixDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Check if user is authenticated
  let isAuthenticated = false
  let session = null
  try {
    const { data } = await supabase.auth.getSession()
    session = data.session
    isAuthenticated = !!session
  } catch (error) {
    console.error("Error checking authentication:", error)
  }

  // Try to get remix details
  let remix = null
  let error = null

  try {
    const response = await supabase
      .from("remixes")
      .select(`
        *,
        user:user_id (email, id),
        bgg_games (*)
      `)
      .eq("id", params.id)
      .single()

    remix = response.data
    error = response.error
  } catch (e) {
    console.error("Error fetching remix:", e)
    error = e
  }

  // If no data in database, use mock data for demo purposes
  if (!remix || error) {
    // For demo purposes, return mock data for specific IDs
    if (["1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(params.id)) {
      const mockRemixes = {
        "1": {
          id: "1",
          title: "Tactical Tower: Chess + Jenga",
          description:
            "A strategic game where each Jenga piece represents a chess piece. Remove pieces strategically without compromising your position.",
          difficulty: "Medium",
          upvotes: 124,
          downvotes: 12,
          created_at: new Date().toISOString(),
          rules:
            "1. Set up the Jenga tower as usual.\n2. Assign each block a chess piece value (pawn, knight, bishop, rook, queen, king).\n3. Players take turns removing blocks according to chess movement rules.\n4. The game ends when the tower falls or a player has no valid moves.",
          setup_instructions:
            "1. Build the Jenga tower in the standard 3x3 pattern.\n2. Use stickers or markers to label each block with a chess piece.\n3. Decide who goes first with a coin toss.",
          user: { email: "demo@example.com", id: "demo-user" },
          bgg_games: [
            {
              id: "bg1",
              name: "Chess",
              bgg_id: "171",
              image_url: "/placeholder.svg?height=300&width=300",
              bgg_url: "https://boardgamegeek.com/boardgame/171/chess",
            },
            {
              id: "bg2",
              name: "Jenga",
              bgg_id: "2452",
              image_url: "/placeholder.svg?height=300&width=300",
              bgg_url: "https://boardgamegeek.com/boardgame/2452/jenga",
            },
          ],
          // Mock hashtags for demo
          hashtags: [
            { id: "h1", name: "strategy" },
            { id: "h2", name: "dexterity" },
            { id: "h3", name: "2player" },
          ],
        },
        "2": {
          id: "2",
          title: "Monopoly Mayhem: Monopoly + Uno",
          description: "Use Uno cards to determine movement and property actions in this fast-paced Monopoly variant.",
          difficulty: "Easy",
          upvotes: 87,
          downvotes: 5,
          created_at: new Date().toISOString(),
          rules:
            "1. Deal 7 Uno cards to each player.\n2. On your turn, play an Uno card to determine your action.\n3. Number cards move you that many spaces.\n4. Special cards have unique effects (Skip: skip next player, Reverse: change direction, etc.).\n5. First player to own 3 complete property sets wins.",
          setup_instructions:
            "1. Set up the Monopoly board normally.\n2. Shuffle the Uno deck and place it near the board.\n3. Give each player starting money as in regular Monopoly.",
          user: { email: "demo@example.com", id: "demo-user" },
          bgg_games: [
            {
              id: "bg3",
              name: "Monopoly",
              bgg_id: "1406",
              image_url: "/placeholder.svg?height=300&width=300",
              bgg_url: "https://boardgamegeek.com/boardgame/1406/monopoly",
            },
            {
              id: "bg4",
              name: "Uno",
              bgg_id: "2223",
              image_url: "/placeholder.svg?height=300&width=300",
              bgg_url: "https://boardgamegeek.com/boardgame/2223/uno",
            },
          ],
          // Mock hashtags for demo
          hashtags: [
            { id: "h4", name: "family" },
            { id: "h5", name: "cards" },
            { id: "h6", name: "quick" },
          ],
        },
      }

      remix = mockRemixes[params.id] || null
    }

    // If still no remix, show 404
    if (!remix) {
      notFound()
    }
  }

  // Get user votes and favorite status
  let userVotes = {}
  let favoriteStatus = {}

  try {
    ;[userVotes, favoriteStatus] = await Promise.all([getUserVotes([params.id]), getFavoriteStatus([params.id])])
  } catch (error) {
    console.error("Error getting user votes or favorites:", error)
    // Continue with empty data
  }

  // Get tags - either from database or mock data
  let tags = []
  try {
    if (remix.bgg_games) {
      // Use game names as tags
      tags = remix.bgg_games.map((game: any) => ({
        id: game.id,
        name: game.name,
      }))
    } else {
      const { data: tagData } = await supabase
        .from("remix_tags")
        .select(`
          tags (id, name)
        `)
        .eq("remix_id", params.id)

      tags = tagData?.map((t) => t.tags) || []
    }
  } catch (error) {
    console.error("Error getting tags:", error)
    // Continue with empty tags
  }

  // Get hashtags
  let hashtags = remix.hashtags || []
  if (!hashtags.length) {
    try {
      const { data: hashtagData } = await supabase
        .from("remix_hashtags")
        .select(`
          hashtags (id, name)
        `)
        .eq("remix_id", params.id)

      hashtags = hashtagData?.map((h: any) => h.hashtags) || []
    } catch (error) {
      console.error("Error getting hashtags:", error)
      // Continue with empty hashtags
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FFF8F0] py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Header section */}
            <div className="bg-[#004E89] text-white p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <h1 className="text-3xl md:text-4xl font-bold mb-2 md:mb-0">{remix.title}</h1>
                <div className="flex items-center space-x-4">
                  <VoteButtons
                    remixId={params.id}
                    upvotes={remix.upvotes || 0}
                    downvotes={remix.downvotes || 0}
                    userVote={userVotes?.[params.id]}
                    isAuthenticated={isAuthenticated}
                    className="bg-white/10 rounded-full px-2 py-1"
                  />
                  <FavoriteButton
                    remixId={params.id}
                    isFavorited={favoriteStatus?.[params.id]}
                    isAuthenticated={isAuthenticated}
                    className="bg-white/10 rounded-full p-2"
                  />
                  <div className="hidden sm:block">
                    <TipJar />
                  </div>
                </div>
              </div>
              <p className="text-lg text-gray-200">{remix.description}</p>

              {/* Game Tags - Now clickable */}
              <div className="mt-4 flex flex-wrap gap-2">
                {tags.map((tag: any, index: number) => (
                  <Link href={`/browse?game=${encodeURIComponent(tag.name)}`} key={index}>
                    <Badge className="bg-[#FFBC42] hover:bg-[#e5a93b] text-[#2A2B2A] cursor-pointer">{tag.name}</Badge>
                  </Link>
                ))}
                <Badge
                  className={`
                  ${
                    remix.difficulty === "Easy"
                      ? "bg-green-500"
                      : remix.difficulty === "Medium"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  } text-white
                `}
                >
                  {remix.difficulty}
                </Badge>
              </div>

              {/* Hashtags section - Already clickable */}
              {hashtags.length > 0 && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {hashtags.map((hashtag: any, index: number) => (
                      <Link href={`/browse?hashtag=${encodeURIComponent(hashtag.name)}`} key={index}>
                        <Badge className="bg-[#FF6B35] hover:bg-[#e55a2a] text-white cursor-pointer">
                          <Hash size={14} className="mr-1" />
                          {hashtag.name}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Required Games section - Now with Amazon affiliate links */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-[#004E89] mb-4">Required Games</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {remix.bgg_games &&
                  remix.bgg_games.map((game: any) => (
                    <div key={game.id} className="border rounded-lg overflow-hidden shadow-sm">
                      <div className="h-40 bg-gray-100">
                        {game.image_url ? (
                          <img
                            src={game.image_url || "/placeholder.svg"}
                            alt={game.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No image available
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold">
                          <Link
                            href={`/browse?game=${encodeURIComponent(game.name)}`}
                            className="text-[#004E89] hover:text-[#FF6B35] hover:underline"
                          >
                            {game.name}
                          </Link>
                        </h3>
                        {game.year_published && <p className="text-sm text-gray-500">({game.year_published})</p>}
                        <div className="flex flex-col gap-2 mt-3">
                          <AmazonAffiliateLink gameName={game.name} className="w-full" />
                          <div className="flex justify-between items-center">
                            <a
                              href={game.bgg_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                            >
                              View on BGG
                              <ExternalLink size={14} className="ml-1" />
                            </a>
                            <Link
                              href={`/browse?game=${encodeURIComponent(game.name)}`}
                              className="text-[#FF6B35] hover:underline text-sm"
                            >
                              Find Remixes
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Rules section */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-[#004E89] mb-4">Game Rules</h2>
              <div className="prose max-w-none">
                {remix.rules &&
                  remix.rules.split("\n").map((paragraph: string, i: number) => (
                    <p key={i} className="mb-4">
                      {paragraph}
                    </p>
                  ))}
              </div>
            </div>

            {/* Setup Instructions section */}
            <div className="p-6">
              <h2 className="text-2xl font-bold text-[#004E89] mb-4">Setup Instructions</h2>
              <div className="prose max-w-none">
                {remix.setup_instructions &&
                  remix.setup_instructions.split("\n").map((paragraph: string, i: number) => (
                    <p key={i} className="mb-4">
                      {paragraph}
                    </p>
                  ))}
              </div>
            </div>

            {/* Creator info with tip jar */}
            <div className="p-6 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center">
              <p className="text-sm text-gray-500 mb-3 sm:mb-0">
                Created by {remix.user?.email ? remix.user.email.split("@")[0] : "Anonymous"} •{" "}
                {new Date(remix.created_at).toLocaleDateString()}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Enjoyed this remix?</span>
                <TipJar />
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link href="/browse" className="text-[#FF6B35] hover:text-[#e55a2a] font-medium">
              Browse more remixes →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
