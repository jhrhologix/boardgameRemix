import Header from "@/components/header"
import Footer from "@/components/footer"
import { Shield, Users, MessageSquare, ThumbsUp, AlertTriangle } from "lucide-react"

export default function CommunityGuidelinesPage() {
  const guidelines = [
    {
      icon: <Shield className="h-8 w-8 text-[#FF6B35]" />,
      title: "Respectful Communication",
      description: "Always communicate with respect and courtesy. Harassment, hate speech, or discriminatory content will not be tolerated.",
    },
    {
      icon: <Users className="h-8 w-8 text-[#FF6B35]" />,
      title: "Inclusive Community",
      description: "We welcome players of all backgrounds and experience levels. Help create a welcoming environment for everyone.",
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-[#FF6B35]" />,
      title: "Quality Contributions",
      description: "Submit well-thought-out remixes with clear instructions. Test your remixes before sharing them with the community.",
    },
    {
      icon: <ThumbsUp className="h-8 w-8 text-[#FF6B35]" />,
      title: "Constructive Feedback",
      description: "When providing feedback, be constructive and helpful. Focus on improving the remix rather than criticizing the creator.",
    },
    {
      icon: <AlertTriangle className="h-8 w-8 text-[#FF6B35]" />,
      title: "Report Violations",
      description: "If you see content that violates our guidelines, report it to help maintain a safe and enjoyable environment.",
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
              Community Guidelines
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Our community thrives on creativity, respect, and collaboration. These guidelines help ensure a positive experience for all members.
            </p>
          </div>
        </section>

        {/* Guidelines Section */}
        <section className="py-16 px-4 bg-[#1a1a1a]">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto space-y-8">
              {guidelines.map((guideline, index) => (
                <div key={index} className="flex gap-6 items-start bg-black p-6 rounded-lg">
                  <div className="flex-shrink-0">{guideline.icon}</div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{guideline.title}</h3>
                    <p className="text-gray-300">{guideline.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Content Rules Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-[#FF6B35] mb-8 text-center">Content Rules</h2>
              
              <div className="space-y-8 text-gray-300">
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Remix Submissions</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Clearly list all required components and games</li>
                    <li>Provide detailed, step-by-step instructions</li>
                    <li>Include estimated play time and player count</li>
                    <li>Test your remix thoroughly before submission</li>
                    <li>Give credit if your remix is inspired by others</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Prohibited Content</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Spam or duplicate submissions</li>
                    <li>Offensive or inappropriate content</li>
                    <li>Copyright violations</li>
                    <li>Commercial promotion without approval</li>
                    <li>Intentionally misleading information</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Engagement Rules</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Vote based on remix quality, not personal bias</li>
                    <li>Provide constructive feedback in comments</li>
                    <li>Report inappropriate content or behavior</li>
                    <li>Respect others' intellectual property</li>
                    <li>Help new members learn and grow</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enforcement Section */}
        <section className="py-16 px-4 bg-[#1a1a1a]">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-[#FF6B35] mb-6">Guideline Enforcement</h2>
              <p className="text-gray-300 mb-4">
                We take our community guidelines seriously and enforce them to maintain a positive environment. Violations may result in:
              </p>
              <ul className="text-gray-300 space-y-2">
                <li>Content removal</li>
                <li>Temporary account suspension</li>
                <li>Permanent account termination</li>
              </ul>
              <p className="text-gray-300 mt-6">
                The severity of the action will depend on the nature and frequency of the violation.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
} 