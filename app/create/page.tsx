import { redirect } from 'next/navigation'

// Redirect /create to /submit for user convenience
export default function CreatePage() {
  redirect('/submit')
}
