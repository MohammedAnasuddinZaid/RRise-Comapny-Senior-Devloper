# Database Migration - AI Gateway Schema Update

## Overview

This migration updates the `api_keys` table to support the new provider-agnostic AI Gateway architecture.

## Current Schema (api_keys)

```sql
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'openai', 'gemini', 'anthropic', 'openrouter'
  encrypted_key TEXT, -- Future: encrypt
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## New Schema (api_keys)

```sql
-- Drop existing table and recreate with new schema
DROP TABLE IF EXISTS api_keys CASCADE;

CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('gemini', 'openai', 'anthropic', 'groq', 'openrouter')),
  selected_model TEXT NOT NULL DEFAULT '',
  encrypted_api_key TEXT NOT NULL, -- Future: encrypt
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
  last_used TIMESTAMP,
  token_usage INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, provider) -- One key per provider per user
);

-- Create index for faster lookups
CREATE INDEX idx_api_keys_user_provider ON api_keys(user_id, provider);
CREATE INDEX idx_api_keys_status ON api_keys(status);
CREATE INDEX idx_api_keys_last_used ON api_keys(last_used DESC);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Migration Script

```sql
-- Step 1: Backup existing data
CREATE TABLE api_keys_backup AS SELECT * FROM api_keys;

-- Step 2: Create new table with updated schema
DROP TABLE IF EXISTS api_keys CASCADE;

CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('gemini', 'openai', 'anthropic', 'groq', 'openrouter')),
  selected_model TEXT NOT NULL DEFAULT '',
  encrypted_api_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
  last_used TIMESTAMP,
  token_usage INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Step 3: Migrate existing Gemini users
INSERT INTO api_keys (user_id, provider, selected_model, encrypted_api_key, status, created_at)
SELECT 
  user_id,
  'gemini'::TEXT,
  'gemini-2.5-flash'::TEXT, -- Default model for existing users
  encrypted_key::TEXT,
  CASE WHEN is_active THEN 'active' ELSE 'inactive' END::TEXT,
  created_at
FROM api_keys_backup
WHERE provider = 'gemini';

-- Step 4: Create indexes
CREATE INDEX idx_api_keys_user_provider ON api_keys(user_id, provider);
CREATE INDEX idx_ai_keys_status ON api_keys(status);
CREATE INDEX idx_api_keys_last_used ON api_keys(last_used DESC);

-- Step 5: Add trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 6: Verify migration
SELECT COUNT(*) as migrated_count FROM api_keys;
SELECT * FROM api_keys;

-- Step 7: Drop backup after verification
-- DROP TABLE api_keys_backup;
```

## New Table: provider_config

```sql
CREATE TABLE provider_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider TEXT NOT NULL UNIQUE CHECK (provider IN ('gemini', 'openai', 'anthropic', 'groq', 'openrouter')),
  enabled BOOLEAN DEFAULT true,
  available_plans TEXT[] DEFAULT ARRAY['free', 'pro', 'ultra']::TEXT[],
  default_model TEXT,
  requires_api_key BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default provider configurations
INSERT INTO provider_config (provider, enabled, available_plans, default_model, requires_api_key) VALUES
  ('gemini', true, ARRAY['free', 'pro', 'ultra']::TEXT[], 'gemini-2.5-flash', true),
  ('openai', true, ARRAY['pro', 'ultra']::TEXT[], 'gpt-5', true),
  ('anthropic', true, ARRAY['pro', 'ultra']::TEXT[], 'claude-sonnet-4', true),
  ('groq', true, ARRAY['free', 'pro', 'ultra']::TEXT[], 'llama-3.3-70b-versatile', true),
  ('openrouter', true, ARRAY['pro', 'ultra']::TEXT[], 'anthropic/claude-sonnet-4', true);
```

## New Table: provider_usage_stats

```sql
CREATE TABLE provider_usage_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider TEXT NOT NULL CHECK (provider IN ('gemini', 'openai', 'anthropic', 'groq', 'openrouter')),
  total_requests INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  total_users INTEGER DEFAULT 0,
  period_start TIMESTAMP DEFAULT DATE_TRUNC('month', NOW()),
  period_end TIMESTAMP DEFAULT DATE_TRUNC('month', NOW() + INTERVAL '1 month'),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for period-based queries
CREATE INDEX idx_provider_usage_stats_period ON provider_usage_stats(period_start, period_end);
```

## RLS Policies

```sql
-- Enable RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Users can only see their own API keys
CREATE POLICY "Users can view own API keys" ON api_keys
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own API keys
CREATE POLICY "Users can insert own API keys" ON api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own API keys
CREATE POLICY "Users can update own API keys" ON api_keys
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own API keys
CREATE POLICY "Users can delete own API keys" ON api_keys
  FOR DELETE USING (auth.uid() = user_id);

-- Admin can view all API keys
CREATE POLICY "Admin can view all API keys" ON api_keys
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND plan = 'ultra'
    )
  );

-- Admin can update all API keys
CREATE POLICY "Admin can update all API keys" ON api_keys
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND plan = 'ultra'
    )
  );

-- Enable RLS for provider_config
ALTER TABLE provider_config ENABLE ROW LEVEL SECURITY;

-- Only admins can view provider config
CREATE POLICY "Admin can view provider config" ON provider_config
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND plan = 'ultra'
    )
  );

-- Only admins can update provider config
CREATE POLICY "Admin can update provider config" ON provider_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND plan = 'ultra'
    )
  );

-- Enable RLS for provider_usage_stats
ALTER TABLE provider_usage_stats ENABLE ROW LEVEL SECURITY;

-- Only admins can view usage stats
CREATE POLICY "Admin can view usage stats" ON provider_usage_stats
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND plan = 'ultra'
    )
  );
```

## Rollback Script

```sql
-- Rollback to old schema
DROP TABLE IF EXISTS api_keys CASCADE;
DROP TABLE IF EXISTS provider_config CASCADE;
DROP TABLE IF EXISTS provider_usage_stats CASCADE;

-- Recreate old schema
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  encrypted_key TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Restore from backup
INSERT INTO api_keys SELECT * FROM api_keys_backup;

-- Drop backup
DROP TABLE api_keys_backup;
```

## Verification Queries

```sql
-- Check migrated data
SELECT user_id, provider, selected_model, status FROM api_keys;

-- Check provider config
SELECT * FROM provider_config;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename IN ('api_keys', 'provider_config', 'provider_usage_stats');
```
