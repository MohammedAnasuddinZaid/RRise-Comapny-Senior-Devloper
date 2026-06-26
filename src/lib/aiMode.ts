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
  userMessage: string,
  selectedMode: 'free' | 'byok' | 'pro' = 'free'
): Promise<{
  response: string;
  templates?: Template[];
  category: ResponseCategory;
}> {
  const lowerMessage = userMessage.toLowerCase();
  
  // Crisis detection - check for self-harm/suicide keywords
  const crisisKeywords = ['suicide', 'kill myself', 'hurt myself', 'self harm', 'end my life', 'want to die'];
  if (crisisKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return {
      response: `I'm concerned about what you're sharing. If you're thinking about hurting yourself, please reach out for help immediately:

🆘 **Crisis Resources:**
- **National Suicide Prevention Lifeline:** Call or text 988 (US)
- **Crisis Text Line:** Text HOME to 741741
- **International:** Find helplines at findahelpline.com

You are not alone, and there are people who want to help. Please consider reaching out to a trusted adult, mental health professional, or the crisis lines above. Your life matters.

If you're in immediate danger, please call emergency services (911 in the US).`,
      category: 'general_help',
    };
  }
  
  // Load user memory for personalization
  const userPreferences = await loadMemory(userId, 'preferences');
  const userGoals = await loadMemory(userId, 'goals');
  const templateHistory = await loadMemory(userId, 'template_history');
  
  // Explicitly check selectedMode
  if (selectedMode === 'byok') {
    // Determine which provider is active or check keys
    const hasOpenAIKey = await hasActiveAIKey(userId, 'openai');
    const hasGeminiKey = await hasActiveAIKey(userId, 'gemini');
    const hasAnthropicKey = await hasActiveAIKey(userId, 'anthropic');
    const hasOpenRouterKey = await hasActiveAIKey(userId, 'openrouter');

    if (!hasOpenAIKey && !hasGeminiKey && !hasAnthropicKey && !hasOpenRouterKey) {
      return {
        response: "BYOK Mode selected, but no API keys are connected. Please go to Settings > AI Settings to add your key.",
        category: 'general_help',
      };
    }

    return await generateRealAIResponse(userId, userMessage, userPreferences, userGoals);
  }

  if (selectedMode === 'pro') {
    return {
      response: "PRO Mode is selected, but hosted Pro AI capabilities are currently locked/coming soon. For now, please use FREE Mode or connect your own key in BYOK Mode.",
      category: 'general_help',
    };
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
      response = generateGreetingResponse(userPreferences, userGoals, templateHistory);
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
      response = generateGeneralHelpResponse(keywords, userPreferences, userGoals);
      break;
    default:
      response = generateFallbackResponse(userPreferences);
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
  console.log('[BYOK DIAGNOSTIC] Starting generateRealAIResponse');
  console.log('[BYOK DIAGNOSTIC] User ID:', userId);
  console.log('[BYOK DIAGNOSTIC] User Message:', userMessage);
  
  try {
    // Determine which provider to use (priority: OpenAI > Gemini > Anthropic)
    let apiKey: string | null = null;
    let provider: AIProvider = 'openai';
    
    console.log('[BYOK DIAGNOSTIC] Checking for OpenAI key...');
    apiKey = await getActiveAIKey(userId, 'openai');
    console.log('[BYOK DIAGNOSTIC] OpenAI key exists:', !!apiKey, 'Length:', apiKey?.length || 0);
    
    if (!apiKey) {
      console.log('[BYOK DIAGNOSTIC] Checking for Gemini key...');
      apiKey = await getActiveAIKey(userId, 'gemini');
      provider = 'gemini';
      console.log('[BYOK DIAGNOSTIC] Gemini key exists:', !!apiKey, 'Length:', apiKey?.length || 0);
    }
    if (!apiKey) {
      console.log('[BYOK DIAGNOSTIC] Checking for Anthropic key...');
      apiKey = await getActiveAIKey(userId, 'anthropic');
      provider = 'anthropic';
      console.log('[BYOK DIAGNOSTIC] Anthropic key exists:', !!apiKey, 'Length:', apiKey?.length || 0);
    }
    
    console.log('[BYOK DIAGNOSTIC] Selected provider:', provider);
    
    if (!apiKey) {
      console.log('[BYOK DIAGNOSTIC] No API key found, falling back to template-based system');
      // Fallback to template-based system if no key found
      return generateTemplateBasedResponse(userId, userMessage, userPreferences, userGoals);
    }
    
    // Call the appropriate AI API based on provider
    console.log('[BYOK DIAGNOSTIC] Calling', provider, 'API...');
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
    
    console.log('[BYOK DIAGNOSTIC] AI response received, length:', aiResponse?.length || 0);
    
    // Parse AI response to extract any plan suggestions
    const templates = await parseAIResponseForPlans(aiResponse);
    
    return {
      response: aiResponse,
      templates: templates.length > 0 ? templates : undefined,
      category: 'general_help',
    };
  } catch (error) {
    console.error('[BYOK DIAGNOSTIC] Error calling AI API:', error);
    console.error('[BYOK DIAGNOSTIC] Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('[BYOK DIAGNOSTIC] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Return specific error based on error type
    let errorMessage = 'Unknown error occurred';
    
    if (error instanceof Error) {
      const errorLower = error.message.toLowerCase();
      
      if (errorLower.includes('401') || errorLower.includes('unauthorized') || errorLower.includes('invalid api key')) {
        errorMessage = 'Invalid API Key (401 Unauthorized). Please check your API key in Settings.';
      } else if (errorLower.includes('403') || errorLower.includes('forbidden') || errorLower.includes('permission denied')) {
        errorMessage = 'Permission Denied (403 Forbidden). Your API key may not have access to this resource.';
      } else if (errorLower.includes('429') || errorLower.includes('quota') || errorLower.includes('rate limit')) {
        errorMessage = 'Quota Exceeded (429). You have exceeded your API rate limit. Please try again later.';
      } else if (errorLower.includes('network') || errorLower.includes('fetch') || errorLower.includes('connection')) {
        errorMessage = 'Network Error. Unable to connect to the AI API. Please check your internet connection.';
      } else if (errorLower.includes('model') || errorLower.includes('not found')) {
        errorMessage = 'Model Not Found. The requested AI model is not available.';
      } else if (errorLower.includes('gemini')) {
        errorMessage = `Gemini API Error: ${error.message}`;
      } else {
        errorMessage = `API Error: ${error.message}`;
      }
    }
    
    return {
      response: errorMessage,
      category: 'general_help'
    };
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
      response = generateGreetingResponse(userPreferences, userGoals, null);
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
      response = generateGeneralHelpResponse(keywords, userPreferences, userGoals);
      break;
    default:
      response = generateFallbackResponse(userPreferences);
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
  console.log('[Gemini BYOK] Starting API call with key length:', apiKey?.length);
  
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

  const requestBody = {
    contents: [
      { parts: [{ text: `${systemPrompt}\n\nUser: ${userMessage}` }] }
    ],
    generationConfig: {
      maxOutputTokens: 500,
    },
  };

  console.log('[Gemini BYOK] Request body:', JSON.stringify(requestBody, null, 2));

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  console.log('[Gemini BYOK] Response status:', response.status, response.statusText);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Gemini BYOK] Error response:', errorText);
    console.error('[Gemini BYOK] Status code:', response.status);
    throw new Error(`Gemini API error (${response.status}): ${response.statusText}. Details: ${errorText}`);
  }

  const data = await response.json();
  console.log('[Gemini BYOK] Response data:', JSON.stringify(data, null, 2));

  // Check for safety filter or blocked response
  if (!data.candidates || data.candidates.length === 0) {
    const errorReason = data.promptFeedback?.blockReason || 'No candidates returned';
    console.error('[Gemini BYOK] No candidates in response. Prompt feedback:', data.promptFeedback);
    throw new Error(`Gemini blocked the response: ${errorReason}`);
  }

  const candidate = data.candidates[0];
  
  // Check if the candidate was blocked
  if (candidate.finishReason === 'SAFETY') {
    console.error('[Gemini BYOK] Response blocked by safety filter');
    throw new Error('Gemini blocked this response due to safety guidelines. Please try rephrasing your request.');
  }

  if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
    console.error('[Gemini BYOK] Invalid response structure:', candidate);
    throw new Error('Gemini returned an invalid response structure');
  }

  const content = candidate.content.parts[0].text;
  
  if (!content) {
    console.error('[Gemini BYOK] Empty content in response');
    throw new Error('Gemini returned an empty response');
  }
  
  console.log('[Gemini BYOK] Success! Content length:', content.length);
  
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
    const totalTokens = data.reduce((sum: number, log: any) => sum + (log.tokens_used || 0), 0);
    const totalRequests = data.length;

    // Group by provider
    const byProvider: Record<string, { tokens: number; requests: number }> = {};
    data.forEach((log: any) => {
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
    data.forEach((log: any) => {
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
 * Generate greeting response with coaching approach
 */
function generateGreetingResponse(preferences: any, goals: any, templateHistory: any): string {
  const greetings = [
    "Hello! I'm here to help you build better habits and stay productive. What would you like to work on today?",
    "Hi there! Ready to make some progress? Let me know what you're focusing on.",
    "Hey! Great to see you. What can I help you with today?",
  ];
  
  let response = greetings[Math.floor(Math.random() * greetings.length)];
  
  if (preferences?.name) {
    response = `Hello ${preferences.name}! I'm here to help you build better habits and stay productive. What would you like to work on today?`;
  }
  
  // Add coaching question based on user data
  if (goals && Array.isArray(goals) && goals.length > 0) {
    response += ` I see you're working on: ${goals.slice(0, 2).join(', ')}. How's your progress on those?`;
  } else {
    response += " What's your main focus right now - building habits, completing tasks, or something else?";
  }
  
  if (templateHistory && Array.isArray(templateHistory) && templateHistory.length > 0) {
    const lastPlan = templateHistory[templateHistory.length - 1];
    response += ` You previously started the "${lastPlan.planTitle || 'a plan'}" - would you like to continue with that or try something new?`;
  }
  
  return response;
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
function generateGeneralHelpResponse(keywords: string[], preferences: any, goals: any): string {
  const responses = [
    "I can help you with habits, tasks, motivation, and finding the right templates. What specific area would you like help with?",
    "Think of me as your personal growth assistant. I can suggest templates, provide motivation, or help you plan your day.",
    "Whether you need help building habits, managing tasks, or just some motivation, I'm here for you. What do you need?",
  ];
  
  let response = responses[Math.floor(Math.random() * responses.length)];
  
  // Add personalized coaching question
  if (goals && Array.isArray(goals) && goals.length > 0) {
    response += ` Since you're working on ${goals[0]}, would you like some specific tips for that?`;
  }
  
  return response;
}

/**
 * Generate fallback response
 */
function generateFallbackResponse(preferences: any): string {
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
