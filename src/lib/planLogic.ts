/**
 * Plan Logic and Usage Tracking
 * 
 * This file handles plan state management and usage tracking for RRise.
 * 
 * IMPORTANT: Plan state must always come from Supabase, never from frontend values.
 * Plan updates should only happen through Stripe webhook handlers on the server.
 * 
 * Plan Types:
 * - free: Templates, dashboard, tracking, mascot, streaks, weekly recap, no real AI
 * - pro: BYOK support, higher limits, richer AI-assisted templates, advanced accountability
 * - ultra: Premium tier with higher/unlimited limits, advanced Alex AI, deep accountability
 * 
 * Usage Tracking:
 * - Monthly AI requests
 * - Monthly token usage
 * - Monthly limit reset
 * - AI mode enabled flag
 * - Plan-based limits
 */

import { PlanType } from '@/types/database';
import { createClientComponentClient, isSupabaseConfigured } from '@/lib/supabase';

/**
 * Plan limits configuration
 * These define the limits for each plan type
 */
export const PLAN_LIMITS = {
  free: {
    monthly_ai_requests: 0,
    monthly_token_usage: 0,
    ai_mode_enabled: false,
    features: ['templates', 'dashboard', 'tracking', 'mascot', 'streaks', 'weekly_recap'],
  },
  pro: {
    monthly_ai_requests: 100,
    monthly_token_usage: 100000,
    ai_mode_enabled: true,
    features: ['templates', 'dashboard', 'tracking', 'mascot', 'streaks', 'weekly_recap', 'byok', 'ai_assisted_templates', 'advanced_accountability'],
  },
  ultra: {
    monthly_ai_requests: 1000,
    monthly_token_usage: 1000000,
    ai_mode_enabled: true,
    features: ['templates', 'dashboard', 'tracking', 'mascot', 'streaks', 'weekly_recap', 'byok', 'ai_assisted_templates', 'advanced_accountability', 'advanced_ai', 'deep_accountability'],
  },
};

/**
 * Get plan limits for a specific plan type
 */
export function getPlanLimits(plan: PlanType) {
  return PLAN_LIMITS[plan];
}

/**
 * Check if a feature is available for a given plan
 */
export function isFeatureAvailable(plan: PlanType, feature: string): boolean {
  const limits = getPlanLimits(plan);
  return limits.features.includes(feature);
}

/**
 * Check if AI mode is enabled for a given plan
 */
export function isAIEnabled(plan: PlanType): boolean {
  const limits = getPlanLimits(plan);
  return limits.ai_mode_enabled;
}

/**
 * Get user's current plan
 * Returns 'free' if Supabase is not configured
 */
export async function getUserPlan(userId: string): Promise<PlanType> {
  const supabase = createClientComponentClient();
  
  // Return free plan if Supabase is not configured
  if (!supabase) {
    return 'free';
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return 'free'; // Default to free plan
    }

    return data.plan as PlanType;
  } catch (error) {
    console.error('Error fetching user plan:', error);
    return 'free';
  }
}

/**
 * Update user's plan
 * This would typically be called by Stripe webhooks in production
 */
export async function updateUserPlan(userId: string, newPlan: PlanType): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }
  
  const supabase = createClientComponentClient();
  
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { error } = await supabase
      .from('profiles')
      .update({ plan: newPlan })
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update plan' 
    };
  }
}

/**
 * Get user's monthly usage
 */
export async function getUserUsage(userId: string): Promise<{
  monthly_ai_requests: number;
  monthly_token_usage: number;
  monthly_limit_reset_at: string | null;
}> {
  if (!isSupabaseConfigured()) {
    return {
      monthly_ai_requests: 0,
      monthly_token_usage: 0,
      monthly_limit_reset_at: null,
    };
  }
  
  const supabase = createClientComponentClient();
  
  if (!supabase) {
    return {
      monthly_ai_requests: 0,
      monthly_token_usage: 0,
      monthly_limit_reset_at: null,
    };
  }

  try {
    // Get current month's usage
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const { data, error } = await supabase
      .from('ai_usage_logs')
      .select('tokens_used')
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString());

    if (error) {
      return {
        monthly_ai_requests: 0,
        monthly_token_usage: 0,
        monthly_limit_reset_at: null,
      };
    }

    const monthly_ai_requests = data?.length || 0;
    const monthly_token_usage = data?.reduce((sum, log) => sum + (log.tokens_used || 0), 0) || 0;

    // Calculate next reset date (first day of next month)
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    return {
      monthly_ai_requests,
      monthly_token_usage,
      monthly_limit_reset_at: nextMonth.toISOString(),
    };
  } catch (error) {
    console.error('Error fetching user usage:', error);
    return {
      monthly_ai_requests: 0,
      monthly_token_usage: 0,
      monthly_limit_reset_at: null,
    };
  }
}

/**
 * Log AI usage
 */
export async function logAIUsage(
  userId: string,
  provider: string,
  tokensUsed: number,
  requestType: 'chat' | 'completion' | 'template'
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClientComponentClient();
  
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { error } = await supabase.from('ai_usage_logs').insert({
      user_id: userId,
      provider,
      tokens_used: tokensUsed,
      request_type: requestType,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to log AI usage' 
    };
  }
}

/**
 * Check if user has exceeded their plan limits
 */
export async function checkUsageLimits(userId: string): Promise<{
  canUseAI: boolean;
  requestsRemaining: number;
  tokensRemaining: number;
  resetDate: string | null;
}> {
  try {
    const plan = await getUserPlan(userId);
    const limits = getPlanLimits(plan);
    const usage = await getUserUsage(userId);

    const requestsRemaining = Math.max(0, limits.monthly_ai_requests - usage.monthly_ai_requests);
    const tokensRemaining = Math.max(0, limits.monthly_token_usage - usage.monthly_token_usage);
    const canUseAI = limits.ai_mode_enabled && requestsRemaining > 0 && tokensRemaining > 0;

    return {
      canUseAI,
      requestsRemaining,
      tokensRemaining,
      resetDate: usage.monthly_limit_reset_at,
    };
  } catch (error) {
    console.error('Error checking usage limits:', error);
    return {
      canUseAI: false,
      requestsRemaining: 0,
      tokensRemaining: 0,
      resetDate: null,
    };
  }
}

/**
 * Get plan display name
 */
export function getPlanDisplayName(plan: PlanType): string {
  const names: Record<PlanType, string> = {
    free: 'Free',
    pro: 'Pro',
    ultra: 'Ultra',
  };
  return names[plan];
}

/**
 * Get plan badge color class
 */
export function getPlanBadgeColor(plan: PlanType): string {
  const colors: Record<PlanType, string> = {
    free: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    pro: 'bg-primary/20 text-primary border-primary/30',
    ultra: 'bg-secondary/20 text-secondary border-secondary/30',
  };
  return colors[plan];
}

/**
 * Check if user can upgrade to a specific plan
 * This would typically check Stripe subscription status in production
 */
export async function canUpgradeToPlan(userId: string, targetPlan: PlanType): Promise<boolean> {
  // In production, this would check Stripe subscription status
  // For now, we'll allow upgrades (they'll be handled by Stripe webhooks)
  return true;
}

/**
 * Get upgrade path for current plan
 */
export function getUpgradePath(currentPlan: PlanType): PlanType[] {
  const paths: Record<PlanType, PlanType[]> = {
    free: ['pro', 'ultra'],
    pro: ['ultra'],
    ultra: [],
  };
  return paths[currentPlan];
}
