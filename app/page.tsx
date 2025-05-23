import FeaturedRemixes from "@/components/featured-remixes"
import HowItWorks from "@/components/how-it-works"
import RecentlyAdded from "@/components/recently-added"
import Footer from "@/components/footer"
import Header from "@/components/header"
import ClientHeroWrapper from "@/components/client-hero-wrapper"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FFF8F0]">
      <Header />
      <ClientHeroWrapper />
      <FeaturedRemixes />
      <HowItWorks />
      <RecentlyAdded />
      <Footer />
    </main>
  )
}
