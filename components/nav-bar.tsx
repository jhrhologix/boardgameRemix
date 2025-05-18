'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'

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
              <Button variant="ghost" onClick={handleSignOut}>Sign Out</Button>
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