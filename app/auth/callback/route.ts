import { createClient } from '@/lib/supabase/server'
import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      // Get authenticated user to ensure session is properly set
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (!userError && user) {
        return redirect(next)
      }
    }
  }

  // Redirect to error page if verification fails
  return redirect('/auth?error=verification-failed')
} 