import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import MyRemixesList from './MyRemixesList'

export default async function MyRemixesPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth?callbackUrl=/my-remixes')
  }

  if (sessionError) {
    console.error('Error fetching session:', sessionError)
    return <div>Error loading session</div>
  }

  const { data: remixes, error: remixesError } = await supabase
    .from('remixes')
    .select(`
      *,
      bgg_games:remix_games(
        game:bgg_game_id(
          name,
          bgg_id,
          image_url
        )
      ),
      hashtags:remix_hashtags(
        hashtag:hashtag_id(
          name
        )
      )
    `)
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  if (remixesError) {
    console.error('Error fetching remixes:', remixesError)
    return <div>Error loading remixes</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Remixes</h1>
        <a
          href="/submit"
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
        >
          Create New Remix
        </a>
      </div>
      <MyRemixesList remixes={remixes || []} />
    </div>
  )
} 