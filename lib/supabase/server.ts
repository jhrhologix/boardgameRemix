'use server'

import { createServerClient } from '@supabase/ssr'
import { headers } from 'next/headers'
import { Database } from '@/lib/database.types'

export async function createClient() {
  const headersList = await headers()
  const cookieHeader = headersList.get('cookie') || ''

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookie = headersList.get('cookie')
          if (!cookie) return null
          const match = cookie.match(new RegExp(`${name}=([^;]+)`))
          return match?.[1]
        },
        set(name: string, value: string, options: any) {
          // Cookie setting is handled by middleware
        },
        remove(name: string, options: any) {
          // Cookie removal is handled by middleware
        }
      }
    }
  )
}
