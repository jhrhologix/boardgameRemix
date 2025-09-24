import Header from "@/components/header"
import Footer from "@/components/footer"

export default function SettingsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-black py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Settings
                </h1>
                <p className="text-gray-600">
                  Manage your account settings and preferences.
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="border rounded-lg p-4">
                  <h2 className="text-xl font-semibold mb-2">Account Settings</h2>
                  <p className="text-gray-600">Account management features coming soon.</p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h2 className="text-xl font-semibold mb-2">Privacy Settings</h2>
                  <p className="text-gray-600">Privacy controls coming soon.</p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h2 className="text-xl font-semibold mb-2">Notifications</h2>
                  <p className="text-gray-600">Notification preferences coming soon.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
