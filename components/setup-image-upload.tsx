'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { X, Upload, Image as ImageIcon, Plus, ChevronUp, ChevronDown, Edit2 } from 'lucide-react'
import Image from 'next/image'

interface SetupImage {
  publicId: string
  url: string
  thumbnailUrl: string
  imageOrder: number
  description: string
  createdAt: string
}

interface SetupImageUploadProps {
  remixId: string
  initialImages?: SetupImage[]
  onImagesChange?: (images: SetupImage[]) => void
  isNewRemix?: boolean // Flag to indicate if this is a new remix without ID yet
}

export default function SetupImageUpload({ 
  remixId, 
  initialImages = [], 
  onImagesChange,
  isNewRemix = false
}: SetupImageUploadProps) {
  // Ensure isNewRemix is always a boolean to prevent dependency array issues
  const isNewRemixFlag = Boolean(isNewRemix)
  const [images, setImages] = useState<SetupImage[]>(initialImages)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [description, setDescription] = useState('')
  const [editingImage, setEditingImage] = useState<string | null>(null)
  const [editDescription, setEditDescription] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load images from Cloudinary
  const loadImages = async () => {
    try {
      const response = await fetch(`/api/remix-images?remixId=${remixId}`)
      if (response.ok) {
        const data = await response.json()
        setImages(data.images || [])
        onImagesChange?.(data.images || [])
      }
    } catch (error) {
      console.error('Error loading images:', error)
    }
  }

  // Load images on component mount
  React.useEffect(() => {
    if (remixId && !isNewRemixFlag) {
      loadImages()
    }
  }, [remixId]) // Only depend on remixId to keep array size consistent

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    // Require description before upload
    if (!description.trim()) {
      alert('Please enter a description for the setup image before uploading.')
      return
    }

    setUploading(true)
    
    try {
      const uploadPromises = Array.from(files).map(async (file, index) => {
        const formData = new FormData()
        formData.append('image', file)
        formData.append('remixId', remixId)
        formData.append('imageOrder', (images.length + index + 1).toString())
        formData.append('description', description.trim())

        const response = await fetch('/api/upload-setup-image', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Upload failed')
        }

        return response.json()
      })

      const results = await Promise.all(uploadPromises)
      
      // Refresh images from Cloudinary to get the latest data
      await loadImages()
      
      // Clear description after successful upload
      setDescription('')
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload images. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = async (imageIndex: number) => {
    const imageToRemove = images[imageIndex]
    
    try {
      // Delete from Cloudinary via our API
      const response = await fetch(`/api/upload-setup-image?publicId=${imageToRemove.publicId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete image')
      }

      // Refresh images from Cloudinary
      await loadImages()
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete image. Please try again.')
    }
  }

  const handleReorderImage = async (imageIndex: number, direction: 'up' | 'down') => {
    const sortedImages = [...images].sort((a, b) => a.imageOrder - b.imageOrder)
    const currentImage = sortedImages[imageIndex]
    
    if (!currentImage) return

    const newOrder = direction === 'up' 
      ? currentImage.imageOrder - 1 
      : currentImage.imageOrder + 1

    // Find the image that should be swapped
    const targetImage = sortedImages.find(img => img.imageOrder === newOrder)
    
    if (!targetImage) return

    try {
      // Rename both images to swap their order
      const [currentResult, targetResult] = await Promise.all([
        fetch('/api/rename-setup-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            oldPublicId: currentImage.publicId,
            newOrder: newOrder,
            newDescription: currentImage.description
          })
        }),
        fetch('/api/rename-setup-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            oldPublicId: targetImage.publicId,
            newOrder: currentImage.imageOrder,
            newDescription: targetImage.description
          })
        })
      ])

      if (!currentResult.ok || !targetResult.ok) {
        throw new Error('Failed to reorder images')
      }

      // Refresh images from Cloudinary
      await loadImages()
    } catch (error) {
      console.error('Reorder error:', error)
      alert('Failed to reorder images. Please try again.')
    }
  }

  const handleEditDescription = (image: SetupImage) => {
    setEditingImage(image.publicId)
    setEditDescription(image.description)
  }

  const handleSaveDescription = async (image: SetupImage) => {
    if (!editDescription.trim()) {
      alert('Description cannot be empty')
      return
    }

    try {
      const response = await fetch('/api/rename-setup-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldPublicId: image.publicId,
          newOrder: image.imageOrder,
          newDescription: editDescription.trim()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update description')
      }

      // Refresh images from Cloudinary
      await loadImages()
      setEditingImage(null)
      setEditDescription('')
    } catch (error) {
      console.error('Edit description error:', error)
      alert('Failed to update description. Please try again.')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Setup Images</h3>
        <span className="text-sm text-gray-500">
          {images.length}/10 images
        </span>
      </div>

      {/* Upload Area */}
      {isNewRemixFlag ? (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Setup images can be added after creating your remix.</strong><br />
            Create your remix first, then edit it to add setup images with descriptions.
          </p>
        </div>
      ) : images.length < 10 && (
        <Card
          className={`border-2 border-dashed transition-colors ${
            dragOver 
              ? 'border-[#FF6B35] bg-orange-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Description Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">
                  Image Description (Optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe this setup image..."
                  maxLength={255}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                />
                <p className="text-xs text-gray-500">
                  {description.length}/255 characters
                </p>
              </div>

              {/* Upload Area */}
              <div className="text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    {uploading ? 'Uploading...' : 'Drag & drop images here, or click to select'}
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, WebP up to 10MB each
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="mt-2"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Choose Images'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Setup Images ({images.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images
              .sort((a, b) => a.imageOrder - b.imageOrder) // Sort by order
              .map((image, index) => (
              <div key={image.publicId} className="relative group border rounded-lg p-3 bg-white">
                <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100 mb-2">
                  <Image
                    src={image.url}
                    alt={image.description || `Setup image ${image.imageOrder}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {image.imageOrder}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                
                {/* Description */}
                <div className="space-y-2">
                  {editingImage === image.publicId ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Describe this setup image..."
                        maxLength={255}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-white text-gray-900 placeholder:text-gray-500"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleSaveDescription(image)}
                          className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingImage(null)
                            setEditDescription('')
                          }}
                          className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700 min-h-[2.5rem]">
                        {image.description || 'No description'}
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditDescription(image)}
                          className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 flex items-center gap-1"
                        >
                          <Edit2 className="h-3 w-3" />
                          Edit
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Reorder buttons */}
                <div className="flex justify-center gap-1 mt-2">
                  <button
                    type="button"
                    onClick={() => handleReorderImage(index, 'up')}
                    disabled={index === 0}
                    className="p-1 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReorderImage(index, 'down')}
                    disabled={index === images.length - 1}
                    className="p-1 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help Text */}
      <p className="text-sm text-gray-500">
        Upload images showing how to set up your remix. Images will be automatically ordered and optimized.
      </p>
    </div>
  )
}
