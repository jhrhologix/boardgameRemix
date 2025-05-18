import Image from 'next/image'

interface ComposedGameImageProps {
  games: Array<{
    name: string
    image_url: string | null
  }>
  className?: string
}

export default function ComposedGameImage({ games, className = "" }: ComposedGameImageProps) {
  // Filter out games without valid image URLs
  const gamesWithImages = games?.filter(game => game && game.image_url) || []

  if (gamesWithImages.length === 0) {
    return (
      <div className={`relative h-48 w-full overflow-hidden ${className}`}>
        <Image
          src="/placeholder.svg"
          alt="No image available"
          fill
          className="object-contain"
          priority
        />
      </div>
    )
  }

  return (
    <div className={`relative h-48 w-full overflow-hidden ${className}`}>
      {gamesWithImages.length === 1 ? (
        // Single game - show full image
        <Image
          src={gamesWithImages[0].image_url || "/placeholder.svg"}
          alt={gamesWithImages[0].name}
          fill
          className="object-contain"
        />
      ) : (
        // Multiple games - show split view
        <div className="grid h-full w-full" 
          style={{ 
            gridTemplateColumns: gamesWithImages.length > 2 ? "1fr 1fr" : "repeat(2, 1fr)",
            gridTemplateRows: gamesWithImages.length > 2 ? "1fr 1fr" : "1fr"
          }}
        >
          {gamesWithImages.slice(0, 4).map((game, index) => (
            <div key={index} className="relative overflow-hidden border border-gray-100">
              <Image
                src={game.image_url || "/placeholder.svg"}
                alt={game.name}
                fill
                className="object-contain p-2"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 