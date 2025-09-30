import { Search, BookOpen, Upload, Users } from "lucide-react"

export default function HowItWorks() {
  const steps = [
    {
      icon: <Search className="h-12 w-12 text-[#FF6B35]" />,
      title: "Find Board Game Remixes",
      description: "Search for creative board game combinations based on the tabletop games you already own. Discover game variants and custom rules that breathe new life into your collection.",
    },
    {
      icon: <BookOpen className="h-12 w-12 text-[#FF6B35]" />,
      title: "Learn New Game Rules",
      description: "Discover innovative game modifications and setup instructions that transform familiar board games into fresh, exciting experiences. Master creative gaming techniques."
    },
    {
      icon: <Upload className="h-12 w-12 text-[#FF6B35]" />,
      title: "Share Your Game Ideas",
      description: "Created a unique board game remix? Share your game invention and creative variants with our community of gaming innovators."
    },
    {
      icon: <Users className="h-12 w-12 text-[#FF6B35]" />,
      title: "Play with Friends",
      description: "Invite friends and family to enjoy your new tabletop game discoveries. Build lasting memories with creative board game combinations."
    },
  ]

  return (
    <section className="py-16 bg-[#004E89] text-white">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How <strong>Board Game Remixing</strong> Works</h2>
          <p className="text-lg max-w-2xl mx-auto text-gray-200">
            <strong>Remix Games</strong> makes it easy to breathe new life into your <strong>board game collection</strong> with <strong>creative combinations</strong> and <strong>innovative variants</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center bg-[#003e6e] p-6 rounded-lg shadow-lg">
              <div className="flex justify-center mb-4">{step.icon}</div>
              <h3 className="text-xl font-bold mb-2 text-[#FFBC42]">{step.title}</h3>
              <p className="text-gray-200">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
