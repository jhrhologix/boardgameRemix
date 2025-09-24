"use client"

import { useEffect, useState } from "react"
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import GameCard from "@/components/game-card"
import { useToast } from "@/components/ui/use-toast"
import Header from "@/components/header"
import Footer from "@/components/footer"

interface FavoriteRemix {
  id: string
  title: string
  description: string
  difficulty: "Easy" | "Medium" | "Hard"
  upvotes: number
  downvotes: number
  user_id: string
  games: Array<{
    name: string
    id: string
    bggUrl: string
    image: string
  }>
  tags: string[]
  hashtags: string[]
}

interface SupabaseRemix {
  remix_id: string
  remix: {
    id: string
    title: string
    description: string
    difficulty: string
    user_id: string
    upvotes: number
    downvotes: number
    bgg_games: Array<{
      game: {
        name: string
        bgg_id: string
        image_url: string | null
        bgg_url: string | null
      }
    }>
    remix_hashtags: Array<{
      hashtag_id: {
        name: string
      }
    }>
  }
}

export default function FavoritesPage() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<FavoriteRemix[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        router.push('/auth?callbackUrl=/favorites')
        return
      }

      try {

        const { data, error: fetchError } = await supabase
          .from('user_favorites')
          .select(`
            remix_id,
            remix:remixes (
              id,
              title,
              description,
              difficulty,
              user_id,
              upvotes,
              downvotes,
              bgg_games:remix_games!inner (
                game:bgg_game_id (
                  name,
                  bgg_id,
                  image_url,
                  bgg_url
                )
              ),
              remix_hashtags (
                hashtag_id (
                  name
                )
              )
            )
          `)
          .eq('user_id', user.id)

        if (fetchError) {
          toast({
            title: "Error",
            description: "Failed to load favorites. Please try again.",
            variant: "destructive"
          })
          throw fetchError
        }

        const typedData = data as unknown as SupabaseRemix[]
        const remixes = typedData?.map(item => ({
          id: item.remix.id,
          title: item.remix.title,
          description: item.remix.description,
          difficulty: item.remix.difficulty.charAt(0).toUpperCase() + item.remix.difficulty.slice(1) as "Easy" | "Medium" | "Hard",
          upvotes: item.remix.upvotes || 0,
          downvotes: item.remix.downvotes || 0,
          user_id: item.remix.user_id,
          games: item.remix.bgg_games.map(g => ({
            name: g.game.name,
            id: g.game.bgg_id,
            bggUrl: g.game.bgg_url || `https://boardgamegeek.com/boardgame/${g.game.bgg_id}/${g.game.name.toLowerCase().replace(/\s+/g, '-')}`,
            image: g.game.image_url || "/placeholder.svg"
          })),
          tags: item.remix.bgg_games.map(g => g.game.name),
          hashtags: item.remix.remix_hashtags
            .filter(h => h && h.hashtag_id)
            .map(h => h.hashtag_id.name)
        })) || []

        setFavorites(remixes)
      } catch (err) {
        console.error('Error fetching favorites:', err)
        setError('Failed to load favorites')
      } finally {
        setIsLoading(false)
      }
    }

    fetchFavorites()
  }, [user, router, toast])

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-[#FF6B35]" />
        </div>
        <Footer />
      </>
    )
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-500">
            <p>{error}</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-black">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-10 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-[#FF6B35] mb-4">My Favorites</h1>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Your collection of favorite game remixes. Check back often for new additions from the community.
            </p>
          </div>
          
          {favorites.length === 0 ? (
            <div className="text-center text-gray-500">
              <p>You haven't favorited any remixes yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((remix) => (
                <GameCard
                  key={remix.id}
                  {...remix}
                  isAuthenticated={true}
                  isFavorited={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
