'use client'

import { useAuth } from '@/lib/auth'
import { useEffect } from 'react'

export default function DebugAuth() {
  const { user, loading } = useAuth()

  useEffect(() => {
    console.log('Debug Auth - User:', user?.id, 'Loading:', loading)
  }, [user, loading])

  if (process.env.NODE_ENV === 'production') {
    return null // Don't show in production
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs z-50">
      <div>User: {user?.id || 'None'}</div>
      <div>Loading: {loading ? 'Yes' : 'No'}</div>
      <div>Email: {user?.email || 'None'}</div>
    </div>
  )
}
