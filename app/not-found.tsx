import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <h1 className="text-6xl font-bold text-[#004E89] mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-[#004E89] mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button className="bg-[#FF6B35] hover:bg-[#e55a2a] w-full">Go Home</Button>
          </Link>
          <Link href="/browse">
            <Button variant="outline" className="w-full">
              Browse Remixes
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
