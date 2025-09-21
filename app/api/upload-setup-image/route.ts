import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { uploadRemixSetupImage } from '@/lib/cloudinary'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('image') as File
    const remixId = formData.get('remixId') as string
    const imageOrder = parseInt(formData.get('imageOrder') as string)
    const description = (formData.get('description') as string) || ''

    if (!file || !remixId || isNaN(imageOrder)) {
      return NextResponse.json(
        { error: 'Missing required fields: image, remixId, imageOrder' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

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
        { error: 'Unauthorized to upload images for this remix' },
        { status: 403 }
      )
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Cloudinary with proper naming convention
    const uploadResult = await uploadRemixSetupImage(
      buffer,
      remixId,
      imageOrder,
      description,
      file.type
    )

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      imageOrder,
      description
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const publicId = searchParams.get('publicId')

    if (!publicId) {
      return NextResponse.json(
        { error: 'Missing publicId parameter' },
        { status: 400 }
      )
    }

    // Extract remix ID from publicId to verify ownership
    // Format: {remixId}_{order}
    const filename = publicId.split('/').pop() || ''
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
        { error: 'Unauthorized to delete images for this remix' },
        { status: 403 }
      )
    }

    // Delete from Cloudinary
    const { deleteRemixSetupImage } = await import('@/lib/cloudinary')
    await deleteRemixSetupImage(publicId)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
