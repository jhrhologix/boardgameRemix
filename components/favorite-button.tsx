"use client"

import { Heart, LogIn } from "lucide-react"
import { useState } from "react"
import { toggleFavorite } from "@/lib/actions"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface FavoriteButtonProps {
  remixId: string
  isFavorited?: boolean
  className?: string
  isAuthenticated?: boolean
}

export default function FavoriteButton({
  remixId,
  isFavorited = false,
  className = '',
  isAuthenticated = false,
}: FavoriteButtonProps) {
  const router = useRouter()

  // Ensure all data is properly typed
  const safeProps = {
    remixId: String(remixId),
    isFavorited: Boolean(isFavorited),
    isAuthenticated: Boolean(isAuthenticated),
  }

  const [optimisticFavorite, setOptimisticFavorite] = useState(safeProps.isFavorited)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleToggleFavorite = async () => {
    // Redirect to login if not authenticated
    if (!safeProps.isAuthenticated) {
      router.push(`/auth/login?callbackUrl=/remixes/${safeProps.remixId}`)
      return
    }

    if (isSubmitting) return // Prevent multiple clicks

    setIsSubmitting(true)
    setOptimisticFavorite(!optimisticFavorite)

    const formData = new FormData()
    formData.append("remixId", safeProps.remixId)

    try {
      const result = await toggleFavorite(formData)

      if (!result.success) {
        // Handle authentication error
        if (result.error === "authentication") {
          // Revert optimistic update
          setOptimisticFavorite(safeProps.isFavorited)

          // Redirect to login
          router.push(`/auth/login?callbackUrl=/remixes/${safeProps.remixId}`)
        }
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
              "p-1 rounded-full transition-colors",
              safeProps.isAuthenticated && optimisticFavorite
                ? "text-red-500 bg-red-100"
                : "text-gray-500 hover:text-red-500 hover:bg-red-100",
              className,
              isSubmitting && "opacity-50 cursor-not-allowed",
            )}
            aria-label={optimisticFavorite ? "Remove from favorites" : "Add to favorites"}
            disabled={isSubmitting}
          >
            {!safeProps.isAuthenticated ? (
              <LogIn size={18} className="text-gray-400" />
            ) : (
              <Heart size={18} className={cn(optimisticFavorite ? "fill-red-500" : "fill-none")} />
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
