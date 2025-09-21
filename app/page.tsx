import FeaturedRemixes from "@/components/featured-remixes"
import HowItWorks from "@/components/how-it-works"
import RecentlyAdded from "@/components/recently-added"
import Footer from "@/components/footer"
import Header from "@/components/header"
import ClientHeroWrapper from "@/components/client-hero-wrapper"
import StructuredData from "@/components/structured-data"
import { generateWebsiteStructuredData, generateOrganizationStructuredData } from "@/lib/seo"

export default function Home() {
  const structuredData = [
    generateWebsiteStructuredData(),
    generateOrganizationStructuredData()
  ]

  return (
    <main className="min-h-screen bg-[#FFF8F0]">
      <StructuredData data={structuredData} />
      <Header />
      <ClientHeroWrapper />
      <FeaturedRemixes />
      <HowItWorks />
      <RecentlyAdded />
      <Footer />
    </main>
  )
}
