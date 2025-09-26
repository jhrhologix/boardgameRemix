import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ModerationResult {
  contentScore: number;
  decision: 'APPROVE' | 'REVIEW' | 'REJECT';
  spamRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  qualityScore: number;
  aiDetected: boolean;
  anthropicFlag: boolean;
  reasoning: string[];
  recommendedAction: string;
}

export interface ModerationInput {
  title?: string;
  description?: string;
  rules?: string;
  comment?: string;
  contentType: 'remix' | 'comment' | 'edit';
  userId: string;
  userRole?: string;
}

/**
 * Main AI moderation function using Claude Haiku 3.5
 * Analyzes content for quality, spam, and promotional content
 */
export async function moderateContent(input: ModerationInput): Promise<ModerationResult> {
  // Skip moderation for admins and moderators
  if (input.userRole === 'admin' || input.userRole === 'moderator') {
    return {
      contentScore: 100,
      decision: 'APPROVE',
      spamRisk: 'LOW',
      qualityScore: 10,
      aiDetected: false,
      anthropicFlag: false,
      reasoning: ['Admin/Moderator bypass - no moderation required'],
      recommendedAction: 'Publish immediately'
    };
  }

  try {
    const content = buildContentString(input);
    const prompt = buildModerationPrompt(content, input.contentType);

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      temperature: 0.1,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const analysisText = response.content[0].type === 'text' ? response.content[0].text : '';
    return parseModerationResponse(analysisText);
  } catch (error) {
    console.error('AI moderation error:', error);
    // Fallback to manual review on AI failure
    return {
      contentScore: 50,
      decision: 'REVIEW',
      spamRisk: 'MEDIUM',
      qualityScore: 5,
      aiDetected: false,
      anthropicFlag: false,
      reasoning: ['AI analysis failed - manual review required'],
      recommendedAction: 'Human moderator review required'
    };
  }
}

/**
 * Analyze images for promotional content, URLs, and spam
 */
export async function moderateImages(imageUrls: string[]): Promise<{
  hasSpam: boolean;
  detectedText: string[];
  urls: string[];
  businessLogos: boolean;
  recommendedAction: string;
}> {
  if (imageUrls.length === 0) {
    return {
      hasSpam: false,
      detectedText: [],
      urls: [],
      businessLogos: false,
      recommendedAction: 'No images to analyze'
    };
  }

  try {
    const prompt = `ANALYZE THESE IMAGES FOR:
1. Any readable text (provide full transcription)
2. URLs, social media handles, contact information
3. Business names, logos, promotional material
4. QR codes or suspicious graphics
5. Does image actually show board game setup?

Images to analyze: ${imageUrls.join(', ')}

FLAG IF FOUND:
- Contact information
- Website URLs
- Social media promotion
- Business/product advertising
- No actual game components visible

Respond with JSON format:
{
  "hasSpam": boolean,
  "detectedText": [string],
  "urls": [string],
  "businessLogos": boolean,
  "gameSetupVisible": boolean,
  "recommendedAction": string
}`;

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      temperature: 0.1,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt
          },
          ...imageUrls.map(url => ({
            type: 'image',
            source: {
              type: 'url',
              url: url
            }
          }))
        ]
      }]
    });

    const analysisText = response.content[0].type === 'text' ? response.content[0].text : '';
    return parseImageAnalysisResponse(analysisText);
  } catch (error) {
    console.error('Image moderation error:', error);
    return {
      hasSpam: false,
      detectedText: [],
      urls: [],
      businessLogos: false,
      recommendedAction: 'Image analysis failed - manual review recommended'
    };
  }
}

function buildContentString(input: ModerationInput): string {
  let content = '';
  
  if (input.title) content += `TITLE: ${input.title}\n\n`;
  if (input.description) content += `DESCRIPTION: ${input.description}\n\n`;
  if (input.rules) content += `RULES: ${input.rules}\n\n`;
  if (input.comment) content += `COMMENT: ${input.comment}\n\n`;
  
  return content.trim();
}

function buildModerationPrompt(content: string, contentType: string): string {
  return `You are the AI moderator for remix.games, a platform for board game remixes. Your job is to evaluate user submissions for quality, legitimacy, and spam detection while ensuring genuine creative content gets approved.

EVALUATION FRAMEWORK:

🎯 PRIMARY OBJECTIVES
1. Validate Ruleset Quality - Ensure remixes are complete, playable, and well-explained
2. Detect Self-Promotion - Block promotional content disguised as remixes  
3. Verify Game Authenticity - Confirm remixes use real, existing board games
4. Spam Protection - Catch low-effort, duplicate, or malicious submissions
5. AI Content Recognition - Allow legitimate AI-assisted content while blocking AI spam

CONTENT TO ANALYZE:
${content}

CONTENT TYPE: ${contentType}

QUALITY INDICATORS (APPROVE):
- Complete Setup Instructions: Clear step-by-step setup process
- Comprehensive Rules: All mechanics explained, edge cases covered
- Component List: Specific pieces needed from each game listed
- Victory Conditions: Clear win/loss conditions defined
- Play Experience: Estimated time, player count, complexity level
- Balance Consideration: Shows thought about game balance/fairness
- Unique Mechanics: Combines games in interesting, novel ways
- Testing Evidence: Mentions playtesting, iterations, or refinements

SPAM & SELF-PROMOTION RED FLAGS (AUTO-REJECT):
- Direct Sales Language: "Buy," "Purchase," "Available now," "Order here"
- Kickstarter/Crowdfunding: Links or mentions of funding campaigns
- Business Promotion: Company names, website URLs (except game references)
- Contact Information: Phone numbers, email addresses, social media handles
- Call-to-Action: "Check out my," "Visit my," "Support my," "Follow me"
- External Links: URLs that aren't to BoardGameGeek or major game databases

AI CONTENT HANDLING:
APPROVE IF:
- High Quality Output: Well-structured, comprehensive, clearly AI-assisted but valuable
- Human Curation Evident: Shows personal testing, modification, or experience
- Genuine Creativity: Novel combinations that show thought and creativity
- Claude Attribution: Mentions "Claude," "AI assistance," or similar (transparency bonus)

FLAG FOR REVIEW IF:
- Generic AI Patterns: Very structured, template-like language without personalization
- No Human Input: Purely generated content without personal touches
- Mass Production Signs: Multiple similar AI-generated submissions from same user

REQUIRED OUTPUT FORMAT:
\`\`\`
CONTENT_SCORE: [0-100]
DECISION: [APPROVE/REVIEW/REJECT]  
SPAM_RISK: [LOW/MEDIUM/HIGH]
QUALITY_SCORE: [0-10]
AI_DETECTED: [YES/NO]
ANTHROPIC_FLAG: [YES/NO]

REASONING:
- [Brief explanation of decision]
- [Key factors that influenced score]
- [Specific concerns or highlights]

RECOMMENDED_ACTION:
[What should happen next]
\`\`\`

DECISION THRESHOLDS:
- CONTENT_SCORE 80-100: Auto-approve (unless SPAM_RISK = HIGH)
- CONTENT_SCORE 60-79: Flag for human review  
- CONTENT_SCORE 0-59: Auto-reject
- ANTHROPIC_FLAG = YES: Always flag for human approval regardless of score
- SPAM_RISK = HIGH: Always flag/reject regardless of quality`;
}

function parseModerationResponse(response: string): ModerationResult {
  const lines = response.split('\n');
  let contentScore = 50;
  let decision: 'APPROVE' | 'REVIEW' | 'REJECT' = 'REVIEW';
  let spamRisk: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';
  let qualityScore = 5;
  let aiDetected = false;
  let anthropicFlag = false;
  let reasoning: string[] = [];
  let recommendedAction = 'Manual review required';

  let inReasoning = false;
  let inRecommendedAction = false;

  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('CONTENT_SCORE:')) {
      const score = parseInt(trimmed.split(':')[1]?.trim() || '50');
      contentScore = isNaN(score) ? 50 : Math.max(0, Math.min(100, score));
    } else if (trimmed.startsWith('DECISION:')) {
      const decisionText = trimmed.split(':')[1]?.trim() || 'REVIEW';
      if (['APPROVE', 'REVIEW', 'REJECT'].includes(decisionText)) {
        decision = decisionText as 'APPROVE' | 'REVIEW' | 'REJECT';
      }
    } else if (trimmed.startsWith('SPAM_RISK:')) {
      const risk = trimmed.split(':')[1]?.trim() || 'MEDIUM';
      if (['LOW', 'MEDIUM', 'HIGH'].includes(risk)) {
        spamRisk = risk as 'LOW' | 'MEDIUM' | 'HIGH';
      }
    } else if (trimmed.startsWith('QUALITY_SCORE:')) {
      const score = parseInt(trimmed.split(':')[1]?.trim() || '5');
      qualityScore = isNaN(score) ? 5 : Math.max(0, Math.min(10, score));
    } else if (trimmed.startsWith('AI_DETECTED:')) {
      aiDetected = trimmed.split(':')[1]?.trim().toUpperCase() === 'YES';
    } else if (trimmed.startsWith('ANTHROPIC_FLAG:')) {
      anthropicFlag = trimmed.split(':')[1]?.trim().toUpperCase() === 'YES';
    } else if (trimmed.startsWith('REASONING:')) {
      inReasoning = true;
      inRecommendedAction = false;
    } else if (trimmed.startsWith('RECOMMENDED_ACTION:')) {
      inReasoning = false;
      inRecommendedAction = true;
      recommendedAction = trimmed.split(':')[1]?.trim() || 'Manual review required';
    } else if (inReasoning && trimmed.startsWith('-')) {
      reasoning.push(trimmed.substring(1).trim());
    } else if (inRecommendedAction && trimmed) {
      recommendedAction = trimmed;
    }
  }

  // Apply decision thresholds
  if (contentScore >= 80 && spamRisk !== 'HIGH') {
    decision = 'APPROVE';
  } else if (contentScore >= 60) {
    decision = 'REVIEW';
  } else {
    decision = 'REJECT';
  }

  if (anthropicFlag) {
    decision = 'REVIEW';
  }

  if (spamRisk === 'HIGH') {
    decision = 'REJECT';
  }

  return {
    contentScore,
    decision,
    spamRisk,
    qualityScore,
    aiDetected,
    anthropicFlag,
    reasoning: reasoning.length > 0 ? reasoning : ['Analysis completed'],
    recommendedAction
  };
}

function parseImageAnalysisResponse(response: string): {
  hasSpam: boolean;
  detectedText: string[];
  urls: string[];
  businessLogos: boolean;
  recommendedAction: string;
} {
  try {
    // Try to parse as JSON first
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        hasSpam: parsed.hasSpam || false,
        detectedText: parsed.detectedText || [],
        urls: parsed.urls || [],
        businessLogos: parsed.businessLogos || false,
        recommendedAction: parsed.recommendedAction || 'Manual review recommended'
      };
    }
  } catch (error) {
    console.error('Failed to parse image analysis JSON:', error);
  }

  // Fallback parsing
  const hasSpam = response.toLowerCase().includes('hasSpam: true') || 
                  response.toLowerCase().includes('spam detected') ||
                  response.toLowerCase().includes('promotional content');
  
  const detectedText: string[] = [];
  const urls: string[] = [];
  const businessLogos = response.toLowerCase().includes('logo') || 
                       response.toLowerCase().includes('business');

  return {
    hasSpam,
    detectedText,
    urls,
    businessLogos,
    recommendedAction: hasSpam ? 'Flag for human review' : 'Approve'
  };
}
