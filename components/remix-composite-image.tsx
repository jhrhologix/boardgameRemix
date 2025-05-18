"use client"

import { useEffect, useRef } from 'react'
import Link from 'next/link'

interface Game {
  name: string
  difficulty?: 'Easy' | 'Medium' | 'Hard'
  tags?: string[]
}

interface RemixCompositeImageProps {
  games: Game[]
  className?: string
  width?: number
  height?: number
  difficulty?: 'Easy' | 'Medium' | 'Hard'
  tags?: string[]
  isClickable?: boolean
}

// Generate a unique color based on game name
function generateColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = hash % 360;
  return `hsl(${h}, 70%, 60%)`; // Using HSL for vibrant but consistent colors
}

// Get symbol for game type
function getGameSymbol(tag: string): string {
  const symbolMap: { [key: string]: string } = {
    // Strategy & Thinking Games
    'strategy': '♟',
    'abstract': '◆',
    'puzzle': '⚡',
    'logic': '🧩',
    
    // Card Based Games
    'card': '♠',
    'deck': '♣',
    'trading': '♦',
    
    // Dice & Chance
    'dice': '⚅',
    'random': '🎲',
    'luck': '🍀',
    
    // Social Games
    'party': '★',
    'social': '👥',
    'bluffing': '🎭',
    'negotiation': '🤝',
    
    // Family & Age Categories
    'family': '♥',
    'kids': '🎈',
    'adult': '🎯',
    
    // Game Styles
    'cooperative': '⚭',
    'competitive': '⚔',
    'team': '⚑',
    
    // Themes
    'fantasy': '🐉',
    'scifi': '🚀',
    'horror': '👻',
    'medieval': '⚔',
    'historical': '📜',
    'adventure': '🗺',
    'war': '⚔',
    'economic': '💰',
    'political': '👑',
    'mystery': '🔍',
    
    // Game Mechanics
    'tile': '⬡',
    'worker': '👷',
    'deck building': '🃏',
    'area control': '🏰',
    'resource': '⚒',
    'exploration': '🧭',
    'racing': '🏁',
    'drafting': '↺',
    'bidding': '💫',
    'memory': '🧠',
    
    // Time & Complexity
    'quick': '⚡',
    'long': '⌛',
    'complex': '💠',
    'simple': '○'
  }

  // Convert tag to lowercase and remove spaces for matching
  const normalizedTag = tag.toLowerCase().trim()
  return symbolMap[normalizedTag] || ''
}

// Get color for difficulty
function getDifficultyColor(difficulty?: 'Easy' | 'Medium' | 'Hard'): string {
  switch (difficulty) {
    case 'Easy': return '#4CAF50'
    case 'Medium': return '#FF9800'
    case 'Hard': return '#F44336'
    default: return '#9E9E9E'
  }
}

// Get display text for game name
function getGameDisplayText(name: string): string {
  const words = name.split(' ');
  const firstWord = words[0];
  // Always show first 3 letters of the first word with a dot
  return firstWord.slice(0, 3) + '.'
}

export default function RemixCompositeImage({ 
  games = [], 
  className = "", 
  width = 500, 
  height = 300,
  difficulty,
  tags = [],
  isClickable = true
}: RemixCompositeImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Calculate grid dimensions for games
  const numGames = games.length
  let cols = Math.ceil(Math.sqrt(numGames))
  let rows = Math.ceil(numGames / cols)
  if (width > height && rows > cols) {
    [rows, cols] = [cols, rows]
  }

  // Calculate cell dimensions
  const cellWidth = width / cols
  const cellHeight = height / rows

  // Calculate symbol dimensions
  const symbolSize = Math.min(width, height) * 0.12
  const symbolPadding = symbolSize * 0.3
  const symbolsStartY = height - symbolSize * 1.2

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

    // Draw tiles
    const drawTiles = () => {
      try {
        // Handle empty or invalid games array
        if (!Array.isArray(games) || games.length === 0) {
          // Draw a nice gradient background
          const gradient = ctx.createLinearGradient(0, 0, width, height)
          gradient.addColorStop(0, '#f0f0f0')
          gradient.addColorStop(1, '#e0e0e0')
          ctx.fillStyle = gradient
          ctx.fillRect(0, 0, width, height)
          
          // Add a placeholder text
          ctx.fillStyle = '#666'
          ctx.font = '20px Arial'
          ctx.textAlign = 'center'
          ctx.fillText('Game Remix', width/2, height/2)
          return
        }

        // Draw colored tiles
        games.forEach((game, index) => {
          if (!game) return

          const row = Math.floor(index / cols)
          const col = index % cols
          const x = col * cellWidth
          const y = row * cellHeight

          // Generate color based on game name
          const color = generateColor(game.name || 'Unknown Game')
          
          // Draw tile with slight gradient
          const gradient = ctx.createLinearGradient(x, y, x + cellWidth, y + cellHeight)
          gradient.addColorStop(0, color)
          gradient.addColorStop(1, adjustColor(color, -20)) // Slightly darker variant
          
          ctx.fillStyle = gradient
          ctx.fillRect(x, y, cellWidth, cellHeight)

          // Add game text
          const displayText = getGameDisplayText(game.name || 'Unknown Game')
          
          // Draw text background
          ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
          ctx.beginPath()
          const textWidth = cellWidth * 0.8
          const textHeight = cellHeight * 0.3
          const textX = x + (cellWidth - textWidth) / 2
          const textY = y + (cellHeight - textHeight) / 2
          ctx.roundRect(textX, textY, textWidth, textHeight, textHeight / 4)
          ctx.fill()

          // Draw text
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
          if (game.name.includes(' ')) {
            // Smaller font for initials
            ctx.font = `bold ${cellWidth * 0.15}px Arial`
          } else {
            ctx.font = `bold ${cellWidth * 0.2}px Arial`
          }
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(displayText.toUpperCase(), x + cellWidth/2, y + cellHeight/2)
        })

        // Draw difficulty tag if provided
        if (difficulty) {
          const tagWidth = width * 0.2
          const tagHeight = height * 0.1
          const tagX = width - tagWidth - 10
          const tagY = 10
          
          // Draw difficulty tag background
          ctx.fillStyle = getDifficultyColor(difficulty)
          ctx.beginPath()
          ctx.roundRect(tagX, tagY, tagWidth, tagHeight, tagHeight / 2)
          ctx.fill()

          // Add white border
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
          ctx.lineWidth = 2
          ctx.stroke()

          // Draw difficulty text
          ctx.fillStyle = 'white'
          ctx.font = `bold ${tagHeight * 0.6}px Arial`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(difficulty, tagX + tagWidth/2, tagY + tagHeight/2)
        }

        // Add unique game type symbols
        const uniqueSymbols = new Set<string>()
        tags.forEach(tag => {
          const symbol = getGameSymbol(tag)
          if (symbol) uniqueSymbols.add(symbol)
        })

        // Draw symbols in a row at the bottom
        const totalSymbolsWidth = Array.from(uniqueSymbols).length * (symbolSize + symbolPadding) - symbolPadding
        let startX = (width - totalSymbolsWidth) / 2

        Array.from(uniqueSymbols).forEach((symbol, index) => {
          const x = startX + index * (symbolSize + symbolPadding)
          const y = height - symbolSize * 1.2
          
          // Draw black circle background
          ctx.beginPath()
          ctx.arc(x + symbolSize/2, y + symbolSize/2, symbolSize/2, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(0, 0, 0, 0.85)'
          ctx.fill()

          // Add white glow effect
          ctx.beginPath()
          ctx.arc(x + symbolSize/2, y + symbolSize/2, symbolSize/2 - 2, 0, Math.PI * 2)
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
          ctx.lineWidth = 2
          ctx.stroke()
          
          // Draw symbol
          ctx.font = `${symbolSize * 0.7}px Arial`
          ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(symbol, x + symbolSize/2, y + symbolSize/2)
        })

      } catch (error) {
        console.error('Error drawing tiles:', error)
        // Draw fallback
        ctx.fillStyle = '#ccc'
        ctx.fillRect(0, 0, width, height)
        ctx.fillStyle = '#666'
        ctx.font = '20px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('Game Remix', width/2, height/2)
      }
    }

    drawTiles()
  }, [games, width, height, difficulty, tags])

  return (
    <div className="relative" style={{ width: '100%', height: 'auto', maxWidth: width }}>
      <canvas
        ref={canvasRef}
        className={className}
        style={{
          width: '100%',
          height: 'auto',
          maxWidth: width,
          aspectRatio: `${width}/${height}`,
          cursor: isClickable ? 'pointer' : 'default'
        }}
      />
      {isClickable && (
        <>
          {/* Clickable areas for games with tooltips */}
          {games.map((game, index) => {
            const row = Math.floor(index / cols)
            const col = index % cols
            const x = (col * cellWidth / width) * 100
            const y = (row * cellHeight / height) * 100
            const w = (cellWidth / width) * 100
            const h = (cellHeight / height) * 100

            return (
              <Link
                key={index}
                href={`/browse?game=${encodeURIComponent(game.name)}`}
                className="absolute hover:bg-black/10 transition-colors"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  width: `${w}%`,
                  height: `${h}%`
                }}
                title={game.name} // This creates the tooltip
              />
            )
          })}

          {/* Clickable areas for tags with tooltips */}
          {tags.map((tag, index) => {
            const totalSymbolsWidth = tags.length * (symbolSize + symbolPadding) - symbolPadding
            const startX = (width - totalSymbolsWidth) / 2
            const x = ((startX + index * (symbolSize + symbolPadding)) / width) * 100
            const y = (symbolsStartY / height) * 100
            const w = (symbolSize / width) * 100
            const h = (symbolSize / height) * 100

            return (
              <Link
                key={`tag-${index}`}
                href={`/browse?hashtag=${encodeURIComponent(tag)}`}
                className="absolute hover:bg-black/10 rounded-full transition-colors"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  width: `${w}%`,
                  height: `${h}%`
                }}
                title={tag} // This creates the tooltip
              />
            )
          })}
        </>
      )}
    </div>
  )
}

// Helper function to adjust color brightness
function adjustColor(color: string, amount: number): string {
  const match = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
  if (!match) return color
  const h = parseInt(match[1])
  const s = parseInt(match[2])
  const l = Math.max(0, Math.min(100, parseInt(match[3]) + amount))
  return `hsl(${h}, ${s}%, ${l}%)`
} 