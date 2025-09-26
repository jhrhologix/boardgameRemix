"use client"

import { Heart, LogIn } from "lucide-react"
import { useState } from "react"
import { toggleFavorite } from "@/lib/actions"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuth } from "@/lib/auth"

interface FavoriteButtonProps {
  remixId: string
  isFavorited?: boolean
  className?: string
}

export default function FavoriteButton({
  remixId,
  isFavorited = false,
  className = '',
}: FavoriteButtonProps) {
  const router = useRouter()
  const { user } = useAuth()

  // Ensure all data is properly typed
  const safeProps = {
    remixId: String(remixId),
    isFavorited: Boolean(isFavorited),
    isAuthenticated: Boolean(user),
  }

  const [optimisticFavorite, setOptimisticFavorite] = useState(safeProps.isFavorited)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleToggleFavorite = async () => {
    console.log('Favorite button clicked:', { 
      remixId: safeProps.remixId, 
      isFavorited: safeProps.isFavorited, 
      isAuthenticated: safeProps.isAuthenticated 
    })
    
    // Redirect to login if not authenticated
    if (!safeProps.isAuthenticated) {
      console.log('User not authenticated, redirecting to login')
      router.push(`/auth/login?callbackUrl=/remixes/${safeProps.remixId}`)
      return
    }

    if (isSubmitting) {
      console.log('Already submitting, ignoring click')
      return // Prevent multiple clicks
    }

    setIsSubmitting(true)
    setOptimisticFavorite(!optimisticFavorite)

    const formData = new FormData()
    formData.append("remixId", safeProps.remixId)

    try {
      console.log('Sending favorite toggle request:', { remixId: safeProps.remixId })
      const result = await toggleFavorite(formData)
      console.log('Favorite toggle result:', result)

      if (!result.success) {
        // Handle authentication error
        if (result.error === "authentication") {
          console.log('Authentication error, reverting optimistic update and redirecting')
          // Revert optimistic update
          setOptimisticFavorite(safeProps.isFavorited)

          // Redirect to login
          router.push(`/auth/login?callbackUrl=/remixes/${safeProps.remixId}`)
        }
      } else {
        console.log('Favorite toggle successful')
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
      // Revert optimistic update on error
      setOptimisticFavorite(safeProps.isFavorited)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleToggleFavorite}
            className={cn(
              "p-2 rounded-full transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center",
              safeProps.isAuthenticated && optimisticFavorite
                ? "text-red-500 bg-red-500/10"
                : "text-gray-500 hover:text-red-500 hover:bg-red-500/10",
              className,
              isSubmitting && "opacity-50 cursor-not-allowed",
            )}
            aria-label={optimisticFavorite ? "Remove from favorites" : "Add to favorites"}
            disabled={isSubmitting}
          >
            {!safeProps.isAuthenticated ? (
              <LogIn size={18} className="text-gray-400 sm:w-5 sm:h-5" />
            ) : (
              <Heart size={18} className={cn(optimisticFavorite ? "fill-red-500" : "fill-none", "sm:w-5 sm:h-5")} />
            )}
          </button>
        </TooltipTrigger>
        {!safeProps.isAuthenticated && (
          <TooltipContent>
            <p>Log in to save to favorites</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  )
}
