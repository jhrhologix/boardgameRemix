"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import VoteButtons from "./vote-buttons"
import FavoriteButton from "./favorite-button"
import HashtagDisplay from "./hashtag-display"
import Link from "next/link"
import RemixCompositeImage from "./remix-composite-image"
import { User } from "lucide-react"

export interface GameCardProps {
  id: string
  title: string
  description: string
  games: Array<{
    name: string
    id: string
    bggUrl: string
    image: string
  }>
  tags: string[]
  difficulty: "Easy" | "Medium" | "Hard"
  upvotes: number
  downvotes: number
  userVote?: string
  isFavorited?: boolean
  isAuthenticated?: boolean
  hashtags?: string[]
  user_id: string
  creator_username: string
}

export default function GameCard({
  id,
  title,
  description,
  games,
  tags,
  difficulty,
  upvotes,
  downvotes,
  userVote,
  isFavorited,
  isAuthenticated,
  hashtags,
  creator_username
}: GameCardProps) {
  const difficultyColor = {
    Easy: "bg-green-500",
    Medium: "bg-yellow-500",
    Hard: "bg-red-500"
  }[difficulty]

  return (
    <Card className="bg-black border border-[#004E89]/20 hover:border-[#004E89]/40 transition-colors overflow-hidden">
      <CardHeader className="p-0">
        <Link href={`/remixes/${id}`}>
          <RemixCompositeImage games={games} />
        </Link>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div>
          <Link href={`/remixes/${id}`} className="hover:text-[#FF6B35] transition-colors">
            <h3 className="font-bold text-lg mb-2">{title}</h3>
          </Link>
          <p className="text-sm text-gray-400 line-clamp-2">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link key={tag} href={`/browse?game=${tag}`}>
              <Badge variant="outline" className="hover:bg-[#004E89]/20 transition-colors">
                {tag}
              </Badge>
            </Link>
          ))}
        </div>
        {hashtags && hashtags.length > 0 && (
          <HashtagDisplay hashtags={hashtags} />
        )}
        <div className="flex items-center justify-between">
          <Badge className={`${difficultyColor} text-black`}>
            {difficulty}
          </Badge>
          <div className="flex items-center text-sm text-gray-400">
            <User className="w-4 h-4 mr-1" />
            <span>{creator_username}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <VoteButtons
          remixId={id}
          upvotes={upvotes}
          downvotes={downvotes}
          userVote={userVote}
          isAuthenticated={isAuthenticated || false}
          className="scale-90"
        />
        <FavoriteButton
          remixId={id}
          isFavorited={isFavorited}
          isAuthenticated={isAuthenticated}
        />
      </CardFooter>
    </Card>
  )
}
