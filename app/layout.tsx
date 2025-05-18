import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth'
import { NavBar } from '@/components/nav-bar'

export const metadata: Metadata = {
  title: 'BoardGame Remix',
  description: 'Create and share board game variations',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <NavBar />
          <main>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}
