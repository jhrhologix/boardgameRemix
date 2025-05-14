import { Hash } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface HashtagDisplayProps {
  hashtags: string[]
  className?: string
}

export default function HashtagDisplay({ hashtags, className }: HashtagDisplayProps) {
  if (!hashtags || hashtags.length === 0) return null

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {hashtags.map((tag, index) => (
        <Link href={`/browse?hashtag=${encodeURIComponent(tag)}`} key={index}>
          <Badge className="bg-[#FF6B35] hover:bg-[#e55a2a] text-white cursor-pointer text-xs">
            <Hash size={10} className="mr-0.5" />
            {tag}
          </Badge>
        </Link>
      ))}
    </div>
  )
}
