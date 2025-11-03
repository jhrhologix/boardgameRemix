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
    // First check if we have the image cached in our database
    const supabase = await import('@/lib/supabase/server').then(m => m.createClient())
    const { data: cachedGame } = await supabase
      .from('bgg_games')
      .select('image_url, thumbnail_url')
      .eq('bgg_id', gameId)
      .single()
    
    // If we have a cached image (already migrated), use it
    if (cachedGame?.image_url && !cachedGame.image_url.includes('cf.geekdo-images.com')) {
      // Redirect to cached image if it's stored locally
      return NextResponse.redirect(cachedGame.image_url)
    }
    
    // Try to get image URL from cached database entry first
    if (cachedGame?.image_url) {
      try {
        const imageResponse = await fetch(cachedGame.image_url, {
          headers: {
            'User-Agent': 'BoardGameRemix/1.0 (+https://remix.games/about; support@remix.games)',
            'Referer': 'https://boardgamegeek.com/',
            'Accept': 'image/*',
          },
          signal: AbortSignal.timeout(5000),
        })
        
        if (imageResponse.ok) {
          const imageBuffer = await imageResponse.arrayBuffer()
          const contentType = imageResponse.headers.get('content-type') || 'image/jpeg'
          return new NextResponse(imageBuffer, {
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=604800',
              'X-BGG-Game-ID': gameId,
              'X-Image-Source': 'Cached',
            },
          })
        }
      } catch (error) {
        console.warn(`Failed to fetch cached image for ${gameId}, trying API...`)
      }
    }
    
    // Fallback: Use BGG's official API to get game details including image URL
    console.log(`Fetching game details from BGG API for gameId: ${gameId}`)
    const gameDetails = await getBGGGameDetails(gameId)
    
    if (!gameDetails || !gameDetails.image) {
      console.error(`No game details or image for gameId: ${gameId}`)
      // Return placeholder image instead of 404
      return NextResponse.redirect('/placeholder.svg')
    }

    // Fetch the image using proper BGG API access
    // Following BGG XML API Terms of Use for non-commercial use
    // Note: Images from cf.geekdo-images.com don't need rate limiting like the API
    const imageResponse = await fetch(gameDetails.image, {
      headers: {
        'User-Agent': 'BoardGameRemix/1.0 (+https://remix.games/about; support@remix.games)',
        'Referer': 'https://boardgamegeek.com/',
        'Accept': 'image/*',
        'From': 'support@remix.games'
      },
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })

    if (!imageResponse.ok) {
      console.error(`Failed to fetch image for game ${gameId}: ${imageResponse.status}`)
      // Return placeholder instead of 404 to prevent broken images
      return NextResponse.redirect('/placeholder.svg')
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
    console.error(`BGG image fetch error for gameId ${gameId}:`, error)
    // Return placeholder instead of error to prevent broken images
    return NextResponse.redirect('/placeholder.svg')
  }
}
