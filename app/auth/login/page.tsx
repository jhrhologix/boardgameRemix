import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-black py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-[#1a1a1a] p-8 rounded-lg shadow-md border border-[#333]">
            <h1 className="text-2xl font-bold text-[#FF6B35] mb-6 text-center">Log in to Remix Games</h1>

            <form action="/auth/login" method="post" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input id="email" name="email" type="email" required className="bg-[#2a2a2a] text-white border-[#333]" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-white">Password</Label>
                  <Link href="/auth/forgot-password" className="text-sm text-[#FF6B35] hover:text-[#e55a2a]">
                    Forgot password?
                  </Link>
                </div>
                <Input id="password" name="password" type="password" required className="bg-[#2a2a2a] text-white border-[#333]" />
              </div>

              <Button type="submit" className="w-full bg-[#FF6B35] hover:bg-[#e55a2a] text-white">
                Log in
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Don't have an account?{" "}
                <Link href="/auth/signup" className="text-[#FF6B35] hover:text-[#e55a2a]">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
