"use client"

import { useEffect, useRef } from 'react'
import type { BGGGame } from '@/lib/bgg-api'
import { Dice1, Dice5, Swords, Users2, Brain, Clock, Users } from 'lucide-react'

interface RemixCompositeImageProps {
  games: BGGGame[]
  className?: string
  width?: number
  height?: number
}

// Game type icons mapping
const gameTypeIcons = {
  strategy: <Brain className="text-white h-6 w-6" />,
  luck: <Dice1 className="text-white h-6 w-6" />,
  skill: <Dice5 className="text-white h-6 w-6" />,
  combat: <Swords className="text-white h-6 w-6" />,
  social: <Users2 className="text-white h-6 w-6" />,
  time: <Clock className="text-white h-6 w-6" />,
  coop: <Users className="text-white h-6 w-6" />,
}

export default function RemixCompositeImage({ games, className = "", width = 500, height = 300 }: RemixCompositeImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = width
    canvas.height = height

    // Clear canvas
    ctx.fillStyle = '#f0f0f0'
    ctx.fillRect(0, 0, width, height)

    // Load and draw images
    const loadAndDrawImages = async () => {
      try {
        const loadImage = (url: string): Promise<HTMLImageElement> => {
          return new Promise((resolve, reject) => {
            const img = new Image()
            img.crossOrigin = 'anonymous' // Handle CORS
            img.onload = () => resolve(img)
            img.onerror = reject
            img.src = url || '/placeholder.svg'
          })
        }

        // Load all images first
        const images = await Promise.all(
          games.map(game => loadImage(game.image || '/placeholder.svg'))
        )

        // Calculate dimensions based on number of games
        const numGames = images.length
        let cols = Math.ceil(Math.sqrt(numGames))
        let rows = Math.ceil(numGames / cols)

        // Ensure aspect ratio is maintained
        if (width > height && rows > cols) {
          [rows, cols] = [cols, rows]
        }

        const cellWidth = width / cols
        const cellHeight = height / rows

        // Draw images
        images.forEach((img, index) => {
          const row = Math.floor(index / cols)
          const col = index % cols
          const x = col * cellWidth
          const y = row * cellHeight

          // Draw with proper scaling
          ctx.save()
          ctx.beginPath()
          ctx.rect(x, y, cellWidth, cellHeight)
          ctx.clip()
          
          // Calculate scaling to cover the cell while maintaining aspect ratio
          const scale = Math.max(cellWidth / img.width, cellHeight / img.height)
          const scaledWidth = img.width * scale
          const scaledHeight = img.height * scale
          
          // Center the image in the cell
          const offsetX = x + (cellWidth - scaledWidth) / 2
          const offsetY = y + (cellHeight - scaledHeight) / 2
          
          ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight)
          ctx.restore()
        })

        // Add overlay for game type icons
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
        ctx.fillRect(0, height - 40, width, 40)

        // Add game type icons (for demo - you'll want to determine these based on actual game data)
        const iconSize = 24
        const padding = 8
        const startX = padding
        const startY = height - 32

        // Draw some example icons
        ctx.fillStyle = 'white'
        const iconTypes = ['strategy', 'luck', 'skill']
        iconTypes.forEach((type, index) => {
          const x = startX + (iconSize + padding) * index
          ctx.strokeStyle = 'white'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(x + iconSize/2, startY + iconSize/2, iconSize/2, 0, Math.PI * 2)
          ctx.stroke()
        })

      } catch (error) {
        console.error('Error loading images:', error)
        // Draw fallback
        ctx.fillStyle = '#ccc'
        ctx.fillRect(0, 0, width, height)
        ctx.fillStyle = '#666'
        ctx.font = '20px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('Image not available', width/2, height/2)
      }
    }

    loadAndDrawImages()
  }, [games, width, height])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        width: '100%',
        height: 'auto',
        maxWidth: width,
        aspectRatio: `${width}/${height}`,
      }}
    />
  )
} 