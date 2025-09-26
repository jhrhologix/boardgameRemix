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
  
  if (authError || !user || user.id !== userId) {
    throw new Error('Authentication error. Please try logging in again.')
  }

  try {
    // Create the remix
    const { data: newRemix, error: insertError } = await supabase
      .from('remixes')
      .insert({
        ...remixData,
        creator_id: userId
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

      // Then associate them with the remix
      const remixHashtagInserts = hashtags.map(hashtag => ({
        remix_id: newRemix.id,
        hashtag_name: hashtag.name.toLowerCase()
      }))

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
  
  if (authError || !user || user.id !== userId) {
    throw new Error('Authentication error. Please try logging in again.')
  }

  try {
    // Update the remix
    const { data: updatedRemix, error: updateError } = await supabase
      .from('remixes')
      .update(remixData)
      .eq('id', remixId)
      .eq('creator_id', userId) // Ensure user owns the remix
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

      // Then associate them with the remix
      const remixHashtagInserts = hashtags.map(hashtag => ({
        remix_id: remixId,
        hashtag_name: hashtag.name.toLowerCase()
      }))

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
