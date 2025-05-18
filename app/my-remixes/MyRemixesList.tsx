'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import RemixCompositeImage from '@/components/remix-composite-image'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

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
  difficulty: 'Easy' | 'Medium' | 'Hard'
}

interface Props {
  remixes: Remix[]
}

export default function MyRemixesList({ remixes }: Props) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [remixToDelete, setRemixToDelete] = useState<Remix | null>(null)

  const handleDelete = async (remix: Remix) => {
    setRemixToDelete(remix)
  }

  const confirmDelete = async () => {
    if (!remixToDelete) return

    setIsDeleting(remixToDelete.id)
    try {
      const { error } = await supabase.from('remixes').delete().eq('id', remixToDelete.id)
      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error('Error deleting remix:', error)
      alert('Error deleting remix')
    } finally {
      setIsDeleting(null)
      setRemixToDelete(null)
    }
  }

  const cancelDelete = () => {
    setRemixToDelete(null)
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

  const difficultyColor = {
    Easy: "bg-green-500",
    Medium: "bg-yellow-500",
    Hard: "bg-red-500",
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {remixes.map((remix) => (
          <div key={remix.id} className="relative rounded-lg border p-4 shadow-sm">
            <div className="mb-4">
              <RemixCompositeImage 
                games={remix.bgg_games
                  .filter(g => g && g.game)
                  .map(g => ({
                    name: g.game?.name || 'Unknown Game'
                  }))} 
                difficulty={remix.difficulty}
                tags={remix.hashtags
                  .filter(tag => tag && tag.hashtag)
                  .map(tag => tag.hashtag.name)}
              />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold">{remix.title}</h2>
                <span className={`${difficultyColor[remix.difficulty]} text-white text-xs px-2 py-1 rounded-full`}>
                  {remix.difficulty}
                </span>
              </div>
              <p className="text-gray-600 mb-4 line-clamp-2">{remix.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {remix.hashtags
                  .filter(tag => tag && tag.hashtag)
                  .map((tag) => (
                    <Link
                      key={tag.hashtag?.name || 'unknown'}
                      href={`/browse?hashtag=${encodeURIComponent(tag.hashtag?.name || '')}`}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-sm transition-colors"
                    >
                      #{tag.hashtag?.name || 'unknown'}
                    </Link>
                  ))}
              </div>
              
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
                  onClick={() => handleDelete(remix)}
                  disabled={isDeleting === remix.id}
                  className="text-red-500 hover:text-red-600 disabled:opacity-50"
                >
                  {isDeleting === remix.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 mt-2">
                <span>↑{remix.upvotes}</span>
                <span>↓{remix.downvotes}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AlertDialog open={!!remixToDelete} onOpenChange={() => !isDeleting && setRemixToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this remix?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your remix
              "{remixToDelete?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete} disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 