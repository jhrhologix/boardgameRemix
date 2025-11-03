'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

/**
 * Official "Powered by BGG" logo component
 * Required by BGG XML API Terms of Use for public-facing applications
 * 
 * Logo files available at:
 * https://drive.google.com/drive/folders/1k3VgEIpNEY59iTVnpTibt31JcO0rEaSw?usp=drive_link
 * 
 * Requirements:
 * - Logo must link back to BoardGameGeek
 * - Logo must be sized so text remains easily legible
 * - Can use any format from the official Google Drive folder
 */
interface BGGPoweredLogoProps {
  className?: string
  width?: number
  height?: number
}

export default function BGGPoweredLogo({ 
  className = "", 
  width = 200,
  height = 60 
}: BGGPoweredLogoProps) {
  const [imageError, setImageError] = useState(false)

  // If logo image not found, show text fallback
  if (imageError) {
    return (
      <Link 
        href="https://boardgamegeek.com" 
        target="_blank" 
        rel="noopener noreferrer"
        className={`inline-block ${className}`}
        aria-label="Powered by BoardGameGeek"
      >
        <div className="bg-white rounded px-3 py-2 text-black text-sm font-semibold hover:bg-gray-100 transition-colors inline-block">
          🎲 Powered by BoardGameGeek
        </div>
      </Link>
    )
  }

  return (
    <Link 
      href="https://boardgamegeek.com" 
      target="_blank" 
      rel="noopener noreferrer"
      className={`inline-block ${className}`}
      aria-label="Powered by BoardGameGeek"
    >
      <Image
        src="/bgg-powered-logo.svg"
        alt="Powered by BoardGameGeek"
        width={width}
        height={height}
        className="h-auto w-auto max-w-full"
        priority={false}
        onError={() => setImageError(true)}
      />
    </Link>
  )
}
