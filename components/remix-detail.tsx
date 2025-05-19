'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import VoteButtons from '@/components/vote-buttons'
import FavoriteButton from '@/components/favorite-button'
import TipJar from '@/components/tip-jar'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Clock } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface RemixData {
  id: string
  title: string
  description: string
  rules: string
  difficulty: string
  upvotes: number
  downvotes: number
  user_id: string
  created_at: string
  duration: number
  games: {
    game: {
      bgg_id: string
      name: string
      image_url: string
      bgg_url: string
    }
  }[]
  hashtags: {
    hashtag: {
      name: string
    }
  }[]
}

interface RemixDetailProps {
  initialData: RemixData
}

// Function to get Amazon affiliate link
function getAmazonLink(gameName: string) {
  const searchQuery = encodeURIComponent(gameName + " board game")
  // Replace YOUR_AFFILIATE_ID with your actual Amazon affiliate ID
  return `https://www.amazon.com/s?k=${searchQuery}&tag=YOUR_AFFILIATE_ID`
}

export default function RemixDetail({ initialData }: RemixDetailProps) {
  const router = useRouter()
  const [remix, setRemix] = useState<RemixData>(initialData)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [userVote, setUserVote] = useState<string | undefined>(undefined)
  const [isFavorited, setIsFavorited] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadUserData() {
      const supabase = createClient()
      try {
        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError) throw authError
        
        if (user) {
          setIsAuthenticated(true)
          setIsOwner(user.id === remix.user_id)

          // Get user's vote
          const { data: voteData } = await supabase
            .from('votes')
            .select('value')
            .eq('user_id', user.id)
            .eq('remix_id', remix.id)
            .single()

          setUserVote(voteData?.value)

          // Get favorite status
          const { data: favoriteData } = await supabase
            .from('favorites')
            .select('id')
            .eq('user_id', user.id)
            .eq('remix_id', remix.id)
            .single()

          setIsFavorited(!!favoriteData)
        }
      } catch (err) {
        console.error('Error loading user data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load user data')
      }
    }

    loadUserData()
  }, [remix.id, remix.user_id])

  const handleDelete = async () => {
    if (isDeleting) return

    setIsDeleting(true)
    const supabase = createClient()
    try {
      const { error } = await supabase
        .from('remixes')
        .delete()
        .eq('id', remix.id)

      if (error) throw error

      router.push('/profile')
    } catch (err) {
      console.error('Error deleting remix:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete remix')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="bg-[#1a1a1a] rounded-lg shadow-md overflow-hidden border border-[#333]">
      {/* Header section */}
      <div className="bg-[#004E89] p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{remix.title}</h1>
            <div className="flex items-center gap-2 text-gray-300 mb-2">
              <Clock size={16} />
              <span>{remix.duration} minutes</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <VoteButtons
              remixId={remix.id}
              upvotes={remix.upvotes || 0}
              downvotes={remix.downvotes || 0}
              userVote={userVote}
              isAuthenticated={isAuthenticated}
              className="bg-white/10 rounded-full px-2 py-1"
            />
            <FavoriteButton
              remixId={remix.id}
              isFavorited={isFavorited}
              isAuthenticated={isAuthenticated}
              className="bg-white/10 rounded-full p-2"
            />
            {isOwner && (
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => router.push(`/submit?edit=${remix.id}`)}
                  className="bg-[#FF6B35] hover:bg-[#e55a2a] text-white"
                >
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Delete</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-[#1a1a1a] border-[#333] text-white">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-[#FF6B35]">Delete Remix</AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-400">
                        Are you sure you want to delete this remix? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-[#2a2a2a] text-white hover:bg-[#333]">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        </div>
        <p className="text-lg text-gray-200">{remix.description}</p>

        {/* Game Tags */}
        <div className="flex flex-wrap gap-2 mt-4">
          {remix.games?.map((gameRel) => (
            <a
              key={gameRel.game.bgg_id}
              href={`/browse?game=${encodeURIComponent(gameRel.game.name)}`}
              className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full text-sm text-white"
            >
              {gameRel.game.name}
            </a>
          ))}
        </div>

        {/* Hashtags */}
        <div className="flex flex-wrap gap-2 mt-2">
          {remix.hashtags?.map((hashtagRel) => (
            <a
              key={hashtagRel.hashtag.name}
              href={`/browse?hashtag=${encodeURIComponent(hashtagRel.hashtag.name)}`}
              className="text-[#FFBC42] hover:text-[#ffd175] text-sm"
            >
              #{hashtagRel.hashtag.name}
            </a>
          ))}
        </div>
      </div>

      {/* Rules section */}
      <div className="p-6 border-t border-[#333]">
        <h2 className="text-2xl font-bold text-[#FF6B35] mb-4">Rules</h2>
        <div className="prose prose-invert max-w-none">
          {remix.rules.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4 text-gray-300">{paragraph}</p>
          ))}
        </div>
      </div>

      {/* Games section */}
      <div className="p-6 border-t border-[#333]">
        <h2 className="text-2xl font-bold text-[#FF6B35] mb-4">Required Games</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {remix.games?.map((gameRel) => (
            <div key={gameRel.game.bgg_id} className="flex flex-col gap-2">
              <a
                href={gameRel.game.bgg_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-[#2a2a2a] rounded-lg overflow-hidden hover:ring-2 hover:ring-[#FF6B35] transition-all"
              >
                <div className="aspect-w-16 aspect-h-9 relative">
                  <Image
                    src={gameRel.game.image_url || '/placeholder.svg'}
                    alt={gameRel.game.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-white">{gameRel.game.name}</h3>
                  <p className="text-sm text-[#FF6B35] mt-1">View on BoardGameGeek →</p>
                </div>
              </a>
              <a
                href={getAmazonLink(gameRel.game.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#FF6B35] hover:bg-[#e55a2a] text-white text-center py-2 px-4 rounded-lg transition-colors"
              >
                Buy on Amazon
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 