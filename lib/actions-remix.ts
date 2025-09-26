'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export interface CreateRemixData {
  title: string
  description: string
  difficulty: string
  rules: string
  setup_instructions: string
  youtube_url?: string
  max_players?: number
}

export interface RemixGameData {
  bgg_game_id: string
  name?: string
  year_published?: number
  image_url?: string
  bgg_url?: string
}

export interface RemixHashtagData {
  name: string
}

export interface RemixTagData {
  name: string
}

export async function createRemix(
  remixData: CreateRemixData,
  games: RemixGameData[],
  hashtags: RemixHashtagData[],
  tags: RemixTagData[],
  userId: string
) {
  const supabase = await createClient()
  
  // Verify user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  console.log('CreateRemix server action auth check:', {
    hasUser: !!user,
    userId: user?.id,
    expectedUserId: userId,
    authError: authError?.message
  })
  
  if (authError || !user || user.id !== userId) {
    console.error('CreateRemix authentication failed:', { authError, user, expectedUserId: userId })
    throw new Error('Authentication error. Please try logging in again.')
  }

  try {
    // Create the remix
    const { data: newRemix, error: insertError } = await supabase
      .from('remixes')
      .insert({
        ...remixData,
        user_id: userId
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating remix:', insertError)
      throw new Error(insertError.message || 'Failed to create remix')
    }

    if (!newRemix) {
      throw new Error('No remix data returned')
    }

    // Handle games relationships
    if (games.length > 0) {
      // First, ensure all BGG games exist in the bgg_games table
      for (const game of games) {
        const { error: bggGameError } = await supabase
          .from('bgg_games')
          .upsert({
            bgg_id: game.bgg_game_id,
            name: game.name || `Game ${game.bgg_game_id}`,
            year_published: game.year_published,
            image_url: game.image_url,
            bgg_url: game.bgg_url || `https://boardgamegeek.com/boardgame/${game.bgg_game_id}`
          }, { 
            onConflict: 'bgg_id' 
          })

        if (bggGameError) {
          console.error('Error upserting BGG game:', bggGameError)
          throw new Error(`Failed to save BGG game: ${bggGameError.message}`)
        }
      }

      // Then create the relationships
      const gameInserts = games.map(game => ({
        remix_id: newRemix.id,
        bgg_game_id: game.bgg_game_id
      }))

      const { error: gamesError } = await supabase
        .from('remix_games')
        .insert(gameInserts)

      if (gamesError) {
        console.error('Error creating remix games:', gamesError)
        throw new Error('Failed to associate games with remix')
      }
    }

    // Handle hashtags
    if (hashtags.length > 0) {
      // First, ensure all hashtags exist
      const hashtagInserts = hashtags.map(hashtag => ({
        name: hashtag.name.toLowerCase()
      }))

      const { error: hashtagsError } = await supabase
        .from('hashtags')
        .upsert(hashtagInserts, { onConflict: 'name' })

      if (hashtagsError) {
        console.error('Error creating hashtags:', hashtagsError)
        throw new Error('Failed to create hashtags')
      }

      // Then associate them with the remix - get hashtag IDs first
      const remixHashtagInserts = []
      for (const hashtag of hashtags) {
        const { data: hashtagData, error: hashtagError } = await supabase
          .from('hashtags')
          .select('id')
          .eq('name', hashtag.name.toLowerCase())
          .single()

        if (hashtagError || !hashtagData) {
          console.error('Error finding hashtag:', hashtagError)
          throw new Error(`Failed to find hashtag: ${hashtag.name}`)
        }

        remixHashtagInserts.push({
          remix_id: newRemix.id,
          hashtag_id: hashtagData.id
        })
      }

      const { error: remixHashtagsError } = await supabase
        .from('remix_hashtags')
        .insert(remixHashtagInserts)

      if (remixHashtagsError) {
        console.error('Error associating hashtags with remix:', remixHashtagsError)
        throw new Error('Failed to associate hashtags with remix')
      }
    }

    // Handle tags
    if (tags.length > 0) {
      // First, ensure all tags exist
      const tagInserts = tags.map(tag => ({
        name: tag.name.toLowerCase()
      }))

      const { error: tagsError } = await supabase
        .from('tags')
        .upsert(tagInserts, { onConflict: 'name' })

      if (tagsError) {
        console.error('Error creating tags:', tagsError)
        throw new Error('Failed to create tags')
      }

      // Then associate them with the remix
      const remixTagInserts = tags.map(tag => ({
        remix_id: newRemix.id,
        tag_name: tag.name.toLowerCase()
      }))

      const { error: remixTagsError } = await supabase
        .from('remix_tags')
        .insert(remixTagInserts)

      if (remixTagsError) {
        console.error('Error associating tags with remix:', remixTagsError)
        throw new Error('Failed to associate tags with remix')
      }
    }

    return { success: true, remix: newRemix }

  } catch (error) {
    console.error('Error in createRemix:', error)
    throw error
  }
}

export async function updateRemix(
  remixId: string,
  remixData: CreateRemixData,
  games: RemixGameData[],
  hashtags: RemixHashtagData[],
  tags: RemixTagData[],
  userId: string
) {
  const supabase = await createClient()
  
  // Verify user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  console.log('UpdateRemix server action auth check:', {
    hasUser: !!user,
    userId: user?.id,
    expectedUserId: userId,
    authError: authError?.message
  })
  
  if (authError || !user || user.id !== userId) {
    console.error('UpdateRemix authentication failed:', { authError, user, expectedUserId: userId })
    throw new Error('Authentication error. Please try logging in again.')
  }

  try {
    // Update the remix
    const { data: updatedRemix, error: updateError } = await supabase
      .from('remixes')
      .update(remixData)
      .eq('id', remixId)
      .eq('user_id', userId) // Ensure user owns the remix
      .select()
      .single()

    if (updateError) {
      console.error('Error updating remix:', updateError)
      throw new Error(updateError.message || 'Failed to update remix')
    }

    if (!updatedRemix) {
      throw new Error('No remix data returned')
    }

    // Delete existing relationships
    await Promise.all([
      supabase.from('remix_games').delete().eq('remix_id', remixId),
      supabase.from('remix_hashtags').delete().eq('remix_id', remixId),
      supabase.from('remix_tags').delete().eq('remix_id', remixId)
    ])

    // Handle games relationships
    if (games.length > 0) {
      // First, ensure all BGG games exist in the bgg_games table
      for (const game of games) {
        const { error: bggGameError } = await supabase
          .from('bgg_games')
          .upsert({
            bgg_id: game.bgg_game_id,
            name: game.name || `Game ${game.bgg_game_id}`,
            year_published: game.year_published,
            image_url: game.image_url,
            bgg_url: game.bgg_url || `https://boardgamegeek.com/boardgame/${game.bgg_game_id}`
          }, { 
            onConflict: 'bgg_id' 
          })

        if (bggGameError) {
          console.error('Error upserting BGG game:', bggGameError)
          throw new Error(`Failed to save BGG game: ${bggGameError.message}`)
        }
      }

      // Then create the relationships
      const gameInserts = games.map(game => ({
        remix_id: remixId,
        bgg_game_id: game.bgg_game_id
      }))

      const { error: gamesError } = await supabase
        .from('remix_games')
        .insert(gameInserts)

      if (gamesError) {
        console.error('Error updating remix games:', gamesError)
        throw new Error('Failed to associate games with remix')
      }
    }

    // Handle hashtags
    if (hashtags.length > 0) {
      // First, ensure all hashtags exist
      const hashtagInserts = hashtags.map(hashtag => ({
        name: hashtag.name.toLowerCase()
      }))

      const { error: hashtagsError } = await supabase
        .from('hashtags')
        .upsert(hashtagInserts, { onConflict: 'name' })

      if (hashtagsError) {
        console.error('Error updating hashtags:', hashtagsError)
        throw new Error('Failed to create hashtags')
      }

      // Then associate them with the remix - get hashtag IDs first
      const remixHashtagInserts = []
      for (const hashtag of hashtags) {
        const { data: hashtagData, error: hashtagError } = await supabase
          .from('hashtags')
          .select('id')
          .eq('name', hashtag.name.toLowerCase())
          .single()

        if (hashtagError || !hashtagData) {
          console.error('Error finding hashtag:', hashtagError)
          throw new Error(`Failed to find hashtag: ${hashtag.name}`)
        }

        remixHashtagInserts.push({
          remix_id: remixId,
          hashtag_id: hashtagData.id
        })
      }

      const { error: remixHashtagsError } = await supabase
        .from('remix_hashtags')
        .insert(remixHashtagInserts)

      if (remixHashtagsError) {
        console.error('Error associating hashtags with remix:', remixHashtagsError)
        throw new Error('Failed to associate hashtags with remix')
      }
    }

    // Handle tags
    if (tags.length > 0) {
      // First, ensure all tags exist
      const tagInserts = tags.map(tag => ({
        name: tag.name.toLowerCase()
      }))

      const { error: tagsError } = await supabase
        .from('tags')
        .upsert(tagInserts, { onConflict: 'name' })

      if (tagsError) {
        console.error('Error updating tags:', tagsError)
        throw new Error('Failed to create tags')
      }

      // Then associate them with the remix
      const remixTagInserts = tags.map(tag => ({
        remix_id: remixId,
        tag_name: tag.name.toLowerCase()
      }))

      const { error: remixTagsError } = await supabase
        .from('remix_tags')
        .insert(remixTagInserts)

      if (remixTagsError) {
        console.error('Error associating tags with remix:', remixTagsError)
        throw new Error('Failed to associate tags with remix')
      }
    }

    return { success: true, remix: updatedRemix }

  } catch (error) {
    console.error('Error in updateRemix:', error)
    throw error
  }
}
