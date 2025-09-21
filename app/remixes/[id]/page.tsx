import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Header from '@/components/header'
import Footer from '@/components/footer'
import RemixDetail from '@/components/remix-detail'
import Link from 'next/link'
import { generateRemixMetadata, generateRemixStructuredData } from '@/lib/seo'
import type { Metadata } from 'next'
import StructuredData from '@/components/structured-data'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params
  const supabase = await createClient()

  try {
    const { data: remix } = await supabase
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
      .eq('id', resolvedParams.id)
      .single()

    if (!remix) {
      return {
        title: 'Remix Not Found',
        description: 'The requested board game remix could not be found.'
      }
    }

    const remixData = {
      title: remix.title,
      description: remix.description,
      games: remix.remix_games?.map((g: any) => ({ name: g.game.name })) || [],
      hashtags: remix.remix_hashtags?.map((h: any) => h.hashtag.name) || [],
      creator_username: remix.creator?.username || 'Unknown',
      created_at: remix.created_at,
      id: remix.id
    }

    return generateRemixMetadata(remixData)
  } catch (error) {
    console.error('Error generating remix metadata:', error)
    return {
      title: 'Remix Not Found',
      description: 'The requested board game remix could not be found.'
    }
  }
}

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

export default async function RemixDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()

  try {
    // Get the ID from params
    const resolvedParams = await params
    const remixId = resolvedParams.id

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
      setup_instructions: String(remixData.setup_instructions || ''),
      difficulty: String(remixData.difficulty),
      upvotes: Number(remixData.upvotes) || 0,
      downvotes: Number(remixData.downvotes) || 0,
      user_id: String(remixData.user_id),
      creator_username: remixData.creator?.username || 'Unknown User',
      created_at: String(remixData.created_at),
      duration: Number(remixData.duration) || 30, // Default to 30 minutes if not set
      max_players: remixData.max_players ? Number(remixData.max_players) : undefined,
      youtube_url: String(remixData.youtube_url || ''),
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

    const structuredData = generateRemixStructuredData({
      id: safeRemixData.id,
      title: safeRemixData.title,
      description: safeRemixData.description,
      games: safeRemixData.games.map((g: any) => ({
        name: g.game.name,
        bggUrl: g.game.bgg_url
      })),
      creator_username: safeRemixData.creator_username,
      created_at: safeRemixData.created_at,
      upvotes: safeRemixData.upvotes,
      downvotes: safeRemixData.downvotes,
      difficulty: safeRemixData.difficulty
    })

    return (
      <>
        <StructuredData data={structuredData} />
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
