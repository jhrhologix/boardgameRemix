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
  const [editingImage, setEditingImage] = useState<string | null>(null)
  const [editDescription, setEditDescription] = useState('')
  const [editOrder, setEditOrder] = useState(0)

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

  const startEditing = (image: SetupImage) => {
    setEditingImage(image.publicId)
    setEditDescription(image.description)
    setEditOrder(image.imageOrder)
  }

  const cancelEditing = () => {
    setEditingImage(null)
    setEditDescription('')
    setEditOrder(0)
  }

  const saveEdit = async () => {
    if (!editingImage) return
    
    try {
      // Here you would call an API to update the image metadata
      // For now, we'll just update the local state
      setImages(prevImages => 
        prevImages.map(img => 
          img.publicId === editingImage 
            ? { ...img, description: editDescription, imageOrder: editOrder }
            : img
        )
      )
      setEditingImage(null)
    } catch (error) {
      console.error('Error updating image:', error)
    }
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
        <h3 className="text-lg font-semibold text-[#FF6B35]">Setup Images</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images
            .sort((a, b) => a.imageOrder - b.imageOrder)
            .map((image) => (
              <div
                key={image.publicId}
                className="relative group"
              >
                <div 
                  className="aspect-square relative overflow-hidden rounded-lg bg-gray-100 cursor-pointer"
                  onClick={() => openModal(image)}
                >
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
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        startEditing(image)
                      }}
                      className="bg-[#FF6B35] text-white text-xs px-2 py-1 rounded hover:bg-[#e55a2b]"
                    >
                      Edit
                    </button>
                  </div>
                </div>
                
                {editingImage === image.publicId ? (
                  <div className="mt-2 space-y-2">
                    <input
                      type="text"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Image description"
                      className="w-full text-xs px-2 py-1 border border-gray-300 rounded"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={editOrder}
                        onChange={(e) => setEditOrder(parseInt(e.target.value) || 0)}
                        placeholder="Order"
                        className="w-16 text-xs px-2 py-1 border border-gray-300 rounded"
                      />
                      <button
                        onClick={saveEdit}
                        className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-1">
                    <p className="text-xs text-gray-600 truncate">
                      <strong>Order {image.imageOrder}:</strong> {image.description || 'No description'}
                    </p>
                  </div>
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
