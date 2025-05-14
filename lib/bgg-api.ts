// BoardGameGeek API client

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
}

// Search for games on BoardGameGeek
export async function searchBGGGames(query: string): Promise<BGGGame[]> {
  try {
    // BGG XML API2 search endpoint
    const response = await fetch(
      `https://boardgamegeek.com/xmlapi2/search?query=${encodeURIComponent(query)}&type=boardgame`,
    )

    if (!response.ok) {
      throw new Error(`BGG API error: ${response.status}`)
    }

    const text = await response.text()
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(text, "text/xml")

    const items = xmlDoc.getElementsByTagName("item")
    const results: BGGGame[] = []

    for (let i = 0; i < items.length && i < 10; i++) {
      const item = items[i]
      const id = item.getAttribute("id") || ""
      const nameNode = item.getElementsByTagName("name")[0]
      const yearNode = item.getElementsByTagName("yearpublished")[0]

      if (nameNode) {
        const name = nameNode.getAttribute("value") || ""
        const yearPublished = yearNode?.getAttribute("value") || ""

        results.push({
          id,
          name,
          yearPublished,
          bggUrl: `https://boardgamegeek.com/boardgame/${id}`,
        })
      }
    }

    return results
  } catch (error) {
    console.error("Error searching BGG:", error)
    return []
  }
}

// Get detailed game info from BoardGameGeek
export async function getBGGGameDetails(gameId: string): Promise<BGGGame | null> {
  try {
    // BGG XML API2 thing endpoint
    const response = await fetch(`https://boardgamegeek.com/xmlapi2/thing?id=${gameId}&stats=1`)

    if (!response.ok) {
      throw new Error(`BGG API error: ${response.status}`)
    }

    const text = await response.text()
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(text, "text/xml")

    const items = xmlDoc.getElementsByTagName("item")
    if (items.length === 0) return null

    const item = items[0]
    const id = item.getAttribute("id") || ""
    const nameNodes = item.getElementsByTagName("name")
    let name = ""

    // Find primary name
    for (let i = 0; i < nameNodes.length; i++) {
      const nameNode = nameNodes[i]
      if (nameNode.getAttribute("type") === "primary") {
        name = nameNode.getAttribute("value") || ""
        break
      }
    }

    if (!name && nameNodes.length > 0) {
      name = nameNodes[0].getAttribute("value") || ""
    }

    const yearPublished = item.getElementsByTagName("yearpublished")[0]?.getAttribute("value") || ""
    const image = item.getElementsByTagName("image")[0]?.textContent || ""
    const thumbnail = item.getElementsByTagName("thumbnail")[0]?.textContent || ""
    const description = item.getElementsByTagName("description")[0]?.textContent || ""
    const minPlayers = Number.parseInt(item.getElementsByTagName("minplayers")[0]?.getAttribute("value") || "0")
    const maxPlayers = Number.parseInt(item.getElementsByTagName("maxplayers")[0]?.getAttribute("value") || "0")
    const playingTime = Number.parseInt(item.getElementsByTagName("playingtime")[0]?.getAttribute("value") || "0")

    return {
      id,
      name,
      yearPublished,
      image,
      thumbnail,
      description,
      minPlayers,
      maxPlayers,
      playingTime,
      bggUrl: `https://boardgamegeek.com/boardgame/${id}`,
    }
  } catch (error) {
    console.error("Error getting BGG game details:", error)
    return null
  }
}

// Server-side version of the search function
export async function searchBGGGamesServer(query: string): Promise<BGGGame[]> {
  try {
    // Use node-fetch or native fetch in Node.js environment
    const response = await fetch(
      `https://boardgamegeek.com/xmlapi2/search?query=${encodeURIComponent(query)}&type=boardgame`,
    )

    if (!response.ok) {
      throw new Error(`BGG API error: ${response.status}`)
    }

    const text = await response.text()

    // Use a server-side XML parser
    const { DOMParser } = await import("xmldom")
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(text, "text/xml")

    const items = xmlDoc.getElementsByTagName("item")
    const results: BGGGame[] = []

    for (let i = 0; i < items.length && i < 10; i++) {
      const item = items[i]
      const id = item.getAttribute("id") || ""
      const nameNodes = item.getElementsByTagName("name")

      if (nameNodes.length > 0) {
        const name = nameNodes[0].getAttribute("value") || ""
        const yearNodes = item.getElementsByTagName("yearpublished")
        const yearPublished = yearNodes.length > 0 ? yearNodes[0].getAttribute("value") || "" : ""

        results.push({
          id,
          name,
          yearPublished,
          bggUrl: `https://boardgamegeek.com/boardgame/${id}`,
        })
      }
    }

    return results
  } catch (error) {
    console.error("Error searching BGG:", error)
    return []
  }
}
