import Link from "next/link"
import { Button } from "@/components/ui/button"
import UserMenu from "./user-menu"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import TipJar from "./tip-jar"

export default async function Header() {
  const supabase = await createClient()
  
  let session = null
  try {
    const { data } = await supabase.auth.getSession()
    session = data.session
  } catch (error) {
    console.error("Error getting session:", error)
  }

  return (
    <header className="bg-black border-b border-[#004E89]/20 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <nav className="flex items-center space-x-6">
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
              <Link href="/favorites" className="text-gray-300 hover:text-[#FF6B35] transition-colors">
                My Favorites
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
