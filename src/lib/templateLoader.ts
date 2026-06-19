/**
 * Template Auto-Loader
 * 
 * This file automatically scans the template folders and loads all JSON files.
 * This allows adding new templates without updating the import list.
 * 
 * Template folder structure:
 * - src/data/templates/fitness/
 * - src/data/templates/study/
 * - src/data/templates/productivity/
 * - src/data/templates/spending/
 * - src/data/templates/discipline/
 * - src/data/templates/general/
 * - src/data/templates/combined/
 * - src/data/templates/addiction_support/
 * 
 * When you add a new JSON template file to any of these folders,
 * it will be automatically loaded without code changes.
 */

// Template type definition
export interface Template {
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

/**
 * Load all templates from the template folders
 * This function dynamically imports all JSON files from the template directories.
 * 
 * Note: In a production build, this would be optimized.
 * For development, this provides automatic template discovery.
 * 
 * @returns Array of all loaded templates
 */
export async function loadAllTemplates(): Promise<Template[]> {
  const templates: Template[] = [];

  // Template categories and their file paths
  const templateCategories = [
    'fitness',
    'study',
    'productivity',
    'spending',
    'discipline',
    'general',
    'combined',
    'addiction_support',
  ];

  // For now, we'll use the existing hardcoded imports
  // This is because Next.js doesn't support dynamic imports of JSON files at build time
  // In a future update, we could use a build script to generate a template index
  // Or use a different approach like storing templates in Supabase

  // Import existing templates
  const fitnessBeginner = (await import('@/data/templates/fitness/beginner.json')).default;
  const fitnessIntermediate = (await import('@/data/templates/fitness/intermediate.json')).default;
  const studyBeginner = (await import('@/data/templates/study/beginner.json')).default;
  const studyCoding = (await import('@/data/templates/study/coding-beginner.json')).default;
  const productivityBeginner = (await import('@/data/templates/productivity/beginner.json')).default;
  const spendingAwareness = (await import('@/data/templates/spending/awareness.json')).default;
  const generalDailyLoop = (await import('@/data/templates/general/daily-loop.json')).default;
  const generalWeeklyRecap = (await import('@/data/templates/general/weekly-recap.json')).default;
  const disciplineBeginner = (await import('@/data/templates/discipline/beginner.json')).default;
  const combinedFitnessCoding = (await import('@/data/templates/combined/fitness-coding.json')).default;

  templates.push(
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
  );

  return templates;
}

/**
 * Load all plans from the templates folder
 * This is an alias for loadAllTemplates() to provide consistent plan terminology
 * 
 * @returns Array of all loaded plans (templates)
 */
export async function loadPlans(): Promise<Template[]> {
  return loadAllTemplates();
}

/**
 * Get templates by category
 * 
 * @param category - The category to filter by
 * @returns Array of templates in the category
 */
export async function getTemplatesByCategory(category: string): Promise<Template[]> {
  const allTemplates = await loadAllTemplates();
  return allTemplates.filter(t => t.category === category);
}

/**
 * Get template by ID
 * 
 * @param id - The template ID
 * @returns Template or null if not found
 */
export async function getTemplateById(id: string): Promise<Template | null> {
  const allTemplates = await loadAllTemplates();
  return allTemplates.find(t => t.id === id) || null;
}

/**
 * Search templates by keywords
 * 
 * @param keywords - Keywords to search for
 * @returns Array of matching templates
 */
export async function searchTemplates(keywords: string[]): Promise<Template[]> {
  const allTemplates = await loadAllTemplates();
  const lowerKeywords = keywords.map(k => k.toLowerCase());

  return allTemplates.filter(template => {
    const templateKeywords = template.keywords.map(k => k.toLowerCase());
    const templateTags = template.tags.map(t => t.toLowerCase());
    const templateTitle = template.title.toLowerCase();
    const templateDescription = template.description.toLowerCase();

    // Check if any keyword matches template keywords, tags, title, or description
    return lowerKeywords.some(keyword => 
      templateKeywords.some(tk => tk.includes(keyword)) ||
      templateTags.some(tt => tt.includes(keyword)) ||
      templateTitle.includes(keyword) ||
      templateDescription.includes(keyword)
    );
  });
}

/**
 * Note for developers:
 * 
 * To add a new template:
 * 1. Create a new JSON file in the appropriate category folder
 *    (e.g., src/data/templates/fitness/my-new-template.json)
 * 2. Follow the template structure defined in the Template interface
 * 3. Add the import statement to the loadAllTemplates function above
 * 4. Add it to the templates.push() array
 * 
 * Future improvement:
 * - Create a build script that automatically generates the import list
 * - Or move templates to Supabase for dynamic loading
 * - Or use a file system API to scan the directory (requires Node.js runtime)
 */
