import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getRemixSetupImages } from '@/lib/cloudinary'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const remixId = searchParams.get('remixId')

    if (!remixId) {
      return NextResponse.json(
        { error: 'Missing remixId parameter' },
        { status: 400 }
      )
    }

    // Check if user has access to this remix (optional - for private remixes)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // Verify user has access to this remix
      const { data: remix, error: remixError } = await supabase
        .from('remixes')
        .select('id, user_id')
        .eq('id', remixId)
        .single()

      if (remixError || !remix) {
        return NextResponse.json(
          { error: 'Remix not found' },
          { status: 404 }
        )
      }

      // For now, we'll allow access to all remixes
      // You can add privacy controls later if needed
    }

    // Get images from Cloudinary using filename pattern
    const images = await getRemixSetupImages(remixId)

    return NextResponse.json({
      success: true,
      images,
      count: images.length
    })

  } catch (error) {
    console.error('Error fetching remix images:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
