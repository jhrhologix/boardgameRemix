import { NextResponse } from "next/server"
import { searchBGGGamesServer } from "@/lib/bgg-api"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")

  if (!query) {
    return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 })
  }

  try {
    const results = await searchBGGGamesServer(query)
    return NextResponse.json({ results })
  } catch (error) {
    console.error("Error searching BGG:", error)
    return NextResponse.json({ error: "Failed to search BoardGameGeek" }, { status: 500 })
  }
}
