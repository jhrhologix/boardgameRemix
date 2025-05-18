'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { type CookieOptions } from '@supabase/ssr'

async function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          try {
            const cookie = cookieStore.get(name)
            return cookie?.value ?? ''
          } catch (error) {
            console.error('Error getting cookie:', error)
            return ''
          }
        },
        async set(name: string, value: string, options: CookieOptions = {}) {
          'use server'
          try {
            cookieStore.set(name, value, {
              ...options,
              secure: process.env.NODE_ENV === 'production',
            })
          } catch (error) {
            console.error('Error setting cookie:', error)
          }
        },
        async remove(name: string) {
          'use server'
          try {
            cookieStore.delete(name)
          } catch (error) {
            console.error('Error removing cookie:', error)
          }
        },
      },
    }
  )
}

export { createClient }
