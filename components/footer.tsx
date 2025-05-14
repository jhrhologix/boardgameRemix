import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-[#2A2B2A] text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Remix Games</h3>
            <p className="text-gray-300 mb-4">Discover new ways to play with board games you already own.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-[#FF6B35]">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-[#FF6B35]">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-[#FF6B35]">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-[#FF6B35]">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-[#FF6B35]">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-[#FF6B35]">
                  Browse Remixes
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-[#FF6B35]">
                  Submit a Remix
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-[#FF6B35]">
                  Community Guidelines
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Help & Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-[#FF6B35]">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-[#FF6B35]">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-[#FF6B35]">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-[#FF6B35]">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Newsletter</h3>
            <p className="text-gray-300 mb-4">Subscribe to get updates on new game remixes and features.</p>
            <div className="flex flex-col space-y-2">
              <Input type="email" placeholder="Your email address" className="bg-gray-700 border-gray-600 text-white" />
              <Button className="bg-[#FF6B35] hover:bg-[#e55a2a] w-full">Subscribe</Button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
          <p>© {new Date().getFullYear()} Remix Games. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
