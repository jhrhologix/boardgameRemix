import { NextRequest, NextResponse } from 'next/server'
import { getBGGGameDetails } from '@/lib/bgg-api'

// Rate limiting to respect BGG servers (as required by their Terms of Use)
const lastRequestTime = new Map<string, number>()
const MIN_REQUEST_INTERVAL = 1000 // 1 second between requests per game ID

// Legal BGG image fetching through their official API
// Compliant with BGG XML API Terms of Use: https://boardgamegeek.com/wiki/page/XML_API_Terms_of_Use
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const gameId = searchParams.get('gameId')

  if (!gameId) {
    return new NextResponse('Missing gameId parameter', { status: 400 })
  }

  // Rate limiting: Check if we need to wait before making request
  const now = Date.now()
  const lastRequest = lastRequestTime.get(gameId)
  if (lastRequest && (now - lastRequest) < MIN_REQUEST_INTERVAL) {
    // Wait to respect BGG servers
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - (now - lastRequest)))
  }
  lastRequestTime.set(gameId, Date.now())

  try {
    // Use BGG's official API to get game details including image URL
    const gameDetails = await getBGGGameDetails(gameId)
    
    if (!gameDetails || !gameDetails.image) {
      return new NextResponse('Game not found or no image available', { status: 404 })
    }

    // Fetch the image using proper BGG API access
    // Following BGG XML API Terms of Use for non-commercial use
    const imageResponse = await fetch(gameDetails.image, {
      headers: {
        'User-Agent': 'BoardGameRemix/1.0 (Non-Commercial Educational Use - BGG API Compliant)',
        'Referer': 'https://boardgamegeek.com/',
        'Accept': 'image/*',
      },
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })

    if (!imageResponse.ok) {
      console.error(`Failed to fetch image for game ${gameId}: ${imageResponse.status}`)
      return new NextResponse('Image not available', { status: 404 })
    }

    const imageBuffer = await imageResponse.arrayBuffer()
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg'

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=604800', // Cache for 1 week
        'X-BGG-Game-ID': gameId,
        'X-Image-Source': 'BGG-XML-API',
        'X-BGG-Terms-Compliance': 'https://boardgamegeek.com/wiki/page/XML_API_Terms_of_Use',
        'X-Usage': 'Non-Commercial',
      },
    })
  } catch (error) {
    console.error('BGG image fetch error:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}
