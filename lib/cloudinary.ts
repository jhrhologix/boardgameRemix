import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '636325382282287',
  api_key: process.env.CLOUDINARY_API_KEY || '282637517386974',
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

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
    // Simple naming convention: {remixId}_{order} - easy to filter and reorder
    const filename = `${remixId}_${imageOrder}`
    
    // Upload to Cloudinary with specific folder structure
    const result = await cloudinary.uploader.upload(
      `data:${mimeType};base64,${imageBuffer.toString('base64')}`,
      {
        folder: 'remix.games',
        public_id: filename,
        upload_preset: 'remix.games', // Use your upload preset
        resource_type: 'auto',
        quality: 'auto',
        fetch_format: 'auto',
        context: {
          alt: description.substring(0, 255), // Max 255 chars for description
          caption: description.substring(0, 255)
        },
        transformation: [
          { width: 1200, height: 800, crop: 'fill', gravity: 'auto' },
          { quality: 'auto', fetch_format: 'auto' }
        ]
      }
    )

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
    // Search for images with filename pattern: {remixId}_*
    const result = await cloudinary.search
      .expression(`filename:${remixId}_*`)
      .sort_by([['public_id', 'asc']]) // Sort by public_id to maintain order
      .max_results(100)
      .execute()

    return result.resources.map(resource => {
      // Extract order from filename: {remixId}_{order}
      const filename = resource.public_id.split('/').pop() || ''
      const parts = filename.split('_')
      const imageOrder = parts.length >= 2 ? parseInt(parts[1]) || 0 : 0
      
      // Get description from context (alt or caption)
      const description = resource.context?.alt || resource.context?.caption || ''
      
      // Generate thumbnail URL
      const thumbnailUrl = cloudinary.url(resource.public_id, {
        width: 200,
        height: 200,
        crop: 'fill',
        quality: 'auto',
        fetch_format: 'auto'
      })

      return {
        publicId: resource.public_id,
        url: resource.secure_url,
        thumbnailUrl,
        imageOrder,
        description,
        createdAt: resource.created_at
      }
    })
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