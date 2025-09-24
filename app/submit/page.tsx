import Header from "@/components/header"
import Footer from "@/components/footer"
import SubmitPageWrapper from "@/components/submit-page-wrapper"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { generateSubmitMetadata } from "@/lib/seo"
import type { Metadata } from "next"

export const metadata: Metadata = generateSubmitMetadata()

export default async function SubmitPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  const editId = params?.edit
  
  // Use getSession() for better reliability in production
  const { data: { session }, error } = await supabase.auth.getSession()
  const user = session?.user

  // If no session or user, redirect to auth
  if (!session || !user || error) {
    redirect("/auth?callbackUrl=/submit")
  }

  // If editing, verify the user owns the remix
  if (editId) {
    const { data: remix } = await supabase
      .from('remixes')
      .select('user_id')
      .eq('id', editId)
      .single()

    if (!remix || remix.user_id !== user.id) {
      redirect('/my-remixes')
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FFF8F0] py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-[#004E89] mb-6">
            {editId ? "Edit Game Remix" : "Submit a Game Remix"}
          </h1>
          <div className="bg-white rounded-lg shadow-md p-6">
            <SubmitPageWrapper 
              userId={user.id} 
              remixId={editId}
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
