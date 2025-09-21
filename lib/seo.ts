import { Metadata } from 'next'

export interface SEOProps {
  title: string
  description: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  section?: string
  tags?: string[]
}

export function generateMetadata({
  title,
  description,
  keywords = [],
  image = '/og-image.svg',
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  section,
  tags = []
}: SEOProps): Metadata {
  const baseKeywords = [
    'board games',
    'game remixes',
    'board game combinations',
    'game variants',
    'creative gaming',
    'board game community'
  ]

  const allKeywords = [...baseKeywords, ...keywords]

  const metadata: Metadata = {
    title,
    description,
    keywords: allKeywords,
    openGraph: {
      title,
      description,
      type,
      url,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(author && { authors: [{ name: author }] }),
      ...(section && { section }),
      ...(tags.length > 0 && { tags }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    alternates: {
      ...(url && { canonical: url }),
    },
  }

  return metadata
}

// Specific SEO generators for different page types
export function generateRemixMetadata(remix: {
  title: string
  description: string
  games: Array<{ name: string }>
  hashtags: string[]
  creator_username: string
  created_at: string
  id: string
}): Metadata {
  const gameNames = remix.games.map(g => g.name).join(', ')
  const keywords = [
    ...remix.games.map(g => g.name),
    ...remix.hashtags,
    'board game remix',
    'game combination',
    'creative gaming'
  ]

  return generateMetadata({
    title: `${remix.title} - Board Game Remix`,
    description: `${remix.description} A creative combination of ${gameNames}. Created by ${remix.creator_username}.`,
    keywords,
    url: `/remixes/${remix.id}`,
    type: 'article',
    publishedTime: remix.created_at,
    author: remix.creator_username,
    tags: remix.hashtags,
    section: 'Board Game Remixes'
  })
}

export function generateBrowseMetadata(filters?: {
  game?: string
  hashtag?: string
  difficulty?: string
}): Metadata {
  let title = 'Browse Board Game Remixes'
  let description = 'Discover creative board game combinations and remixes from our community.'
  const keywords = ['browse', 'discover', 'board game remixes']

  if (filters?.game) {
    title = `${filters.game} Remixes - Browse Board Game Combinations`
    description = `Discover creative remixes and combinations featuring ${filters.game}.`
    keywords.push(filters.game)
  }

  if (filters?.hashtag) {
    title = `#${filters.hashtag} Remixes - Browse Board Game Combinations`
    description = `Explore board game remixes tagged with ${filters.hashtag}.`
    keywords.push(filters.hashtag)
  }

  if (filters?.difficulty) {
    title = `${filters.difficulty} Difficulty Remixes - Browse Board Game Combinations`
    description = `Find ${filters.difficulty.toLowerCase()} board game remixes perfect for your skill level.`
    keywords.push(filters.difficulty.toLowerCase())
  }

  return generateMetadata({
    title,
    description,
    keywords,
    url: '/browse'
  })
}

export function generateSubmitMetadata(): Metadata {
  return generateMetadata({
    title: 'Submit a Board Game Remix',
    description: 'Share your creative board game combinations with the community. Create innovative remixes using games you already own.',
    keywords: ['submit', 'create', 'share', 'board game remix', 'community'],
    url: '/submit'
  })
}

export function generateProfileMetadata(username: string): Metadata {
  return generateMetadata({
    title: `${username}'s Profile - Remix Games`,
    description: `View ${username}'s board game remixes and creative combinations on Remix Games.`,
    keywords: ['profile', username, 'board game remixes', 'creator'],
    url: `/profile/${username}`
  })
}

// Structured Data generators
export function generateRemixStructuredData(remix: {
  id: string
  title: string
  description: string
  games: Array<{ name: string; bggUrl?: string }>
  creator_username: string
  created_at: string
  upvotes: number
  downvotes: number
  difficulty: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": remix.title,
    "description": remix.description,
    "author": {
      "@type": "Person",
      "name": remix.creator_username
    },
    "dateCreated": remix.created_at,
    "about": remix.games.map(game => ({
      "@type": "Thing",
      "name": game.name,
      ...(game.bggUrl && { "url": game.bggUrl })
    })),
    "genre": "Board Game Remix",
    "keywords": remix.games.map(g => g.name).join(", "),
    "interactionStatistic": [
      {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/LikeAction",
        "userInteractionCount": remix.upvotes
      }
    ],
    "url": `https://remix.games/remixes/${remix.id}`,
    "publisher": {
      "@type": "Organization",
      "name": "Remix Games",
      "url": "https://remix.games"
    }
  }
}

export function generateWebsiteStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Remix Games",
    "description": "Creative board game combinations and remixes",
    "url": "https://remix.games",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://remix.games/browse?q={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Remix Games",
      "url": "https://remix.games"
    }
  }
}

export function generateOrganizationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Remix Games",
    "description": "A community platform for creative board game combinations and remixes",
    "url": "https://remix.games",
    "logo": "https://remix.games/logo.png",
    "sameAs": [
      "https://twitter.com/remixgames",
      "https://facebook.com/remixgames"
    ]
  }
}
