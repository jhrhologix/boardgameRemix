import { useState } from 'react';

interface ModerationResult {
  approved: boolean;
  bypassed?: boolean;
  moderationResult?: {
    contentScore: number;
    decision: string;
    spamRisk: string;
    qualityScore: number;
    aiDetected: boolean;
    anthropicFlag: boolean;
    reasoning: string[];
    recommendedAction: string;
  };
  imageModeration?: {
    hasSpam: boolean;
    detectedText: string[];
    urls: string[];
    businessLogos: boolean;
    recommendedAction: string;
  };
  queueId?: string;
  escalated?: boolean;
  message?: string;
}

interface ModerationInput {
  contentType: 'remix' | 'comment' | 'edit';
  contentId: string;
  title?: string;
  description?: string;
  rules?: string;
  comment?: string;
  imageUrls?: string[];
}

export function useContentModeration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const moderateContent = async (input: ModerationInput): Promise<ModerationResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/moderate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Moderation failed');
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Moderation failed';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    moderateContent,
    loading,
    error,
    clearError: () => setError(null)
  };
}
