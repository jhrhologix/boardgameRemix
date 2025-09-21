import { redirect } from 'next/navigation'

interface EditRedirectPageProps {
  params: Promise<{ id: string }>
}

export default async function EditRedirectPage({ params }: EditRedirectPageProps) {
  const resolvedParams = await params
  // Redirect to the correct edit URL
  redirect(`/submit?edit=${resolvedParams.id}`)
}
