'use client'

import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import SubmitRemixForm from './submit-remix-form'

interface SubmitPageWrapperProps {
  userId: string
  remixId?: string
}

export default function SubmitPageWrapper({ userId, remixId }: SubmitPageWrapperProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      console.log('Client-side auth check failed, redirecting to auth')
      router.push('/auth?callbackUrl=/submit')
    } else if (!loading && user) {
      console.log('Client-side auth check passed:', { userId: user.id, email: user.email })
    }
  }, [user, loading, router])

  // If we have a userId from server but no client user, wait a bit for hydration
  if (userId && !user && !loading) {
    console.log('Server has user but client does not, waiting for hydration...')
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35] mx-auto mb-4"></div>
          <p className="text-[#004E89]">Syncing authentication...</p>
        </div>
      </div>
    )
  }

  // Always show loading while auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35] mx-auto mb-4"></div>
          <p className="text-[#004E89]">Loading...</p>
        </div>
      </div>
    )
  }

  // If not loading and no user, show nothing (will redirect via useEffect)
  if (!user) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35] mx-auto mb-4"></div>
          <p className="text-[#004E89]">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <SubmitRemixForm userId={user.id} remixId={remixId} />
  )
}
