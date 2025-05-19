'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SignInForm } from '@/components/auth/sign-in-form'
import { SignUpForm } from '@/components/auth/sign-up-form'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = searchParams.get('tab')
  const callbackUrl = searchParams.get('callbackUrl')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        
        // First get the user directly instead of checking session
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        // Only redirect if we have a valid authenticated user
        if (user && !userError) {
          router.push(callbackUrl || '/')
        }
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [callbackUrl, router])

  // Handle tab selection
  const defaultTab = tab === 'sign-up' ? 'sign-up' : 'sign-in'

  // Show nothing while checking auth status
  if (isLoading) {
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
                <SignInForm callbackUrl={callbackUrl || ''} />
              </TabsContent>
              <TabsContent value="sign-up">
                <SignUpForm callbackUrl={callbackUrl || ''} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 