import { createClient } from '@supabase/supabase-js'
import { Database } from '../lib/database.types'

// Load environment variables manually
const supabaseUrl = 'https://dqfemavcxskjjbnictjt.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxZmVtYXZjeHNrampibmljdGp0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzE4ODA0NiwiZXhwIjoyMDYyNzY0MDQ2fQ.sEYB5YiUtzl8ARfxnELUW3PbKiDBb76HRLMYMYpBeao'

console.log('⚠️  WARNING: Using service role key for inspection - this should be replaced with anon key for production!')

// Create Supabase client
const supabase = createClient<Database>(supabaseUrl, supabaseKey)

async function inspectDatabase() {
  console.log('🔍 Inspecting Supabase Database...\n')

  try {
    // Check users/profiles
    console.log('👥 USERS/PROFILES:')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(10)
    
    if (profilesError) {
      console.log('❌ Error fetching profiles:', profilesError.message)
    } else {
      console.log(`📊 Total profiles found: ${profiles?.length || 0}`)
      profiles?.forEach(profile => {
        console.log(`  - ${profile.username} (ID: ${profile.id.slice(0, 8)}...)`)
      })
    }

    // Check BGG games
    console.log('\n🎲 BGG GAMES:')
    const { data: games, error: gamesError } = await supabase
      .from('bgg_games')
      .select('*')
      .limit(10)
    
    if (gamesError) {
      console.log('❌ Error fetching games:', gamesError.message)
    } else {
      console.log(`📊 Total games found: ${games?.length || 0}`)
      games?.forEach(game => {
        console.log(`  - ${game.name} (${game.year_published}) - BGG ID: ${game.bgg_id}`)
      })
    }

    // Check remixes
    console.log('\n🔄 REMIXES:')
    const { data: remixes, error: remixesError } = await supabase
      .from('remixes')
      .select(`
        *,
        profiles!user_id(username),
        remix_games(
          bgg_games!bgg_game_id(name, bgg_id)
        ),
        remix_hashtags(
          hashtags!hashtag_id(name)
        )
      `)
      .limit(10)
    
    if (remixesError) {
      console.log('❌ Error fetching remixes:', remixesError.message)
    } else {
      console.log(`📊 Total remixes found: ${remixes?.length || 0}`)
      remixes?.forEach(remix => {
        const creator = (remix.profiles as any)?.username || 'Unknown'
        const gameNames = (remix.remix_games as any[])?.map(rg => rg.bgg_games?.name).join(', ') || 'No games'
        const hashtags = (remix.remix_hashtags as any[])?.map(rh => rh.hashtags?.name).join(', ') || 'No hashtags'
        
        console.log(`  📝 "${remix.title}" by ${creator}`)
        console.log(`     Games: ${gameNames}`)
        console.log(`     Hashtags: ${hashtags}`)
        console.log(`     Votes: ${remix.upvotes || 0} up, ${remix.downvotes || 0} down`)
        console.log(`     Difficulty: ${remix.difficulty}`)
        console.log('')
      })
    }

    // Check hashtags
    console.log('🏷️ HASHTAGS:')
    const { data: hashtags, error: hashtagsError } = await supabase
      .from('hashtags')
      .select('*')
      .limit(20)
    
    if (hashtagsError) {
      console.log('❌ Error fetching hashtags:', hashtagsError.message)
    } else {
      console.log(`📊 Total hashtags found: ${hashtags?.length || 0}`)
      const tagNames = hashtags?.map(tag => tag.name).join(', ')
      console.log(`  Tags: ${tagNames}`)
    }

    // Check favorites
    console.log('\n❤️ FAVORITES:')
    const { data: favorites, error: favoritesError } = await supabase
      .from('favorites')
      .select('*')
      .limit(10)
    
    if (favoritesError) {
      console.log('❌ Error fetching favorites:', favoritesError.message)
    } else {
      console.log(`📊 Total favorites found: ${favorites?.length || 0}`)
    }

    // Check comments
    console.log('\n💬 COMMENTS:')
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('*')
      .limit(10)
    
    if (commentsError) {
      console.log('❌ Error fetching comments:', commentsError.message)
    } else {
      console.log(`📊 Total comments found: ${comments?.length || 0}`)
    }

    // Database summary
    console.log('\n📊 DATABASE SUMMARY:')
    console.log(`  - Profiles: ${profiles?.length || 0}`)
    console.log(`  - BGG Games: ${games?.length || 0}`)
    console.log(`  - Remixes: ${remixes?.length || 0}`)
    console.log(`  - Hashtags: ${hashtags?.length || 0}`)
    console.log(`  - Favorites: ${favorites?.length || 0}`)
    console.log(`  - Comments: ${comments?.length || 0}`)

  } catch (error) {
    console.error('❌ Database inspection failed:', error)
  }
}

// Run the inspection
inspectDatabase().then(() => {
  console.log('\n✅ Database inspection complete!')
  process.exit(0)
}).catch(error => {
  console.error('💥 Fatal error:', error)
  process.exit(1)
})
