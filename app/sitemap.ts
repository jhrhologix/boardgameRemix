import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: 'https://remix.games',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
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
      url: 'https://remix.games/faq',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
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
