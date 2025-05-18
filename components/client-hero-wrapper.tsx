'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Dynamically import HeroSection with no SSR
const HeroSection = dynamic(
  () => import('./hero-section'),
  {
    ssr: false,
    loading: () => <div className="min-h-[400px] bg-[#004E89]" />
  }
)

export default function ClientHeroWrapper() {
  return (
    <div>
      <Suspense fallback={<div className="min-h-[400px] bg-[#004E89]" />}>
        <HeroSection />
      </Suspense>
    </div>
  )
} 