import Link from "next/link"
import NewsletterForm from "./newsletter-form"

export default function Footer() {
  return (
    <footer className="bg-[#2A2B2A] text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Remix Games</h3>
            <p className="text-gray-300 mb-4">
              Discover new ways to play with board games you already own.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-[#FF6B35]">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/browse" className="text-gray-300 hover:text-[#FF6B35]">
                  Browse Remixes
                </Link>
              </li>
              <li>
                <Link href="/submit" className="text-gray-300 hover:text-[#FF6B35]">
                  Submit a Remix
                </Link>
              </li>
              <li>
                <Link href="/community-guidelines" className="text-gray-300 hover:text-[#FF6B35]">
                  Community Guidelines
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
                <Link href="/contact" className="text-gray-300 hover:text-[#FF6B35]">
                  Contact Us
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
            <NewsletterForm />
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
          <p>© {new Date().getFullYear()} Remix Games. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
