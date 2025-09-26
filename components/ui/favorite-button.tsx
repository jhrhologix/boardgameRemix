"use client"

import { useState } from "react"
import { Heart } from "lucide-react"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types'
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface FavoriteButtonProps {
  remixId: string
  isFavorited?: boolean
  isAuthenticated: boolean
  className?: string
}

export default function FavoriteButton({ remixId, isFavorited = false, isAuthenticated, className }: FavoriteButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isFavorite, setIsFavorite] = useState(isFavorited)
  const supabase = createClientComponentClient<Database>()
  const { toast } = useToast()
  const router = useRouter()

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to favorite remixes.",
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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('remix_id', remixId)
          .eq('user_id', user.id)

        if (error) throw error
        setIsFavorite(false)
        toast({
          title: "Success",
          description: "Removed from favorites",
        })
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('user_favorites')
          .insert({
            remix_id: remixId,
            user_id: user.id
          })

        if (error) throw error
        setIsFavorite(true)
        toast({
          title: "Success",
          description: "Added to favorites",
        })
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFavorite}
            disabled={isLoading || !isAuthenticated}
            className={className}
          >
            <Heart
              className={`h-5 w-5 ${
                !isAuthenticated 
                  ? 'text-gray-300' 
                  : isFavorite 
                    ? 'fill-current text-red-500' 
                    : 'text-gray-400'
              }`}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {!isAuthenticated 
              ? "Log in to favorite remixes"
              : isFavorite 
                ? "Remove from favorites" 
                : "Add to favorites"
            }
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
} 