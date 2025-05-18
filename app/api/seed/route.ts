import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Insert a sample game
    const { data: game, error: gameError } = await supabase
      .from('original_games')
      .insert({
        name: 'Catan',
        publisher: 'KOSMOS',
        description: 'A classic resource management and trading game',
        min_players: 3,
        max_players: 4,
        avg_play_time: 90,
        category: 'strategy'
      })
      .select()
      .single()

    if (gameError) {
      return NextResponse.json({ error: gameError.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Sample game added successfully',
      data: game 
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 