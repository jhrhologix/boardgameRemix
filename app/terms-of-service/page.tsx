import Header from "@/components/header"
import Footer from "@/components/footer"
import Link from "next/link"

export default function TermsOfServicePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-black">
        {/* Hero Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-[#FF6B35] mb-6 text-center">
              Terms of Service
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto text-center">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </section>

        {/* Terms Content */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto prose prose-invert">
              <div className="bg-[#1a1a1a] p-8 rounded-lg mb-8">
                <h2 className="text-2xl font-bold text-[#FF6B35] mb-4">Agreement to Terms</h2>
                <div className="text-gray-300 space-y-4">
                  <p>
                    By accessing or using Remix Games, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.
                  </p>
                </div>
              </div>

              <div className="bg-[#1a1a1a] p-8 rounded-lg mb-8">
                <h2 className="text-2xl font-bold text-[#FF6B35] mb-4">User Accounts</h2>
                <div className="text-gray-300 space-y-4">
                  <p>When creating an account, you agree to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Provide accurate and complete information</li>
                    <li>Maintain the security of your account</li>
                    <li>Accept responsibility for all activities under your account</li>
                    <li>Not share your account credentials</li>
                    <li>Notify us immediately of any security breaches</li>
                  </ul>
                </div>
              </div>

              <div className="bg-[#1a1a1a] p-8 rounded-lg mb-8">
                <h2 className="text-2xl font-bold text-[#FF6B35] mb-4">Content Guidelines</h2>
                <div className="text-gray-300 space-y-4">
                  <p>When submitting content to Remix Games, you agree not to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Post false, misleading, or deceptive content</li>
                    <li>Violate intellectual property rights</li>
                    <li>Share inappropriate or offensive material</li>
                    <li>Engage in spamming or harassment</li>
                    <li>Attempt to manipulate the platform's features</li>
                  </ul>
                </div>
              </div>

              <div className="bg-[#1a1a1a] p-8 rounded-lg mb-8">
                <h2 className="text-2xl font-bold text-[#FF6B35] mb-4">Intellectual Property</h2>
                <div className="text-gray-300 space-y-4">
                  <p>
                    By submitting content to Remix Games, you grant us a non-exclusive, worldwide, royalty-free license to use, modify, publicly display, and distribute your content on our platform.
                  </p>
                  <p>
                    You retain all ownership rights to your content and are responsible for ensuring you have the necessary rights to share it.
                  </p>
                </div>
              </div>

              <div className="bg-[#1a1a1a] p-8 rounded-lg mb-8">
                <h2 className="text-2xl font-bold text-[#FF6B35] mb-4">Platform Rules</h2>
                <div className="text-gray-300 space-y-4">
                  <p>Users must not:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Attempt to bypass any platform security measures</li>
                    <li>Use automated systems to access the platform</li>
                    <li>Interfere with other users' access to the service</li>
                    <li>Collect user data without consent</li>
                    <li>Use the platform for illegal activities</li>
                  </ul>
                </div>
              </div>

              <div className="bg-[#1a1a1a] p-8 rounded-lg mb-8">
                <h2 className="text-2xl font-bold text-[#FF6B35] mb-4">Termination</h2>
                <div className="text-gray-300 space-y-4">
                  <p>
                    We reserve the right to terminate or suspend access to our service immediately, without prior notice, for any reason including, but not limited to, a breach of the Terms.
                  </p>
                  <p>
                    All provisions of the Terms which by their nature should survive termination shall survive termination.
                  </p>
                </div>
              </div>

              <div className="bg-[#1a1a1a] p-8 rounded-lg mb-8">
                <h2 className="text-2xl font-bold text-[#FF6B35] mb-4">Disclaimer</h2>
                <div className="text-gray-300 space-y-4">
                  <p>
                    Remix Games is provided "as is" without any warranties, expressed or implied. We do not warrant that the service will be uninterrupted or error-free.
                  </p>
                </div>
              </div>

              <div className="bg-[#1a1a1a] p-8 rounded-lg mb-8">
                <h2 className="text-2xl font-bold text-[#FF6B35] mb-4">Limitation of Liability</h2>
                <div className="text-gray-300 space-y-4">
                  <p>
                    In no event shall Remix Games be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the service.
                  </p>
                </div>
              </div>

              <div className="bg-[#1a1a1a] p-8 rounded-lg">
                <h2 className="text-2xl font-bold text-[#FF6B35] mb-4">Contact Information</h2>
                <div className="text-gray-300 space-y-4">
                  <p>
                    If you have any questions about these Terms, please contact us at{' '}
                    <a href="mailto:legal@remixgames.com" className="text-[#FF6B35] hover:text-[#e55a2a]">
                      legal@remixgames.com
                    </a>
                    {' '}or through our{' '}
                    <Link href="/contact" className="text-[#FF6B35] hover:text-[#e55a2a]">
                      contact form
                    </Link>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
} 