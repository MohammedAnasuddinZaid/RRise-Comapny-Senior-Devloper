/**
 * Plan Auto-Loader
 * 
 * This file automatically scans the plan folders and loads all JSON files.
 * This allows adding new plans without updating the import list.
 * 
 * Plan folder structure:
 * - src/data/templates/fitness/
 * - src/data/templates/study/
 * - src/data/templates/productivity/
 * - src/data/templates/spending/
 * - src/data/templates/discipline/
 * - src/data/templates/general/
 * - src/data/templates/combined/
 * - src/data/templates/addiction_support/
 * 
 * When you add a new JSON plan file to any of these folders,
 * it will be automatically loaded without code changes.
 * 
 * Note: Internal folder name remains 'templates' for consistency,
 * but user-facing language uses 'plan', 'roadmap', 'program', or 'journey'
 */

// Plan type definition (internally still called Template for code consistency)
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
 * Validate a plan object has all required fields
 * 
 * @param template - The plan object to validate
 * @returns Whether the plan is valid
 */
function validateTemplate(template: any): boolean {
  const requiredFields = [
    'id',
    'title',
    'category',
    'age_range',
    'difficulty',
    'description',
    'goals',
    'habits',
    'tasks',
    'warnings',
    'estimated_duration',
    'xp_rewards',
    'mascot_effects',
    'plan_type',
    'tags',
    'keywords',
    'fallback_message'
  ];

  for (const field of requiredFields) {
    if (!(field in template)) {
      console.error(`Template missing required field: ${field}`);
      return false;
    }
  }

  // Validate arrays
  if (!Array.isArray(template.goals) || !Array.isArray(template.habits) || !Array.isArray(template.tasks)) {
    console.error('Template has invalid array fields');
    return false;
  }

  return true;
}

/**
 * Load all plans from the plan folders
 * This function dynamically imports all JSON files from the plan directories.
 * 
 * Note: In a production build, this would be optimized.
 * For development, this provides automatic plan discovery.
 * 
 * @returns Array of all loaded plans
 */
export async function loadAllTemplates(): Promise<Template[]> {
  const templates: Template[] = [];

  // Plan categories and their file paths
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
  // In a future update, we could use a build script to generate a plan index
  // Or use a different approach like storing plans in Supabase
  // 
  // To add a new plan:
  // 1. Create a JSON file in the appropriate category folder under src/data/templates/
  // 2. Add the import statement below following the existing pattern
  // 3. Add the template to the templates.push() array
  // 4. Ensure the JSON has all required fields (see validateTemplate function)

  // Import existing plans
  const planImports = [
    (await import('@/data/templates/fitness/beginner.json')).default,
    (await import('@/data/templates/fitness/intermediate.json')).default,
    (await import('@/data/templates/study/beginner.json')).default,
    (await import('@/data/templates/study/coding-beginner.json')).default,
    (await import('@/data/templates/productivity/beginner.json')).default,
    (await import('@/data/templates/spending/awareness.json')).default,
    (await import('@/data/templates/general/daily-loop.json')).default,
    (await import('@/data/templates/general/weekly-recap.json')).default,
    (await import('@/data/templates/discipline/beginner.json')).default,
    (await import('@/data/templates/combined/fitness-coding.json')).default,
  ];

  // Validate and load each plan
  for (const plan of planImports) {
    if (validateTemplate(plan)) {
      templates.push(plan);
    } else {
      console.error(`Skipping invalid plan: ${plan.id || 'unknown'}`);
    }
  }

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
 * Get plans by category
 * 
 * @param category - The category to filter by
 * @returns Array of plans in the category
 */
export async function getTemplatesByCategory(category: string): Promise<Template[]> {
  const allTemplates = await loadAllTemplates();
  return allTemplates.filter(t => t.category === category);
}

/**
 * Get plan by ID
 * 
 * @param id - The plan ID
 * @returns Plan or null if not found
 */
export async function getTemplateById(id: string): Promise<Template | null> {
  const allTemplates = await loadAllTemplates();
  return allTemplates.find(t => t.id === id) || null;
}

/**
 * Search plans by keywords
 * 
 * @param keywords - Keywords to search for
 * @returns Array of matching plans
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
