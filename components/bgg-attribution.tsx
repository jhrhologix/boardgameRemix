export default function BGGAttribution() {
  return (
    <div className="text-xs text-gray-500 mt-2 p-2 border-t">
      <p>
        Game data provided by{' '}
        <a 
          href="https://boardgamegeek.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          BoardGameGeek
        </a>
        . Used with permission for educational/personal use.
      </p>
      <p>
        Game images are property of their respective publishers.
      </p>
    </div>
  )
}
