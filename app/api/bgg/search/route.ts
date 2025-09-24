import { NextResponse } from "next/server"
import { searchBGGGamesServer } from "@/lib/bgg-api"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")
  const searchType = searchParams.get("type") || "contains"

  if (!query) {
    return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 })
  }

  try {
    console.log('API route: searching for', query, 'type:', searchType)
    const results = await searchBGGGamesServer(query, searchType as 'contains' | 'starts_with' | 'exact')
    console.log('API route: got results', results)
    
    if (!Array.isArray(results)) {
      throw new Error('Invalid response format from BGG search')
    }

    return NextResponse.json({ 
      results,
      query,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("API route error:", error)
    return NextResponse.json(
      { 
        error: "Failed to search BoardGameGeek",
        details: error instanceof Error ? error.message : 'Unknown error',
        query 
      }, 
      { status: 500 }
    )
  }
}
