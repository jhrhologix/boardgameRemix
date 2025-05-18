"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

export async function voteOnRemix(formData: FormData) {
  const remixId = formData.get("remixId") as string
  const voteType = formData.get("voteType") as "upvote" | "downvote" | "remove"

  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Ensure user is authenticated
    if (!session) {
      // Return an authentication error instead of redirecting
      return { success: false, error: "authentication", message: "You must be logged in to vote" }
    }

    const userId = session.user.id

    // Check if user has already voted on this remix
    const { data: existingVote } = await supabase
      .from("votes")
      .select("*")
      .eq("user_id", userId)
      .eq("remix_id", remixId)
      .single()

    // Handle vote based on type and existing vote
    if (voteType === "remove" || (existingVote && existingVote.vote_type === voteType)) {
      // Remove vote if user is removing or clicking the same vote type again
      if (existingVote) {
        await supabase.from("votes").delete().eq("id", existingVote.id)

        // Update vote count on remix
        await supabase.rpc("update_vote_count", {
          remix_id_param: remixId,
        })
      }
    } else {
      // Insert or update vote
      if (existingVote) {
        await supabase.from("votes").update({ vote_type: voteType }).eq("id", existingVote.id)
      } else {
        await supabase.from("votes").insert({
          remix_id: remixId,
          user_id: userId,
          vote_type: voteType,
        })
      }

      // Update vote count on remix
      await supabase.rpc("update_vote_count", {
        remix_id_param: remixId,
      })
    }

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

    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      // Return an authentication error instead of redirecting
      return { success: false, error: "authentication", message: "You must be logged in to favorite" }
    }

    const userId = session.user.id

    // Check if already favorited
    const { data: existingFavorite } = await supabase
      .from("favorites")
      .select("*")
      .eq("user_id", userId)
      .eq("remix_id", remixId)
      .single()

    if (existingFavorite) {
      // Remove from favorites
      await supabase.from("favorites").delete().eq("id", existingFavorite.id)
    } else {
      // Add to favorites
      await supabase.from("favorites").insert({
        remix_id: remixId,
        user_id: userId,
      })
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

  const supabase = await createClient()

  try {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return {}
    }

    const { data } = await supabase
      .from('favorites')
      .select('remix_id')
      .eq('user_id', session.user.id)
      .in('remix_id', remixIds)

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

  const supabase = await createClient()

  try {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return {}
    }

    const { data } = await supabase
      .from('user_votes')
      .select('remix_id, vote_type')
      .eq('user_id', session.user.id)
      .in('remix_id', remixIds)

    return data?.reduce((acc, vote) => ({
      ...acc,
      [vote.remix_id]: vote.vote_type,
    }), {}) || {}
  } catch (error) {
    console.error('Error getting user votes:', error)
    return {}
  }
}
