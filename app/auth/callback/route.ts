import { createClient } from '@/lib/supabase/server'
import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const token = searchParams.get('token')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  // If no parameters, redirect to verify page to handle URL fragments
  if (!token_hash && !token && !type) {
    return redirect('/auth/verify')
  }

  if ((token_hash || token) && type) {
    const supabase = await createClient()
    
    let error = null
    
    // Handle both token_hash and token formats
    if (token_hash) {
      const result = await supabase.auth.verifyOtp({
        type,
        token_hash,
      })
      error = result.error
    } else if (token) {
      // For signup tokens, we need to use exchangeCodeForSession
      const result = await supabase.auth.exchangeCodeForSession(token)
      error = result.error
    }

    if (!error) {
      // Handle different OTP types
      if (type === 'recovery') {
        // Password reset - redirect to reset password page
        return redirect('/auth/reset-password')
      } else {
        // Email confirmation or signup - get authenticated user and redirect
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (!userError && user) {
          return redirect(next)
        }
      }
    }
  }

  // Redirect to error page if verification fails
  return redirect('/auth?error=verification-failed')
} 