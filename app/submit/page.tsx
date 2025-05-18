import Header from "@/components/header"
import Footer from "@/components/footer"
import SubmitRemixForm from "@/components/submit-remix-form"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function SubmitPage({
  searchParams,
}: {
  searchParams: { edit?: string }
}) {
  const supabase = await createClient()
  
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth?callbackUrl=/submit")
  }

  // If editing, verify the user owns the remix
  if (searchParams.edit) {
    const { data: remix } = await supabase
      .from('remixes')
      .select('user_id')
      .eq('id', searchParams.edit)
      .single()

    if (!remix || remix.user_id !== session.user.id) {
      redirect('/my-remixes')
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FFF8F0] py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-[#004E89] mb-6">
            {searchParams.edit ? "Edit Game Remix" : "Submit a Game Remix"}
          </h1>
          <div className="bg-white rounded-lg shadow-md p-6">
            <SubmitRemixForm 
              userId={session.user.id} 
              remixId={searchParams.edit}
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
