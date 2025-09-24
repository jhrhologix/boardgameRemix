// BoardGameGeek API client
import type { DOMParser as XMLDOMParser } from '@xmldom/xmldom'

export type GameType = 'strategy' | 'luck' | 'skill' | 'combat' | 'social' | 'time' | 'coop'

export interface BGGGame {
  id: string
  name: string
  yearPublished?: string
  image?: string
  thumbnail?: string
  description?: string
  minPlayers?: number
  maxPlayers?: number
  playingTime?: number
  bggUrl: string
  types?: GameType[]
  relevanceScore?: number // For internal sorting
}

// Helper function to determine game types based on BGG categories and mechanics
function determineGameTypes(categories: string[], mechanics: string[]): GameType[] {
  const types = new Set<GameType>()

  // Strategy games
  if (
    categories.some(c => 
      ['Strategy Games', 'Abstract Strategy', 'Economic'].includes(c)
    ) ||
    mechanics.some(m => 
      ['Worker Placement', 'Area Control', 'Deck Building'].includes(m)
    )
  ) {
    types.add('strategy')
  }

  // Cooperative games
  if (
    categories.some(c => 
      ['Cooperative Game', 'Solo / Solitaire Game'].includes(c)
    ) ||
    mechanics.some(m => 
      ['Cooperative Game', 'Team-Based Game'].includes(m)
    )
  ) {
    types.add('coop')
  }

  // Luck-based games
  if (
    mechanics.some(m => 
      ['Dice Rolling', 'Push Your Luck', 'Random Draw'].includes(m)
    )
  ) {
    types.add('luck')
  }

  // Skill-based games
  if (
    mechanics.some(m => 
      ['Dexterity', 'Pattern Recognition', 'Memory'].includes(m)
    )
  ) {
    types.add('skill')
  }

  // Combat games
  if (
    categories.some(c => 
      ['Wargames', 'Fighting', 'Miniatures'].includes(c)
    ) ||
    mechanics.some(m => 
      ['Take That', 'Combat', 'Area Control'].includes(m)
    )
  ) {
    types.add('combat')
  }

  // Social games
  if (
    categories.some(c => 
      ['Party Game', 'Deduction', 'Negotiation'].includes(c)
    ) ||
    mechanics.some(m => 
      ['Trading', 'Social Deduction', 'Voting'].includes(m)
    )
  ) {
    types.add('social')
  }

  // Time-pressure games
  if (
    mechanics.some(m => 
      ['Real-Time', 'Speed', 'Time Track'].includes(m)
    )
  ) {
    types.add('time')
  }

  return Array.from(types)
}

// Search for games on BoardGameGeek (client-side version)
export async function searchBGGGames(query: string): Promise<BGGGame[]> {
  try {
    const response = await fetch(`/api/bgg/search?q=${encodeURIComponent(query)}`)
    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`)
    }
    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error("Error searching BGG:", error)
    return []
  }
}

// Get detailed game info from BoardGameGeek
export async function getBGGGameDetails(gameId: string): Promise<BGGGame | null> {
  try {
    const response = await fetch(
      `https://boardgamegeek.com/xmlapi2/thing?id=${gameId}&stats=1`,
      {
        headers: {
          'Accept': 'application/xml',
          'User-Agent': 'BoardGameRemix/1.0'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to get game details: ${response.statusText}`)
    }

    const text = await response.text()
    const { DOMParser } = await import('@xmldom/xmldom')
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(text, "text/xml")

    const item = xmlDoc.getElementsByTagName("item")[0]
    if (!item) return null

    const name = item.getElementsByTagName("name")[0]?.getAttribute("value") || ""
    const yearPublished = item.getElementsByTagName("yearpublished")[0]?.getAttribute("value") || undefined
    const image = item.getElementsByTagName("image")[0]?.textContent || ""
    const thumbnail = item.getElementsByTagName("thumbnail")[0]?.textContent || ""
    const description = item.getElementsByTagName("description")[0]?.textContent || ""
    const minPlayers = parseInt(item.getElementsByTagName("minplayers")[0]?.getAttribute("value") || "0")
    const maxPlayers = parseInt(item.getElementsByTagName("maxplayers")[0]?.getAttribute("value") || "0")
    const playingTime = parseInt(item.getElementsByTagName("playingtime")[0]?.getAttribute("value") || "0")

    // Get categories and mechanics
    const links = item.getElementsByTagName("link")
    const categories: string[] = []
    const mechanics: string[] = []

    for (let i = 0; i < links.length; i++) {
      const link = links[i]
      const type = link.getAttribute("type")
      const value = link.getAttribute("value")
      if (value) {
        if (type === "boardgamecategory") categories.push(value)
        if (type === "boardgamemechanic") mechanics.push(value)
      }
    }

    // Determine game types
    const types = determineGameTypes(categories, mechanics)

    return {
      id: gameId,
      name,
      yearPublished,
      image,
      thumbnail,
      description,
      minPlayers,
      maxPlayers,
      playingTime,
      bggUrl: `https://boardgamegeek.com/boardgame/${gameId}`,
      types
    }
  } catch (error) {
    console.error("Error getting BGG game details:", error)
    return null
  }
}

// Server-side version of the search function
export async function searchBGGGamesServer(query: string): Promise<BGGGame[]> {
  try {
    console.log('Searching BGG for:', query)
    // Make search case-insensitive and use contains matching
    const searchQuery = query.toLowerCase().trim()
    const response = await fetch(
      `https://boardgamegeek.com/xmlapi2/search?query=${encodeURIComponent(searchQuery)}&type=boardgame&exact=0`,
      {
        headers: {
          'Accept': 'application/xml',
          'User-Agent': 'BoardGameRemix/1.0',
          'Origin': 'https://boardgamegeek.com',
          'Referer': 'https://boardgamegeek.com/'
        },
        next: {
          revalidate: 3600 // Cache for 1 hour
        }
      }
    )

    if (!response.ok) {
      console.error(`BGG API error: ${response.status} - ${response.statusText}`)
      console.error('Response headers:', Object.fromEntries(response.headers.entries()))
      throw new Error(`BGG API error: ${response.status}`)
    }

    const text = await response.text()
    console.log('BGG API response:', text.substring(0, 200))

    if (!text || text.trim() === '') {
      console.error('Empty response from BGG API')
      throw new Error('Empty response from BGG API')
    }

    const { DOMParser } = await import('@xmldom/xmldom')
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(text, "text/xml")

    const errors = xmlDoc.getElementsByTagName("parsererror")
    if (errors.length > 0) {
      console.error('XML parsing error:', errors[0].textContent)
      throw new Error('Failed to parse BGG API response')
    }

    const items = xmlDoc.getElementsByTagName("item")
    console.log(`Found ${items.length} items in BGG response`)
    
    if (items.length === 0) {
      console.log('No items found in BGG response. Raw response:', text)
    }

    const results: BGGGame[] = []

    for (let i = 0; i < items.length && i < 50; i++) {
      try {
        const item = items[i]
        const id = item.getAttribute("id")
        if (!id) {
          console.warn('Item missing ID, skipping:', item)
          continue
        }

        const nameNodes = item.getElementsByTagName("name")
        if (nameNodes.length === 0) {
          console.warn('Item missing name, skipping:', id)
          continue
        }

        const name = nameNodes[0].getAttribute("value")
        if (!name) {
          console.warn('Name node missing value attribute:', id)
          continue
        }

        const yearNodes = item.getElementsByTagName("yearpublished")
        const yearPublished = yearNodes.length > 0 ? yearNodes[0].getAttribute("value") || undefined : undefined

        // Calculate relevance score for better sorting (prioritize contains matches)
        const nameLower = name.toLowerCase()
        const queryLower = searchQuery.toLowerCase()
        let relevanceScore = 0
        
        // Exact match gets highest score
        if (nameLower === queryLower) {
          relevanceScore = 100
        }
        // Classic UNO game gets special priority (ID 2223)
        else if (id === "2223") {
          relevanceScore = 95
        }
        // Starts with query gets high score
        else if (nameLower.startsWith(queryLower)) {
          relevanceScore = 90
        }
        // Contains query gets high score (this is what we want!)
        else if (nameLower.includes(queryLower)) {
          relevanceScore = 85
        }
        // Word boundary match gets medium-high score
        else if (new RegExp(`\\b${queryLower}\\b`).test(nameLower)) {
          relevanceScore = 70
        }
        // Partial match gets medium score
        else {
          relevanceScore = 30
        }

        results.push({
          id,
          name,
          yearPublished,
          bggUrl: `https://boardgamegeek.com/boardgame/${id}`,
          relevanceScore // Add for sorting
        })
      } catch (itemError) {
        console.error('Error processing item:', itemError)
      }
    }

    // Sort by relevance score (exact matches first)
    results.sort((a, b) => (b as any).relevanceScore - (a as any).relevanceScore)

    console.log('Processed BGG results:', results)
    return results
  } catch (error) {
    console.error("Error searching BGG:", error)
    throw error
  }
}

// LEGAL BGG API: Use BGG's official API to fetch images
export function getLegalBGGImageUrl(gameId: string): string {
  // If we have a BGG ID, use our legal API route
  if (gameId && gameId !== 'placeholder') {
    return `/api/bgg-image?gameId=${gameId}`
  }
  
  // Fallback to placeholder for games without BGG IDs
  return '/placeholder.svg'
}
