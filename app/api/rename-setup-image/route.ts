import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { renameRemixSetupImage } from '@/lib/cloudinary'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { oldPublicId, newOrder, newDescription } = await request.json()

    if (!oldPublicId || newOrder === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: oldPublicId, newOrder' },
        { status: 400 }
      )
    }

    // Extract remix ID from oldPublicId to verify ownership
    // Format: {remixId}_{order}
    const filename = oldPublicId.split('/').pop() || ''
    const parts = filename.split('_')
    if (parts.length < 2) {
      return NextResponse.json(
        { error: 'Invalid publicId format' },
        { status: 400 }
      )
    }

    const remixId = parts[0]

    // Verify user owns the remix
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

    if (remix.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to rename images for this remix' },
        { status: 403 }
      )
    }

    // Rename/reorder the image in Cloudinary
    const result = await renameRemixSetupImage(
      oldPublicId,
      newOrder,
      newDescription || ''
    )

    return NextResponse.json({
      success: true,
      url: result.url,
      publicId: result.publicId,
      newOrder,
      newDescription
    })

  } catch (error) {
    console.error('Rename error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
