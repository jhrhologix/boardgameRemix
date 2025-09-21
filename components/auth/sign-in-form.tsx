'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface SignInFormProps {
  callbackUrl: string
  onForgotPassword?: () => void
}

export function SignInForm({ callbackUrl, onForgotPassword }: SignInFormProps) {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { user, error } = await signIn(email, password)

      if (error) throw error

      // Only redirect if we have a valid user
      if (user) {
        router.push(callbackUrl || '/')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-white">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-[#2a2a2a] border-[#333] text-white placeholder:text-gray-500"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-white">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="bg-[#2a2a2a] border-[#333] text-white placeholder:text-gray-500"
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button 
        type="submit" 
        className="w-full bg-[#FF6B35] hover:bg-[#e55a2a] text-white" 
        disabled={loading}
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </Button>

      {onForgotPassword && (
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Forgot your password?
          </button>
        </div>
      )}
    </form>
  )
} 