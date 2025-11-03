import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | Board Game Remix",
  description: "Privacy policy and data handling practices for Board Game Remix",
}

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      
      {/* Affiliate Disclosure - Temporarily Removed */}
      {/* <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Affiliate Disclosure</h2>
        <p className="mb-4">
          Board Game Remix is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com.
        </p>
        <p className="mb-4">
          This means that when you click on certain links to products on our site and make a purchase on Amazon, we may earn a small commission at no additional cost to you. These affiliate relationships help support the operation of our website.
        </p>
        <p className="mb-4">
          We only recommend products that we believe will be valuable to our users, and our affiliate relationships do not influence our product recommendations or reviews. All opinions expressed on this site are our own.
        </p>
      </section> */}

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
        <p className="mb-4">
          We collect information that you voluntarily provide to us when you:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Create an account</li>
          <li>Submit a game remix</li>
          <li>Leave comments or reviews</li>
          <li>Subscribe to our newsletter</li>
          <li>Contact us through our support channels</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
        <p className="mb-4">
          We use the information we collect to:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Provide and maintain our services</li>
          <li>Improve user experience</li>
          <li>Send you updates and newsletters (if subscribed)</li>
          <li>Respond to your inquiries</li>
          <li>Monitor and analyze usage patterns</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
        <p className="mb-4">
          We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Cookies and Tracking</h2>
        <p className="mb-4">
          We use cookies and similar tracking technologies to track activity on our website and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Third-Party Services</h2>
        <p className="mb-4">
          Our service may contain links to third-party websites or services that are not owned or controlled by Board Game Remix. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
        <p className="mb-4">
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "last updated" date.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
        <p className="mb-4">
          If you have any questions about this Privacy Policy, please contact us through our support channels.
        </p>
      </section>
    </div>
  )
} 