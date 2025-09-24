import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    return NextResponse.json({
      user: user ? {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      } : null,
      error: error?.message || null,
      isAuthenticated: !!user,
      environment: process.env.NODE_ENV,
      skipAuth: process.env.NEXT_PUBLIC_SKIP_AUTH
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to check auth',
      isAuthenticated: false,
      environment: process.env.NODE_ENV,
      skipAuth: process.env.NEXT_PUBLIC_SKIP_AUTH
    })
  }
}
