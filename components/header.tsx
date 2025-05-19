'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import UserMenu from "./user-menu"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import TipJar from "./tip-jar"
import { Session } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

export default function Header() {
  const [session, setSession] = useState<Session | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession()
      setSession(initialSession)
    }
    
    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  return (
    <header className="bg-black border-b border-[#004E89]/20 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <nav className="flex items-center space-x-6">
            <Link href="/" className="text-[#FF6B35] font-bold text-xl hover:text-[#e55a2a] transition-colors">
              Board Game Remix
            </Link>
            <Link href="/browse" className="text-gray-300 hover:text-[#FF6B35] transition-colors">
              Browse Remixes
            </Link>
            <Link href="/popular" className="text-gray-300 hover:text-[#FF6B35] transition-colors">
              Popular
            </Link>
            <Link href="/submit" className="text-gray-300 hover:text-[#FF6B35] transition-colors">
              Submit a Remix
            </Link>
            {session && (
              <Link href="/favorites" className="text-gray-300 hover:text-[#FF6B35] transition-colors flex items-center gap-1">
                <span>My Favorites</span>
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:block">
              <TipJar />
            </div>
            {session ? (
              <UserMenu user={session.user} />
            ) : (
              <Link href="/auth">
                <Button variant="outline" className="hidden sm:inline-flex bg-black text-[#FF6B35] border-[#004E89]/20 hover:bg-[#004E89]/20 hover:text-[#FF6B35]">
                  Log in
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
