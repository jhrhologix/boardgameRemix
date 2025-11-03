import Link from "next/link"
import NewsletterForm from "./newsletter-form"
import BGGPoweredLogo from "./bgg-powered-logo"

export default function Footer() {
  return (
    <footer className="bg-[#2A2B2A] text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4"><strong>Remix Games</strong></h3>
            <p className="text-gray-300 mb-4">
              Discover <strong>creative board game combinations</strong> and <strong>innovative variants</strong> using games you already own. Join the largest community of <strong>gaming innovators</strong>.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4"><strong>Board Game Remixes</strong></h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-[#FF6B35]">
                  About <strong>Remix Games</strong>
                </Link>
              </li>
              <li>
                <Link href="/browse" className="text-gray-300 hover:text-[#FF6B35]">
                  Browse <strong>Game Remixes</strong>
                </Link>
              </li>
              <li>
                <Link href="/popular" className="text-gray-300 hover:text-[#FF6B35]">
                  <strong>Popular</strong> Board Game Combinations
                </Link>
              </li>
              <li>
                <Link href="/submit" className="text-gray-300 hover:text-[#FF6B35]">
                  Submit Your <strong>Game Remix</strong>
                </Link>
              </li>
              <li>
                <Link href="/community-guidelines" className="text-gray-300 hover:text-[#FF6B35]">
                  <strong>Community</strong> Guidelines
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Help & Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-[#FF6B35]">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-gray-300 hover:text-[#FF6B35]">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="text-gray-300 hover:text-[#FF6B35]">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Newsletter</h3>
            <p className="text-gray-300 mb-4">
              Subscribe to get updates on new game remixes and features.
            </p>
            {/* <NewsletterForm /> */}
            <div className="text-gray-500 text-sm">
              Newsletter coming soon!
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
          <p>© {new Date().getFullYear()} Remix Games. All rights reserved.</p>
          
          {/* BGG Terms of Use Compliance - Official Logo Required */}
          <div className="mt-4 flex flex-col items-center space-y-2">
            {/* Official "Powered by BGG" Logo - Required by BGG XML API Terms of Use */}
            {/* Logo files: https://drive.google.com/drive/folders/1k3VgEIpNEY59iTVnpTibt31JcO0rEaSw?usp=drive_link */}
            <BGGPoweredLogo width={200} height={150} className="mb-2" />
            <p className="text-xs">
              Game data and images provided by BoardGameGeek under their{' '}
              <a 
                href="https://boardgamegeek.com/wiki/page/XML_API_Terms_of_Use" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                XML API Terms of Use
              </a>
              . Used for non-commercial purposes.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
