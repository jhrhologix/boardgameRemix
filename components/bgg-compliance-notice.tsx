import Link from 'next/link'

interface BGGComplianceNoticeProps {
  className?: string
  compact?: boolean
}

export default function BGGComplianceNotice({ 
  className = "", 
  compact = false 
}: BGGComplianceNoticeProps) {
  if (compact) {
    return (
      <div className={`text-xs text-gray-500 ${className}`}>
        <Link 
          href="https://boardgamegeek.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          Powered by BGG
        </Link>
      </div>
    )
  }

  return (
    <div className={`border-t border-gray-200 pt-4 mt-4 ${className}`}>
      <div className="flex items-center justify-center space-x-4">
        <Link 
          href="https://boardgamegeek.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block"
        >
          <div className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors">
            🎲 Powered by BoardGameGeek
          </div>
        </Link>
      </div>
      
      <p className="text-xs text-gray-600 text-center mt-2">
        Game data and images provided by{' '}
        <Link 
          href="https://boardgamegeek.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          BoardGameGeek
        </Link>
        {' '}under their{' '}
        <Link 
          href="https://boardgamegeek.com/wiki/page/XML_API_Terms_of_Use" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          XML API Terms of Use
        </Link>
        . Used for non-commercial educational purposes.
      </p>
    </div>
  )
}
