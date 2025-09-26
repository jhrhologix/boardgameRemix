"use client"

import { ThumbsUp } from "lucide-react"
import { useState } from "react"
import { voteOnRemix } from "@/lib/actions"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"

interface VoteButtonsProps {
  remixId: string
  upvotes: number
  userVote?: string
  className?: string
  isAuthenticated: boolean
}

export default function VoteButtons({
  remixId,
  upvotes,
  userVote,
  className,
  isAuthenticated
}: VoteButtonsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleVote = async () => {
    console.log('Vote button clicked:', { remixId, userVote, isAuthenticated })
    console.log('Vote button - isAuthenticated check:', { isAuthenticated, type: typeof isAuthenticated })
    
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login')
      toast({
        title: "Login Required",
        description: "Please log in to vote on remixes.",
        variant: "destructive",
        action: (
          <button
            onClick={() => router.push('/auth')}
            className="bg-white text-black px-3 py-2 rounded hover:bg-gray-100"
          >
            Log In
          </button>
        ),
      })
      return
    }

    if (isLoading) {
      console.log('Already loading, ignoring click')
      return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('remixId', remixId)
      formData.append('voteType', userVote === 'upvote' ? 'remove' : 'upvote')
      
      console.log('Sending vote request:', { remixId, voteType: userVote === 'upvote' ? 'remove' : 'upvote' })
      const result = await voteOnRemix(formData)
      console.log('Vote result:', result)
      
      if (!result.success) {
        if (result.error === 'authentication') {
          console.log('Authentication error, redirecting to login')
          router.push('/auth')
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
                userVote === 'upvote' 
                  ? "text-green-500 bg-green-500/10" 
                  : "text-gray-400 hover:text-green-500 hover:bg-green-500/10"
              )}
            >
              <ThumbsUp size={18} className="sm:w-5 sm:h-5" />
              <span className="text-sm font-medium">{upvotes || 0}</span>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isAuthenticated ? (userVote === 'upvote' ? "Remove like" : "Like this remix") : "Log in to like"}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
