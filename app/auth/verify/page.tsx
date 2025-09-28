'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function VerifyPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleVerification = async () => {
      try {
        console.log('Starting verification process...')
        console.log('Current URL:', window.location.href)
        
        // Get URL parameters from both query string and fragment
        const urlParams = new URLSearchParams(window.location.search)
        const fragment = window.location.hash.substring(1) // Remove the #
        const fragmentParams = new URLSearchParams(fragment)
        
        console.log('URL params:', Object.fromEntries(urlParams.entries()))
        console.log('Fragment params:', Object.fromEntries(fragmentParams.entries()))
        
        // Check for token in query params (from Supabase email links)
        const token = searchParams.get('token') || urlParams.get('token')
        const type = searchParams.get('type') || urlParams.get('type')
        
        console.log('Token check:', { token: !!token, type, searchParamsToken: searchParams.get('token'), urlParamsToken: urlParams.get('token') })
        
        if (token && type) {
          console.log('Found token in query params, redirecting to callback...')
          // Redirect to callback route which handles token verification
          router.push(`/auth/callback?token=${token}&type=${type}`)
          return
        }
        
        // If no token found, check if we should redirect to auth page with error
        console.log('No token found, checking if this is a failed verification...')
        
        // Check if we came from a Supabase redirect but lost the token
        const referrer = document.referrer
        if (referrer && referrer.includes('supabase.co')) {
          console.log('Came from Supabase but no token found, redirecting to auth with error')
          router.push('/auth?error=verification-failed&error_description=Token not found in URL')
          return
        }
        
        // Check for error in fragment first
        const error = fragmentParams.get('error') || urlParams.get('error')
        const errorDescription = fragmentParams.get('error_description') || urlParams.get('error_description')
        const errorCode = fragmentParams.get('error_code')
        
        if (error) {
          console.log('Error found:', error, errorDescription, errorCode)
          // Handle errors
          if (error === 'access_denied' && errorCode === 'otp_expired') {
            router.push('/auth?error=otp_expired')
          } else {
            router.push(`/auth?error=${error}&error_description=${encodeURIComponent(errorDescription || '')}`)
          }
          return
        }

        // Check for success tokens
        const accessToken = fragmentParams.get('access_token')
        const refreshToken = fragmentParams.get('refresh_token')
        const tokenType = fragmentParams.get('token_type')
        
        console.log('Tokens found:', { accessToken: !!accessToken, refreshToken: !!refreshToken, tokenType })
        
        if (accessToken && refreshToken) {
          console.log('Setting session...')
          // Set the session in Supabase
          const supabase = createClient()
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })
          
          console.log('Session result:', { data, error })
          
          if (!error) {
            console.log('Success! Redirecting to home...')
            // Success! Redirect to home
            router.push('/')
            return
          } else {
            console.error('Session error:', error)
          }
        }

        // If we get here, something went wrong
        console.log('Verification failed, redirecting to error page')
        router.push('/auth?error=verification-failed')
      } catch (err) {
        console.error('Verification error:', err)
        router.push('/auth?error=verification-failed')
      }
    }

    // Add a small delay to ensure the page is fully loaded
    setTimeout(handleVerification, 100)
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white text-center max-w-md">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35] mx-auto mb-4"></div>
        <p>Verifying your email...</p>
        <p className="text-sm text-gray-400 mt-2">
          If this takes too long, check the browser console for errors.
        </p>
        <button 
          onClick={() => router.push('/auth')}
          className="mt-4 text-[#FF6B35] hover:underline"
        >
          Back to Login
        </button>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35] mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <VerifyPageContent />
    </Suspense>
  )
}
