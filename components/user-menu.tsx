"use client"

import type { User } from "@supabase/supabase-js"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Heart, LogOut, Settings, UserIcon } from "lucide-react"
import Link from "next/link"

interface UserMenuProps {
  user: User
}

export default function UserMenu({ user }: UserMenuProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!user.email) return "U"
    return user.email.charAt(0).toUpperCase()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <Avatar>
          {user.user_metadata?.avatar_url ? (
            <AvatarImage 
              src={user.user_metadata.avatar_url} 
              alt={`${user.email}'s avatar`}
            />
          ) : (
            <AvatarFallback className="bg-[#FF6B35] text-white">
              {getInitials()}
            </AvatarFallback>
          )}
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-black border border-[#333]">
        <div className="px-4 py-3 border-b border-[#333]">
          <p className="text-sm font-medium text-white">{user.email}</p>
        </div>

        <Link href="/profile">
          <DropdownMenuItem className="text-gray-300 focus:bg-[#1a1a1a] focus:text-[#FF6B35] cursor-pointer">
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
        </Link>

        <Link href="/favorites">
          <DropdownMenuItem className="text-gray-300 focus:bg-[#1a1a1a] focus:text-[#FF6B35] cursor-pointer">
            <Heart className="mr-2 h-4 w-4" />
            <span>My Favorites</span>
          </DropdownMenuItem>
        </Link>

        <Link href="/settings">
          <DropdownMenuItem className="text-gray-300 focus:bg-[#1a1a1a] focus:text-[#FF6B35] cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </Link>

        <DropdownMenuSeparator className="bg-[#333]" />

        <DropdownMenuItem 
          onClick={handleSignOut}
          className="text-gray-300 focus:bg-[#1a1a1a] focus:text-[#FF6B35] cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
