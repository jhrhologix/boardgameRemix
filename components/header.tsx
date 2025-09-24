'use client'

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import UserMenu from "./user-menu"
import { useAuth } from "@/lib/auth"
import TipJar from "./tip-jar"
import { Menu, X } from "lucide-react"
import { useState } from "react"

export default function Header() {
  const { user } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="bg-black border-b border-[#004E89]/20 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo - responsive sizing */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0">
            <Image 
              src="/logo.png" 
              alt="Remix Games Logo" 
              width={32} 
              height={32} 
              className="w-8 h-8 sm:w-10 sm:h-10"
            />
            <span className="text-[#FF6B35] font-bold text-lg sm:text-xl">
              <span className="hidden sm:inline">Board Game Remix</span>
              <span className="sm:hidden">BGR</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/browse" className="text-gray-300 hover:text-[#FF6B35] transition-colors">
              Browse Remixes
            </Link>
            <Link href="/popular" className="text-gray-300 hover:text-[#FF6B35] transition-colors">
              Popular
            </Link>
            <Link href="/submit" className="text-gray-300 hover:text-[#FF6B35] transition-colors">
              Submit a Remix
            </Link>
            {user && (
              <Link href="/favorites" className="text-gray-300 hover:text-[#FF6B35] transition-colors flex items-center gap-1">
                <span>My Favorites</span>
              </Link>
            )}
          </nav>

          {/* Right side - Auth and TipJar */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden sm:block">
              <TipJar />
            </div>
            {user ? (
              <UserMenu user={user} />
            ) : (
              <Link href="/auth">
                <Button variant="outline" className="bg-black text-[#FF6B35] border-[#004E89]/20 hover:bg-[#004E89]/20 hover:text-[#FF6B35] text-sm sm:text-base">
                  <span className="hidden sm:inline">Log in</span>
                  <span className="sm:hidden">Login</span>
                </Button>
              </Link>
            )}
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-gray-300 hover:text-[#FF6B35] p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-[#004E89]/20 bg-black">
            <nav className="flex flex-col space-y-2 py-4">
              <Link 
                href="/browse" 
                className="text-gray-300 hover:text-[#FF6B35] transition-colors px-4 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Browse Remixes
              </Link>
              <Link 
                href="/popular" 
                className="text-gray-300 hover:text-[#FF6B35] transition-colors px-4 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Popular
              </Link>
              <Link 
                href="/submit" 
                className="text-gray-300 hover:text-[#FF6B35] transition-colors px-4 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Submit a Remix
              </Link>
              {user && (
                <Link 
                  href="/favorites" 
                  className="text-gray-300 hover:text-[#FF6B35] transition-colors px-4 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Favorites
                </Link>
              )}
              <div className="px-4 py-2 sm:hidden">
                <TipJar />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
