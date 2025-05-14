import Header from "@/components/header"
import Footer from "@/components/footer"
import SubmitRemixForm from "@/components/submit-remix-form"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function SubmitPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login?callbackUrl=/submit")
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FFF8F0] py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-[#004E89] mb-6">Submit a Game Remix</h1>
          <div className="bg-white rounded-lg shadow-md p-6">
            <SubmitRemixForm userId={session.user.id} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
