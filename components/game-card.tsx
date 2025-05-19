import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import VoteButtons from "./vote-buttons"
import FavoriteButton from "./favorite-button"
import HashtagDisplay from "./hashtag-display"
import Link from "next/link"
import RemixCompositeImage from "./remix-composite-image"

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
}

export default function GameCard({
  id,
  title,
  description,
  games = [],
  tags = [],
  difficulty,
  upvotes = 0,
  downvotes = 0,
  userVote,
  isFavorited = false,
  isAuthenticated = false,
  hashtags = [],
}: GameCardProps) {
  // Ensure all data is properly typed
  const safeProps = {
    id: String(id),
    title: String(title),
    description: String(description),
    difficulty: String(difficulty) as "Easy" | "Medium" | "Hard",
    upvotes: Number(upvotes) || 0,
    downvotes: Number(downvotes) || 0,
    userVote: userVote ? String(userVote) : undefined,
    isFavorited: Boolean(isFavorited),
    isAuthenticated: Boolean(isAuthenticated),
  }

  // Filter out any invalid games and ensure proper typing
  const validGames = games
    .filter(game => game && game.name)
    .map(game => ({
      name: String(game.name),
      id: String(game.id),
      bggUrl: String(game.bggUrl),
      image: String(game.image),
    }))

  // Ensure tags and hashtags are strings
  const safeTags = tags.map(tag => String(tag))
  const safeHashtags = hashtags.map(tag => String(tag))

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg h-full flex flex-col">
      <div className="relative h-48 overflow-hidden">
        <RemixCompositeImage
          games={validGames.map(game => ({
            name: game.name
          }))}
          difficulty={safeProps.difficulty}
          tags={safeHashtags}
          isClickable={true}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute top-2 left-2 flex items-center gap-1">
          <VoteButtons
            remixId={safeProps.id}
            upvotes={safeProps.upvotes}
            downvotes={safeProps.downvotes}
            userVote={safeProps.userVote}
            isAuthenticated={safeProps.isAuthenticated}
            className="bg-white/90 rounded-full px-1 shadow-sm"
          />
        </div>
      </div>
      <CardHeader className="pb-2 flex flex-row justify-between items-start">
        <h3 className="text-xl font-bold text-[#004E89]">
          <Link href={`/remixes/${safeProps.id}`} className="hover:text-[#FF6B35] hover:underline">
            {safeProps.title}
          </Link>
        </h3>
        <FavoriteButton 
          remixId={safeProps.id} 
          isFavorited={safeProps.isFavorited} 
          isAuthenticated={safeProps.isAuthenticated} 
        />
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-gray-600 mb-4 line-clamp-2">{safeProps.description}</p>
        <div className="flex flex-wrap gap-2">
          {safeTags.map((tag, index) => (
            <Badge key={index} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <HashtagDisplay hashtags={safeHashtags} />
      </CardFooter>
    </Card>
  )
}
