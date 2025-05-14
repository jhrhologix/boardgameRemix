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
  className,
  isAuthenticated = false,
}: FavoriteButtonProps) {
  const router = useRouter()
  const [optimisticFavorite, setOptimisticFavorite] = useState(isFavorited)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleToggleFavorite = async () => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push(`/auth/login?callbackUrl=/remixes/${remixId}`)
      return
    }

    if (isSubmitting) return // Prevent multiple clicks

    setIsSubmitting(true)
    setOptimisticFavorite(!optimisticFavorite)

    const formData = new FormData()
    formData.append("remixId", remixId)

    try {
      const result = await toggleFavorite(formData)

      if (!result.success) {
        // Handle authentication error
        if (result.error === "authentication") {
          // Revert optimistic update
          setOptimisticFavorite(isFavorited)

          // Redirect to login
          router.push(`/auth/login?callbackUrl=/remixes/${remixId}`)
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
      // Revert optimistic update on error
      setOptimisticFavorite(isFavorited)
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
              isAuthenticated && optimisticFavorite
                ? "text-red-500 bg-red-100"
                : "text-gray-500 hover:text-red-500 hover:bg-red-100",
              className,
              isSubmitting && "opacity-50 cursor-not-allowed",
            )}
            aria-label={optimisticFavorite ? "Remove from favorites" : "Add to favorites"}
            disabled={isSubmitting}
          >
            {!isAuthenticated ? (
              <LogIn size={18} className="text-gray-400" />
            ) : (
              <Heart size={18} className={cn(optimisticFavorite ? "fill-red-500" : "fill-none")} />
            )}
          </button>
        </TooltipTrigger>
        {!isAuthenticated && (
          <TooltipContent>
            <p>Log in to save to favorites</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  )
}
