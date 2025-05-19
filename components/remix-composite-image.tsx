"use client"

import { useEffect, useRef } from 'react'

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

// Function to convert original image URL to thumbnail
function getThumbnailUrl(originalUrl: string) {
  if (!originalUrl || originalUrl === '/placeholder.svg') return '/placeholder.svg'
  return originalUrl.replace('/original/', '/thumb/').replace('/0x0/', '/200x200/')
}

export default function RemixCompositeImage({ 
  games = [], 
  className = "", 
  difficulty,
  tags = [],
  isClickable = true
}: RemixCompositeImageProps) {
  // Calculate grid columns based on number of games
  const cols = games.length > 1 ? 2 : 1
  const rows = Math.ceil(games.length / cols)

  return (
    <div className={`grid grid-cols-${cols} gap-2 aspect-[4/3] bg-black rounded-lg p-2 ${className}`}>
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

// Helper function to adjust color brightness
function adjustColor(color: string, amount: number): string {
  const hslMatch = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
  if (!hslMatch) return color
  
  const h = parseInt(hslMatch[1])
  const s = parseInt(hslMatch[2])
  const l = Math.max(0, Math.min(100, parseInt(hslMatch[3]) + amount))
  
  return `hsl(${h}, ${s}%, ${l}%)`
} 