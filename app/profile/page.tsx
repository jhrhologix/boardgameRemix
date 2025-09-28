'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Remix {
  id: string
  title: string
  description: string
  difficulty: string
  upvotes: number
  downvotes: number
  created_at: string
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [remixes, setRemixes] = useState<Remix[]>([])
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        router.push('/auth?callbackUrl=/profile')
        return
      }

      try {
        // Use the user from auth context directly
        if (!user) {
          throw new Error('No authenticated user')
        }

        const [profileData, remixesData] = await Promise.all([
          supabase
            .from('profiles')
            .select('username, full_name')
            .eq('id', user.id)
            .maybeSingle(), // Use maybeSingle() instead of single() to handle missing profiles
          supabase
            .from('remixes')
            .select(`
              id,
              title,
              description,
              difficulty,
              upvotes,
              downvotes,
              created_at
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
        ])

        if (profileData.error) {
          console.error('Error loading profile:', profileData.error)
          // Don't throw error for profile - user might not have created one yet
          console.log('Profile not found, user will need to create one')
        }

        if (remixesData.error) {
          console.error('Error loading remixes:', remixesData.error)
          throw new Error('Failed to load remixes')
        }

        if (profileData.data) {
          setUsername(profileData.data.username || '')
          setFullName(profileData.data.full_name || '')
        } else {
          // Profile doesn't exist yet, initialize with empty values
          setUsername('')
          setFullName('')
        }

        if (remixesData.data) {
          setRemixes(remixesData.data)
        }
      } catch (err) {
        console.error('Error loading profile:', err)
        setError(err instanceof Error ? err.message : 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setError(null)
    setSuccess(false)
    setLoading(true)

    try {
      // Use the user from auth context directly
      if (!user) {
        throw new Error('No authenticated user')
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: username || null,
          full_name: fullName || null,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        })

      if (error) throw error
      setSuccess(true)
      router.refresh()
    } catch (err) {
      console.error('Error updating profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="container max-w-4xl px-4">
        <div className="grid gap-6">
          {/* Profile Settings Card */}
          <Card className="bg-[#1a1a1a] border-[#333] text-white">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg bg-[#FF6B35]">
                    {user.email?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-[#FF6B35]">Profile Settings</CardTitle>
                  <p className="text-sm text-gray-400">{user.email}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert>
                    <AlertDescription>Profile updated successfully!</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-white">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    disabled={loading}
                    className="bg-[#2a2a2a] border-[#333] text-white placeholder:text-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-white">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    disabled={loading}
                    className="bg-[#2a2a2a] border-[#333] text-white placeholder:text-gray-500"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-[#FF6B35] hover:bg-[#e55a2a] text-white"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* My Remixes Card */}
          <Card className="bg-[#1a1a1a] border-[#333] text-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-[#FF6B35]">My Remixes</CardTitle>
                <Button 
                  onClick={() => router.push('/create')}
                  className="bg-[#FF6B35] hover:bg-[#e55a2a] text-white"
                >
                  Create New Remix
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">Loading your remixes...</p>
                </div>
              ) : remixes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">You haven't created any remixes yet.</p>
                  <Button 
                    onClick={() => router.push('/create')}
                    className="mt-4 bg-[#FF6B35] hover:bg-[#e55a2a] text-white"
                  >
                    Create Your First Remix
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {remixes.map((remix) => (
                    <Link 
                      key={remix.id} 
                      href={`/remixes/${remix.id}`}
                      className="block"
                    >
                      <div className="p-4 rounded-lg border border-[#333] hover:border-[#FF6B35] transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-white">{remix.title}</h3>
                            <p className="text-sm text-gray-400 mt-1">{remix.description}</p>
                          </div>
                          <div className="text-right">
                            <span className="inline-block px-2 py-1 text-xs rounded bg-[#2a2a2a] text-[#FF6B35] capitalize">
                              {remix.difficulty}
                            </span>
                            <div className="mt-2 text-sm text-gray-400">
                              <span className="text-green-500">↑{remix.upvotes}</span>
                              <span className="mx-1">|</span>
                              <span className="text-red-500">↓{remix.downvotes}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 