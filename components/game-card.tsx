import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import VoteButtons from "./vote-buttons"
import FavoriteButton from "./favorite-button"
import HashtagDisplay from "./hashtag-display"
import Link from "next/link"

export interface GameCardProps {
  id: string
  title: string
  description: string
  imageSrc: string
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
  imageSrc,
  tags,
  difficulty,
  upvotes = 0,
  downvotes = 0,
  userVote,
  isFavorited = false,
  isAuthenticated = false,
  hashtags = [],
}: GameCardProps) {
  const difficultyColor = {
    Easy: "bg-green-500",
    Medium: "bg-yellow-500",
    Hard: "bg-red-500",
  }[difficulty]

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg h-full flex flex-col">
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageSrc || "/placeholder.svg"}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className={`absolute top-2 right-2 ${difficultyColor} text-white text-xs px-2 py-1 rounded-full`}>
          {difficulty}
        </div>
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
      <CardContent className="pb-2 flex-grow">
        <p className="text-gray-700 mb-4">{description}</p>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag, index) => (
            <Link href={`/browse?game=${encodeURIComponent(tag)}`} key={index}>
              <Badge className="bg-[#FFBC42] hover:bg-[#e5a93b] text-[#2A2B2A] cursor-pointer">{tag}</Badge>
            </Link>
          ))}
        </div>

        {/* Display hashtags */}
        <HashtagDisplay hashtags={hashtags} className="mt-2" />
      </CardContent>
      <CardFooter className="pt-2">
        <Link href={`/remixes/${id}`} className="text-[#FF6B35] font-medium hover:underline w-full text-left">
          View Remix →
        </Link>
      </CardFooter>
    </Card>
  )
}
