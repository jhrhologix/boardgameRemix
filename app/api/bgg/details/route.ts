import { NextResponse } from "next/server"
import { getBGGGameDetails } from "@/lib/bgg-api"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "Game ID is required" }, { status: 400 })
  }

  try {
    const game = await getBGGGameDetails(id)
    return NextResponse.json({ game })
  } catch (error) {
    console.error("Error getting game details:", error)
    return NextResponse.json(
      { error: "Failed to get game details from BoardGameGeek" },
      { status: 500 }
    )
  }
} 