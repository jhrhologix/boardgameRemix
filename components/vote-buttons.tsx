"use client"

import { ThumbsUp, ThumbsDown, LogIn } from "lucide-react"
import { useState } from "react"
import { voteOnRemix } from "@/lib/actions"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface VoteButtonsProps {
  remixId: string
  upvotes: number
  downvotes: number
  userVote?: string
  className?: string
  isAuthenticated?: boolean
}

export default function VoteButtons({
  remixId,
  upvotes = 0,
  downvotes = 0,
  userVote,
  className = '',
  isAuthenticated = false,
}: VoteButtonsProps) {
  const router = useRouter()
  
  // Ensure all data is properly typed
  const safeProps = {
    remixId: String(remixId),
    upvotes: Number(upvotes) || 0,
    downvotes: Number(downvotes) || 0,
    userVote: userVote ? String(userVote) : undefined,
    isAuthenticated: Boolean(isAuthenticated),
  }

  const [optimisticUpvotes, setOptimisticUpvotes] = useState(safeProps.upvotes)
  const [optimisticDownvotes, setOptimisticDownvotes] = useState(safeProps.downvotes)
  const [optimisticUserVote, setOptimisticUserVote] = useState(safeProps.userVote)
  const [isVoting, setIsVoting] = useState(false)

  const handleVote = async (voteType: "upvote" | "downvote") => {
    // If not authenticated, redirect to login
    if (!safeProps.isAuthenticated) {
      router.push(`/auth/login?callbackUrl=/remixes/${safeProps.remixId}`)
      return
    }

    if (isVoting) return // Prevent multiple clicks

    setIsVoting(true)

    // Determine the action based on current state
    let action: "upvote" | "downvote" | "remove" = voteType

    if (optimisticUserVote === voteType) {
      action = "remove"
    }

    // Update optimistic UI
    if (action === "upvote") {
      if (optimisticUserVote === "downvote") {
        setOptimisticDownvotes((prev) => prev - 1)
      }
      setOptimisticUpvotes((prev) => prev + 1)
      setOptimisticUserVote("upvote")
    } else if (action === "downvote") {
      if (optimisticUserVote === "upvote") {
        setOptimisticUpvotes((prev) => prev - 1)
      }
      setOptimisticDownvotes((prev) => prev + 1)
      setOptimisticUserVote("downvote")
    } else if (action === "remove") {
      if (optimisticUserVote === "upvote") {
        setOptimisticUpvotes((prev) => prev - 1)
      } else if (optimisticUserVote === "downvote") {
        setOptimisticDownvotes((prev) => prev - 1)
      }
      setOptimisticUserVote(undefined)
    }

    // Submit the form
    const formData = new FormData()
    formData.append("remixId", safeProps.remixId)
    formData.append("voteType", action)

    try {
      const result = await voteOnRemix(formData)

      if (!result.success) {
        // Handle authentication error
        if (result.error === "authentication") {
          // Revert optimistic updates
          setOptimisticUpvotes(safeProps.upvotes)
          setOptimisticDownvotes(safeProps.downvotes)
          setOptimisticUserVote(safeProps.userVote)

          // Redirect to login
          router.push(`/auth/login?callbackUrl=/remixes/${safeProps.remixId}`)
        }
      }
    } catch (error) {
      console.error("Error voting:", error)
      // Revert optimistic updates on error
      setOptimisticUpvotes(safeProps.upvotes)
      setOptimisticDownvotes(safeProps.downvotes)
      setOptimisticUserVote(safeProps.userVote)
    } finally {
      setIsVoting(false)
    }
  }

  const voteScore = optimisticUpvotes - optimisticDownvotes

  // Render vote buttons with tooltips for non-authenticated users
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => handleVote("upvote")}
              className={cn(
                "p-1 rounded-full transition-colors",
                safeProps.isAuthenticated && optimisticUserVote === "upvote"
                  ? "text-green-500 bg-green-100"
                  : "text-gray-500 hover:text-green-500 hover:bg-green-100",
                !safeProps.isAuthenticated && "cursor-pointer",
                isVoting && "opacity-50 cursor-not-allowed",
              )}
              aria-label="Upvote"
              disabled={isVoting}
            >
              {!safeProps.isAuthenticated ? <LogIn size={16} className="text-gray-400" /> : <ThumbsUp size={16} />}
            </button>
          </TooltipTrigger>
          {!safeProps.isAuthenticated && (
            <TooltipContent>
              <p>Log in to vote</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>

      <span
        className={cn(
          "font-medium text-sm min-w-[24px] text-center",
          voteScore > 0 ? "text-green-600" : voteScore < 0 ? "text-red-600" : "text-gray-600",
        )}
      >
        {voteScore}
      </span>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => handleVote("downvote")}
              className={cn(
                "p-1 rounded-full transition-colors",
                safeProps.isAuthenticated && optimisticUserVote === "downvote"
                  ? "text-red-500 bg-red-100"
                  : "text-gray-500 hover:text-red-500 hover:bg-red-100",
                !safeProps.isAuthenticated && "cursor-pointer",
                isVoting && "opacity-50 cursor-not-allowed",
              )}
              aria-label="Downvote"
              disabled={isVoting}
            >
              {!safeProps.isAuthenticated ? <LogIn size={16} className="text-gray-400" /> : <ThumbsDown size={16} />}
            </button>
          </TooltipTrigger>
          {!safeProps.isAuthenticated && (
            <TooltipContent>
              <p>Log in to vote</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
