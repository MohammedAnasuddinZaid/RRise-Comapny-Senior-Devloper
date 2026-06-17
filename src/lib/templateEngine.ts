/**
 * Template Engine - Decision Tree Logic
 * 
 * This engine analyzes user input and matches it to appropriate templates.
 * It implements a decision tree that:
 * - Detects keywords in user input
 * - Classifies categories
 * - Asks follow-up questions if needed
 * - Detects age and experience level
 * - Finds matching templates
 * - Merges or stacks templates
 * - Returns personalized plans
 * 
 * This is a "fake AI" system that feels intelligent but remains predictable and cheap.
 */

import fitnessBeginner from '@/data/templates/fitness/beginner.json';
import fitnessIntermediate from '@/data/templates/fitness/intermediate.json';
import studyBeginner from '@/data/templates/study/beginner.json';
import studyCoding from '@/data/templates/study/coding-beginner.json';
import productivityBeginner from '@/data/templates/productivity/beginner.json';
import spendingAwareness from '@/data/templates/spending/awareness.json';
import generalDailyLoop from '@/data/templates/general/daily-loop.json';
import generalWeeklyRecap from '@/data/templates/general/weekly-recap.json';
import disciplineBeginner from '@/data/templates/discipline/beginner.json';
import combinedFitnessCoding from '@/data/templates/combined/fitness-coding.json';

// Template type definition
interface Template {
  id: string;
  title: string;
  category: string;
  age_range: string;
  difficulty: string;
  description: string;
  goals: any[];
  habits: any[];
  tasks: any[];
  warnings: string[];
  estimated_duration: string;
  xp_rewards: any;
  mascot_effects: any;
  plan_type: string;
  tags: string[];
  keywords: string[];
  fallback_message: string;
}

// Load all templates
const allTemplates: Template[] = [
  fitnessBeginner,
  fitnessIntermediate,
  studyBeginner,
  studyCoding,
  productivityBeginner,
  spendingAwareness,
  generalDailyLoop,
  generalWeeklyRecap,
  disciplineBeginner,
  combinedFitnessCoding,
];

/**
 * Analyze user input and detect categories
 */
function detectCategories(input: string): string[] {
  const lowerInput = input.toLowerCase();
  const categories: string[] = [];

  // Fitness keywords
  const fitnessKeywords = ['fitness', 'exercise', 'workout', 'gym', 'fit', 'health', 'muscle', 'lose weight', 'get in shape'];
  if (fitnessKeywords.some(keyword => lowerInput.includes(keyword))) {
    categories.push('fitness');
  }

  // Study/learning keywords
  const studyKeywords = ['study', 'learn', 'school', 'academic', 'education', 'homework', 'grades', 'exam', 'test', 'coding', 'programming', 'code'];
  if (studyKeywords.some(keyword => lowerInput.includes(keyword))) {
    categories.push('study');
  }

  // Productivity keywords
  const productivityKeywords = ['productive', 'productivity', 'time management', 'focus', 'efficient', 'get things done', 'organized', 'discipline'];
  if (productivityKeywords.some(keyword => lowerInput.includes(keyword))) {
    categories.push('productivity');
  }

  // Spending/finance keywords
  const spendingKeywords = ['spending', 'money', 'finance', 'budget', 'save', 'financial', 'expenses', 'track spending'];
  if (spendingKeywords.some(keyword => lowerInput.includes(keyword))) {
    categories.push('spending');
  }

  // Discipline keywords
  const disciplineKeywords = ['discipline', 'self-discipline', 'willpower', 'self-control', 'consistent', 'stick to it'];
  if (disciplineKeywords.some(keyword => lowerInput.includes(keyword))) {
    categories.push('discipline');
  }

  // General/growth keywords
  const generalKeywords = ['daily', 'routine', 'growth', 'personal development', 'self-improvement', 'better', 'improve myself'];
  if (generalKeywords.some(keyword => lowerInput.includes(keyword))) {
    categories.push('general');
  }

  // Combined keywords (multiple categories)
  const combinedKeywords = ['both', 'and', 'plus', 'also', 'while', 'with'];
  const hasMultiple = categories.length > 1 || combinedKeywords.some(keyword => lowerInput.includes(keyword));
  if (hasMultiple && categories.length > 1) {
    categories.push('combined');
  }

  return categories.length > 0 ? categories : ['general'];
}

/**
 * Detect difficulty level from input
 */
function detectDifficulty(input: string): string {
  const lowerInput = input.toLowerCase();

  const beginnerKeywords = ['beginner', 'start', 'new', 'just starting', 'from scratch', 'basic', 'foundation'];
  const intermediateKeywords = ['intermediate', 'already', 'continue', 'next level', 'progress', 'improve', 'better'];

  if (beginnerKeywords.some(keyword => lowerInput.includes(keyword))) {
    return 'beginner';
  }
  if (intermediateKeywords.some(keyword => lowerInput.includes(keyword))) {
    return 'intermediate';
  }
  
  return 'beginner'; // Default to beginner
}

/**
 * Detect age range from input (simplified)
 */
function detectAgeRange(input: string): string {
  const lowerInput = input.toLowerCase();
  
  // Look for age mentions
  const ageMatch = lowerInput.match(/(\d{2})\s*(years old|y\.o\.|age)/i);
  if (ageMatch) {
    const age = parseInt(ageMatch[1]);
    if (age >= 13 && age <= 17) return '15-17';
    if (age >= 18 && age <= 24) return '18-24';
  }

  // Default to teen range since RRise is targeted at teens
  return '15-17';
}

/**
 * Find matching templates based on analysis
 */
function findMatchingTemplates(
  categories: string[],
  difficulty: string,
  ageRange: string
): Template[] {
  return allTemplates.filter(template => {
    // Match category
    const categoryMatch = categories.includes(template.category) || 
                         categories.includes('combined') && template.category === 'combined';
    
    // Match difficulty (or allow if not specified)
    const difficultyMatch = template.difficulty === difficulty || difficulty === 'beginner';
    
    // Match age range (or allow if not specified)
    const ageMatch = template.age_range === ageRange || ageRange === '15-17';
    
    return categoryMatch && difficultyMatch && ageMatch;
  });
}

/**
 * Merge multiple templates into one combined plan
 */
function mergeTemplates(templates: Template[]): Template {
  if (templates.length === 0) {
    return generalDailyLoop as Template;
  }

  if (templates.length === 1) {
    return templates[0];
  }

  // Merge templates by combining goals, habits, and tasks
  const merged: Template = {
    ...templates[0],
    id: `combined-${Date.now()}`,
    title: templates.map(t => t.title).join(' + '),
    category: 'combined',
    description: `A personalized plan combining ${templates.map(t => t.title).join(' and ')}`,
    goals: templates.flatMap(t => t.goals),
    habits: templates.flatMap(t => t.habits),
    tasks: templates.flatMap(t => t.tasks),
    warnings: [...new Set(templates.flatMap(t => t.warnings))],
    estimated_duration: templates.reduce((max, t) => {
      const duration = parseInt(t.estimated_duration) || 0;
      return Math.max(max, duration);
    }, 0) + ' weeks',
    xp_rewards: {
      total: templates.reduce((sum, t) => sum + (t.xp_rewards?.total || 0), 0),
      completion_bonus: templates.reduce((sum, t) => sum + (t.xp_rewards?.completion_bonus || 0), 0),
    },
    mascot_effects: {
      xp_multiplier: Math.max(...templates.map(t => t.mascot_effects?.xp_multiplier || 1)),
      streak_bonus: Math.max(...templates.map(t => t.mascot_effects?.streak_bonus || 1)),
    },
    plan_type: 'free',
    tags: [...new Set(templates.flatMap(t => t.tags))],
    keywords: [...new Set(templates.flatMap(t => t.keywords))],
    fallback_message: `I've created a personalized plan combining ${templates.map(t => t.title).join(' and ')} for you!`,
  };

  return merged;
}

/**
 * Main function to analyze user input and return matching template(s)
 */
export function analyzeUserInput(input: string): {
  template: Template;
  message: string;
  needsFollowUp: boolean;
  followUpQuestion?: string;
} {
  // Detect categories, difficulty, and age
  const categories = detectCategories(input);
  const difficulty = detectDifficulty(input);
  const ageRange = detectAgeRange(input);

  // Find matching templates
  const matchingTemplates = findMatchingTemplates(categories, difficulty, ageRange);

  // If no exact matches, try broader search
  if (matchingTemplates.length === 0) {
    const broaderTemplates = allTemplates.filter(template => {
      const categoryMatch = categories.includes(template.category);
      return categoryMatch;
    });

    if (broaderTemplates.length > 0) {
      const merged = mergeTemplates(broaderTemplates);
      return {
        template: merged,
        message: merged.fallback_message,
        needsFollowUp: false,
      };
    }

    // Fallback to general template
    return {
      template: generalDailyLoop as Template,
      message: "I couldn't find a specific match, but I've set you up with a great daily growth template to get started. You can also try rephrasing your request or choosing a specific category.",
      needsFollowUp: false,
    };
  }

  // If multiple matches, merge them
  if (matchingTemplates.length > 1) {
    const merged = mergeTemplates(matchingTemplates);
    return {
      template: merged,
      message: merged.fallback_message,
      needsFollowUp: false,
    };
  }

  // Single match
  const template = matchingTemplates[0];
  return {
    template,
    message: template.fallback_message,
    needsFollowUp: false,
  };
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): Template | null {
  return allTemplates.find(t => t.id === id) || null;
}

/**
 * Get all templates by category
 */
export function getTemplatesByCategory(category: string): Template[] {
  return allTemplates.filter(t => t.category === category);
}

/**
 * Get all available categories
 */
export function getAllCategories(): string[] {
  return [...new Set(allTemplates.map(t => t.category))];
}

/**
 * Get all available templates
 */
export function getAllTemplates(): Template[] {
  return allTemplates;
}
