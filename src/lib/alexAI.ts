/**
 * Alex AI Readiness Structure
 * 
 * This file provides the structure for Alex AI integration.
 * Alex AI is the AI companion that helps users with productivity and personal growth.
 * 
 * Current State: Placeholder structure for future AI integration
 * Future State: Will use BYOK keys or hosted AI for Pro/Ultra Max plans
 * 
 * Alex AI will read:
 * - Streak data
 * - Habits
 * - Tasks
 * - Mood
 * - Spending
 * - Recent activity
 * - Plan type
 * - User preferences
 * 
 * Alex AI will follow strict safety rules:
 * - Productivity only
 * - No adult content
 * - No illegal advice
 * - No harmful instructions
 * - No self-harm encouragement
 * - No violent or abusive content
 * - No hateful content
 * - No sexual content
 * - No exploitative content
 */

import { AIProvider } from '@/types/database';
import { getActiveAIKey } from './byok';
import { getUserPlan } from './planLogic';
import { logAIUsage } from './planLogic';

/**
 * User context data that Alex AI can read
 */
export interface AlexAIContext {
  userId: string;
  plan: string;
  streaks: {
    current_streak: number;
    best_streak: number;
    last_activity_at: string | null;
  };
  habits: {
    total: number;
    completed_today: number;
    completion_rate: number;
  };
  tasks: {
    pending: number;
    completed_today: number;
    in_progress: number;
  };
  mood: {
    recent_mood: string | null;
    mood_trend: string;
  };
  spending: {
    monthly_total: number;
    category_breakdown: Record<string, number>;
  };
  recent_activity: {
    last_7_days: string[];
  };
}

/**
 * Alex AI response structure
 */
export interface AlexAIResponse {
  message: string;
  suggestions: string[];
  encouragement: string;
  action_items: string[];
  tokens_used: number;
}

/**
 * Generate a response from Alex AI
 * 
 * This is a placeholder function that will be replaced with actual AI calls
 * when BYOK or hosted AI is implemented.
 * 
 * For now, it returns template-based responses based on user context.
 */
export async function generateAlexAIResponse(
  userMessage: string,
  context: AlexAIContext
): Promise<AlexAIResponse> {
  // Check if user has AI access
  const plan = await getUserPlan(context.userId);
  
  // Free plan users get template-based responses only
  if (plan === 'free') {
    return generateTemplateResponse(userMessage, context);
  }

  // Pro/Ultra Max users can use BYOK AI
  // Try to get an active key (prioritize Gemini, then OpenAI)
  const geminiKey = await getActiveAIKey(context.userId, 'gemini');
  const openaiKey = await getActiveAIKey(context.userId, 'openai');

  if (geminiKey) {
    return await callGeminiAI(userMessage, context, geminiKey);
  }

  if (openaiKey) {
    return await callOpenAIAI(userMessage, context, openaiKey);
  }

  // No keys available, fall back to template response
  return generateTemplateResponse(userMessage, context);
}

/**
 * Generate a template-based response (for free plan or when no keys available)
 */
function generateTemplateResponse(
  userMessage: string,
  context: AlexAIContext
): AlexAIResponse {
  const lowerMessage = userMessage.toLowerCase();

  // Analyze user message and provide contextual responses
  if (lowerMessage.includes('streak') || lowerMessage.includes('progress')) {
    return {
      message: `Great job on your current streak of ${context.streaks.current_streak} days! Your best streak is ${context.streaks.best_streak} days. Keep going!`,
      suggestions: [
        'Complete your daily habits to maintain your streak',
        'Focus on consistency over intensity',
        'Celebrate small wins along the way'
      ],
      encouragement: "You're building momentum! Every day counts.",
      action_items: [
        'Review your habit completion rate',
        'Plan your activities for tomorrow',
        'Set a small goal for today'
      ],
      tokens_used: 0,
    };
  }

  if (lowerMessage.includes('habit') || lowerMessage.includes('routine')) {
    return {
      message: `You've completed ${context.habits.completed_today} of ${context.habits.total} habits today. Your completion rate is ${Math.round(context.habits.completion_rate * 100)}%.`,
      suggestions: [
        'Focus on your most important habits first',
        'Start small and build gradually',
        'Track your progress consistently'
      ],
      encouragement: "Building habits takes time. You're on the right track!",
      action_items: [
        'Complete your remaining habits for today',
        'Review which habits need more attention',
        'Plan tomorrow\'s habit schedule'
      ],
      tokens_used: 0,
    };
  }

  if (lowerMessage.includes('task') || lowerMessage.includes('todo') || lowerMessage.includes('work')) {
    return {
      message: `You have ${context.tasks.pending} pending tasks and ${context.tasks.in_progress} in progress. You've completed ${context.tasks.completed_today} tasks today.`,
      suggestions: [
        'Prioritize your most important tasks',
        'Break large tasks into smaller steps',
        'Use time blocking for focused work'
      ],
      encouragement: "Stay focused and tackle one task at a time!",
      action_items: [
        'Complete your highest priority task',
        'Review your task list',
        'Plan your work for the next hour'
      ],
      tokens_used: 0,
    };
  }

  if (lowerMessage.includes('motivat') || lowerMessage.includes('encourage') || lowerMessage.includes('help')) {
    return {
      message: "I'm here to help you stay motivated and on track! Remember why you started this journey.",
      suggestions: [
        'Review your goals and progress',
        'Connect with your deeper purpose',
        'Take a small step right now'
      ],
      encouragement: "You have everything you need to succeed. Keep pushing forward!",
      action_items: [
        'Write down your top 3 goals',
        'Complete one small task right now',
        'Share your progress with someone'
      ],
      tokens_used: 0,
    };
  }

  // Default response
  return {
    message: "I'm here to help you with your personal growth journey. Ask me about your habits, tasks, streaks, or anything else!",
    suggestions: [
      "Ask about your current progress",
      "Get motivation for your goals",
      "Review your daily activities",
      "Plan your next steps"
    ],
    encouragement: "Every small step counts. You're doing great!",
    action_items: [
      "Complete your daily habits",
      "Work on your pending tasks",
      "Review your progress"
    ],
    tokens_used: 0,
  };
}

/**
 * Call Gemini AI (placeholder - will be implemented with actual API calls)
 */
async function callGeminiAI(
  userMessage: string,
  context: AlexAIContext,
  apiKey: string
): Promise<AlexAIResponse> {
  // TODO: Implement actual Gemini API call
  // For now, return template response with token estimation
  const estimatedTokens = Math.ceil(userMessage.length / 4);
  
  await logAIUsage(context.userId, 'gemini', estimatedTokens, 'chat');
  
  return {
    message: "Alex AI (Gemini) integration coming soon! For now, I'm using template responses.",
    suggestions: [
      "Upgrade to Pro to enable full AI features",
      "Add your Gemini API key in settings"
    ],
    encouragement: "Your AI companion will be ready soon!",
    action_items: [
      "Add your API key in settings",
      "Continue with template-based guidance"
    ],
    tokens_used: estimatedTokens,
  };
}

/**
 * Call OpenAI AI (placeholder - will be implemented with actual API calls)
 */
async function callOpenAIAI(
  userMessage: string,
  context: AlexAIContext,
  apiKey: string
): Promise<AlexAIResponse> {
  // TODO: Implement actual OpenAI API call
  // For now, return template response with token estimation
  const estimatedTokens = Math.ceil(userMessage.length / 4);
  
  await logAIUsage(context.userId, 'openai', estimatedTokens, 'chat');
  
  return {
    message: "Alex AI (OpenAI) integration coming soon! For now, I'm using template responses.",
    suggestions: [
      "Upgrade to Pro to enable full AI features",
      "Add your OpenAI API key in settings"
    ],
    encouragement: "Your AI companion will be ready soon!",
    action_items: [
      "Add your API key in settings",
      "Continue with template-based guidance"
    ],
    tokens_used: estimatedTokens,
  };
}

/**
 * Fetch user context data for Alex AI
 * This gathers all the data Alex AI needs to provide personalized responses
 */
export async function fetchAlexAIContext(userId: string): Promise<AlexAIContext> {
  // TODO: Implement actual data fetching from Supabase
  // For now, return placeholder context
  return {
    userId,
    plan: 'free',
    streaks: {
      current_streak: 0,
      best_streak: 0,
      last_activity_at: null,
    },
    habits: {
      total: 0,
      completed_today: 0,
      completion_rate: 0,
    },
    tasks: {
      pending: 0,
      completed_today: 0,
      in_progress: 0,
    },
    mood: {
      recent_mood: null,
      mood_trend: 'stable',
    },
    spending: {
      monthly_total: 0,
      category_breakdown: {},
    },
    recent_activity: {
      last_7_days: [],
    },
  };
}

/**
 * Check if Alex AI is available for a user
 */
export async function isAlexAIAvailable(userId: string): Promise<boolean> {
  const plan = await getUserPlan(userId);
  
  // Free plan: template-based only (available)
  // Pro/Ultra Max: BYOK or hosted AI (available if keys exist)
  if (plan === 'free') {
    return true;
  }

  // Check if user has any active AI keys
  const hasGeminiKey = await getActiveAIKey(userId, 'gemini');
  const hasOpenAIKey = await getActiveAIKey(userId, 'openai');

  return !!(hasGeminiKey || hasOpenAIKey);
}
