'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface SetupImage {
  publicId: string
  url: string
  thumbnailUrl: string
  imageOrder: number
  description: string
  createdAt: string
}

interface SetupImagesDisplayProps {
  remixId: string
}

export default function SetupImagesDisplay({ remixId }: SetupImagesDisplayProps) {
  const [images, setImages] = useState<SetupImage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<SetupImage | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const loadImages = async () => {
      try {
        const response = await fetch(`/api/remix-images?remixId=${remixId}`)
        if (response.ok) {
          const data = await response.json()
          setImages(data.images || [])
        }
      } catch (error) {
        console.error('Error loading setup images:', error)
      } finally {
        setLoading(false)
      }
    }

    if (remixId) {
      loadImages()
    }
  }, [remixId])

  const openModal = (image: SetupImage) => {
    setSelectedImage(image)
    setShowModal(true)
  }

  const closeModal = () => {
    setSelectedImage(null)
    setShowModal(false)
  }

  const nextImage = () => {
    if (!selectedImage) return
    const currentIndex = images.findIndex(img => img.publicId === selectedImage.publicId)
    const nextIndex = (currentIndex + 1) % images.length
    setSelectedImage(images[nextIndex])
  }

  const prevImage = () => {
    if (!selectedImage) return
    const currentIndex = images.findIndex(img => img.publicId === selectedImage.publicId)
    const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1
    setSelectedImage(images[prevIndex])
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B35]"></div>
      </div>
    )
  }

  if (images.length === 0) {
    return null
  }

  return (
    <>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Setup Images</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images
            .sort((a, b) => a.imageOrder - b.imageOrder)
            .map((image) => (
              <div
                key={image.publicId}
                className="relative group cursor-pointer"
                onClick={() => openModal(image)}
              >
                <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
                  <Image
                    src={image.thumbnailUrl}
                    alt={image.description || `Setup image ${image.imageOrder}`}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  />
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {image.imageOrder}
                  </div>
                </div>
                {image.description && (
                  <p className="text-xs text-gray-600 mt-1 truncate">
                    {image.description}
                  </p>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full bg-white rounded-lg overflow-hidden">
            <div className="relative">
              <Image
                src={selectedImage.url}
                alt={selectedImage.description || `Setup image ${selectedImage.imageOrder}`}
                width={800}
                height={600}
                className="w-full h-auto max-h-[80vh] object-contain"
                priority
              />
              
              {/* Navigation buttons */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
              
              {/* Close button */}
              <Button
                variant="outline"
                size="icon"
                className="absolute top-4 right-4 bg-white/90 hover:bg-white"
                onClick={closeModal}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Description */}
            {selectedImage.description && (
              <div className="p-4 bg-gray-50">
                <p className="text-sm text-gray-700">{selectedImage.description}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
