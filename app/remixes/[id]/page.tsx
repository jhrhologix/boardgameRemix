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
import { Suspense } from 'react'

// Generate some static params to ensure the page exists during build time
export function generateStaticParams() {
  return [{ id: "1" }, { id: "2" }, { id: "3" }, { id: "4" }]
}

interface UserVotes {
  [key: string]: 'upvote' | 'downvote' | null
}

interface FavoriteStatus {
  [key: string]: boolean
}

export default async function RemixDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  let isAuthenticated = false
  let remix = null
  let userVotes: UserVotes | null = null
  let favoriteStatus: FavoriteStatus | null = null
  const remixId = params.id // Store params.id in a variable

  // Check authentication
  try {
    const { data: { session } } = await supabase.auth.getSession()
    isAuthenticated = !!session
  } catch (error) {
    console.error("Error checking authentication:", error)
  }

  // Fetch remix data
  try {
    const { data, error } = await supabase
      .from('remixes')
      .select(`
        *,
        creator:creator_id (email),
        games:remix_games (
          game:bgg_game_id (
            bgg_id,
            name,
            image_url,
            bgg_url,
            amazon_url
          )
        ),
        hashtags:remix_hashtags (
          hashtag:hashtag_id (name)
        ),
        keywords:remix_keywords (
          keyword:keyword_id (name)
        )
      `)
      .eq('id', remixId)
      .single()

    if (data) {
      remix = data
    }
  } catch (error) {
    console.error("Error fetching remix:", error)
  }

  // If no remix found, return 404
  if (!remix) {
    notFound()
  }

  // Get user votes and favorites
  if (isAuthenticated) {
    try {
      const [votes, favorites] = await Promise.all([
        getUserVotes([remixId]),
        getFavoriteStatus([remixId])
      ])
      userVotes = votes
      favoriteStatus = favorites
    } catch (error) {
      console.error("Error getting user votes or favorites:", error)
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
                    remixId={remixId}
                    upvotes={remix.upvotes || 0}
                    downvotes={remix.downvotes || 0}
                    userVote={userVotes?.[remixId] || null}
                    isAuthenticated={isAuthenticated}
                    className="bg-white/10 rounded-full px-2 py-1"
                  />
                  <FavoriteButton
                    remixId={remixId}
                    isFavorited={favoriteStatus?.[remixId] || false}
                    isAuthenticated={isAuthenticated}
                    className="bg-white/10 rounded-full p-2"
                  />
                  <div className="hidden sm:block">
                    <TipJar />
                  </div>
                </div>
              </div>
              <p className="text-lg text-gray-200">{remix.description}</p>

              {/* Game Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                {remix.games?.map((gameRel: any) => (
                  <a
                    key={gameRel.game.bgg_id}
                    href={`/browse?game=${encodeURIComponent(gameRel.game.name)}`}
                    className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full text-sm"
                  >
                    {gameRel.game.name}
                  </a>
                ))}
              </div>

              {/* Hashtags */}
              <div className="flex flex-wrap gap-2 mt-2">
                {remix.hashtags?.map((hashtagRel: any) => (
                  <a
                    key={hashtagRel.hashtag.id}
                    href={`/browse?hashtag=${encodeURIComponent(hashtagRel.hashtag.name)}`}
                    className="text-[#FFBC42] hover:text-[#ffd175] text-sm"
                  >
                    #{hashtagRel.hashtag.name}
                  </a>
                ))}
              </div>
            </div>

            {/* Games section */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-[#004E89] mb-4">Required Games</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {remix.games?.map((gameRel: any) => (
                  <div key={gameRel.game.bgg_id} className="border rounded-lg overflow-hidden shadow-sm">
                    <div className="h-40 bg-gray-100">
                      {gameRel.game.image_url ? (
                        <img
                          src={gameRel.game.image_url}
                          alt={gameRel.game.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No image available
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-2">{gameRel.game.name}</h3>
                      <div className="flex gap-2">
                        <a
                          href={gameRel.game.bgg_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#004E89] hover:underline"
                        >
                          View on BGG
                        </a>
                        {gameRel.game.amazon_url && (
                          <a
                            href={gameRel.game.amazon_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[#FF6B35] hover:underline"
                          >
                            Buy on Amazon
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* YouTube video section */}
            {remix.youtube_url && (
              <div className="p-6">
                <h2 className="text-2xl font-bold text-[#004E89] mb-4">Watch How to Play</h2>
                <div className="aspect-w-16 aspect-h-9">
                  <iframe
                    src={`https://www.youtube.com/embed/${getYouTubeVideoId(remix.youtube_url)}`}
                    title="How to play video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full rounded-lg"
                  />
                </div>
              </div>
            )}
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

function getYouTubeVideoId(url: string): string {
  try {
    const urlObj = new URL(url)
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1)
    }
    if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
      return urlObj.searchParams.get('v') || ''
    }
  } catch (error) {
    console.error('Invalid YouTube URL:', error)
  }
  return ''
}
