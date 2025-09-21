import { NextResponse } from 'next/server'
import { getBGGGameDetails } from '@/lib/bgg-api'

// Test endpoint to verify BGG API integration
export async function GET() {
  try {
    console.log('Testing BGG API for Catan (ID: 13)...')
    
    const catanDetails = await getBGGGameDetails('13')
    
    if (!catanDetails) {
      return NextResponse.json({ error: 'Failed to fetch Catan details' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      game: {
        id: catanDetails.id,
        name: catanDetails.name,
        year: catanDetails.yearPublished,
        image: catanDetails.image,
        thumbnail: catanDetails.thumbnail,
        bggUrl: catanDetails.bggUrl,
      },
      imageApiUrl: `/api/bgg-image?gameId=13`,
      message: 'BGG API integration working!'
    })
  } catch (error) {
    console.error('BGG API test failed:', error)
    return NextResponse.json(
      { error: 'BGG API test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
