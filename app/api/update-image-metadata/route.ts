import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get auth token from headers
    const supabaseAuth = request.headers.get('X-Supabase-Auth')
    
    // Try cookie-based auth first
    let { data: { user }, error: authError } = await supabase.auth.getUser()
    
    // If cookie auth fails, try token-based auth
    if (authError || !user) {
      console.log('Cookie auth failed, trying token auth...')
      if (supabaseAuth) {
        const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(supabaseAuth)
        if (tokenUser && !tokenError) {
          console.log('Token auth succeeded')
          user = tokenUser
          authError = null
        }
      }
    }
    
    if (authError || !user) {
      console.log('Authentication failed:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { publicId, description, imageOrder } = await request.json()
    
    if (!publicId) {
      return NextResponse.json({ error: 'Missing publicId' }, { status: 400 })
    }

    console.log('Updating image metadata:', { publicId, description, imageOrder })

    // Import cloudinary
    const { v2: cloudinary } = require('cloudinary')
    
    // Configure Cloudinary
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      console.error('Cloudinary environment variables not set')
      return NextResponse.json({ error: 'Cloudinary not configured' }, { status: 500 })
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret
    })

    // Update the image context data
    const result = await cloudinary.api.update(publicId, {
      context: {
        alt: description || '',
        caption: description || '',
        order: imageOrder.toString()
      }
    })

    console.log('Cloudinary update result:', result)

    return NextResponse.json({ 
      success: true, 
      message: 'Image metadata updated successfully',
      result 
    })

  } catch (error) {
    console.error('Error updating image metadata:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
