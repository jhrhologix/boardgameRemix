"use client"

import { useAuth } from '@/lib/auth'
import { useEffect, useState } from 'react'

export default function DebugAuth() {
  const { user, loading } = useAuth()
  const [serverAuth, setServerAuth] = useState<any>(null)

  useEffect(() => {
    // Test server-side auth
    fetch('/api/test-auth')
      .then(res => res.json())
      .then(data => setServerAuth(data))
      .catch(err => console.error('Auth test error:', err))
  }, [])

  if (process.env.NODE_ENV !== 'development') {
    return null // Only show in development
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div className="space-y-1">
        <div>Client User: {user ? user.email : 'null'}</div>
        <div>Loading: {loading ? 'true' : 'false'}</div>
        <div>Server Auth: {serverAuth?.isAuthenticated ? 'true' : 'false'}</div>
        <div>Server User: {serverAuth?.user?.email || 'null'}</div>
        <div>Server Error: {serverAuth?.error || 'none'}</div>
      </div>
    </div>
  )
}