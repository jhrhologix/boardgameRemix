import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  
  // Static pages with comprehensive SEO data
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: 'https://remix.games',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: 'https://remix.games/browse',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: 'https://remix.games/popular',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: 'https://remix.games/submit',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://remix.games/about',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: 'https://remix.games/faq',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: 'https://remix.games/contact',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: 'https://remix.games/community-guidelines',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: 'https://remix.games/privacy-policy',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: 'https://remix.games/terms-of-service',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  try {
    // Get all public remixes
    const { data: remixes } = await supabase
      .from('remixes')
      .select('id, updated_at')
      .order('updated_at', { ascending: false })
      .limit(1000) // Limit to prevent timeout

    const remixPages: MetadataRoute.Sitemap = (remixes || []).map((remix) => ({
      url: `https://remix.games/remixes/${remix.id}`,
      lastModified: new Date(remix.updated_at),
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

    return [...staticPages, ...remixPages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return staticPages
  }
}
