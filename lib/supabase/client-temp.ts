import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/lib/database.types'

// Temporary hardcoded client for testing - REMOVE AFTER FIXING ENV VARS
export function createClientTemp() {
  return createBrowserClient<Database>(
    'https://dqfemavcxskjjbnictjt.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxZmVtYXZjeHNrampibmljdGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxODgwNDYsImV4cCI6MjA2Mjc2NDA0Nn0.mqaTuGEywj1Ehb31Ngwt02nS2whhDgTJQW4sk9H32OA'
  )
}

// Original function for comparison
export function createClient() {
  console.log('ENV URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('ENV KEY exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  console.log('ENV KEY length:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length)
  
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
