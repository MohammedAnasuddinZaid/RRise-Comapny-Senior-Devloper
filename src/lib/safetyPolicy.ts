/**
 * Safety Policy and Guardrails
 * 
 * This file defines the safety policy for all AI-like outputs in RRise.
 * It ensures that all content remains within the scope of productivity and personal growth.
 * 
 * RRise Safety Rules:
 * - Productivity only
 * - No adult content
 * - No illegal advice
 * - No harmful instructions
 * - No self-harm encouragement
 * - No violent or abusive content
 * - No hateful content
 * - No sexual content
 * - No exploitative content
 * 
 * If AI content falls outside RRise scope, it should refuse and redirect back to productivity.
 */

/**
 * Content categories that are ALLOWED in RRise
 */
export const ALLOWED_CATEGORIES = [
  'productivity',
  'time management',
  'habit building',
  'goal setting',
  'personal development',
  'fitness',
  'health',
  'study skills',
  'learning',
  'financial literacy',
  'discipline',
  'motivation',
  'routine building',
  'self-improvement',
  'wellness',
  'mindfulness',
  'organization',
  'planning',
] as const;

/**
 * Content categories that are BLOCKED in RRise
 */
export const BLOCKED_CATEGORIES = [
  'adult content',
  'illegal activities',
  'harmful instructions',
  'self-harm',
  'violence',
  'abuse',
  'hate speech',
  'sexual content',
  'exploitative content',
  'dangerous activities',
  'substance abuse',
  'gambling',
  'fraud',
  'harassment',
  'discrimination',
] as const;

/**
 * Keywords that trigger safety filters
 */
export const BLOCKED_KEYWORDS = [
  // Self-harm related
  'suicide',
  'kill myself',
  'hurt myself',
  'self harm',
  'end my life',
  
  // Violence related
  'kill others',
  'hurt others',
  'violence',
  'attack',
  'assault',
  
  // Adult content
  'porn',
  'adult content',
  'nsfw',
  'sexual',
  
  // Illegal activities
  'illegal',
  'crime',
  'steal',
  'rob',
  'fraud',
  'hack',
  'drugs',
  
  // Hate speech
  'hate',
  'racist',
  'discrimination',
  'slur',
] as const;

/**
 * Check if content is safe according to RRise policy
 */
export function isContentSafe(content: string): {
  safe: boolean;
  reason?: string;
  category?: string;
} {
  const lowerContent = content.toLowerCase();

  // Check for blocked keywords
  for (const keyword of BLOCKED_KEYWORDS) {
    if (lowerContent.includes(keyword)) {
      return {
        safe: false,
        reason: `Content contains blocked keyword: ${keyword}`,
        category: 'blocked_keyword',
      };
    }
  }

  // Check for blocked categories (simple heuristic)
  const blockedPatterns = [
    /how to (kill|hurt|steal|rob|hack)/i,
    /suicide/i,
    /self.?harm/i,
    /porn/i,
    /adult content/i,
    /illegal/i,
    /hate speech/i,
    /discriminat/i,
  ];

  for (const pattern of blockedPatterns) {
    if (pattern.test(content)) {
      return {
        safe: false,
        reason: 'Content matches blocked pattern',
        category: 'blocked_pattern',
      };
    }
  }

  return { safe: true };
}

/**
 * Filter content to ensure it's safe
 * Returns safe content or a fallback message
 */
export function filterContent(content: string, fallbackMessage?: string): string {
  const safetyCheck = isContentSafe(content);

  if (!safetyCheck.safe) {
    return fallbackMessage || getRefusalMessage();
  }

  return content;
}

/**
 * Get a standard refusal message for unsafe content
 */
export function getRefusalMessage(): string {
  return "I can't help with that. I'm here to assist with productivity, personal growth, and self-improvement topics only. If you're struggling with something serious, please reach out to a trusted adult, mental health professional, or helpline.";
}

/**
 * Check if a user request is within RRise scope
 */
export function isRequestInScope(request: string): {
  inScope: boolean;
  reason?: string;
} {
  const lowerRequest = request.toLowerCase();

  // Check if request contains allowed categories
  const hasAllowedCategory = ALLOWED_CATEGORIES.some(category =>
    lowerRequest.includes(category.toLowerCase())
  );

  // Check if request contains blocked keywords
  const hasBlockedKeyword = BLOCKED_KEYWORDS.some(keyword =>
    lowerRequest.includes(keyword)
  );

  if (hasBlockedKeyword) {
    return {
      inScope: false,
      reason: 'Request contains blocked content',
    };
  }

  if (hasAllowedCategory) {
    return { inScope: true };
  }

  // Default: assume in scope but could be clarified
  return {
    inScope: true,
    reason: 'Request appears to be in scope but could be clarified',
  };
}

/**
 * Log a safety event for monitoring
 */
export async function logSafetyEvent(
  userId: string,
  eventType: 'content_flag' | 'policy_violation' | 'blocked_request',
  severity: 'low' | 'medium' | 'high' | 'critical',
  description: string,
  metadata?: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { createClientComponentClient, isSupabaseConfigured } = await import('@/lib/supabase');
    
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Supabase not configured' };
    }
    
    const supabase = createClientComponentClient();
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    const { error } = await supabase.from('safety_events').insert({
      user_id: userId,
      event_type: eventType,
      severity,
      description,
      metadata: metadata || null,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error logging safety event:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to log safety event' 
    };
  }
}

/**
 * Apply safety guardrails to AI response
 * This should be called before returning any AI-generated content
 */
export function applySafetyGuardrails(
  response: string,
  userId?: string
): { safe: boolean; content: string; logged?: boolean } {
  const safetyCheck = isContentSafe(response);

  if (!safetyCheck.safe) {
    // Log the safety event if userId is provided
    if (userId) {
      logSafetyEvent(
        userId,
        'content_flag',
        'medium',
        safetyCheck.reason || 'Unsafe content detected',
        { original_content: response.substring(0, 200) }
      ).catch(err => console.error('Failed to log safety event:', err));
    }

    return {
      safe: false,
      content: getRefusalMessage(),
      logged: !!userId,
    };
  }

  return {
    safe: true,
    content: response,
    logged: false,
  };
}

/**
 * Get the system prompt for AI models
 * This instructs the AI to stay within RRise's safety boundaries
 */
export function getSafetySystemPrompt(): string {
  return `You are Alex AI, a productivity and personal growth assistant for RRise.

Your purpose is to help users with:
- Building productive habits
- Setting and achieving goals
- Improving time management
- Personal development and self-improvement
- Fitness and wellness
- Study skills and learning
- Financial literacy
- Motivation and discipline

You MUST NOT provide assistance with:
- Adult content
- Illegal activities
- Harmful instructions
- Self-harm or suicide
- Violence or abuse
- Hate speech or discrimination
- Sexual content
- Exploitative content
- Dangerous activities

If a user asks for help outside your scope, politely refuse and redirect them back to productivity topics. If they seem to be struggling with serious issues, encourage them to seek help from appropriate professionals.

Keep your responses:
- Positive and encouraging
- Focused on productivity and growth
- Age-appropriate (teens and young adults)
- Safe and constructive
- Actionable and practical`;
}

/**
 * Validate user input before processing
 */
export function validateUserInput(input: string): {
  valid: boolean;
  reason?: string;
  sanitized?: string;
} {
  // Remove any HTML tags
  const sanitized = input.replace(/<[^>]*>/g, '');

  // Check length
  if (sanitized.length > 5000) {
    return {
      valid: false,
      reason: 'Input is too long (max 5000 characters)',
    };
  }

  if (sanitized.length === 0) {
    return {
      valid: false,
      reason: 'Input cannot be empty',
    };
  }

  // Check for safety
  const safetyCheck = isContentSafe(sanitized);
  if (!safetyCheck.safe) {
    return {
      valid: false,
      reason: safetyCheck.reason,
    };
  }

  return {
    valid: true,
    sanitized,
  };
}
