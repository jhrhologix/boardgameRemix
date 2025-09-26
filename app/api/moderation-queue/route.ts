import { NextRequest, NextResponse } from 'next/server';
import { 
  getPendingModerationItems, 
  updateModerationStatus,
  getUserRole,
  getModerationStats
} from '@/lib/moderation-db';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin or moderator
    const userRole = await getUserRole(user.id);
    if (userRole !== 'admin' && userRole !== 'moderator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const stats = searchParams.get('stats') === 'true';

    if (stats) {
      const moderationStats = await getModerationStats();
      return NextResponse.json(moderationStats);
    }

    const queueItems = await getPendingModerationItems(limit);
    
    return NextResponse.json({
      items: queueItems,
      count: queueItems.length
    });

  } catch (error) {
    console.error('Moderation queue error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin or moderator
    const userRole = await getUserRole(user.id);
    if (userRole !== 'admin' && userRole !== 'moderator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { queueId, status, notes } = body;

    if (!queueId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['approved', 'rejected', 'escalated'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const success = await updateModerationStatus(queueId, status, user.id, notes);
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Moderation update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
