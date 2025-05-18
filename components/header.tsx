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
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <nav className="flex items-center space-x-6">
            <Link href="/browse" className="text-gray-700 hover:text-[#FF6B35]">
              Browse Remixes
            </Link>
            <Link href="/popular" className="text-gray-700 hover:text-[#FF6B35]">
              Popular
            </Link>
            <Link href="/submit" className="text-gray-700 hover:text-[#FF6B35]">
              Submit a Remix
            </Link>
            {session && (
              <Link href="/favorites" className="text-gray-700 hover:text-[#FF6B35]">
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
                <Button variant="outline" className="hidden sm:inline-flex">
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
