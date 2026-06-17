-- RRise Database Schema
-- This file defines all tables, indexes, and Row Level Security (RLS) policies
-- Run this in your Supabase SQL editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
-- Stores user profile information and plan state
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'ultra_max')),
  onboarding_completed BOOLEAN DEFAULT false,
  mascot_level INTEGER DEFAULT 1,
  xp_total INTEGER DEFAULT 0,
  streak_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create index on plan for filtering
CREATE INDEX IF NOT EXISTS profiles_plan_idx ON profiles(plan);

-- ============================================
-- GOALS TABLE
-- ============================================
-- Stores user goals with progress tracking
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on goals
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Goals policies
CREATE POLICY "Users can view own goals" ON goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON goals
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS goals_user_id_idx ON goals(user_id);
CREATE INDEX IF NOT EXISTS goals_status_idx ON goals(status);

-- ============================================
-- HABITS TABLE
-- ============================================
-- Stores user habits with tracking settings
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  target_count INTEGER DEFAULT 1,
  xp_reward INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on habits
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

-- Habits policies
CREATE POLICY "Users can view own habits" ON habits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habits" ON habits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habits" ON habits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own habits" ON habits
  FOR DELETE USING (auth.uid() = user_id);

-- Create index
CREATE INDEX IF NOT EXISTS habits_user_id_idx ON habits(user_id);

-- ============================================
-- HABIT LOGS TABLE
-- ============================================
-- Tracks daily habit completions
CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on habit_logs
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

-- Habit logs policies
CREATE POLICY "Users can view own habit logs" ON habit_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habit logs" ON habit_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS habit_logs_user_id_idx ON habit_logs(user_id);
CREATE INDEX IF NOT EXISTS habit_logs_habit_id_idx ON habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS habit_logs_completed_at_idx ON habit_logs(completed_at);

-- ============================================
-- TASKS TABLE
-- ============================================
-- Stores user tasks with priority and status
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  due_date DATE,
  xp_reward INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Tasks policies
CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON tasks(user_id);
CREATE INDEX IF NOT EXISTS tasks_status_idx ON tasks(status);

-- ============================================
-- TASK LOGS TABLE
-- ============================================
-- Tracks task completion history
CREATE TABLE IF NOT EXISTS task_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on task_logs
ALTER TABLE task_logs ENABLE ROW LEVEL SECURITY;

-- Task logs policies
CREATE POLICY "Users can view own task logs" ON task_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own task logs" ON task_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS task_logs_user_id_idx ON task_logs(user_id);
CREATE INDEX IF NOT EXISTS task_logs_task_id_idx ON task_logs(task_id);

-- ============================================
-- JOURNAL ENTRIES TABLE
-- ============================================
-- Stores user journal entries for reflection
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  mood TEXT CHECK (mood IN ('great', 'good', 'neutral', 'bad', 'terrible')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on journal_entries
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Journal entries policies
CREATE POLICY "Users can view own journal entries" ON journal_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal entries" ON journal_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries" ON journal_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries" ON journal_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Create index
CREATE INDEX IF NOT EXISTS journal_entries_user_id_idx ON journal_entries(user_id);

-- ============================================
-- MOODS TABLE
-- ============================================
-- Tracks daily mood entries
CREATE TABLE IF NOT EXISTS moods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mood TEXT NOT NULL CHECK (mood IN ('great', 'good', 'neutral', 'bad', 'terrible')),
  note TEXT,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on moods
ALTER TABLE moods ENABLE ROW LEVEL SECURITY;

-- Moods policies
CREATE POLICY "Users can view own moods" ON moods
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own moods" ON moods
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS moods_user_id_idx ON moods(user_id);
CREATE INDEX IF NOT EXISTS moods_logged_at_idx ON moods(logged_at);

-- ============================================
-- SPENDING ENTRIES TABLE
-- ============================================
-- Tracks user spending and financial data
CREATE TABLE IF NOT EXISTS spending_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  spent_at DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on spending_entries
ALTER TABLE spending_entries ENABLE ROW LEVEL SECURITY;

-- Spending entries policies
CREATE POLICY "Users can view own spending entries" ON spending_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own spending entries" ON spending_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own spending entries" ON spending_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own spending entries" ON spending_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS spending_entries_user_id_idx ON spending_entries(user_id);
CREATE INDEX IF NOT EXISTS spending_entries_category_idx ON spending_entries(category);
CREATE INDEX IF NOT EXISTS spending_entries_spent_at_idx ON spending_entries(spent_at);

-- ============================================
-- STREAKS TABLE
-- ============================================
-- Tracks user streaks for various activities
CREATE TABLE IF NOT EXISTS streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('habits', 'tasks', 'overall')),
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  last_activity_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, type)
);

-- Enable RLS on streaks
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

-- Streaks policies
CREATE POLICY "Users can view own streaks" ON streaks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks" ON streaks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks" ON streaks
  FOR UPDATE USING (auth.uid() = user_id);

-- Create index
CREATE INDEX IF NOT EXISTS streaks_user_id_idx ON streaks(user_id);

-- ============================================
-- XP LOGS TABLE
-- ============================================
-- Tracks XP earned and spent
CREATE TABLE IF NOT EXISTS xp_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  source TEXT CHECK (source IN ('habit', 'task', 'goal', 'bonus', 'penalty')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on xp_logs
ALTER TABLE xp_logs ENABLE ROW LEVEL SECURITY;

-- XP logs policies
CREATE POLICY "Users can view own xp logs" ON xp_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own xp logs" ON xp_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS xp_logs_user_id_idx ON xp_logs(user_id);
CREATE INDEX IF NOT EXISTS xp_logs_created_at_idx ON xp_logs(created_at);

-- ============================================
-- AI KEYS TABLE
-- ============================================
-- Stores user's AI API keys (encrypted in production)
CREATE TABLE IF NOT EXISTS ai_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'gemini', 'anthropic')),
  key_name TEXT NOT NULL,
  encrypted_key TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on ai_keys
ALTER TABLE ai_keys ENABLE ROW LEVEL SECURITY;

-- AI keys policies (strict - users can only see their own keys)
CREATE POLICY "Users can view own ai keys" ON ai_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ai keys" ON ai_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ai keys" ON ai_keys
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ai keys" ON ai_keys
  FOR DELETE USING (auth.uid() = user_id);

-- Create index
CREATE INDEX IF NOT EXISTS ai_keys_user_id_idx ON ai_keys(user_id);

-- ============================================
-- AI USAGE LOGS TABLE
-- ============================================
-- Tracks AI usage for billing and limits
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  request_type TEXT CHECK (request_type IN ('chat', 'completion', 'template')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on ai_usage_logs
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- AI usage logs policies
CREATE POLICY "Users can view own ai usage logs" ON ai_usage_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ai usage logs" ON ai_usage_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS ai_usage_logs_user_id_idx ON ai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS ai_usage_logs_created_at_idx ON ai_usage_logs(created_at);

-- ============================================
-- WEEKLY RECAPS TABLE
-- ============================================
-- Stores generated weekly recap data
CREATE TABLE IF NOT EXISTS weekly_recaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  recap_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, week_start)
);

-- Enable RLS on weekly_recaps
ALTER TABLE weekly_recaps ENABLE ROW LEVEL SECURITY;

-- Weekly recaps policies
CREATE POLICY "Users can view own weekly recaps" ON weekly_recaps
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weekly recaps" ON weekly_recaps
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS weekly_recaps_user_id_idx ON weekly_recaps(user_id);
CREATE INDEX IF NOT EXISTS weekly_recaps_week_start_idx ON weekly_recaps(week_start);

-- ============================================
-- MASCOT STATE TABLE
-- ============================================
-- Stores mascot evolution and state
CREATE TABLE IF NOT EXISTS mascot_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  level INTEGER DEFAULT 1,
  evolution_stage TEXT DEFAULT 'egg' CHECK (evolution_stage IN ('egg', 'hatchling', 'growing', 'mature', 'legendary')),
  total_interactions INTEGER DEFAULT 0,
  last_fed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- Enable RLS on mascot_state
ALTER TABLE mascot_state ENABLE ROW LEVEL SECURITY;

-- Mascot state policies
CREATE POLICY "Users can view own mascot state" ON mascot_state
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mascot state" ON mascot_state
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mascot state" ON mascot_state
  FOR UPDATE USING (auth.uid() = user_id);

-- Create index
CREATE INDEX IF NOT EXISTS mascot_state_user_id_idx ON mascot_state(user_id);

-- ============================================
-- SAFETY EVENTS TABLE
-- ============================================
-- Logs safety policy violations or concerning content
CREATE TABLE IF NOT EXISTS safety_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('content_flag', 'policy_violation', 'blocked_request')),
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on safety_events
ALTER TABLE safety_events ENABLE ROW LEVEL SECURITY;

-- Safety events policies (admin can view all, users view own)
CREATE POLICY "Users can view own safety events" ON safety_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert safety events" ON safety_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create index
CREATE INDEX IF NOT EXISTS safety_events_user_id_idx ON safety_events(user_id);
CREATE INDEX IF NOT EXISTS safety_events_created_at_idx ON safety_events(created_at);

-- ============================================
-- PROMPT MEMORY TABLE
-- ============================================
-- Stores AI prompt memory for context
CREATE TABLE IF NOT EXISTS prompt_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  memory_type TEXT NOT NULL CHECK (memory_type IN ('preference', 'context', 'history')),
  memory_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on prompt_memory
ALTER TABLE prompt_memory ENABLE ROW LEVEL SECURITY;

-- Prompt memory policies
CREATE POLICY "Users can view own prompt memory" ON prompt_memory
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prompt memory" ON prompt_memory
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prompt memory" ON prompt_memory
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own prompt memory" ON prompt_memory
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS prompt_memory_user_id_idx ON prompt_memory(user_id);
CREATE INDEX IF NOT EXISTS prompt_memory_type_idx ON prompt_memory(memory_type);

-- ============================================
-- APP SETTINGS TABLE
-- ============================================
-- Stores global app settings
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on app_settings
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- App settings policies (read-only for authenticated users)
CREATE POLICY "Authenticated users can view app settings" ON app_settings
  FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================
-- AUDIT LOGS TABLE
-- ============================================
-- Tracks important changes for audit trail
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Audit logs policies
CREATE POLICY "Users can view own audit logs" ON audit_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs(created_at);

-- ============================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- ============================================
-- This trigger automatically creates a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, plan)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'free'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- UPDATED AT TRIGGER FUNCTION
-- ============================================
-- Automatically updates updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_habits_updated_at BEFORE UPDATE ON habits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON journal_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_streaks_updated_at BEFORE UPDATE ON streaks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_keys_updated_at BEFORE UPDATE ON ai_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mascot_state_updated_at BEFORE UPDATE ON mascot_state
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prompt_memory_updated_at BEFORE UPDATE ON prompt_memory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON app_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STORAGE BUCKETS (Create these in Supabase Storage UI)
-- ============================================
-- Note: User avatars are not supported to save on cloud storage costs
-- Users will use default avatars or external avatar URLs

-- Recommended buckets:
-- 1. user-assets (private)
--    - future support for uploads, attachments, exports
-- 2. reports (private)
--    - future weekly PDF or data exports

-- Example storage policies (run in Supabase Storage UI):

-- For user-assets bucket (private):
-- CREATE POLICY "Users can upload own assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'user-assets' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can view own assets" ON storage.objects FOR SELECT USING (bucket_id = 'user-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

-- For reports bucket (private):
-- CREATE POLICY "Users can upload own reports" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'reports' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can view own reports" ON storage.objects FOR SELECT USING (bucket_id = 'reports' AND auth.uid()::text = (storage.foldername(name))[1]);
