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
  
  // Extract keywords from user message
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
    response += `\n\nI found ${matchingTemplates.length} template${matchingTemplates.length > 1 ? 's' : ''} that might help:`;
  }
  
  return {
    response,
    templates: matchingTemplates.length > 0 ? matchingTemplates : undefined,
    category,
  };
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
        "Would you like to see more templates?",
        "What's your current level?",
        "What's your main goal?",
      ];
    default:
      return [
        "What would you like to work on?",
        "Do you need help with habits or tasks?",
        "Should I suggest some templates?",
      ];
  }
}
