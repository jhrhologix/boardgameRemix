import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary with environment variables
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const apiKey = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET

// Only configure Cloudinary if we have the required variables (skip during build if not available)
if (cloudName && apiKey && apiSecret) {
  console.log('Cloudinary config loaded:', {
    cloudName,
    apiKey: apiKey.substring(0, 8) + '...', // Only show first 8 chars for security
    hasApiSecret: !!apiSecret
  })

  // Configure Cloudinary
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
  })
} else {
  console.warn('Cloudinary environment variables not set - Cloudinary functionality will be limited')
}

export { cloudinary }

// Upload image to Cloudinary with remix-specific naming convention
export async function uploadRemixSetupImage(
  imageBuffer: Buffer,
  remixId: string,
  imageOrder: number,
  description: string = '',
  mimeType: string = 'image/jpeg'
): Promise<{ url: string; publicId: string }> {
  try {
    // Check if Cloudinary is configured
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary is not configured. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.')
    }
    // New naming convention: {remixId}_{yyyymmddhhmmss} with order metadata
    const now = new Date()
    const timestamp = now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0') +
      now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0') +
      now.getSeconds().toString().padStart(2, '0')
    
    const filename = `${remixId}_${timestamp}`
    
    // Debug Cloudinary configuration
    console.log('Cloudinary config check:', {
      hasCloudName: !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      hasApiKey: !!process.env.CLOUDINARY_API_KEY,
      hasApiSecret: !!process.env.CLOUDINARY_API_SECRET,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    })
    
    // Upload to Cloudinary with specific folder structure
    const uploadOptions = {
      folder: 'remix.games',
      public_id: filename,
      // Remove upload_preset to use explicit API with context
      resource_type: 'auto' as const,
      quality: 'auto',
      fetch_format: 'auto',
      context: {
        alt: description.substring(0, 255), // Max 255 chars for description
        caption: description.substring(0, 255),
        order: imageOrder.toString() // Store order as metadata
      },
      transformation: [
        { width: 1024, height: 1024, crop: 'limit', quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    }
    
    console.log('Uploading with options:', {
      filename,
      imageOrder,
      description,
      context: uploadOptions.context,
      metadata: uploadOptions.metadata
    })
    
    const result = await cloudinary.uploader.upload(
      `data:${mimeType};base64,${imageBuffer.toString('base64')}`,
      uploadOptions
    )
    
    console.log('Upload result:', {
      context: result.context,
      metadata: result.metadata,
      publicId: result.public_id
    })

    return {
      url: result.secure_url,
      publicId: result.public_id
    }
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error)
    throw new Error('Failed to upload image')
  }
}

// Delete image from Cloudinary
export async function deleteRemixSetupImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error)
    throw new Error('Failed to delete image')
  }
}

// Get optimized image URL with transformations
export function getOptimizedImageUrl(
  publicId: string,
  transformations?: Record<string, any>
): string {
  const defaultTransformations = {
    width: 800,
    height: 600,
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto',
    fetch_format: 'auto'
  }

  const finalTransformations = {
    ...defaultTransformations,
    ...transformations
  }

  return cloudinary.url(publicId, {
    ...finalTransformations,
    secure: true
  })
}

// Search for remix setup images by remix ID (following your pattern)
export async function getRemixSetupImages(remixId: string): Promise<Array<{
  publicId: string
  url: string
  thumbnailUrl: string
  imageOrder: number
  description: string
  createdAt: string
}>> {
  try {
    console.log('Searching for images with remixId:', remixId)
    // Search for images with filename pattern: {remixId}_*
    const result = await cloudinary.search
      .expression(`filename:${remixId}_*`)
      .max_results(100)
      .execute()

    console.log('Cloudinary search result:', {
      totalCount: result.total_count,
      resourcesCount: result.resources.length,
      resources: result.resources.map((r: any) => ({
        publicId: r.public_id,
        filename: r.filename,
        context: r.context
      }))
    })

    return result.resources
      .map((resource: any) => {
        // Debug: Log the context and metadata
        console.log('Resource metadata:', {
          publicId: resource.public_id,
          context: resource.context,
          metadata: resource.metadata,
          order: resource.context?.order,
          alt: resource.context?.alt,
          caption: resource.context?.caption,
          allContextKeys: resource.context ? Object.keys(resource.context) : 'no context',
          allMetadataKeys: resource.metadata ? Object.keys(resource.metadata) : 'no metadata'
        })
        
        // Get order from context metadata or metadata fields (stored during upload)
        const imageOrder = parseInt(resource.context?.order || '0') || 0
        
        // Get description from context fields only
        const description = resource.context?.alt || resource.context?.caption || ''
        
        console.log('Extracted metadata:', { imageOrder, description })
        console.log('Context data:', resource.context)
        console.log('Resource public_id:', resource.public_id)
        
        // Generate clean thumbnail URL
        const thumbnailUrl = cloudinary.url(resource.public_id, {
          width: 200,
          height: 200,
          crop: 'fill',
          quality: 'auto',
          fetch_format: 'auto',
          secure: true
        })

        // Generate clean URL without metadata
        const cleanUrl = cloudinary.url(resource.public_id, {
          secure: true
        })

        console.log('Generated URLs:', {
          publicId: resource.public_id,
          thumbnailUrl,
          cleanUrl,
          originalSecureUrl: resource.secure_url
        })
        console.log('Final image object:', {
          publicId: resource.public_id,
          url: cleanUrl,
          thumbnailUrl,
          imageOrder,
          description
        })

        return {
          publicId: resource.public_id,
          url: cleanUrl,
          thumbnailUrl,
          imageOrder,
          description,
          createdAt: resource.created_at
        }
      })
      .sort((a: any, b: any) => a.imageOrder - b.imageOrder) // Sort by order metadata
  } catch (error) {
    console.error('Error searching Cloudinary images:', error)
    return []
  }
}

// Rename/reorder image in Cloudinary
export async function renameRemixSetupImage(
  oldPublicId: string,
  newOrder: number,
  newDescription: string = ''
): Promise<{ url: string; publicId: string }> {
  try {
    // Extract remix ID from old public ID
    const oldFilename = oldPublicId.split('/').pop() || ''
    const parts = oldFilename.split('_')
    if (parts.length < 2) {
      throw new Error('Invalid public ID format')
    }
    
    const remixId = parts[0]
    const newPublicId = `remix.games/${remixId}_${newOrder}`
    
    // Rename the image
    const result = await cloudinary.uploader.rename(
      oldPublicId,
      newPublicId,
      {
        overwrite: false // Don't overwrite if target exists
      }
    )
    
    // Update context (description) if provided
    if (newDescription) {
      await cloudinary.uploader.explicit(result.public_id, {
        context: {
          alt: newDescription.substring(0, 255),
          caption: newDescription.substring(0, 255)
        }
      })
    }
    
    return {
      url: result.secure_url,
      publicId: result.public_id
    }
  } catch (error) {
    console.error('Error renaming Cloudinary image:', error)
    throw new Error('Failed to rename image')
  }
}

// Move image up in order (decrease order number)
export async function moveImageUp(publicId: string): Promise<void> {
  try {
    // Get current image data
    const result = await cloudinary.search
      .expression(`public_id:${publicId}`)
      .execute()
    
    if (result.resources.length === 0) {
      throw new Error('Image not found')
    }
    
    const currentOrder = parseInt(result.resources[0].context?.order || '0')
    if (currentOrder <= 1) {
      throw new Error('Image is already at the top')
    }
    
    // Update order metadata
    await cloudinary.uploader.explicit(publicId, {
      context: {
        ...result.resources[0].context,
        order: (currentOrder - 1).toString()
      }
    })
  } catch (error) {
    console.error('Error moving image up:', error)
    throw new Error('Failed to move image up')
  }
}

// Move image down in order (increase order number)
export async function moveImageDown(publicId: string): Promise<void> {
  try {
    // Get current image data
    const result = await cloudinary.search
      .expression(`public_id:${publicId}`)
      .execute()
    
    if (result.resources.length === 0) {
      throw new Error('Image not found')
    }
    
    const currentOrder = parseInt(result.resources[0].context?.order || '0')
    
    // Update order metadata
    await cloudinary.uploader.explicit(publicId, {
      context: {
        ...result.resources[0].context,
        order: (currentOrder + 1).toString()
      }
    })
  } catch (error) {
    console.error('Error moving image down:', error)
    throw new Error('Failed to move image down')
  }
}

// Generate upload signature for client-side uploads (if needed later)
export function generateUploadSignature(
  remixId: string,
  imageOrder: number
): { signature: string; timestamp: number } {
  const timestamp = Math.round(new Date().getTime() / 1000)
  const publicId = `remix.games/${remixId}_${imageOrder}`
  
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder: 'remix.games',
      public_id: publicId,
    },
    process.env.CLOUDINARY_API_SECRET!
  )

  return { signature, timestamp }
}