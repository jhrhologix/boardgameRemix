import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth'
import { NavBar } from '@/components/nav-bar'
import { GoogleAnalytics } from '@/components/google-analytics'

export const metadata: Metadata = {
  title: {
    default: 'Remix Games - Creative Board Game Combinations & Variants',
    template: '%s | Remix Games - Board Game Remixes'
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  description: 'Discover and create innovative board game combinations using games you already own. Join the largest community of creative gamers sharing unique remixes, variants, and custom rules for tabletop games.',
  keywords: [
    'board games',
    'game remixes',
    'board game combinations',
    'game variants',
    'creative gaming',
    'board game community',
    'game modifications',
    'tabletop gaming',
    'board game rules',
    'custom board games',
    'game mixing',
    'board game ideas',
    'gaming community',
    'board game creativity',
    'game design',
    'board game variants',
    'tabletop game combinations',
    'board game remix',
    'gaming innovation',
    'board game experiments'
  ],
  authors: [{ name: 'Remix Games Team' }],
  creator: 'Remix Games',
  publisher: 'Remix Games',
  category: 'Gaming',
  classification: 'Board Games, Gaming Community, Creative Gaming',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://remix.games'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en-US',
      'en-GB': '/en-GB',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://remix.games',
    siteName: 'Remix Games',
    title: 'Remix Games - Creative Board Game Combinations & Variants',
    description: 'Discover and create innovative board game combinations using games you already own. Join the largest community of creative gamers sharing unique remixes, variants, and custom rules for tabletop games.',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Remix Games - Creative Board Game Combinations and Variants Platform',
        type: 'image/svg+xml',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Remix Games - Creative Board Game Combinations',
    description: 'Discover and create innovative board game combinations using games you already own. Join the gaming community!',
    images: ['/og-image.svg'],
    creator: '@remixgames',
    site: '@remixgames',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  other: {
    'msapplication-TileColor': '#FF6B35',
    'theme-color': '#FF6B35',
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
