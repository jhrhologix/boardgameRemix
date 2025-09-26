"use client"

import { ThumbsUp } from "lucide-react"
import { useState } from "react"
import { voteOnRemix } from "@/lib/actions"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth"

interface VoteButtonsProps {
  remixId: string
  upvotes: number
  userVote?: string
  className?: string
}

export default function VoteButtons({
  remixId,
  upvotes,
  userVote,
  className
}: VoteButtonsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  // Ensure all data is properly typed
  const safeProps = {
    remixId: String(remixId),
    userVote: userVote ? String(userVote) : undefined,
    isAuthenticated: Boolean(user),
  }

  const handleVote = async () => {
    console.log('Vote button clicked:', { 
      remixId: safeProps.remixId, 
      userVote: safeProps.userVote, 
      isAuthenticated: safeProps.isAuthenticated 
    })
    console.log('Vote button - isAuthenticated check:', { 
      isAuthenticated: safeProps.isAuthenticated, 
      type: typeof safeProps.isAuthenticated 
    })
    
    if (!safeProps.isAuthenticated) {
      console.log('User not authenticated, redirecting to login')
      router.push(`/auth/login?callbackUrl=/remixes/${safeProps.remixId}`)
      return
    }

    if (isLoading) {
      console.log('Already loading, ignoring click')
      return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('remixId', safeProps.remixId)
      formData.append('voteType', safeProps.userVote === 'upvote' ? 'remove' : 'upvote')
      
      console.log('Sending vote request:', { 
        remixId: safeProps.remixId, 
        voteType: safeProps.userVote === 'upvote' ? 'remove' : 'upvote' 
      })
      const result = await voteOnRemix(formData)
      console.log('Vote result:', result)
      
      if (!result.success) {
        if (result.error === 'authentication') {
          console.log('Authentication error, redirecting to login')
          router.push(`/auth/login?callbackUrl=/remixes/${safeProps.remixId}`)
          return
        }
        throw new Error(result.message)
      }
      
      console.log('Vote successful, refreshing page')
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
      <div className={cn("flex items-center gap-1 sm:gap-2", className)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleVote}
              disabled={isLoading}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-md transition-colors min-h-[40px] min-w-[40px] justify-center",
                safeProps.userVote === 'upvote' 
                  ? "text-green-500 bg-green-500/10" 
                  : "text-gray-400 hover:text-green-500 hover:bg-green-500/10"
              )}
            >
              <ThumbsUp size={18} className="sm:w-5 sm:h-5" />
              <span className="text-sm font-medium">{upvotes || 0}</span>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{safeProps.isAuthenticated ? (safeProps.userVote === 'upvote' ? "Remove like" : "Like this remix") : "Log in to like"}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
