import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Header from '@/components/header'
import Footer from '@/components/footer'
import RemixDetail from '@/components/remix-detail'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface GameRelation {
  game: {
    bgg_id: string
    name: string
    image_url: string | null
    bgg_url: string
  }
}

interface HashtagRelation {
  hashtag: {
    name: string
  }
}

// Add generateMetadata function to handle params properly
export async function generateMetadata({ params }: { params: { id: string } }) {
  const id = params.id
  return {
    title: `Remix Details - ${id}`,
  }
}

export default async function RemixDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  try {
    // Get the ID from params
    const remixId = params.id

    if (!remixId) {
      notFound()
    }

    // Fetch remix data
    const { data: remixData, error: remixError } = await supabase
      .from('remixes')
      .select(`
        *,
        creator:profiles!user_id(username),
        games:remix_games (
          game:bgg_game_id (
            bgg_id,
            name,
            image_url,
            bgg_url
          )
        ),
        hashtags:remix_hashtags (
          hashtag:hashtag_id (
            name
          )
        )
      `)
      .eq('id', remixId)
      .single()

    if (remixError) throw remixError
    if (!remixData) notFound()

    // Ensure we're creating a plain object
    const safeRemixData = {
      id: String(remixData.id),
      title: String(remixData.title),
      description: String(remixData.description),
      rules: String(remixData.rules),
      difficulty: String(remixData.difficulty),
      upvotes: Number(remixData.upvotes) || 0,
      downvotes: Number(remixData.downvotes) || 0,
      user_id: String(remixData.user_id),
      creator_username: remixData.creator?.username || 'Unknown User',
      created_at: String(remixData.created_at),
      duration: Number(remixData.duration) || 30, // Default to 30 minutes if not set
      games: (remixData.games || []).map((gameRel: GameRelation) => ({
        game: {
          bgg_id: String(gameRel.game.bgg_id),
          name: String(gameRel.game.name),
          image_url: String(gameRel.game.image_url || '/placeholder.svg'),
          bgg_url: String(gameRel.game.bgg_url),
        }
      })),
      hashtags: (remixData.hashtags || []).map((hashtagRel: HashtagRelation) => ({
        hashtag: {
          name: String(hashtagRel.hashtag.name),
        }
      }))
    }

    return (
      <>
        <Header />
        <main className="min-h-screen bg-black py-8">
          <div className="container mx-auto px-4">
            <RemixDetail initialData={safeRemixData} />
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
  } catch (error) {
    console.error('Error loading remix:', error)
    return (
      <>
        <Header />
        <main className="min-h-screen bg-black py-8">
          <div className="container mx-auto px-4">
            <div className="text-center py-8">
              <p className="text-red-500">Failed to load remix</p>
              <Link href="/browse" className="text-[#FF6B35] hover:text-[#e55a2a] mt-4 inline-block">
                Browse other remixes →
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }
}
