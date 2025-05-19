"use client"

import { ThumbsUp, ThumbsDown } from "lucide-react"
import { useState } from "react"
import { voteOnRemix } from "@/lib/actions"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"

interface VoteButtonsProps {
  remixId: string
  upvotes: number
  downvotes: number
  userVote?: string
  className?: string
  isAuthenticated: boolean
}

export default function VoteButtons({
  remixId,
  upvotes,
  downvotes,
  userVote,
  className,
  isAuthenticated
}: VoteButtonsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleVote = async (value: 'upvote' | 'downvote') => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to vote on remixes.",
        variant: "destructive",
        action: (
          <button
            onClick={() => router.push('/login')}
            className="bg-white text-black px-3 py-2 rounded hover:bg-gray-100"
          >
            Log In
          </button>
        ),
      })
      return
    }

    if (isLoading) return

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('remixId', remixId)
      formData.append('voteType', userVote === value ? 'remove' : value)
      const result = await voteOnRemix(formData)
      
      if (!result.success) {
        if (result.error === 'authentication') {
          router.push('/login')
          return
        }
        throw new Error(result.message)
      }
      
      router.refresh()
    } catch (error) {
      console.error('Error voting:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to vote. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-2", className)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => handleVote('upvote')}
              disabled={isLoading}
              className={cn(
                "flex items-center gap-1 transition-colors",
                userVote === 'upvote' ? "text-green-500" : "text-gray-400 hover:text-green-500"
              )}
            >
              <ThumbsUp size={20} />
              <span>{upvotes || 0}</span>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isAuthenticated ? (userVote === 'upvote' ? "Remove upvote" : "Upvote this remix") : "Log in to upvote"}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => handleVote('downvote')}
              disabled={isLoading}
              className={cn(
                "flex items-center gap-1 transition-colors",
                userVote === 'downvote' ? "text-red-500" : "text-gray-400 hover:text-red-500"
              )}
            >
              <ThumbsDown size={20} />
              <span>{downvotes || 0}</span>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isAuthenticated ? (userVote === 'downvote' ? "Remove downvote" : "Downvote this remix") : "Log in to downvote"}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
