import Header from "@/components/header"
import Footer from "@/components/footer"
import Link from "next/link"

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-black">
        {/* Hero Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-[#FF6B35] mb-6 text-center">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto text-center">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </section>

        {/* Policy Content */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto prose prose-invert">
              <div className="bg-[#1a1a1a] p-8 rounded-lg mb-8">
                <h2 className="text-2xl font-bold text-[#FF6B35] mb-4">Introduction</h2>
                <p className="text-gray-300">
                  At Remix Games, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
                </p>
              </div>

              <div className="bg-[#1a1a1a] p-8 rounded-lg mb-8">
                <h2 className="text-2xl font-bold text-[#FF6B35] mb-4">Information We Collect</h2>
                <div className="text-gray-300 space-y-4">
                  <h3 className="text-xl font-bold text-white">Personal Information</h3>
                  <p>We may collect personal information that you voluntarily provide to us when you:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Register for an account</li>
                    <li>Sign up for our newsletter</li>
                    <li>Submit a game remix</li>
                    <li>Contact us through our contact form</li>
                    <li>Participate in community discussions</li>
                  </ul>

                  <h3 className="text-xl font-bold text-white mt-6">Automatically Collected Information</h3>
                  <p>When you visit our website, we automatically collect certain information about your device, including:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Browser type and version</li>
                    <li>Operating system</li>
                    <li>IP address</li>
                    <li>Pages visited and time spent</li>
                    <li>Referral sources</li>
                  </ul>
                </div>
              </div>

              <div className="bg-[#1a1a1a] p-8 rounded-lg mb-8">
                <h2 className="text-2xl font-bold text-[#FF6B35] mb-4">How We Use Your Information</h2>
                <div className="text-gray-300 space-y-4">
                  <p>We use the information we collect to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Provide and maintain our services</li>
                    <li>Improve user experience</li>
                    <li>Send you updates and newsletters (if subscribed)</li>
                    <li>Respond to your inquiries</li>
                    <li>Monitor and analyze usage patterns</li>
                    <li>Prevent fraudulent activities</li>
                  </ul>
                </div>
              </div>

              <div className="bg-[#1a1a1a] p-8 rounded-lg mb-8">
                <h2 className="text-2xl font-bold text-[#FF6B35] mb-4">Information Sharing</h2>
                <div className="text-gray-300 space-y-4">
                  <p>We may share your information with:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Service providers who assist in our operations</li>
                    <li>Law enforcement when required by law</li>
                    <li>Other users (only your public profile information)</li>
                  </ul>
                  <p>We will never sell your personal information to third parties.</p>
                </div>
              </div>

              <div className="bg-[#1a1a1a] p-8 rounded-lg mb-8">
                <h2 className="text-2xl font-bold text-[#FF6B35] mb-4">Cookies and Tracking</h2>
                <div className="text-gray-300 space-y-4">
                  <p>
                    We use cookies and similar tracking technologies to track activity on our website and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                  </p>
                  <p>
                    We use both session cookies (which expire when you close your browser) and persistent cookies (which stay on your device until you delete them) to provide you with a more personal and interactive experience on our site.
                  </p>
                </div>
              </div>

              <div className="bg-[#1a1a1a] p-8 rounded-lg mb-8">
                <h2 className="text-2xl font-bold text-[#FF6B35] mb-4">Data Security</h2>
                <div className="text-gray-300 space-y-4">
                  <p>
                    We implement appropriate technical and organizational security measures to protect your information. However, no electronic transmission over the internet or information storage technology can be guaranteed to be 100% secure.
                  </p>
                </div>
              </div>

              <div className="bg-[#1a1a1a] p-8 rounded-lg mb-8">
                <h2 className="text-2xl font-bold text-[#FF6B35] mb-4">Your Rights</h2>
                <div className="text-gray-300 space-y-4">
                  <p>You have the right to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Access your personal information</li>
                    <li>Correct inaccurate information</li>
                    <li>Request deletion of your information</li>
                    <li>Opt-out of marketing communications</li>
                    <li>Object to processing of your information</li>
                  </ul>
                </div>
              </div>

              <div className="bg-[#1a1a1a] p-8 rounded-lg">
                <h2 className="text-2xl font-bold text-[#FF6B35] mb-4">Contact Us</h2>
                <div className="text-gray-300 space-y-4">
                  <p>
                    If you have any questions about this Privacy Policy, please contact us at{' '}
                    <a href="mailto:privacy@remixgames.com" className="text-[#FF6B35] hover:text-[#e55a2a]">
                      privacy@remixgames.com
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