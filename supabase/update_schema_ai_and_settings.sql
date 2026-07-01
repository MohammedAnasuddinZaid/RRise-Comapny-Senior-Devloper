-- Update script to fix ai_keys table and add system_settings table
-- Run this in your Supabase SQL editor

-- 1. Add missing columns to ai_keys table for AI Gateway compatibility
ALTER TABLE ai_keys 
ADD COLUMN IF NOT EXISTS selected_model TEXT DEFAULT 'default',
ADD COLUMN IF NOT EXISTS token_usage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_used TIMESTAMP WITH TIME ZONE;

-- 2. Create system_settings table to store dynamic app configurations like Stripe rates
CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on system_settings
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access (so frontend can show prices)
DROP POLICY IF EXISTS "Anyone can read system settings" ON system_settings;
CREATE POLICY "Anyone can read system settings" ON system_settings
  FOR SELECT USING (true);

-- Allow only admins to update/insert system settings
-- (In a real scenario, you'd use a service role key or a custom Postgres function checking is_admin)
-- For simplicity, since the admin panel uses the service role key, it can bypass RLS anyway.
CREATE POLICY "Admins can update system settings" ON system_settings
  FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));

-- Insert default Stripe settings
INSERT INTO system_settings (key, value, description)
VALUES 
  ('stripe_pro_price', '20', 'Monthly price for Pro plan in USD'),
  ('stripe_ultra_price', '40', 'Monthly price for Ultra plan in USD'),
  ('stripe_pro_link', 'https://buy.stripe.com/...', 'Checkout link for Pro plan'),
  ('stripe_ultra_link', 'https://buy.stripe.com/...', 'Checkout link for Ultra plan')
ON CONFLICT (key) DO NOTHING;
