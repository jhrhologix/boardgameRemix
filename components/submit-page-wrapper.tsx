'use client'

import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import SubmitRemixForm from './submit-remix-form'
import DebugAuth from './debug-auth'

interface SubmitPageWrapperProps {
  userId: string
  remixId?: string
}

export default function SubmitPageWrapper({ userId, remixId }: SubmitPageWrapperProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth?callbackUrl=/submit')
    }
  }, [user, loading, router])

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

  if (!user) {
    return null // Will redirect via useEffect
  }

  return (
    <>
      <SubmitRemixForm userId={userId} remixId={remixId} />
      <DebugAuth />
    </>
  )
}
