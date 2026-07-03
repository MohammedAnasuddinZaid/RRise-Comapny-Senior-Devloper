-- Content Management System Tables
-- Run this in your Supabase SQL editor

-- Content table for managing all dynamic content
CREATE TABLE IF NOT EXISTS content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL, -- Unique identifier for the content (e.g., 'privacy_policy', 'pro_price')
  type TEXT NOT NULL CHECK (type IN ('page', 'pricing', 'legal', 'setting', 'text')),
  title TEXT NOT NULL,
  content TEXT NOT NULL, -- Can be HTML, markdown, or plain text
  metadata JSONB DEFAULT '{}', -- Additional data like pricing tiers, features, etc
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Content history table for tracking changes
CREATE TABLE IF NOT EXISTS content_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  change_reason TEXT
);

-- Enable RLS
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_history ENABLE ROW LEVEL SECURITY;

-- Policies for content table
CREATE POLICY "Admins can view all content" ON content
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can insert content" ON content
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can update content" ON content
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can delete content" ON content
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Public can read published content
CREATE POLICY "Public can read published content" ON content
  FOR SELECT USING (is_published = true);

-- Policies for content_history table
CREATE POLICY "Admins can view content history" ON content_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "System can insert content history" ON content_history
  FOR INSERT WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_key ON content(key);
CREATE INDEX IF NOT EXISTS idx_content_type ON content(type);
CREATE INDEX IF NOT EXISTS idx_content_is_published ON content(is_published);
CREATE INDEX IF NOT EXISTS idx_content_history_content_id ON content_history(content_id);
CREATE INDEX IF NOT EXISTS idx_content_history_changed_at ON content_history(changed_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at and save history
DROP TRIGGER IF EXISTS on_content_update ON content;
CREATE TRIGGER on_content_update
  BEFORE UPDATE ON content
  FOR EACH ROW
  EXECUTE FUNCTION update_content_updated_at();

-- Function to save content history
CREATE OR REPLACE FUNCTION save_content_history()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO content_history (content_id, content, metadata, changed_by, change_reason)
  VALUES (OLD.id, OLD.content, OLD.metadata, auth.uid(), 'Content updated');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to save history before update
DROP TRIGGER IF EXISTS on_content_history_save ON content;
CREATE TRIGGER on_content_history_save
  BEFORE UPDATE ON content
  FOR EACH ROW
  EXECUTE FUNCTION save_content_history();

-- Insert default content
INSERT INTO content (key, type, title, content, metadata) VALUES
  ('pro_price', 'pricing', 'Pro Plan Price', '20', '{"currency": "USD", "period": "month"}')
  ON CONFLICT (key) DO NOTHING;

INSERT INTO content (key, type, title, content, metadata) VALUES
  ('ultra_price', 'pricing', 'Ultra Plan Price', '40', '{"currency": "USD", "period": "month"}')
  ON CONFLICT (key) DO NOTHING;

INSERT INTO content (key, type, title, content, metadata) VALUES
  ('privacy_policy', 'legal', 'Privacy Policy', '<h1>Privacy Policy</h1><p>Last Updated: July 3, 2026</p>', '{}')
  ON CONFLICT (key) DO NOTHING;

INSERT INTO content (key, type, title, content, metadata) VALUES
  ('terms_of_service', 'legal', 'Terms of Service', '<h1>Terms of Service</h1><p>Last Updated: July 3, 2026</p>', '{}')
  ON CONFLICT (key) DO NOTHING;

INSERT INTO content (key, type, title, content, metadata) VALUES
  ('pricing_pro_features', 'pricing', 'Pro Plan Features', '["AI-powered insights", "Increased token limits", "Priority support"]', '{"type": "array"}')
  ON CONFLICT (key) DO NOTHING;

INSERT INTO content (key, type, title, content, metadata) VALUES
  ('pricing_ultra_features', 'pricing', 'Ultra Plan Features', '["Unlimited AI access", "Advanced analytics", "Dedicated support"]', '{"type": "array"}')
  ON CONFLICT (key) DO NOTHING;
