import { Search, BookOpen, Upload, Users } from "lucide-react"

export default function HowItWorks() {
  const steps = [
    {
      icon: <Search className="h-12 w-12 text-[#FF6B35]" />,
      title: "Find Remixes",
      description: "Search for game remixes based on the board games you already own at home.",
    },
    {
      icon: <BookOpen className="h-12 w-12 text-[#FF6B35]" />,
      title: "Learn New Rules",
      description: "Discover new rules and setups that transform familiar games into fresh experiences.",
    },
    {
      icon: <Upload className="h-12 w-12 text-[#FF6B35]" />,
      title: "Submit Your Ideas",
      description: "Created a unique remix? Share your game invention with our community.",
    },
    {
      icon: <Users className="h-12 w-12 text-[#FF6B35]" />,
      title: "Play Together",
      description: "Invite friends and family to enjoy your new game discoveries.",
    },
  ]

  return (
    <section className="py-16 bg-[#004E89] text-white">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-lg max-w-2xl mx-auto text-gray-200">
            Remix Games makes it easy to breathe new life into your board game collection
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
