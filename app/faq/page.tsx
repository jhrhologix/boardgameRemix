import Header from "@/components/header"
import Footer from "@/components/footer"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function FAQPage() {
  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          q: "What is Remix Games?",
          a: "Remix Games is a platform where board game enthusiasts can discover and share new ways to play with board games they already own. Users can browse remixes created by the community or submit their own creative game variations."
        },
        {
          q: "Do I need an account to use Remix Games?",
          a: "While you can browse remixes without an account, you'll need to create one to submit your own remixes, vote on others' remixes, or save favorites to your profile."
        },
        {
          q: "Is Remix Games free to use?",
          a: "Yes! Remix Games is completely free to use. We believe in making creative gaming accessible to everyone."
        }
      ]
    },
    {
      category: "Using Remixes",
      questions: [
        {
          q: "How do I find remixes for games I own?",
          a: "You can use the search function on our browse page to find remixes for specific games, or filter by game title. You can also discover remixes by browsing popular categories and tags."
        },
        {
          q: "Can I save remixes to try later?",
          a: "Yes! Once you're logged in, you can click the heart icon on any remix to save it to your favorites for easy access later."
        },
        {
          q: "What if I don't understand a remix's rules?",
          a: "You can ask questions in the comments section of any remix. Our community is helpful and creators are usually happy to clarify their rules."
        }
      ]
    },
    {
      category: "Creating Remixes",
      questions: [
        {
          q: "How do I submit a remix?",
          a: "After logging in, click the 'Submit a Remix' button. You'll need to provide the game(s) required, detailed instructions, estimated play time, and player count. Make sure to test your remix before submitting!"
        },
        {
          q: "Can I edit my remix after submitting?",
          a: "Yes, you can edit your remixes at any time. Just go to your profile and find the remix you want to update."
        },
        {
          q: "What makes a good remix?",
          a: "Good remixes are clear, well-tested, and add something interesting to the original game. Include all necessary information and consider adding tips for smooth gameplay."
        }
      ]
    },
    {
      category: "Community & Support",
      questions: [
        {
          q: "How can I report inappropriate content?",
          a: "Use the report button on any remix or comment that violates our community guidelines. Our moderation team will review all reports promptly."
        },
        {
          q: "Can I suggest features for the platform?",
          a: "Absolutely! We welcome feedback and suggestions. Use our contact form to share your ideas for improving Remix Games."
        },
        {
          q: "How can I get more involved in the community?",
          a: "Share your remixes, comment on others' submissions, join discussions, and follow our social media channels for updates and community events."
        }
      ]
    }
  ]

  return (
    <>
      <Header />
      <main className="min-h-screen bg-black">
        {/* Hero Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-[#FF6B35] mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Find answers to common questions about Remix Games. Can't find what you're looking for?
            </p>
            <Link href="/contact">
              <Button className="bg-[#FF6B35] hover:bg-[#e55a2a] text-white">
                Contact Us
              </Button>
            </Link>
          </div>
        </section>

        {/* FAQ Sections */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              {faqs.map((section, index) => (
                <div key={index} className="mb-12">
                  <h2 className="text-2xl font-bold text-[#FF6B35] mb-6">{section.category}</h2>
                  <div className="space-y-6">
                    {section.questions.map((faq, faqIndex) => (
                      <div key={faqIndex} className="bg-[#1a1a1a] p-6 rounded-lg">
                        <h3 className="text-xl font-bold text-white mb-3">{faq.q}</h3>
                        <p className="text-gray-300">{faq.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Still Need Help Section */}
        <section className="py-16 px-4 bg-[#1a1a1a]">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold text-[#FF6B35] mb-6">Still Need Help?</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button className="bg-[#FF6B35] hover:bg-[#e55a2a] text-white px-8">
                  Contact Support
                </Button>
              </Link>
              <Link href="/community-guidelines">
                <Button variant="outline" className="text-[#FF6B35] border-[#FF6B35] hover:bg-[#FF6B35] hover:text-white px-8">
                  View Guidelines
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