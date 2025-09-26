import { NextRequest, NextResponse } from 'next/server';
import { moderateContent, moderateImages } from '@/lib/ai-moderation';
import { 
  addToModerationQueue, 
  shouldBypassModeration, 
  saveAIAnalysis,
  shouldEscalateUser,
  recordUserFlag
} from '@/lib/moderation-db';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      contentType, 
      contentId, 
      title, 
      description, 
      rules, 
      comment,
      imageUrls = []
    } = body;

    if (!contentType || !contentId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user should bypass moderation
    const bypassModeration = await shouldBypassModeration(user.id);
    
    if (bypassModeration) {
      return NextResponse.json({
        approved: true,
        bypassed: true,
        reason: 'Admin/Moderator bypass'
      });
    }

    // Check if user should be escalated
    const shouldEscalate = await shouldEscalateUser(user.id);
    
    // Perform AI moderation
    const moderationResult = await moderateContent({
      title,
      description,
      rules,
      comment,
      contentType,
      userId: user.id,
      userRole: 'user' // Will be fetched in the function
    });

    // Moderate images if provided
    let imageModeration = null;
    if (imageUrls.length > 0) {
      imageModeration = await moderateImages(imageUrls);
      
      // If images contain spam, override decision
      if (imageModeration.hasSpam) {
        moderationResult.decision = 'REJECT';
        moderationResult.spamRisk = 'HIGH';
        moderationResult.reasoning.push('Spam detected in images');
      }
    }

    // Save AI analysis
    await saveAIAnalysis(contentId, contentType, moderationResult);

    // Handle decision
    if (moderationResult.decision === 'APPROVE') {
      return NextResponse.json({
        approved: true,
        moderationResult,
        imageModeration
      });
    }

    // For REVIEW or REJECT, add to moderation queue
    const queueId = await addToModerationQueue(
      contentType,
      contentId,
      user.id,
      {
        title,
        description,
        rules,
        comment,
        imageUrls
      },
      moderationResult
    );

    // Record user flag if rejected
    if (moderationResult.decision === 'REJECT') {
      let flagType: 'spam' | 'promotional' | 'low_quality' | 'ai_generated' | 'inappropriate' = 'low_quality';
      
      if (moderationResult.spamRisk === 'HIGH') {
        flagType = 'spam';
      } else if (moderationResult.anthropicFlag) {
        flagType = 'ai_generated';
      }
      
      await recordUserFlag(user.id, flagType, contentId, contentType);
    }

    // Escalate if user has multiple flags
    if (shouldEscalate) {
      // Update queue item to escalated status
      if (queueId) {
        // This would require updating the moderation queue item
        // For now, we'll handle this in the response
      }
    }

    return NextResponse.json({
      approved: false,
      moderationResult,
      imageModeration,
      queueId,
      escalated: shouldEscalate,
      message: getModerationMessage(moderationResult, shouldEscalate)
    });

  } catch (error) {
    console.error('Moderation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

function getModerationMessage(result: any, escalated: boolean): string {
  if (escalated) {
    return 'Your content has been flagged for manual review due to multiple previous violations. A moderator will review it shortly.';
  }

  switch (result.decision) {
    case 'REVIEW':
      return 'Your content is under review by our moderation team. You will be notified once it\'s approved.';
    case 'REJECT':
      if (result.spamRisk === 'HIGH') {
        return 'Your content was rejected due to promotional or spam content. Please ensure your submission focuses on genuine board game remixes.';
      } else if (result.qualityScore < 4) {
        return 'Your content was rejected due to insufficient quality. Please provide more detailed rules and setup instructions.';
      } else {
        return 'Your content was rejected. Please review our community guidelines and try again.';
      }
    default:
      return 'Your content is being processed.';
  }
}
