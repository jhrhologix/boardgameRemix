'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, AuthError } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { useRouter } from 'next/navigation'

type AuthContextType = {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, callbackUrl?: string) => Promise<{ user: User | null; error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Only skip auth if explicitly set in environment variables
    if (process.env.NEXT_PUBLIC_SKIP_AUTH === 'true') {
      console.log('Skipping auth checks as requested by environment variable')
      setUser(null)
      setLoading(false)
      return
    }

    // Production: Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('AuthProvider: Initial session check:', { 
        hasSession: !!session, 
        hasUser: !!session?.user, 
        userId: session?.user?.id,
        error: error?.message 
      })
      if (error) {
        console.warn('Auth session error:', error.message)
      }
      setUser(session?.user ?? null)
      setLoading(false)
    }).catch((error) => {
      console.warn('Auth session error:', error.message)
      setUser(null)
      setLoading(false)
    })

    // Listen for changes on auth state (signed in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthProvider: Auth state change:', { 
        event, 
        hasSession: !!session, 
        hasUser: !!session?.user,
        userId: session?.user?.id
      })
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
        setUser(session?.user ?? null)
        router.refresh()
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const signUp = async (email: string, password: string, callbackUrl?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?callbackUrl=${encodeURIComponent(callbackUrl || '/')}`
      }
    })
    return { user: data.user, error }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (!error) {
      router.refresh()
    }
    return { user: data.user, error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/auth')
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    return { error }
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 