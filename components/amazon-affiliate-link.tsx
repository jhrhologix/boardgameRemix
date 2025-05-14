import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"

interface AmazonAffiliateLinkProps {
  gameName: string
  className?: string
}

export default function AmazonAffiliateLink({ gameName, className }: AmazonAffiliateLinkProps) {
  // Create a search-friendly version of the game name for Amazon
  const searchQuery = encodeURIComponent(`${gameName} board game`)

  // Replace this with your actual Amazon affiliate tag
  const affiliateTag = "remixgames-20"

  // Construct the Amazon affiliate URL
  const amazonUrl = `https://www.amazon.com/s?k=${searchQuery}&tag=${affiliateTag}`

  return (
    <Button
      variant="outline"
      size="sm"
      className={`bg-[#FFD814] hover:bg-[#F7CA00] text-black border-[#FCD200] hover:border-[#F2C200] ${className}`}
      asChild
    >
      <a href={amazonUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
        <ShoppingCart className="h-4 w-4" />
        Buy on Amazon
      </a>
    </Button>
  )
}
