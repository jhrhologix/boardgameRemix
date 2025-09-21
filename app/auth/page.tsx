'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SignInForm } from '@/components/auth/sign-in-form'
import { SignUpForm } from '@/components/auth/sign-up-form'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AuthPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = searchParams.get('tab')
  const callbackUrl = searchParams.get('callbackUrl')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  useEffect(() => {
    // If user is authenticated, redirect them
    if (user && !loading) {
      router.push(callbackUrl || '/')
    }
  }, [user, loading, callbackUrl, router])

  // Handle tab selection
  const defaultTab = tab === 'sign-up' ? 'sign-up' : 'sign-in'

  // Show nothing while checking auth status
  if (loading) {
    return null
  }

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="container flex items-center justify-center">
        <Card className="w-[400px] bg-[#1a1a1a] border-[#333] text-white">
          <CardHeader>
            <CardTitle className="text-[#FF6B35] text-center">Welcome to Remix Games</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Show error messages from URL params */}
            {error && (
              <div className="mb-4 bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded">
                {error === 'otp_expired' ? 'Verification link has expired. Please sign up again to get a new verification email.' : 
                 error === 'access_denied' ? 'Reset link is invalid or has expired.' :
                 error === 'verification-failed' ? 'Email verification failed. Please try signing up again.' :
                 errorDescription || error}
              </div>
            )}

            {showForgotPassword ? (
              <ForgotPasswordForm 
                onBackToSignIn={() => setShowForgotPassword(false)}
              />
            ) : (
              <Tabs defaultValue={defaultTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-[#2a2a2a]">
                  <TabsTrigger 
                    value="sign-in"
                    className="data-[state=active]:bg-[#FF6B35] data-[state=active]:text-white text-gray-400"
                  >
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger 
                    value="sign-up"
                    className="data-[state=active]:bg-[#FF6B35] data-[state=active]:text-white text-gray-400"
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="sign-in">
                  <SignInForm 
                    callbackUrl={callbackUrl || ''} 
                    onForgotPassword={() => setShowForgotPassword(true)}
                  />
                </TabsContent>
                <TabsContent value="sign-up">
                  <SignUpForm callbackUrl={callbackUrl || ''} />
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 