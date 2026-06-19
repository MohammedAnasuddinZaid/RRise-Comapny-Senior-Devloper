/**
 * AI Mode - Template-Based AI Responses
 * 
 * This file provides AI-like responses using templates for free plan users.
 * Instead of calling expensive AI APIs, it uses template matching and
 * pre-defined response patterns to generate contextual responses.
 * 
 * Features:
 * - Keyword-based template matching
 * - Context-aware response generation
 * - Fallback responses for unmatched queries
 * - Memory integration for personalization
 */

import { searchTemplates, loadAllTemplates } from './templateLoader';
import type { Template } from './templateLoader';
import { loadMemory } from './memorySystem';
import { getActiveAIKey, hasActiveAIKey } from './byok';
import type { AIProvider } from '@/types/database';
import { createClientComponentClient, isSupabaseConfigured } from '@/lib/supabase';

/**
 * Response categories for different types of user queries
 */
type ResponseCategory = 
  | 'greeting'
  | 'habit_help'
  | 'task_help'
  | 'motivation'
  | 'template_suggestion'
  | 'general_help'
  | 'unknown';

/**
 * Generate AI-like response based on user input
 * 
 * @param userId - User ID for personalization
 * @param userMessage - User's message
 * @returns AI response with optional template suggestions
 */
export async function generateAIResponse(
  userId: string,
  userMessage: string
): Promise<{
  response: string;
  templates?: Template[];
  category: ResponseCategory;
}> {
  const lowerMessage = userMessage.toLowerCase();
  
  // Load user memory for personalization
  const userPreferences = await loadMemory(userId, 'preferences');
  const userGoals = await loadMemory(userId, 'goals');
  
  // Check if user has BYOK configured
  const hasOpenAIKey = await hasActiveAIKey(userId, 'openai');
  const hasGeminiKey = await hasActiveAIKey(userId, 'gemini');
  const hasAnthropicKey = await hasActiveAIKey(userId, 'anthropic');
  
  // If user has BYOK, use real AI API
  if (hasOpenAIKey || hasGeminiKey || hasAnthropicKey) {
    return await generateRealAIResponse(userId, userMessage, userPreferences, userGoals);
  }
  
  // Otherwise, use template-based system (free plan)
  const keywords = lowerMessage.split(/\s+/).filter(word => word.length > 2);
  
  // Determine response category
  const category = categorizeMessage(lowerMessage);
  
  // Search for matching templates
  const matchingTemplates = await searchTemplates(keywords);
  
  // Generate response based on category
  let response = '';
  
  switch (category) {
    case 'greeting':
      response = generateGreetingResponse(userPreferences);
      break;
    case 'habit_help':
      response = generateHabitHelpResponse(keywords, userPreferences);
      break;
    case 'task_help':
      response = generateTaskHelpResponse(keywords, userPreferences);
      break;
    case 'motivation':
      response = generateMotivationResponse(userGoals);
      break;
    case 'template_suggestion':
      response = generateTemplateSuggestionResponse(matchingTemplates);
      break;
    case 'general_help':
      response = generateGeneralHelpResponse(keywords);
      break;
    default:
      response = generateFallbackResponse();
  }
  
  // Add template suggestions if found
  if (matchingTemplates.length > 0 && category !== 'template_suggestion') {
    response += `\n\nI found ${matchingTemplates.length} plan${matchingTemplates.length > 1 ? 's' : ''} that might help:`;
  }
  
  return {
    response,
    templates: matchingTemplates.length > 0 ? matchingTemplates : undefined,
    category,
  };
}

/**
 * Generate real AI response using BYOK
 * 
 * @param userId - User ID for personalization
 * @param userMessage - User's message
 * @param userPreferences - User preferences from memory
 * @param userGoals - User goals from memory
 * @returns AI response with optional template suggestions
 */
async function generateRealAIResponse(
  userId: string,
  userMessage: string,
  userPreferences: any,
  userGoals: any
): Promise<{
  response: string;
  templates?: Template[];
  category: ResponseCategory;
}> {
  try {
    // Determine which provider to use (priority: OpenAI > Gemini > Anthropic)
    let apiKey: string | null = null;
    let provider: AIProvider = 'openai';
    
    apiKey = await getActiveAIKey(userId, 'openai');
    if (!apiKey) {
      apiKey = await getActiveAIKey(userId, 'gemini');
      provider = 'gemini';
    }
    if (!apiKey) {
      apiKey = await getActiveAIKey(userId, 'anthropic');
      provider = 'anthropic';
    }
    
    if (!apiKey) {
      // Fallback to template-based system if no key found
      return generateTemplateBasedResponse(userId, userMessage, userPreferences, userGoals);
    }
    
    // Call the appropriate AI API based on provider
    let aiResponse: string;
    
    if (provider === 'openai') {
      aiResponse = await callOpenAI(apiKey, userMessage, userPreferences, userGoals, userId);
    } else if (provider === 'gemini') {
      aiResponse = await callGemini(apiKey, userMessage, userPreferences, userGoals, userId);
    } else if (provider === 'anthropic') {
      aiResponse = await callAnthropic(apiKey, userMessage, userPreferences, userGoals, userId);
    } else {
      aiResponse = await callOpenAI(apiKey, userMessage, userPreferences, userGoals, userId);
    }
    
    // Parse AI response to extract any plan suggestions
    const templates = await parseAIResponseForPlans(aiResponse);
    
    return {
      response: aiResponse,
      templates: templates.length > 0 ? templates : undefined,
      category: 'general_help',
    };
  } catch (error) {
    console.error('Error calling AI API:', error);
    // Fallback to template-based system on error
    return generateTemplateBasedResponse(userId, userMessage, userPreferences, userGoals);
  }
}

/**
 * Generate template-based response (fallback)
 */
async function generateTemplateBasedResponse(
  userId: string,
  userMessage: string,
  userPreferences: any,
  userGoals: any
): Promise<{
  response: string;
  templates?: Template[];
  category: ResponseCategory;
}> {
  const lowerMessage = userMessage.toLowerCase();
  const keywords = lowerMessage.split(/\s+/).filter(word => word.length > 2);
  const category = categorizeMessage(lowerMessage);
  const matchingTemplates = await searchTemplates(keywords);
  
  let response = '';
  
  switch (category) {
    case 'greeting':
      response = generateGreetingResponse(userPreferences);
      break;
    case 'habit_help':
      response = generateHabitHelpResponse(keywords, userPreferences);
      break;
    case 'task_help':
      response = generateTaskHelpResponse(keywords, userPreferences);
      break;
    case 'motivation':
      response = generateMotivationResponse(userGoals);
      break;
    case 'template_suggestion':
      response = generateTemplateSuggestionResponse(matchingTemplates);
      break;
    case 'general_help':
      response = generateGeneralHelpResponse(keywords);
      break;
    default:
      response = generateFallbackResponse();
  }
  
  if (matchingTemplates.length > 0 && category !== 'template_suggestion') {
    response += `\n\nI found ${matchingTemplates.length} plan${matchingTemplates.length > 1 ? 's' : ''} that might help:`;
  }
  
  return {
    response,
    templates: matchingTemplates.length > 0 ? matchingTemplates : undefined,
    category,
  };
}

/**
 * Call OpenAI API
 */
async function callOpenAI(
  apiKey: string,
  userMessage: string,
  userPreferences: any,
  userGoals: any,
  userId: string
): Promise<string> {
  const systemPrompt = `You are Alex, a personal growth and productivity AI companion for RRise. 
Your role is to help users build better habits, stay productive, and achieve their goals.

User preferences: ${JSON.stringify(userPreferences || {})}
User goals: ${JSON.stringify(userGoals || [])}

When suggesting plans or routines, focus on:
- Habit building and consistency
- Productivity and time management
- Personal development and growth
- Fitness and wellness
- Study skills and learning

Keep responses concise, encouraging, and actionable. If you suggest a plan, describe it clearly with habits and tasks.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  // Log usage (estimate tokens from response)
  const tokensUsed = data.usage?.total_tokens || 0;
  await logAIUsage(userId, 'openai', tokensUsed, 'chat');
  
  return content;
}

/**
 * Call Gemini API
 */
async function callGemini(
  apiKey: string,
  userMessage: string,
  userPreferences: any,
  userGoals: any,
  userId: string
): Promise<string> {
  const systemPrompt = `You are Alex, a personal growth and productivity AI companion for RRise. 
Your role is to help users build better habits, stay productive, and achieve their goals.

User preferences: ${JSON.stringify(userPreferences || {})}
User goals: ${JSON.stringify(userGoals || [])}

When suggesting plans or routines, focus on:
- Habit building and consistency
- Productivity and time management
- Personal development and growth
- Fitness and wellness
- Study skills and learning

Keep responses concise, encouraging, and actionable. If you suggest a plan, describe it clearly with habits and tasks.`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        { parts: [{ text: `${systemPrompt}\n\nUser: ${userMessage}` }] }
      ],
      generationConfig: {
        maxOutputTokens: 500,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.candidates[0].content.parts[0].text;
  
  // Log usage (estimate tokens from response length)
  const tokensUsed = Math.ceil(content.length / 4); // Rough estimate
  await logAIUsage(userId, 'gemini', tokensUsed, 'chat');
  
  return content;
}

/**
 * Call Anthropic API
 */
async function callAnthropic(
  apiKey: string,
  userMessage: string,
  userPreferences: any,
  userGoals: any,
  userId: string
): Promise<string> {
  const systemPrompt = `You are Alex, a personal growth and productivity AI companion for RRise. 
Your role is to help users build better habits, stay productive, and achieve their goals.

User preferences: ${JSON.stringify(userPreferences || {})}
User goals: ${JSON.stringify(userGoals || [])}

When suggesting plans or routines, focus on:
- Habit building and consistency
- Productivity and time management
- Personal development and growth
- Fitness and wellness
- Study skills and learning

Keep responses concise, encouraging, and actionable. If you suggest a plan, describe it clearly with habits and tasks.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 500,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userMessage },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.content[0].text;
  
  // Log usage (estimate tokens from response)
  const tokensUsed = data.usage?.output_tokens || Math.ceil(content.length / 4);
  await logAIUsage(userId, 'anthropic', tokensUsed, 'chat');
  
  return content;
}

/**
 * Parse AI response to extract plan suggestions
 * This is a simple implementation - could be enhanced with better parsing
 */
async function parseAIResponseForPlans(aiResponse: string): Promise<Template[]> {
  // For now, return empty array - the AI will describe plans in text
  // In the future, we could parse the response to extract structured plan data
  return [];
}

/**
 * Log AI API usage for quota tracking
 * 
 * @param userId - User ID
 * @param provider - AI provider used
 * @param tokensUsed - Number of tokens used
 * @param requestType - Type of request (chat, completion, template)
 */
export async function logAIUsage(
  userId: string,
  provider: AIProvider | 'free',
  tokensUsed: number,
  requestType: 'chat' | 'completion' | 'template'
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' };
  
  const supabase = createClientComponentClient();
  if (!supabase) return { success: false, error: 'Supabase not configured' };

  try {
    const { error } = await supabase.from('ai_usage_logs').insert({
      user_id: userId,
      provider,
      tokens_used: tokensUsed,
      request_type: requestType,
      created_at: new Date().toISOString(),
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
 * Get AI usage statistics for a user
 * 
 * @param userId - User ID
 * @param days - Number of days to look back (default: 30)
 * @returns Usage statistics
 */
export async function getAIUsageStats(
  userId: string,
  days: number = 30
): Promise<{
  totalTokens: number;
  totalRequests: number;
  byProvider: Record<string, { tokens: number; requests: number }>;
  dailyUsage: Array<{ date: string; tokens: number; requests: number }>;
}> {
  if (!isSupabaseConfigured()) {
    return { totalTokens: 0, totalRequests: 0, byProvider: {}, dailyUsage: [] };
  }
  
  const supabase = createClientComponentClient();
  if (!supabase) {
    return { totalTokens: 0, totalRequests: 0, byProvider: {}, dailyUsage: [] };
  }

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString();

    const { data, error } = await supabase
      .from('ai_usage_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDateStr)
      .order('created_at', { ascending: true });

    if (error || !data) {
      return { totalTokens: 0, totalRequests: 0, byProvider: {}, dailyUsage: [] };
    }

    // Calculate totals
    const totalTokens = data.reduce((sum, log) => sum + (log.tokens_used || 0), 0);
    const totalRequests = data.length;

    // Group by provider
    const byProvider: Record<string, { tokens: number; requests: number }> = {};
    data.forEach(log => {
      const provider = log.provider || 'free';
      if (!byProvider[provider]) {
        byProvider[provider] = { tokens: 0, requests: 0 };
      }
      byProvider[provider].tokens += log.tokens_used || 0;
      byProvider[provider].requests += 1;
    });

    // Group by day
    const dailyUsage: Array<{ date: string; tokens: number; requests: number }> = [];
    const byDay: Record<string, { tokens: number; requests: number }> = {};
    data.forEach(log => {
      const date = log.created_at.split('T')[0];
      if (!byDay[date]) {
        byDay[date] = { tokens: 0, requests: 0 };
      }
      byDay[date].tokens += log.tokens_used || 0;
      byDay[date].requests += 1;
    });
    Object.entries(byDay).forEach(([date, stats]) => {
      dailyUsage.push({ date, ...stats });
    });

    return { totalTokens, totalRequests, byProvider, dailyUsage };
  } catch (error) {
    console.error('Error fetching AI usage stats:', error);
    return { totalTokens: 0, totalRequests: 0, byProvider: {}, dailyUsage: [] };
  }
}

/**
 * Categorize user message to determine response type
 */
function categorizeMessage(message: string): ResponseCategory {
  const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'];
  const habitKeywords = ['habit', 'routine', 'daily', 'practice', 'build'];
  const taskKeywords = ['task', 'todo', 'complete', 'finish', 'deadline'];
  const motivationKeywords = ['motivate', 'inspire', 'encourage', 'stuck', 'help me'];
  const templateKeywords = ['template', 'plan', 'program', 'schedule'];
  
  if (greetings.some(g => message.includes(g))) {
    return 'greeting';
  }
  
  if (habitKeywords.some(k => message.includes(k))) {
    return 'habit_help';
  }
  
  if (taskKeywords.some(k => message.includes(k))) {
    return 'task_help';
  }
  
  if (motivationKeywords.some(k => message.includes(k))) {
    return 'motivation';
  }
  
  if (templateKeywords.some(k => message.includes(k))) {
    return 'template_suggestion';
  }
  
  if (message.includes('help') || message.includes('how to') || message.includes('what')) {
    return 'general_help';
  }
  
  return 'unknown';
}

/**
 * Generate greeting response
 */
function generateGreetingResponse(preferences: any): string {
  const greetings = [
    "Hello! I'm here to help you build better habits and stay productive. What would you like to work on today?",
    "Hi there! Ready to make some progress? Let me know what you're focusing on.",
    "Hey! Great to see you. What can I help you with today?",
  ];
  
  if (preferences?.name) {
    return `Hello ${preferences.name}! I'm here to help you build better habits and stay productive. What would you like to work on today?`;
  }
  
  return greetings[Math.floor(Math.random() * greetings.length)];
}

/**
 * Generate habit help response
 */
function generateHabitHelpResponse(keywords: string[], preferences: any): string {
  const responses = [
    "Building habits is all about consistency. Start small - pick one habit and commit to it for 30 days. Would you like me to suggest some habit templates?",
    "The key to habit formation is starting with something so small you can't say no. What habit are you trying to build?",
    "Remember: habits are formed through repetition. Focus on showing up every day, even if it's just for 5 minutes.",
  ];
  
  if (keywords.includes('morning')) {
    return "Morning habits are powerful! Consider starting with just 5 minutes of your chosen activity. Consistency beats intensity every time.";
  }
  
  if (keywords.includes('evening')) {
    return "Evening routines help you wind down and prepare for tomorrow. What would make your evening more productive?";
  }
  
  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Generate task help response
 */
function generateTaskHelpResponse(keywords: string[], preferences: any): string {
  const responses = [
    "For task management, try breaking big tasks into smaller, actionable steps. What's your biggest challenge right now?",
    "The 2-minute rule: if a task takes less than 2 minutes, do it immediately. This keeps your to-do list manageable.",
    "Prioritize your tasks by impact, not urgency. What's the one thing that would make the biggest difference today?",
  ];
  
  if (keywords.includes('overwhelm')) {
    return "Feeling overwhelmed is normal. Try the 'one thing' approach: pick just one task and focus on that. Everything else can wait.";
  }
  
  if (keywords.includes('procrastinat')) {
    return "Procrastination often comes from fear or perfectionism. Try starting with just 5 minutes - you can always stop after that. Usually, you won't want to.";
  }
  
  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Generate motivation response
 */
function generateMotivationResponse(goals: any): string {
  const responses = [
    "Remember why you started. Your future self will thank you for the work you're putting in today.",
    "Progress isn't always visible, but it's happening. Every small action compounds over time.",
    "You're capable of more than you think. The only limits are the ones you set for yourself.",
    "Discipline is choosing between what you want now and what you want most. Keep going!",
  ];
  
  if (goals?.length > 0) {
    const randomGoal = goals[Math.floor(Math.random() * goals.length)];
    return `Remember your goal: "${randomGoal}"? Every small step brings you closer. You've got this!`;
  }
  
  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Generate template suggestion response
 */
function generateTemplateSuggestionResponse(templates: Template[]): string {
  if (templates.length === 0) {
    return "I don't have a specific template for that yet, but I can help you create a custom plan. What area would you like to focus on?";
  }
  
  const template = templates[0];
  return `I found the "${template.title}" template that might help! It's a ${template.difficulty} ${template.category} plan. Would you like to see the details?`;
}

/**
 * Generate general help response
 */
function generateGeneralHelpResponse(keywords: string[]): string {
  const responses = [
    "I can help you with habits, tasks, motivation, and finding the right templates. What specific area would you like help with?",
    "Think of me as your personal growth assistant. I can suggest templates, provide motivation, or help you plan your day.",
    "Whether you need help building habits, managing tasks, or just some motivation, I'm here for you. What do you need?",
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Generate fallback response
 */
function generateFallbackResponse(): string {
  const responses = [
    "I'm here to help you build better habits and stay productive. Try asking me about habits, tasks, or templates!",
    "I can help you find the right templates and provide motivation. What would you like to work on?",
    "Let me help you make progress today. Ask me about habits, tasks, or I can suggest some templates for you.",
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Get suggested follow-up questions based on context
 */
export function getFollowUpQuestions(category: ResponseCategory): string[] {
  switch (category) {
    case 'habit_help':
      return [
        "What habit do you want to build?",
        "How long have you been trying?",
        "What's been stopping you?",
      ];
    case 'task_help':
      return [
        "What's your biggest task right now?",
        "Are you feeling overwhelmed?",
        "What's your deadline?",
      ];
    case 'motivation':
      return [
        "What are you working toward?",
        "What's your biggest challenge?",
        "How can I help you stay on track?",
      ];
    case 'template_suggestion':
      return [
        "Would you like to see more plans?",
        "What's your current level?",
        "What's your main goal?",
      ];
    default:
      return [
        "What would you like to work on?",
        "Do you need help with habits or tasks?",
        "Should I suggest some plans?",
      ];
  }
}
