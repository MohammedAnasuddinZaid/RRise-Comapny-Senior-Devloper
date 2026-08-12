-- Billing Schema (subscriptions, payments, billing_history)
-- Run this in your Supabase SQL editor to set up the database.
-- Requires: profiles table (see schema.sql), system_settings table (see update_schema_ai_and_settings.sql)

-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================
-- Mirrors Stripe subscription state. Written ONLY by the Stripe webhook handler.
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT,
  stripe_price_id TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'ultra')),
  status TEXT DEFAULT 'active',
  cancel_at_period_end BOOLEAN DEFAULT false,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage subscriptions" ON subscriptions
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_stripe_subscription_id_idx ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS subscriptions_plan_idx ON subscriptions(plan);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON subscriptions(status);

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PAYMENTS TABLE
-- ============================================
-- Records successful/attempted payments from Stripe invoices.
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  stripe_subscription_id TEXT,
  amount BIGINT DEFAULT 0,
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'succeeded',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage payments" ON payments
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS payments_user_id_idx ON payments(user_id);
CREATE INDEX IF NOT EXISTS payments_stripe_invoice_id_idx ON payments(stripe_invoice_id);
CREATE INDEX IF NOT EXISTS payments_created_at_idx ON payments(created_at);

-- ============================================
-- BILLING HISTORY TABLE
-- ============================================
-- Human-friendly billing timeline (payments, plan changes, refunds).
CREATE TABLE IF NOT EXISTS billing_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT,
  stripe_subscription_id TEXT,
  amount BIGINT DEFAULT 0,
  currency TEXT DEFAULT 'usd',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own billing history" ON billing_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage billing history" ON billing_history
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS billing_history_user_id_idx ON billing_history(user_id);
CREATE INDEX IF NOT EXISTS billing_history_created_at_idx ON billing_history(created_at);

-- ============================================
-- DEFAULT SYSTEM SETTINGS
-- ============================================
-- Price ID overrides are optional; env vars STRIPE_PRICE_PRO/ULTRA are the
-- default source of truth. Setting these keys in the admin panel overrides them.
INSERT INTO system_settings (key, value, description)
VALUES
  ('stripe_pro_price_id', '', 'Stripe Price ID override for Pro plan (empty = use env)'),
  ('stripe_ultra_price_id', '', 'Stripe Price ID override for Ultra plan (empty = use env)')
ON CONFLICT (key) DO NOTHING;
