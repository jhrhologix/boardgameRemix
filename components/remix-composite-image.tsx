"use client"

import { useEffect, useRef } from 'react'
import Image from 'next/image'

interface Game {
  name: string
  id?: string
  bggUrl?: string
  image: string
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
    'family-game': '♥',
    'kids': '🎈',
    'adult-only': '🎯',
    
    // Game Styles
    'cooperative': '⚭',
    'competitive': '⚔',
    'team': '⚑',
    'solo': '👤',
    'multiplayer-game': '👥',
    'asymmetric': '⚖',
    
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
    'nature': '🌿',
    'space': '🌠',
    'cyberpunk': '🤖',
    'steampunk': '⚙',
    'western': '🤠',
    'pirates': '☠',
    'zombies': '🧟',
    'mythology': '⚡',
    'anime': '🎌',
    
    // Game Mechanics
    'tile-laying': '⬡',
    'worker-placement': '👷',
    'deck-building': '🃏',
    'area-control': '🏰',
    'resource-management': '⚒',
    'exploration': '🧭',
    'racing': '🏁',
    'drafting': '↺',
    'bidding': '💫',
    'memory': '🧠',
    'hidden-movement': '👻',
    'hand-management': '🤲',
    'set-collection': '🎯',
    'push-your-luck': '🎲',
    'take-that': '⚔',
    'programming': '💻',
    'deduction': '🔍',
    'pattern-building': '🔄',
    'engine-building': '⚙',
    'action-points': '⭐',
    'action-selection': '✓',
    'area-movement': '➡',
    'card-drafting': '🎴',
    'deck-construction': '📚',
    'dice-rolling': '🎲',
    'grid-movement': '▦',
    'modular-board': '🔲',
    'network-building': '🕸',
    'pickup-and-deliver': '📦',
    'player-elimination': '❌',
    'point-to-point': '📍',
    'press-your-luck': '🎰',
    'roll-and-move': '🎲',
    'route-building': '🛣',
    'secret-unit-deployment': '🕵',
    'simultaneous-action': '⚡',
    'stock-holding': '📈',
    'storytelling': '📖',
    'tableau-building': '🏗',
    'tile-placement': '🔲',
    'trading-game': '🤝',
    'trick-taking': '♠',
    'variable-powers': '💪',
    'voting': '✋',
    
    // Time & Complexity
    'quick-game': '⚡',
    'long-game': '⌛',
    'complex': '💠',
    'simple': '○',
    'casual': '☺',
    'hardcore': '💪',
    'lightweight': '🪶',
    'middleweight': '⚖',
    'heavyweight': '🏋',
    
    // Player Count
    'single-player': '👤',
    'two-player': '👥',
    'party-game': '🎉',
    
    // Age Categories
    'children': '🎈',
    'family-friendly': '👨‍👩‍👧‍👦',
    'adult-game': '🎯',
    'all-ages': '🌟',
    
    // Game Length
    'filler': '⚡',
    'short': '🕐',
    'medium': '🕒',
    'long': '🕕',
    'epic': '🕛',
    
    // Game Experience
    'beginner': '🌱',
    'intermediate': '🌿',
    'advanced': '🌳',
    'expert': '🎓',
    
    // Special Categories
    'legacy': '📚',
    'campaign': '📖',
    'expandable': '➕',
    'customizable': '🛠',
    'print-and-play': '🖨',
    'educational': '📚',
    'travel': '✈',
    'miniatures': '🎨',
    'cards': '🃏',
    'tokens': '🔘',
    'board': '🎲',
    'tiles': '🔲'
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

// LEGAL BGG API: Use BGG's official API to fetch images
function getLegalBGGImageUrl(game: Game): string {
  // If we have a BGG ID, use our legal API route
  if (game.id && game.id !== 'placeholder') {
    return `/api/bgg-image?gameId=${game.id}`
  }
  
  // Fallback to placeholder for games without BGG IDs
  return '/placeholder.svg'
}

export default function RemixCompositeImage({ 
  games = [], 
  className = "", 
  difficulty,
  tags = [],
  isClickable = true
}: RemixCompositeImageProps) {
  // Check if we have games with BGG IDs that could have images
  const gamesWithPotentialImages = games.filter(game => game.id && game.id !== 'placeholder')
  
  // If no games have BGG IDs, show text-based version
  if (gamesWithPotentialImages.length === 0) {
    const cols = games.length > 1 ? 2 : 1
    return (
      <div className={`grid grid-cols-${cols} gap-2 h-auto bg-black rounded-lg p-2 ${className}`}>
        {games.map((game, index) => (
          <div 
            key={index} 
            className="relative flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-md p-3"
          >
            <div className="text-center">
              <span className="text-white text-sm sm:text-base font-medium line-clamp-2">
                {game.name}
              </span>
            </div>
          </div>
        ))}
        {difficulty && (
          <div className="absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-medium" style={{
            backgroundColor: getDifficultyColor(difficulty),
            color: 'white'
          }}>
            {difficulty}
          </div>
        )}
      </div>
    )
  }

  // Show actual game images or placeholders
  return (
    <div className={`relative h-auto bg-black rounded-lg overflow-hidden ${className}`}>
      {gamesWithPotentialImages.length === 1 ? (
        // Single game - show full image
        <Image
          src={getLegalBGGImageUrl(gamesWithPotentialImages[0])}
          alt={gamesWithPotentialImages[0].name}
          width={400}
          height={300}
          className="object-contain p-2 w-full h-auto"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
          onError={(e) => {
            // Fallback to placeholder on error
            e.currentTarget.src = '/placeholder.svg'
          }}
        />
      ) : (
        // Multiple games - show grid
        <div className="grid w-full gap-1 p-2" 
          style={{ 
            gridTemplateColumns: gamesWithPotentialImages.length > 2 ? "1fr 1fr" : "repeat(2, 1fr)"
          }}
        >
          {gamesWithPotentialImages.slice(0, 4).map((game, index) => (
            <div key={index} className="relative overflow-hidden rounded-md bg-gray-800">
              <Image
                src={getLegalBGGImageUrl(game)}
                alt={game.name}
                width={200}
                height={150}
                className="object-contain p-1 w-full h-auto"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                priority={index === 0}
                onError={(e) => {
                  // Fallback to placeholder on error
                  e.currentTarget.src = '/placeholder.svg'
                }}
              />
            </div>
          ))}
        </div>
      )}
      
    </div>
  )
}

// Helper function to adjust color brightness
function adjustColor(color: string, amount: number): string {
  const hslMatch = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
  if (!hslMatch) return color
  
  const h = parseInt(hslMatch[1])
  const s = parseInt(hslMatch[2])
  const l = Math.max(0, Math.min(100, parseInt(hslMatch[3]) + amount))
  
  return `hsl(${h}, ${s}%, ${l}%)`
} 