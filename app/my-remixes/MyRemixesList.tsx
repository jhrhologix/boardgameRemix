'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import ComposedGameImage from '@/components/composed-game-image'

interface BGGGame {
  game: {
    name: string
    bgg_id: string
    image_url: string | null
  } | null
}

interface Hashtag {
  hashtag: {
    name: string
  }
}

interface Remix {
  id: string
  title: string
  description: string
  bgg_games: BGGGame[]
  hashtags: Hashtag[]
  created_at: string
  upvotes: number
  downvotes: number
}

interface Props {
  remixes: Remix[]
}

export default function MyRemixesList({ remixes }: Props) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this remix?')) return

    setIsDeleting(id)
    try {
      const { error } = await supabase.from('remixes').delete().eq('id', id)
      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error('Error deleting remix:', error)
      alert('Error deleting remix')
    } finally {
      setIsDeleting(null)
    }
  }

  if (remixes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">You haven't created any remixes yet.</p>
        <Link
          href="/submit"
          className="text-blue-500 hover:text-blue-600 font-semibold"
        >
          Create your first remix
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {remixes.map((remix) => (
        <div key={remix.id} className="relative rounded-lg border p-4 shadow-sm">
          <div className="mb-4">
            <ComposedGameImage 
              games={remix.bgg_games
                .filter(g => g && g.game)
                .map(g => ({
                  name: g.game?.name || 'Unknown Game',
                  image_url: g.game?.image_url || null
                }))} 
            />
          </div>
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-2">{remix.title}</h2>
            <p className="text-gray-600 mb-4 line-clamp-2">{remix.description}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {remix.hashtags
                .filter(tag => tag && tag.hashtag)
                .map((tag) => (
                  <span
                    key={tag.hashtag?.name || 'unknown'}
                    className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm"
                  >
                    #{tag.hashtag?.name || 'unknown'}
                  </span>
                ))}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  href={`/remixes/${remix.id}`}
                  className="text-blue-500 hover:text-blue-600"
                >
                  View
                </Link>
                <Link
                  href={`/submit?edit=${remix.id}`}
                  className="text-green-500 hover:text-green-600"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(remix.id)}
                  disabled={isDeleting === remix.id}
                  className="text-red-500 hover:text-red-600 disabled:opacity-50"
                >
                  {isDeleting === remix.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>↑{remix.upvotes}</span>
                <span>↓{remix.downvotes}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 