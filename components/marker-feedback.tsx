'use client'

import { useEffect } from 'react'
import { initializeMarker } from '@/lib/marker'

export default function MarkerFeedback() {
  useEffect(() => {
    // Initialize Marker.io widget on client side
    initializeMarker()
  }, [])

  return null // This component doesn't render anything visible
}
