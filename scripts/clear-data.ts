import { createClient } from '@supabase/supabase-js'

async function clearData() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  console.log('Starting data deletion...')

  try {
    // Delete in order to respect foreign key constraints
    console.log('Deleting remix hashtags...')
    await supabase.from('remix_hashtags').delete().neq('remix_id', '')
    
    console.log('Deleting remix tags...')
    await supabase.from('remix_tags').delete().neq('remix_id', '')
    
    console.log('Deleting remix games...')
    await supabase.from('remix_games').delete().neq('remix_id', '')
    
    console.log('Deleting votes...')
    await supabase.from('votes').delete().neq('remix_id', '')
    
    console.log('Deleting comments...')
    await supabase.from('comments').delete().neq('remix_id', '')
    
    console.log('Deleting remixes...')
    await supabase.from('remixes').delete().neq('id', '')

    console.log('All data deleted successfully!')
  } catch (error) {
    console.error('Error deleting data:', error)
  }
}

clearData() 