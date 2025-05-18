import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    // Create a new client instance for testing
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Log environment status
    const envStatus = {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      url: supabaseUrl?.substring(0, 10) + '...',
    }

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials')
    }

    // Test direct connection
    const testUrl = `${supabaseUrl}/rest/v1/original_games?select=*&limit=1`
    const response = await fetch(testUrl, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    })

    const data = await response.json()

    return NextResponse.json({
      envStatus,
      connectionTest: {
        status: response.status,
        ok: response.ok,
        data
      }
    })

  } catch (error) {
    console.error('Detailed error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : null : null,
        type: error instanceof Error ? error.constructor.name : typeof error
      },
      { status: 500 }
    )
  }
} 