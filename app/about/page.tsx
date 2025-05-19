import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, Sparkles, Heart, Trophy } from "lucide-react"

export default function AboutPage() {
  const values = [
    {
      icon: <Users className="h-12 w-12 text-[#FF6B35]" />,
      title: "Community First",
      description: "We believe in the power of community. Our platform is built by gamers, for gamers, fostering creativity and collaboration.",
    },
    {
      icon: <Sparkles className="h-12 w-12 text-[#FF6B35]" />,
      title: "Innovation",
      description: "We encourage creative thinking and new ways to experience classic board games, making every game night an adventure.",
    },
    {
      icon: <Heart className="h-12 w-12 text-[#FF6B35]" />,
      title: "Passion for Games",
      description: "Our love for board games drives us to create a platform where everyone can share and discover new ways to play.",
    },
    {
      icon: <Trophy className="h-12 w-12 text-[#FF6B35]" />,
      title: "Quality Content",
      description: "We maintain high standards for our remixes, ensuring each contribution adds value to the gaming community.",
    },
  ]

  return (
    <>
      <Header />
      <main className="min-h-screen bg-black">
        {/* Hero Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-[#FF6B35] mb-6">
              About Remix Games
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              We're revolutionizing board game nights by helping you discover new ways to play with games you already own.
            </p>
            <Link href="/browse">
              <Button className="bg-[#FF6B35] hover:bg-[#e55a2a] text-white px-8 py-6 text-lg">
                Start Exploring
              </Button>
            </Link>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-16 px-4 bg-[#1a1a1a]">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-[#FF6B35] mb-6 text-center">Our Story</h2>
            <div className="max-w-3xl mx-auto text-gray-300 space-y-4">
              <p>
                Remix Games was born from a simple idea: what if we could breathe new life into the board games collecting dust on our shelves? We realized that many people own great games but don't play them as often as they'd like, either because they've become too familiar or because they're looking for something new.
              </p>
              <p>
                Our platform connects board game enthusiasts who share creative ways to remix and reimagine classic games. Whether it's combining elements from different games, adding new rules, or creating entirely new experiences with existing components, we're here to help you rediscover the joy of your game collection.
              </p>
              <p>
                Today, we're proud to host a growing community of creative gamers who contribute their ideas and help others discover new ways to play. Every remix on our platform represents someone's innovative thinking and passion for gaming.
              </p>
            </div>
          </div>
        </section>

        {/* Our Values Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-[#FF6B35] mb-12 text-center">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div key={index} className="bg-[#1a1a1a] p-6 rounded-lg text-center">
                  <div className="flex justify-center mb-4">{value.icon}</div>
                  <h3 className="text-xl font-bold mb-2 text-white">{value.title}</h3>
                  <p className="text-gray-300">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Join Us Section */}
        <section className="py-16 px-4 bg-[#1a1a1a]">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold text-[#FF6B35] mb-6">Join Our Community</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Be part of our growing community of board game enthusiasts. Share your ideas, discover new ways to play, and connect with fellow gamers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth?tab=sign-up">
                <Button className="bg-[#FF6B35] hover:bg-[#e55a2a] text-white px-8">
                  Sign Up Now
                </Button>
              </Link>
              <Link href="/browse">
                <Button variant="outline" className="text-[#FF6B35] border-[#FF6B35] hover:bg-[#FF6B35] hover:text-white px-8">
                  Browse Remixes
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
} 