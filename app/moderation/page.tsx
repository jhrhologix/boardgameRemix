import { ModerationQueue } from '@/components/moderation-queue';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function ModerationPage() {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect('/auth/login');
  }

  // Check if user is admin or moderator
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || (profile.role !== 'admin' && profile.role !== 'moderator')) {
    redirect('/');
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Content Moderation</h1>
        <p className="text-muted-foreground mt-2">
          Review and moderate user-generated content
        </p>
      </div>
      
      <ModerationQueue />
    </div>
  );
}
