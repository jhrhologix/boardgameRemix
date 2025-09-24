"use client"

import Image from "next/image"
import Link from "next/link"
import FavoriteButton from "@/components/favorite-button"
import { useAuth } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"

interface RemixCardProps {
  remix: {
    id: string
    title: string
    description: string
    difficulty: string
    user_id: string
    bgg_games: {
      game: {
        name: string
        image_url: string | null
      }
    }[]
    user: {
      username: string | null
    } | null
  }
  showFavoriteButton?: boolean
}

export default function RemixCard({ remix, showFavoriteButton = false }: RemixCardProps) {
  const { user } = useAuth()


  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'hard':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }


  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-[#FF6B35] hover:border-white transition-colors duration-300">
      <div className="relative h-48">
        {remix.bgg_games[0]?.game.image_url ? (
          <Image
            src={remix.bgg_games[0].game.image_url}
            alt={remix.bgg_games[0].game.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No image available</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between">
          <Link href={`/remixes/${remix.id}`} className="hover:underline">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{remix.title}</h3>
          </Link>
          {showFavoriteButton && user && (
            <FavoriteButton
              remixId={remix.id}
              isFavorited={false}
            />
          )}
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{remix.description}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {remix.bgg_games.map((game, index) => (
            <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
              {game.game.name}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <Badge variant="outline" className={getDifficultyColor(remix.difficulty)}>
            {remix.difficulty}
          </Badge>
          <span className="text-sm text-gray-500">
            by {remix.user?.username || 'Unknown User'}
          </span>
        </div>
      </div>
    </div>
  )
} 