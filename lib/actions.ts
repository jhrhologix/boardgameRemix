"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

export async function voteOnRemix(formData: FormData) {
  const remixId = formData.get("remixId") as string
  const voteType = formData.get("voteType") as "upvote" | "remove"
  const supabase = await createClient()

  console.log('voteOnRemix called:', { remixId, voteType })

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("Authentication error:", userError)
      return { success: false, error: "authentication", message: "You must be logged in to vote" }
    }

    const userId = user.id
    console.log('User authenticated:', { userId })

    // Check if user has already voted on this remix
    const { data: existingVote, error: voteError } = await supabase
      .from("user_votes")
      .select("*")
      .eq("user_id", userId)
      .eq("remix_id", remixId)
      .maybeSingle()

    console.log('Existing vote check:', { existingVote, voteError })

    if (voteError) {
      console.error("Error checking vote status:", voteError)
      return { success: false, error: "unknown", message: "Error checking vote status" }
    }

    // If user is clicking the same vote type again or removing vote, delete the vote
    if (existingVote && (voteType === existingVote.vote_type || voteType === "remove")) {
      console.log('Removing existing vote')
      const { error: deleteError } = await supabase
        .from("user_votes")
        .delete()
        .eq("user_id", userId)
        .eq("remix_id", remixId)

      if (deleteError) {
        console.error("Error removing vote:", deleteError)
        return { success: false, error: "unknown", message: "Error removing vote" }
      }
      console.log('Vote removed successfully')
    } else {
      // Insert new vote (only upvote allowed)
      const voteData = {
        remix_id: remixId,
        user_id: userId,
        vote_type: "upvote" // Only allow upvotes
      }

      console.log('Inserting new vote:', voteData)
      const { error: upsertError } = await supabase
        .from("user_votes")
        .upsert(voteData, { onConflict: 'user_id,remix_id' })

      if (upsertError) {
        console.error("Error upserting vote:", upsertError)
        return { success: false, error: "unknown", message: "Error updating vote" }
      }
      console.log('Vote inserted successfully')
    }

    // Update vote count on remix
    console.log('Updating vote count for remix:', remixId)
    const { error: updateError } = await supabase.rpc("update_remix_votes", {
      remix_id_param: remixId,
    })

    if (updateError) {
      console.error("Error updating vote count:", updateError)
      return { success: false, error: "unknown", message: "Error updating vote count" }
    }

    console.log('Vote count updated successfully')
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error voting on remix:", error)
    return { success: false, error: "unknown", message: "An error occurred while voting" }
  }
}

export async function toggleFavorite(formData: FormData) {
  try {
    const remixId = formData.get("remixId") as string
    const supabase = await createClient()

    console.log('toggleFavorite called:', { remixId })

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("Authentication error:", userError)
      return { success: false, error: "authentication", message: "You must be logged in to favorite" }
    }

    const userId = user.id
    console.log('User authenticated:', { userId })

    // Check if already favorited
    const { data: existingFavorite, error: favoriteError } = await supabase
      .from("user_favorites")
      .select("*")
      .eq("user_id", userId)
      .eq("remix_id", remixId)
      .maybeSingle()

    console.log('Existing favorite check:', { existingFavorite, favoriteError })

    if (favoriteError) {
      console.error("Error checking favorite status:", favoriteError)
      return { success: false, error: "unknown", message: "Error checking favorite status" }
    }

    if (existingFavorite) {
      // Remove from favorites
      console.log('Removing from favorites')
      const { error: deleteError } = await supabase
        .from("user_favorites")
        .delete()
        .eq("user_id", userId)
        .eq("remix_id", remixId)

      if (deleteError) {
        console.error("Error removing favorite:", deleteError)
        return { success: false, error: "unknown", message: "Error removing favorite" }
      }
      console.log('Favorite removed successfully')
    } else {
      // Add to favorites
      console.log('Adding to favorites')
      const { error: insertError } = await supabase
        .from("user_favorites")
        .insert({
          remix_id: remixId,
          user_id: userId,
        })

      if (insertError) {
        console.error("Error adding favorite:", insertError)
        return { success: false, error: "unknown", message: "Error adding favorite" }
      }
      console.log('Favorite added successfully')
    }

    revalidatePath("/")
    revalidatePath("/favorites")
    return { success: true }
  } catch (error) {
    console.error("Error toggling favorite:", error)
    return { success: false, error: "unknown", message: "An error occurred while toggling favorite" }
  }
}

export async function getFavoriteStatus(remixIds: string[]) {
  if (!remixIds.length) return {}

  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      // Return empty object for anonymous users instead of logging error
      return {}
    }

    const { data, error: favoritesError } = await supabase
      .from('user_favorites')
      .select('remix_id')
      .eq('user_id', user.id)
      .in('remix_id', remixIds)

    if (favoritesError) {
      console.error("Error fetching favorites:", favoritesError)
      return {}
    }

    return data?.reduce((acc, fav) => ({
      ...acc,
      [fav.remix_id]: true,
    }), {}) || {}
  } catch (error) {
    console.error('Error getting favorite status:', error)
    return {}
  }
}

export async function getUserVotes(remixIds: string[]) {
  if (!remixIds.length) return {}

  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      // Return empty object for anonymous users instead of logging error
      return {}
    }

    const { data, error: votesError } = await supabase
      .from('user_votes')
      .select('remix_id, vote_type')
      .eq('user_id', user.id)
      .in('remix_id', remixIds)

    if (votesError) {
      console.error("Error fetching votes:", votesError)
      return {}
    }

    return data?.reduce((acc, vote) => ({
      ...acc,
      [vote.remix_id]: vote.vote_type,
    }), {}) || {}
  } catch (error) {
    console.error('Error getting user votes:', error)
    return {}
  }
}
