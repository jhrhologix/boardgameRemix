import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Test basic internet connectivity
    const googleResponse = await fetch('https://www.google.com')
    
    // Test Supabase domain accessibility
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    let supabaseResponse = null
    let supabaseError = null
    
    try {
      if (supabaseUrl) {
        supabaseResponse = await fetch(supabaseUrl)
      }
    } catch (error) {
      supabaseError = error instanceof Error ? error.message : 'Unknown error'
    }

    return NextResponse.json({
      internetConnectivity: {
        google: {
          status: googleResponse.status,
          ok: googleResponse.ok
        },
        supabase: supabaseResponse ? {
          status: supabaseResponse.status,
          ok: supabaseResponse.ok
        } : {
          error: supabaseError
        }
      },
      supabaseUrl: supabaseUrl?.substring(0, 10) + '...'
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Connection test failed',
      type: error instanceof Error ? error.constructor.name : typeof error
    }, { status: 500 })
  }
} 