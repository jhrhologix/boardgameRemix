// Legal image handling for BGG images
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for storage operations
)

export async function downloadAndStoreImage(bggImageUrl: string, gameId: string): Promise<string | null> {
  try {
    // Download image with proper headers
    const response = await fetch(bggImageUrl, {
      headers: {
        'User-Agent': 'BoardGameRemix/1.0 (Educational/Personal Use)',
        'Referer': 'https://boardgamegeek.com/',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`)
    }

    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const extension = contentType.split('/')[1] || 'jpg'
    const fileName = `games/${gameId}.${extension}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('game-images')
      .upload(fileName, imageBuffer, {
        contentType,
        upsert: true, // Replace if exists
      })

    if (error) {
      console.error('Storage upload error:', error)
      return null
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('game-images')
      .getPublicUrl(fileName)

    return publicUrlData.publicUrl
  } catch (error) {
    console.error('Error downloading/storing image:', error)
    return null
  }
}

// Function to migrate BGG images to local storage
export async function migrateBGGImagesToLocal() {
  console.log('🔄 Migrating BGG images to local storage...')
  
  // Get all games with BGG image URLs
  const { data: games, error } = await supabase
    .from('bgg_games')
    .select('*')
    .not('image_url', 'is', null)
    .like('image_url', '%cf.geekdo-images.com%')

  if (error || !games) {
    console.error('Error fetching games:', error)
    return
  }

  for (const game of games) {
    console.log(`📥 Downloading image for ${game.name}...`)
    
    const localUrl = await downloadAndStoreImage(game.image_url!, game.bgg_id)
    
    if (localUrl) {
      // Update database with local URL
      await supabase
        .from('bgg_games')
        .update({ 
          image_url: localUrl,
          original_bgg_image_url: game.image_url // Keep reference to original
        })
        .eq('id', game.id)
      
      console.log(`✅ Updated ${game.name} with local image`)
    } else {
      console.log(`❌ Failed to download image for ${game.name}`)
    }
    
    // Rate limiting - wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  console.log('🎉 Image migration complete!')
}
