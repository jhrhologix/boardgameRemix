'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SignInForm } from '@/components/auth/sign-in-form'
import { SignUpForm } from '@/components/auth/sign-up-form'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = searchParams.get('tab')
  const callbackUrl = searchParams.get('callbackUrl')

  useEffect(() => {
    const supabase = createClient()

    // Check if user is already authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push(callbackUrl || '/')
      }
    })
  }, [callbackUrl, router])

  // Handle tab selection
  const defaultTab = tab === 'sign-up' ? 'sign-up' : 'sign-in'

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Tabs defaultValue={defaultTab} className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sign-in">Sign In</TabsTrigger>
          <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="sign-in">
          <SignInForm callbackUrl={callbackUrl || ''} />
        </TabsContent>
        <TabsContent value="sign-up">
          <SignUpForm callbackUrl={callbackUrl || ''} />
        </TabsContent>
      </Tabs>
    </div>
  )
} 