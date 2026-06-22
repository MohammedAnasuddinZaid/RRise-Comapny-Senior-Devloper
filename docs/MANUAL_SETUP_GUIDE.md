# RRise Manual Setup Guide

This guide walks you through all the manual setup steps required to deploy RRise as a production SaaS application.

---

## Table of Contents

1. [Environment Variables Setup](#environment-variables-setup)
2. [Supabase Database Schema Updates](#supabase-database-schema-updates)
3. [Stripe Configuration](#stripe-configuration)
4. [Webhook Setup](#webhook-setup)
5. [Deployment Checklist](#deployment-checklist)

---

## Environment Variables Setup

### Required Environment Variables

Create or update your `.env.local` file with the following variables:

#### Supabase Variables (Required)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

#### Stripe Variables (Required for Billing)
```env
STRIPE_SECRET_KEY=sk_test_... or sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO=price_pro_...
STRIPE_PRICE_ULTRA=price_ultra_...
```

#### Application Variables (Required)
```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Where to Find These Variables

#### Supabase
1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **Settings → API**
4. Copy the following:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **IMPORTANT:** Never expose the service role key to the frontend. It should only be used in server-side code (API routes, webhook handlers).

#### Stripe
1. Go to https://dashboard.stripe.com
2. Navigate to **Developers → API keys**
3. Copy the **Secret key** (starts with `sk_test_` for development, `sk_live_` for production)
4. Navigate to **Developers → Webhooks**
5. Add webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
6. Copy the **Signing secret** (starts with `whsec_`)

#### Stripe Price IDs
1. In Stripe Dashboard, go to **Products**
2. Create products for Pro and Ultra plans
3. Create monthly subscription prices for each product
4. Copy the price IDs (start with `price_`)
5. Update `STRIPE_PRICE_PRO` and `STRIPE_PRICE_ULTRA` with these IDs

#### Application URL
- For local development: `http://localhost:3000`
- For production: `https://yourdomain.com`

---

## Supabase Database Schema Updates

### Overview

The `supabase/schema.sql` file contains the complete database schema. However, if you already have an existing database, you need to run specific ALTER TABLE commands to avoid conflicts.

### Step 1: Check Existing Tables

Run this query in Supabase SQL Editor to see what tables already exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

### Step 2: Run Schema Updates

#### For New Databases (No Existing Tables)

Run the entire `supabase/schema.sql` file in Supabase SQL Editor.

#### For Existing Databases (Tables Already Exist)

Run these ALTER TABLE commands to add new columns:

```sql
-- Add stripe_customer_id to profiles table (if it doesn't exist)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Update plan constraint to use 'ultra' instead of 'ultra_max'
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_plan_check;

ALTER TABLE profiles 
ADD CONSTRAINT profiles_plan_check 
CHECK (plan IN ('free', 'pro', 'ultra'));
```

### Step 3: Verify RLS is Enabled

Run this query to ensure Row Level Security is enabled on all tables:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

All tables should have `rowsecurity = true`.

### Step 4: Verify RLS Policies

Run this query to check RLS policies exist:

```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
```

Each table should have policies like:
- "Users can view own [table]"
- "Users can insert own [table]"
- "Users can update own [table]"
- "Users can delete own [table]"

---

## Stripe Configuration

### Step 1: Create Products

1. Go to Stripe Dashboard → **Products**
2. Click **Add product**
3. Create **Pro Plan**:
   - Name: "RRise Pro"
   - Description: "AI-enabled productivity with advanced features"
4. Create **Ultra Plan**:
   - Name: "RRise Ultra"
   - Description: "Premium tier with unlimited AI and advanced accountability"

### Step 2: Create Prices

1. For each product, click **Add price**
2. Configure:
   - **Price**: $29/month for Pro, $99/month for Ultra
   - **Billing interval**: Monthly
   - **Currency**: USD (or your preferred currency)
3. Copy the price ID (starts with `price_`)
4. Update your `.env.local` file:
   ```env
   STRIPE_PRICE_PRO=price_1abc...
   STRIPE_PRICE_ULTRA=price_1xyz...
   ```

### Step 3: Configure Webhook

1. Go to Stripe Dashboard → **Developers → Webhooks**
2. Click **Add endpoint**
3. Enter endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Copy the webhook signing secret (starts with `whsec_`)
6. Update your `.env.local` file:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### Step 4: Test Webhook Locally

For local development, use Stripe CLI to forward webhooks:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

This will give you a test webhook signing secret for local development.

---

## Webhook Setup

### Step 1: Deploy Webhook Handler

The webhook handler is located at `src/app/api/webhooks/stripe/route.ts`. This file is already implemented and handles:

- Plan updates based on Stripe events
- Webhook signature verification
- Service role key usage for plan updates
- Error handling and logging

### Step 2: Verify Webhook is Accessible

After deployment, test the webhook endpoint:

```bash
curl -X POST https://yourdomain.com/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

Expected response: `{"received": true}` (or error if signature verification fails)

### Step 3: Test Stripe Events

1. Create a test checkout session in Stripe Dashboard
2. Complete the checkout flow
3. Verify the webhook is received in Stripe Dashboard → **Developers → Webhooks**
4. Check that the user's plan is updated in Supabase

---

## Deployment Checklist

### Pre-Deployment Checklist

- [ ] All environment variables are set in `.env.local`
- [ ] Supabase database schema is updated
- [ ] RLS is enabled on all tables
- [ ] RLS policies are verified
- [ ] Stripe products and prices are created
- [ ] Stripe webhook is configured
- [ ] Webhook signing secret is added to environment variables
- [ ] Stripe price IDs are added to environment variables
- [ ] Admin emails are added to `src/app/admin/page.tsx`

### Post-Deployment Checklist

- [ ] Test user signup flow
- [ ] Test plan upgrade flow (Stripe checkout)
- [ ] Verify webhook receives Stripe events
- [ ] Verify plan updates in Supabase after checkout
- [ ] Test admin dashboard access
- [ ] Test feature gating (free users see upgrade prompts)
- [ ] Test BYOK functionality (Pro/Ultra users)
- [ ] Test account deletion flow
- [ ] Verify no console errors in browser
- [ ] Verify no Supabase query errors

---

## Troubleshooting

### Webhook Signature Verification Fails

**Error:** "Webhook signature verification failed"

**Solution:**
1. Verify `STRIPE_WEBHOOK_SECRET` is correct in `.env.local`
2. Ensure you're using the correct webhook secret (test vs live)
3. Check that the webhook endpoint is accessible

### Plan Not Updating After Stripe Checkout

**Error:** User completes checkout but plan doesn't update

**Solution:**
1. Check Stripe Dashboard → **Webhooks** to see if webhook was sent
2. Check server logs for webhook handler errors
3. Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly
4. Check that the price ID mapping is correct in webhook handler

### RLS Policy Errors

**Error:** "new row violates row-level security policy"

**Solution:**
1. Verify RLS policies exist for the table
2. Check that policies use `auth.uid() = user_id`
3. Ensure service role key is used for admin operations
4. Verify user is authenticated

### Stripe Checkout Fails

**Error:** Checkout session creation fails

**Solution:**
1. Verify `STRIPE_SECRET_KEY` is correct
2. Check that price IDs are valid
3. Ensure user is authenticated
4. Check that `NEXT_PUBLIC_APP_URL` is set correctly

---

## Security Notes

### Service Role Key

⚠️ **CRITICAL:** The service role key bypasses RLS and should NEVER be exposed to the frontend.

- Only use in server-side code (API routes, webhook handlers)
- Never commit to version control
- Never log or print in error messages
- Rotate if compromised

### Webhook Security

- Always verify webhook signatures
- Never trust client-side plan updates
- Use Stripe as single source of truth for subscription state
- Log all webhook events for auditing

### RLS Policies

- All user-specific tables must have RLS enabled
- Policies must use `auth.uid() = user_id` for user isolation
- Admin operations require service role key
- Never disable RLS for convenience

---

## Support

If you encounter issues during setup:

1. Check the [PROJECT_AUDIT.md](./PROJECT_AUDIT.md) for detailed architecture documentation
2. Review Supabase logs in the Supabase Dashboard
3. Review Stripe webhook logs in the Stripe Dashboard
4. Check browser console for frontend errors
5. Check server logs for API route errors

---

**Last Updated:** 2026-06-21  
**Version:** 1.0
