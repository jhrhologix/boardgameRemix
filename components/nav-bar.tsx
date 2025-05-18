'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export function NavBar() {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    // Will automatically redirect due to auth state change
  }

  return (
    <nav className="border-b bg-white">
      <div className="container flex items-center justify-between h-16">
        <Link href="/" className="flex items-center">
          <span className="text-2xl font-bold text-[#004E89]">Remix Games</span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/browse">
                <Button variant="ghost">Browse Games</Button>
              </Link>
              <Link href="/submit">
                <Button variant="ghost">Submit Remix</Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {user.email?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 dropdown-menu-content bg-white">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {user.email && (
                        <p className="font-medium text-black">{user.email}</p>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <Link href="/profile">
                    <DropdownMenuItem className="cursor-pointer text-black">
                      Profile
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/favorites">
                    <DropdownMenuItem className="cursor-pointer text-black">
                      My Favorites
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/my-remixes">
                    <DropdownMenuItem className="cursor-pointer text-black">
                      My Remixes
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer text-red-600 focus:text-red-600" 
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth?tab=sign-up">
                <Button>Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
} 