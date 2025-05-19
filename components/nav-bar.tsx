'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function NavBar() {
  return (
    <nav className="border-b bg-white">
      <div className="container flex items-center justify-between h-16">
        <Link href="/" className="flex items-center">
          <span className="text-2xl font-bold text-[#004E89]">Remix Games</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/browse">
            <Button variant="ghost">Browse Games</Button>
          </Link>
          <Link href="/submit">
            <Button variant="ghost">Submit Remix</Button>
          </Link>
        </div>
      </div>
    </nav>
  )
} 