/**
 * Database Types
 * 
 * This file defines TypeScript types that match the Supabase database schema.
 * These types ensure type safety when working with Supabase data.
 * 
 * Plan Types:
 * - free: Basic plan with templates and tracking, no real AI
 * - pro: BYOK support, higher limits, advanced features
 * - ultra: Premium tier with unlimited limits and advanced AI
 */

// ============================================
// PLAN TYPES
// ============================================
export type PlanType = 'free' | 'pro' | 'ultra';

// ============================================
// PROFILE TYPES
// ============================================
export interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  plan: PlanType;
  stripe_customer_id: string | null;
  onboarding_completed: boolean;
  mascot_level: number;
  xp_total: number;
  streak_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProfileInsert {
  id: string;
  name?: string;
  email?: string;
  avatar_url?: string;
  plan?: PlanType;
  stripe_customer_id?: string;
  onboarding_completed?: boolean;
  mascot_level?: number;
  xp_total?: number;
  streak_count?: number;
}

export interface ProfileUpdate {
  name?: string;
  avatar_url?: string;
  plan?: PlanType;
  stripe_customer_id?: string;
  onboarding_completed?: boolean;
  mascot_level?: number;
  xp_total?: number;
  streak_count?: number;
}

// ============================================
// GOAL TYPES
// ============================================
export type GoalStatus = 'active' | 'completed' | 'paused';

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  target_date: string | null;
  progress: number;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
}

export interface GoalInsert {
  user_id: string;
  title: string;
  description?: string;
  target_date?: string;
  progress?: number;
  status?: GoalStatus;
}

export interface GoalUpdate {
  title?: string;
  description?: string;
  target_date?: string;
  progress?: number;
  status?: GoalStatus;
}

// ============================================
// HABIT TYPES
// ============================================
export type HabitFrequency = 'daily' | 'weekly' | 'monthly';

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  frequency: HabitFrequency;
  target_count: number;
  xp_reward: number;
  created_at: string;
  updated_at: string;
}

export interface HabitInsert {
  user_id: string;
  title: string;
  description?: string;
  frequency?: HabitFrequency;
  target_count?: number;
  xp_reward?: number;
}

export interface HabitUpdate {
  title?: string;
  description?: string;
  frequency?: HabitFrequency;
  target_count?: number;
  xp_reward?: number;
}

// ============================================
// HABIT LOG TYPES
// ============================================
export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  completed_at: string;
  xp_earned: number;
  created_at: string;
}

export interface HabitLogInsert {
  habit_id: string;
  user_id: string;
  completed_at?: string;
  xp_earned?: number;
}

// ============================================
// TASK TYPES
// ============================================
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string | null;
  xp_reward: number;
  created_at: string;
  updated_at: string;
}

export interface TaskInsert {
  user_id: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  due_date?: string;
  xp_reward?: number;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  due_date?: string;
  xp_reward?: number;
}

// ============================================
// TASK LOG TYPES
// ============================================
export interface TaskLog {
  id: string;
  task_id: string;
  user_id: string;
  completed_at: string;
  xp_earned: number;
  created_at: string;
}

export interface TaskLogInsert {
  task_id: string;
  user_id: string;
  completed_at?: string;
  xp_earned?: number;
}

// ============================================
// JOURNAL ENTRY TYPES
// ============================================
export type MoodType = 'great' | 'good' | 'neutral' | 'bad' | 'terrible';

export interface JournalEntry {
  id: string;
  user_id: string;
  title: string | null;
  content: string;
  mood: MoodType | null;
  created_at: string;
  updated_at: string;
}

export interface JournalEntryInsert {
  user_id: string;
  title?: string;
  content: string;
  mood?: MoodType;
}

export interface JournalEntryUpdate {
  title?: string;
  content?: string;
  mood?: MoodType;
}

// ============================================
// MOOD TYPES
// ============================================
export interface Mood {
  id: string;
  user_id: string;
  mood: MoodType;
  note: string | null;
  logged_at: string;
  created_at: string;
}

export interface MoodInsert {
  user_id: string;
  mood: MoodType;
  note?: string;
  logged_at?: string;
}

// ============================================
// SPENDING ENTRY TYPES
// ============================================
export interface SpendingEntry {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  description: string | null;
  spent_at: string;
  created_at: string;
}

export interface SpendingEntryInsert {
  user_id: string;
  category: string;
  amount: number;
  description?: string;
  spent_at: string;
}

export interface SpendingEntryUpdate {
  category?: string;
  amount?: number;
  description?: string;
  spent_at?: string;
}

// ============================================
// STREAK TYPES
// ============================================
export type StreakType = 'habits' | 'tasks' | 'overall';

export interface Streak {
  id: string;
  user_id: string;
  type: StreakType;
  current_streak: number;
  best_streak: number;
  last_activity_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface StreakInsert {
  user_id: string;
  type: StreakType;
  current_streak?: number;
  best_streak?: number;
  last_activity_at?: string;
}

export interface StreakUpdate {
  current_streak?: number;
  best_streak?: number;
  last_activity_at?: string;
}

// ============================================
// XP LOG TYPES
// ============================================
export type XPSource = 'habit' | 'task' | 'goal' | 'bonus' | 'penalty';

export interface XPLog {
  id: string;
  user_id: string;
  amount: number;
  reason: string;
  source: XPSource;
  created_at: string;
}

export interface XPLogInsert {
  user_id: string;
  amount: number;
  reason: string;
  source: XPSource;
}

// ============================================
// AI KEY TYPES
// ============================================
export type AIProvider = 'openai' | 'gemini' | 'anthropic' | 'openrouter';

export interface AIKey {
  id: string;
  user_id: string;
  provider: AIProvider;
  key_name: string;
  encrypted_key: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Public version of AIKey without the encrypted_key (for client-side display)
export interface AIKeyPublic {
  id: string;
  user_id: string;
  provider: AIProvider;
  key_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AIKeyInsert {
  user_id: string;
  provider: AIProvider;
  key_name: string;
  encrypted_key: string;
  is_active?: boolean;
}

export interface AIKeyUpdate {
  key_name?: string;
  encrypted_key?: string;
  is_active?: boolean;
}

// ============================================
// AI USAGE LOG TYPES
// ============================================
export type AIRequestType = 'chat' | 'completion' | 'template';

export interface AIUsageLog {
  id: string;
  user_id: string;
  provider: string;
  tokens_used: number;
  request_type: AIRequestType;
  created_at: string;
}

export interface AIUsageLogInsert {
  user_id: string;
  provider: string;
  tokens_used?: number;
  request_type: AIRequestType;
}

// ============================================
// WEEKLY RECAP TYPES
// ============================================
export interface WeeklyRecap {
  id: string;
  user_id: string;
  week_start: string;
  week_end: string;
  recap_data: Record<string, any>;
  created_at: string;
}

export interface WeeklyRecapInsert {
  user_id: string;
  week_start: string;
  week_end: string;
  recap_data: Record<string, any>;
}

// ============================================
// MASCOT STATE TYPES
// ============================================
export type EvolutionStage = 'egg' | 'hatchling' | 'growing' | 'mature' | 'legendary';

export interface MascotState {
  id: string;
  user_id: string;
  level: number;
  evolution_stage: EvolutionStage;
  total_interactions: number;
  last_fed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MascotStateInsert {
  user_id: string;
  level?: number;
  evolution_stage?: EvolutionStage;
  total_interactions?: number;
  last_fed_at?: string;
}

export interface MascotStateUpdate {
  level?: number;
  evolution_stage?: EvolutionStage;
  total_interactions?: number;
  last_fed_at?: string;
}

// ============================================
// SAFETY EVENT TYPES
// ============================================
export type SafetyEventType = 'content_flag' | 'policy_violation' | 'blocked_request';
export type SafetySeverity = 'low' | 'medium' | 'high' | 'critical';

export interface SafetyEvent {
  id: string;
  user_id: string | null;
  event_type: SafetyEventType;
  severity: SafetySeverity | null;
  description: string;
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface SafetyEventInsert {
  user_id?: string;
  event_type: SafetyEventType;
  severity?: SafetySeverity;
  description: string;
  metadata?: Record<string, any>;
}

// ============================================
// PROMPT MEMORY TYPES
// ============================================
export type MemoryType = 'preference' | 'context' | 'history';

export interface PromptMemory {
  id: string;
  user_id: string;
  memory_type: MemoryType;
  memory_data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PromptMemoryInsert {
  user_id: string;
  memory_type: MemoryType;
  memory_data: Record<string, any>;
}

export interface PromptMemoryUpdate {
  memory_type?: MemoryType;
  memory_data?: Record<string, any>;
}

// ============================================
// APP SETTINGS TYPES
// ============================================
export interface AppSetting {
  id: string;
  key: string;
  value: Record<string, any>;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppSettingInsert {
  key: string;
  value: Record<string, any>;
  description?: string;
}

export interface AppSettingUpdate {
  value?: Record<string, any>;
  description?: string;
}

// ============================================
// AUDIT LOG TYPES
// ============================================
export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  created_at: string;
}

export interface AuditLogInsert {
  user_id?: string;
  action: string;
  table_name: string;
  record_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
}
