import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import TipJar from "./tip-jar"

export default function HeroSection() {
  return (
    <section className="relative bg-[#004E89] text-white py-16 md:py-24">
      {/* Background image with overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/A%20high-resolution%20im.png-heMY7xTWJUCXOkv7K4uUUQ5FL98gIY.jpeg')",
          backgroundPosition: "center 30%",
        }}
      >
        {/* Dark overlay to ensure text readability */}
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <TipJar />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-shadow-lg">
            Give Your Board Games a Second Life
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-[#FFBC42] font-semibold text-shadow-md">
            Discover new games to play using board games you already own
          </p>

          <div className="relative max-w-2xl mx-auto mb-8">
            <div className="flex items-center bg-white rounded-lg overflow-hidden shadow-lg">
              <input
                type="text"
                placeholder="Enter games you own (e.g., Chess, Monopoly, Jenga)"
                className="flex-grow px-4 py-3 text-[#2A2B2A] focus:outline-none"
              />
              <button className="bg-[#FF6B35] p-3 text-white">
                <Search size={24} />
              </button>
            </div>
          </div>

          <Button className="bg-[#FF6B35] hover:bg-[#e55a2a] text-white px-8 py-6 text-lg rounded-lg shadow-lg transition-all">
            Browse All Remixes
          </Button>
        </div>
      </div>
    </section>
  )
}
