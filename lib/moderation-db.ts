import { createClient } from './supabase/server';
import { ModerationResult } from './ai-moderation';

export interface ModerationQueueItem {
  id: string;
  content_type: 'remix' | 'comment' | 'edit';
  content_id: string;
  user_id: string;
  content_data: any;
  ai_analysis?: any;
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  moderator_id?: string;
  moderator_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface UserFlag {
  id: string;
  user_id: string;
  flag_type: 'spam' | 'promotional' | 'low_quality' | 'ai_generated' | 'inappropriate';
  content_id?: string;
  content_type?: string;
  flag_count: number;
  last_flagged_at: string;
  created_at: string;
  updated_at: string;
}

/**
 * Add content to moderation queue
 */
export async function addToModerationQueue(
  contentType: 'remix' | 'comment' | 'edit',
  contentId: string,
  userId: string,
  contentData: any,
  aiAnalysis?: ModerationResult
): Promise<string | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('moderation_queue')
    .insert({
      content_type: contentType,
      content_id: contentId,
      user_id: userId,
      content_data: contentData,
      ai_analysis: aiAnalysis,
      status: 'pending'
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error adding to moderation queue:', error);
    return null;
  }

  return data.id;
}

/**
 * Get pending moderation queue items
 */
export async function getPendingModerationItems(limit = 50): Promise<ModerationQueueItem[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('moderation_queue')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Error fetching moderation queue:', error);
    return [];
  }

  return data || [];
}

/**
 * Update moderation queue item status
 */
export async function updateModerationStatus(
  queueId: string,
  status: 'approved' | 'rejected' | 'escalated',
  moderatorId: string,
  notes?: string
): Promise<boolean> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('moderation_queue')
    .update({
      status,
      moderator_id: moderatorId,
      moderator_notes: notes,
      updated_at: new Date().toISOString()
    })
    .eq('id', queueId);

  if (error) {
    console.error('Error updating moderation status:', error);
    return false;
  }

  return true;
}

/**
 * Get user role
 */
export async function getUserRole(userId: string): Promise<string | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user role:', error);
    return null;
  }

  return data?.role || 'user';
}

/**
 * Check if user should bypass moderation
 */
export async function shouldBypassModeration(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === 'admin' || role === 'moderator';
}

/**
 * Record user flag
 */
export async function recordUserFlag(
  userId: string,
  flagType: 'spam' | 'promotional' | 'low_quality' | 'ai_generated' | 'inappropriate',
  contentId?: string,
  contentType?: string
): Promise<boolean> {
  const supabase = await createClient();
  
  // Check if flag already exists
  const { data: existingFlag } = await supabase
    .from('user_flags')
    .select('*')
    .eq('user_id', userId)
    .eq('flag_type', flagType)
    .eq('content_id', contentId || '')
    .eq('content_type', contentType || '')
    .single();

  if (existingFlag) {
    // Update existing flag count
    const { error } = await supabase
      .from('user_flags')
      .update({
        flag_count: existingFlag.flag_count + 1,
        last_flagged_at: new Date().toISOString()
      })
      .eq('id', existingFlag.id);

    if (error) {
      console.error('Error updating user flag:', error);
      return false;
    }
  } else {
    // Create new flag
    const { error } = await supabase
      .from('user_flags')
      .insert({
        user_id: userId,
        flag_type: flagType,
        content_id: contentId,
        content_type: contentType,
        flag_count: 1
      });

    if (error) {
      console.error('Error creating user flag:', error);
      return false;
    }
  }

  return true;
}

/**
 * Get user flag history
 */
export async function getUserFlagHistory(userId: string): Promise<UserFlag[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('user_flags')
    .select('*')
    .eq('user_id', userId)
    .order('last_flagged_at', { ascending: false });

  if (error) {
    console.error('Error fetching user flag history:', error);
    return [];
  }

  return data || [];
}

/**
 * Check if user is flagged for escalation
 */
export async function shouldEscalateUser(userId: string): Promise<boolean> {
  const flags = await getUserFlagHistory(userId);
  
  // Escalate if user has multiple flags in the last 24 hours
  const recentFlags = flags.filter(flag => {
    const flagTime = new Date(flag.last_flagged_at);
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return flagTime > dayAgo;
  });

  const totalRecentFlags = recentFlags.reduce((sum, flag) => sum + flag.flag_count, 0);
  
  // Escalate if more than 3 flags in 24 hours or any spam flags
  return totalRecentFlags > 3 || flags.some(flag => flag.flag_type === 'spam');
}

/**
 * Save AI analysis results
 */
export async function saveAIAnalysis(
  contentId: string,
  contentType: string,
  analysis: ModerationResult
): Promise<boolean> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('ai_analysis')
    .insert({
      content_id: contentId,
      content_type: contentType,
      analysis_data: analysis,
      content_score: analysis.contentScore,
      decision: analysis.decision,
      spam_risk: analysis.spamRisk,
      quality_score: analysis.qualityScore,
      ai_detected: analysis.aiDetected,
      anthropic_flag: analysis.anthropicFlag
    });

  if (error) {
    console.error('Error saving AI analysis:', error);
    return false;
  }

  return true;
}

/**
 * Get moderation statistics
 */
export async function getModerationStats(): Promise<{
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  escalatedCount: number;
  totalFlags: number;
}> {
  const supabase = await createClient();
  
  const [queueResult, flagsResult] = await Promise.all([
    supabase
      .from('moderation_queue')
      .select('status'),
    supabase
      .from('user_flags')
      .select('flag_count')
  ]);

  const queueData = queueResult.data || [];
  const flagsData = flagsResult.data || [];

  const stats = {
    pendingCount: queueData.filter(item => item.status === 'pending').length,
    approvedCount: queueData.filter(item => item.status === 'approved').length,
    rejectedCount: queueData.filter(item => item.status === 'rejected').length,
    escalatedCount: queueData.filter(item => item.status === 'escalated').length,
    totalFlags: flagsData.reduce((sum, flag) => sum + flag.flag_count, 0)
  };

  return stats;
}
