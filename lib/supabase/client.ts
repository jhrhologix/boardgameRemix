import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  // Check if environment variables are available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.warn(
      "Supabase URL or Anon Key not found. Authentication features will be disabled. Please check your environment variables.",
    )

    // Return a mock client for development/preview
    return {
      auth: {
        getSession: async () => ({ data: { session: null } }),
        signOut: async () => ({ error: null }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => ({ data: null, error: null }),
          }),
        }),
        insert: () => ({ data: null, error: null }),
        update: () => ({ data: null, error: null }),
        delete: () => ({ data: null, error: null }),
      }),
    } as any
  }

  // Create the actual client if environment variables are available
  return createBrowserClient(supabaseUrl, supabaseKey)
}
