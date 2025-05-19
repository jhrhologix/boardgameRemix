'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MessageCircle, Check, Pin, Reply, LogIn } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'

interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
  parent_id: string | null
  is_resolved: boolean
  is_pinned: boolean
  profiles: {
    username: string | null
    avatar_url: string | null
  } | null
  replies?: Comment[]
}

interface CommentsSectionProps {
  remixId: string
  isAuthenticated: boolean
  isOwner: boolean
}

export default function CommentsSection({ remixId, isAuthenticated, isOwner }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingComments, setIsLoadingComments] = useState(true)
  const [supabase] = useState(() => createClient())
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (remixId) {
      loadComments()
    }
  }, [remixId])

  const loadComments = async () => {
    if (!remixId) {
      console.error('No remixId provided to CommentsSection')
      return
    }

    setIsLoadingComments(true)
    try {
      console.log('Loading comments for remix:', remixId)

      // Ensure we have a valid Supabase client
      if (!supabase) {
        throw new Error('Supabase client not initialized')
      }

      // First check if the remix exists
      const { data: remix, error: remixError } = await supabase
        .from('remixes')
        .select('id')
        .eq('id', remixId)
        .single()

      if (remixError) {
        console.error('Error checking remix:', {
          message: remixError.message,
          details: remixError.details,
          hint: remixError.hint,
          code: remixError.code
        })
        throw new Error(`Failed to verify remix: ${remixError.message}`)
      }

      if (!remix) {
        throw new Error('Remix not found')
      }

      // Then load comments with better error handling
      let commentsQuery = supabase
        .from('comments')
        .select('*')
        .eq('remix_id', remixId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: true })

      const { data: commentsData, error: commentsError } = await commentsQuery

      if (commentsError) {
        console.error('Supabase error loading comments:', {
          message: commentsError.message,
          details: commentsError.details,
          hint: commentsError.hint,
          code: commentsError.code
        })
        throw new Error(`Failed to load comments: ${commentsError.message}`)
      }

      if (!commentsData) {
        console.log('No comments found for remix:', remixId)
        setComments([])
        return
      }

      // Get unique user IDs from comments
      const userIds = [...new Set(commentsData.map(comment => comment.user_id))]

      // Fetch profiles for all users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds)

      if (profilesError) {
        console.error('Error loading profiles:', profilesError)
        throw new Error('Failed to load user profiles')
      }

      // Create a map of user profiles
      const profilesMap = new Map(
        (profilesData || []).map(profile => [profile.id, profile])
      )

      // Combine comments with profiles
      const typedData = commentsData.map(comment => ({
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        user_id: comment.user_id,
        parent_id: comment.parent_id,
        is_resolved: comment.is_resolved,
        is_pinned: comment.is_pinned,
        remix_id: comment.remix_id,
        profiles: profilesMap.get(comment.user_id) || null
      }))

      console.log('Loaded comments:', typedData)

      // Organize comments into threads with proper typing
      const threads = typedData.reduce<{ [key: string]: Comment[] }>((acc, comment) => {
        const commentWithReplies: Comment = {
          id: comment.id,
          content: comment.content,
          created_at: comment.created_at,
          user_id: comment.user_id,
          parent_id: comment.parent_id,
          is_resolved: comment.is_resolved,
          is_pinned: comment.is_pinned,
          profiles: comment.profiles,
          replies: []
        }

        if (!comment.parent_id) {
          if (!acc.root) acc.root = []
          acc.root.push(commentWithReplies)
        } else {
          if (!acc[comment.parent_id]) acc[comment.parent_id] = []
          acc[comment.parent_id].push(commentWithReplies)
        }
        return acc
      }, { root: [] })

      // Attach replies to parent comments
      const rootComments = threads.root || []
      rootComments.forEach(comment => {
        comment.replies = threads[comment.id] || []
      })

      console.log('Processed comments:', rootComments)
      setComments(rootComments)
    } catch (error) {
      console.error('Error in loadComments:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load comments. Please try again.",
        variant: "destructive"
      })
      setComments([])
    } finally {
      setIsLoadingComments(false)
    }
  }

  const handleSubmit = async (parentId: string | null = null) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to join the discussion.",
        variant: "destructive",
        action: (
          <button
            onClick={() => router.push('/auth')}
            className="bg-white text-black px-3 py-2 rounded hover:bg-gray-100"
          >
            Log In
          </button>
        ),
      })
      return
    }

    if (!newComment.trim()) return

    setIsLoading(true)
    try {
      console.log('Posting comment for remix:', remixId)

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) {
        console.error('Auth error:', userError)
        throw userError
      }
      if (!user) throw new Error('Not authenticated')

      // Check if user has already commented today
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const { data: existingComments, error: checkError } = await supabase
        .from('comments')
        .select('id')
        .eq('user_id', user.id)
        .eq('remix_id', remixId)
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString())

      if (checkError) {
        console.error('Error checking existing comments:', checkError)
        throw checkError
      }

      if (existingComments && existingComments.length > 0) {
        toast({
          title: "Comment Limit Reached",
          description: "You can only post one comment per day on each remix.",
          variant: "destructive"
        })
        return
      }

      // Create the comment
      const { error: insertError } = await supabase
        .from('comments')
        .insert({
          remix_id: remixId,
          user_id: user.id,
          content: newComment.trim(),
          parent_id: parentId,
          is_resolved: false,
          is_pinned: false
        })

      if (insertError) {
        console.error('Error inserting comment:', insertError)
        throw new Error(insertError.message)
      }

      console.log('Comment posted successfully')

      // Clear form and refresh comments
      setNewComment('')
      setReplyTo(null)
      await loadComments()
      
      toast({
        title: "Success",
        description: "Your comment has been posted.",
      })
    } catch (error) {
      console.error('Error in handleSubmit:', error)
      toast({
        title: "Error",
        description: error instanceof Error 
          ? error.message 
          : "Failed to post comment. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const togglePin = async (commentId: string, isPinned: boolean) => {
    try {
      const { error } = await supabase
        .from('comments')
        .update({ is_pinned: !isPinned })
        .eq('id', commentId)

      if (error) throw error

      await loadComments()
      toast({
        title: "Success",
        description: `Comment ${isPinned ? 'unpinned' : 'pinned'} successfully.`,
      })
    } catch (error) {
      console.error('Error toggling pin:', error)
      toast({
        title: "Error",
        description: "Failed to update comment. Please try again.",
        variant: "destructive"
      })
    }
  }

  const toggleResolved = async (commentId: string, isResolved: boolean) => {
    try {
      const { error } = await supabase
        .from('comments')
        .update({ is_resolved: !isResolved })
        .eq('id', commentId)

      if (error) throw error

      await loadComments()
      toast({
        title: "Success",
        description: `Comment marked as ${isResolved ? 'unresolved' : 'resolved'}.`,
      })
    } catch (error) {
      console.error('Error toggling resolved status:', error)
      toast({
        title: "Error",
        description: "Failed to update comment. Please try again.",
        variant: "destructive"
      })
    }
  }

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-8' : 'border-t'} py-4`}>
      <div className="flex items-start gap-4">
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            {comment.profiles?.username?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{comment.profiles?.username || 'Unknown User'}</span>
            <span className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
            {comment.is_pinned && (
              <Pin size={16} className="text-blue-500" />
            )}
            {comment.is_resolved && (
              <Check size={16} className="text-green-500" />
            )}
          </div>
          <p className="mt-1 text-gray-700">{comment.content}</p>
          <div className="mt-2 flex items-center gap-4">
            {isAuthenticated && !isReply && (
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
              >
                <Reply size={16} className="mr-1" />
                Reply
              </Button>
            )}
            {isOwner && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => togglePin(comment.id, comment.is_pinned)}
                >
                  <Pin size={16} className="mr-1" />
                  {comment.is_pinned ? 'Unpin' : 'Pin'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => toggleResolved(comment.id, comment.is_resolved)}
                >
                  <Check size={16} className="mr-1" />
                  {comment.is_resolved ? 'Mark Unresolved' : 'Mark Resolved'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => deleteComment(comment.id)}
                >
                  Delete
                </Button>
              </>
            )}
          </div>
          {replyTo === comment.id && (
            <div className="mt-4">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a reply..."
                className="mb-2"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setReplyTo(null)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleSubmit(comment.id)}
                  disabled={isLoading || !newComment.trim()}
                >
                  {isLoading ? 'Posting...' : 'Post Reply'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      {comment.replies?.map(reply => renderComment(reply, true))}
    </div>
  )

  const deleteComment = async (commentId: string) => {
    if (!isOwner) return

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)

      if (error) throw error

      await loadComments()
      toast({
        title: "Success",
        description: "Comment deleted successfully.",
      })
    } catch (error) {
      console.error('Error deleting comment:', error)
      toast({
        title: "Error",
        description: "Failed to delete comment. Please try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="text-[#FF6B35]" />
        <h2 className="text-xl font-semibold">Discussion</h2>
      </div>

      {isAuthenticated ? (
        <div className="mb-6">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ask a question or share your thoughts..."
            className="mb-2"
          />
          <div className="text-sm text-gray-500 mb-2">
            Please be concise in your questions. You may only send 1 comment per day.
          </div>
          <Button
            onClick={() => handleSubmit()}
            disabled={isLoading || !newComment.trim()}
            className="bg-[#FF6B35] hover:bg-[#e55a2a] text-white"
          >
            {isLoading ? 'Posting...' : 'Post Comment'}
          </Button>
        </div>
      ) : (
        <Card className="bg-gray-50 p-6 mb-6 text-center">
          <LogIn className="mx-auto h-12 w-12 text-gray-400 mb-2" />
          <h3 className="text-lg font-semibold mb-2">Join the Discussion</h3>
          <p className="text-gray-600 mb-4">
            Log in to share your thoughts, ask questions, and interact with other remix enthusiasts.
          </p>
          <Button
            onClick={() => router.push('/auth')}
            className="bg-[#FF6B35] hover:bg-[#e55a2a] text-white"
          >
            Log In to Comment
          </Button>
        </Card>
      )}

      <div className="space-y-4">
        {isLoadingComments ? (
          <p className="text-gray-500 text-center py-4">Loading comments...</p>
        ) : comments.length > 0 ? (
          comments.map(comment => renderComment(comment))
        ) : (
          <p className="text-gray-500 text-center py-4">
            No comments yet. {isAuthenticated ? 'Be the first to start the discussion!' : 'Log in to be the first to comment!'}
          </p>
        )}
      </div>
    </div>
  )
} 