import Header from "@/components/header"
import Footer from "@/components/footer"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export default function ForgotPasswordPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-black py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Forgot Password
                </h1>
                <p className="text-gray-600">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>
              
              <ForgotPasswordForm />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
