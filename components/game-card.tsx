import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import VoteButtons from "./vote-buttons"
import FavoriteButton from "./favorite-button"
import HashtagDisplay from "./hashtag-display"
import Link from "next/link"
import RemixCompositeImage from "./remix-composite-image"
import type { BGGGame } from "@/lib/bgg-api"

export interface GameCardProps {
  id: string
  title: string
  description: string
  games: BGGGame[]
  tags: string[]
  difficulty: "Easy" | "Medium" | "Hard"
  upvotes: number
  downvotes: number
  userVote?: string
  isFavorited?: boolean
  isAuthenticated?: boolean
  hashtags?: string[]
}

export default function GameCard({
  id,
  title,
  description,
  games = [],
  tags,
  difficulty,
  upvotes = 0,
  downvotes = 0,
  userVote,
  isFavorited = false,
  isAuthenticated = false,
  hashtags = [],
}: GameCardProps) {
  // Filter out any invalid games
  const validGames = games.filter(game => game && game.name);

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg h-full flex flex-col">
      <div className="relative h-48 overflow-hidden">
        <RemixCompositeImage
          games={validGames.map(game => ({
            name: game.name
          }))}
          difficulty={difficulty}
          tags={hashtags}
          isClickable={true}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute top-2 left-2 flex items-center gap-1">
          <VoteButtons
            remixId={id}
            upvotes={upvotes}
            downvotes={downvotes}
            userVote={userVote}
            isAuthenticated={isAuthenticated}
            className="bg-white/90 rounded-full px-1 shadow-sm"
          />
        </div>
      </div>
      <CardHeader className="pb-2 flex flex-row justify-between items-start">
        <h3 className="text-xl font-bold text-[#004E89]">
          <Link href={`/remixes/${id}`} className="hover:text-[#FF6B35] hover:underline">
            {title}
          </Link>
        </h3>
        <FavoriteButton remixId={id} isFavorited={isFavorited} isAuthenticated={isAuthenticated} />
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-gray-600 mb-4 line-clamp-2">{description}</p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <Badge key={index} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <HashtagDisplay hashtags={hashtags} />
      </CardFooter>
    </Card>
  )
}
