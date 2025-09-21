'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft } from 'lucide-react'

interface ForgotPasswordFormProps {
  onBackToSignIn: () => void
}

export function ForgotPasswordForm({ onBackToSignIn }: ForgotPasswordFormProps) {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error } = await resetPassword(email)
      if (error) throw error
      
      setSuccess(true)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
          <p className="text-gray-300">
            We've sent a password reset link to <strong>{email}</strong>
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Check your email and click the link to reset your password.
          </p>
        </div>
        
        <Button
          onClick={onBackToSignIn}
          variant="outline"
          className="w-full bg-transparent border-[#333] text-white hover:bg-[#2a2a2a]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Sign In
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
        <p className="text-gray-300">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="text-white">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="bg-[#2a2a2a] border-[#333] text-white placeholder:text-gray-500"
          />
        </div>

        <Button
          type="submit"
          disabled={loading || !email}
          className="w-full bg-[#FF6B35] hover:bg-[#e55a2a] text-white"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </Button>

        <Button
          type="button"
          onClick={onBackToSignIn}
          variant="ghost"
          className="w-full text-gray-300 hover:text-white hover:bg-[#2a2a2a]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Sign In
        </Button>
      </form>
    </div>
  )
}
