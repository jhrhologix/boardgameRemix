import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth'
import { NavBar } from '@/components/nav-bar'
import { GoogleAnalytics } from '@/components/google-analytics'

export const metadata: Metadata = {
  title: {
    default: 'Remix Games - Creative Board Game Combinations',
    template: '%s | Remix Games'
  },
  description: 'Discover and create innovative board game combinations using games you already own. Join the community of creative gamers sharing unique remixes and variants.',
  keywords: [
    'board games',
    'game remixes',
    'board game combinations',
    'game variants',
    'creative gaming',
    'board game community',
    'game modifications',
    'tabletop gaming'
  ],
  authors: [{ name: 'Remix Games Team' }],
  creator: 'Remix Games',
  publisher: 'Remix Games',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://remix.games'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://remix.games',
    siteName: 'Remix Games',
    title: 'Remix Games - Creative Board Game Combinations',
    description: 'Discover and create innovative board game combinations using games you already own. Join the community of creative gamers sharing unique remixes and variants.',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Remix Games - Creative Board Game Combinations',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Remix Games - Creative Board Game Combinations',
    description: 'Discover and create innovative board game combinations using games you already own.',
    images: ['/og-image.svg'],
    creator: '@remixgames',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <GoogleAnalytics />
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
