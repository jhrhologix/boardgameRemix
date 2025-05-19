import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, MessageSquare, AlertCircle, HelpCircle } from "lucide-react"

export default function ContactPage() {
  const contactReasons = [
    {
      icon: <HelpCircle className="h-8 w-8 text-[#FF6B35]" />,
      title: "General Inquiries",
      description: "Questions about our platform or how things work",
    },
    {
      icon: <AlertCircle className="h-8 w-8 text-[#FF6B35]" />,
      title: "Report an Issue",
      description: "Technical problems or bugs you've encountered",
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-[#FF6B35]" />,
      title: "Feedback & Suggestions",
      description: "Share your ideas for improving Remix Games",
    },
    {
      icon: <Mail className="h-8 w-8 text-[#FF6B35]" />,
      title: "Business Inquiries",
      description: "Partnership opportunities and business-related matters",
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
              Contact Us
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Have a question or feedback? We'd love to hear from you. Choose a topic below or use our contact form.
            </p>
          </div>
        </section>

        {/* Contact Reasons */}
        <section className="py-16 px-4 bg-[#1a1a1a]">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {contactReasons.map((reason, index) => (
                <div key={index} className="bg-black p-6 rounded-lg text-center">
                  <div className="flex justify-center mb-4">{reason.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{reason.title}</h3>
                  <p className="text-gray-300">{reason.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="max-w-2xl mx-auto bg-[#1a1a1a] p-8 rounded-lg">
              <h2 className="text-2xl font-bold text-[#FF6B35] mb-6">Send Us a Message</h2>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-white">Name</label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      className="bg-black border-[#333] text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-white">Email</label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      className="bg-black border-[#333] text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-white">Subject</label>
                  <Input
                    id="subject"
                    placeholder="What's this about?"
                    className="bg-black border-[#333] text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-white">Message</label>
                  <Textarea
                    id="message"
                    placeholder="Your message..."
                    className="bg-black border-[#333] text-white min-h-[150px]"
                  />
                </div>

                <Button className="w-full bg-[#FF6B35] hover:bg-[#e55a2a] text-white">
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </section>

        {/* Additional Contact Info */}
        <section className="py-16 px-4 bg-[#1a1a1a]">
          <div className="container mx-auto text-center">
            <h2 className="text-2xl font-bold text-[#FF6B35] mb-6">Other Ways to Reach Us</h2>
            <div className="max-w-2xl mx-auto">
              <p className="text-gray-300 mb-4">
                For urgent matters or if you prefer email, you can reach us directly at:
              </p>
              <a
                href="mailto:support@remixgames.com"
                className="text-[#FF6B35] hover:text-[#e55a2a] font-medium text-lg"
              >
                support@remixgames.com
              </a>
              <p className="text-gray-300 mt-6">
                We aim to respond to all inquiries within 24-48 hours during business days.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
} 