# RRise - Project Documentation

## Overview

RRise is a personal growth and productivity platform with AI-powered habit tracking, task management, and goal achievement features.

## Architecture

### Frontend
- **Framework:** Next.js 16.2.9 (App Router)
- **Styling:** TailwindCSS
- **UI Components:** Custom components with shadcn/ui patterns
- **Animations:** Framer Motion
- **State Management:** React hooks (useState, useEffect, useContext)
- **Icons:** Lucide React

### Backend
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (Google OAuth, Email/Password)
- **API:** Next.js API Routes
- **Payment:** Stripe (checkout, webhooks)

### Supabase
- **Auth:** User authentication and session management
- **Database:** PostgreSQL with Row Level Security (RLS)
- **Real-time:** Subscriptions for real-time updates
- **Storage:** For file uploads (future)

### Stripe
- **Checkout:** Stripe Checkout for subscription payments
- **Webhooks:** Stripe webhooks for subscription events
- **Plans:** Free, Pro ($29/mo), Ultra ($99/mo)

### Admin
- **Dashboard:** Admin panel for user management
- **Access:** Supabase RLS policies
- **Operations:** Plan changes, usage reset, user deletion

### AI System
- **Free Mode:** Template-based responses
- **BYOK Mode:** User-provided API keys (OpenAI, Gemini, Anthropic, OpenRouter)
- **Pro Mode:** Hosted AI (coming soon)
- **Crisis Detection:** Self-harm/suicide keyword detection with crisis resources

## AI Modes

### Free Mode
- **Description:** Template-based AI responses
- **Features:**
  - Keyword-based template matching
  - Context-aware response generation
  - Plan suggestions from JSON templates
  - Limited AI usage
- **Access:** All users

### BYOK Mode (Bring Your Own Key)
- **Description:** Users provide their own AI API keys
- **Supported Providers:**
  - OpenAI (GPT models)
  - Google Gemini (gemini-pro)
  - Anthropic (Claude models)
  - OpenRouter (multi-provider)
- **Features:**
  - Real AI responses
  - Unlimited usage (subject to API key limits)
  - No platform fees
- **Access:** All users with API keys

### Pro Mode (Coming Soon)
- **Description:** Hosted AI with platform-provided API keys
- **Features:**
  - Unlimited AI usage
  - AI insights and recommendations
  - AI-generated plans
  - Advanced analytics
- **Access:** Pro and Ultra plan users

## User Roles

### User
- **Plan:** Free
- **Features:**
  - Goals, habits, tasks
  - Dashboards
  - Streaks
  - Mascot evolution
  - Limited AI usage (Free mode)
  - BYOK support

### Pro User
- **Plan:** Pro ($29/mo)
- **Features:**
  - All Free features
  - Unlimited AI usage (Pro mode - coming soon)
  - AI insights
  - AI recommendations
  - AI-generated plans
  - Advanced analytics

### Ultra User
- **Plan:** Ultra ($99/mo)
- **Features:**
  - All Pro features
  - Human accountability (coming soon)
  - Accountability check-ins (coming soon)
  - Personalized feedback (coming soon)
  - Community access (coming soon)

### Admin
- **Access:** Supabase RLS policies
- **Features:**
  - User management
  - Plan changes
  - Usage reset
  - Account suspension
  - User deletion
  - View all metrics

## Database Schema

### profiles
```sql
- id: uuid (primary key, references auth.users)
- email: text
- full_name: text
- plan: text (free, pro, ultra, suspended)
- created_at: timestamp
- updated_at: timestamp
- xp: integer (deprecated - using percentage-based progression)
- streak: integer
```

### habits
```sql
- id: uuid (primary key)
- user_id: uuid (references profiles.id)
- title: text
- description: json (contains icon)
- created_at: timestamp
- updated_at: timestamp
```

### habit_logs
```sql
- id: uuid (primary key)
- habit_id: uuid (references habits.id)
- user_id: uuid (references profiles.id)
- completed_at: timestamp
```

### tasks
```sql
- id: uuid (primary key)
- user_id: uuid (references profiles.id)
- title: text
- description: json (contains dueTime)
- status: text (pending, completed)
- due_date: date
- created_at: timestamp
- updated_at: timestamp
```

### task_logs
```sql
- id: uuid (primary key)
- task_id: uuid (references tasks.id)
- user_id: uuid (references profiles.id)
- completed_at: timestamp
```

### spending
```sql
- id: uuid (primary key)
- user_id: uuid (references profiles.id)
- description: text
- category: text (Food, Transport, Entertainment, Shopping)
- amount: number
- spent_at: timestamp
- created_at: timestamp
```

### subscriptions
```sql
- id: uuid (primary key)
- user_id: uuid (references profiles.id)
- stripe_customer_id: text
- stripe_subscription_id: text
- stripe_price_id: text
- status: text (active, cancelled, past_due)
- current_period_start: timestamp
- current_period_end: timestamp
- created_at: timestamp
- updated_at: timestamp
```

### payments
```sql
- id: uuid (primary key)
- user_id: uuid (references profiles.id)
- subscription_id: uuid (references subscriptions.id)
- stripe_payment_intent_id: text
- amount: number
- currency: text
- status: text (succeeded, failed, pending)
- created_at: timestamp
```

### billing_history
```sql
- id: uuid (primary key)
- user_id: uuid (references profiles.id)
- subscription_id: uuid (references subscriptions.id)
- amount: number
- currency: text
- description: text
- created_at: timestamp
```

### usage
```sql
- id: uuid (primary key)
- user_id: uuid (references profiles.id)
- ai_requests: integer
- tokens_used: integer
- period_start: timestamp
- period_end: timestamp
```

### ai_usage_logs
```sql
- id: uuid (primary key)
- user_id: uuid (references profiles.id)
- provider: text (openai, gemini, anthropic, openrouter)
- model: text
- tokens_used: integer
- created_at: timestamp
```

### api_keys (BYOK)
```sql
- id: uuid (primary key)
- user_id: uuid (references profiles.id)
- provider: text (openai, gemini, anthropic, openrouter)
- encrypted_key: text (future: encrypt)
- is_active: boolean
- created_at: timestamp
- updated_at: timestamp
```

### prompt_memory
```sql
- id: uuid (primary key)
- user_id: uuid (references profiles.id)
- memory_type: text (preferences, goals, template_history)
- memory_data: json
- created_at: timestamp
- updated_at: timestamp
```

## Admin Permissions

### User Management
- **View Users:** List all users with plan, email, created date
- **Change Plan:** Upgrade/downgrade user plan (free, pro, ultra, suspended)
- **Suspend Account:** Suspend user account
- **Delete User:** Delete user from database
- **Reset Usage:** Reset AI usage logs for a user

### Subscription Management
- **View Subscriptions:** List all active subscriptions
- **Cancel Subscription:** Cancel user subscription
- **Modify Subscription:** Change subscription plan
- **Refund:** Process refunds (via Stripe)

### Usage Management
- **View Usage:** View AI usage statistics
- **Reset Usage:** Reset usage for specific users
- **Adjust Limits:** Adjust monthly limits (future)
- **Grant Bonus Tokens:** Add bonus tokens (future)

### AI Key Management
- **View API Keys:** View user BYOK keys (encrypted)
- **Revoke Keys:** Revoke user API keys
- **Enable BYOK:** Enable BYOK for specific users
- **Disable BYOK:** Disable BYOK for specific users

### Billing Management
- **View Revenue:** View monthly revenue
- **View Payments:** View payment history
- **Process Refunds:** Process refunds via Stripe
- **View Invoices:** View Stripe invoices

## Known Issues

### BYOK System
- **Issue:** Gemini BYOK may show generic safety fallback for legitimate requests
- **Status:** Fixed with detailed logging and specific error messages
- **Note:** Check browser console for [BYOK DIAGNOSTIC] logs

### Admin Dashboard
- **Issue:** User counts may show 0 if no users exist
- **Status:** Fixed with detailed logging
- **Note:** Check browser console for [ADMIN] logs

### Crisis Detection
- **Issue:** Self-harm messages may trigger moderation instead of crisis support
- **Status:** Fixed - crisis detection now runs BEFORE moderation
- **Note:** Keywords: suicide, kill myself, hurt myself, self harm, end my life, want to die, no reason to live, better off dead

### XP System
- **Issue:** XP-based progression was inconsistent
- **Status:** Fixed - replaced with percentage-based progression
- **Note:** Evolution stages based on completion percentage (0-20 Egg, 21-40 Baby, 41-60 Young, 61-80 Adult, 81-100 Elder)

### Stripe Integration
- **Issue:** Stripe checkout not fully configured
- **Status:** Skeleton built, requires live API keys
- **Note:** Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY and STRIPE_SECRET_KEY to env

## Deployment Checklist

### Environment Variables
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- [ ] STRIPE_SECRET_KEY
- [ ] STRIPE_WEBHOOK_SECRET

### Supabase Setup
- [ ] Create Supabase project
- [ ] Set up authentication (Google OAuth, Email/Password)
- [ ] Create database tables (profiles, habits, tasks, etc.)
- [ ] Configure Row Level Security (RLS) policies
- [ ] Set up admin user with elevated permissions
- [ ] Test authentication flow

### Stripe Setup
- [ ] Create Stripe account
- [ ] Create products and prices (Free, Pro, Ultra)
- [ ] Configure webhook endpoints
- [ ] Add webhook secret to environment variables
- [ ] Test checkout flow
- [ ] Test webhook handling

### Admin Setup
- [ ] Create admin user in Supabase
- [ ] Configure RLS policies for admin access
- [ ] Test admin dashboard access
- [ ] Verify user management functions
- [ ] Verify usage reset function

### Domain Setup
- [ ] Configure custom domain
- [ ] Set up SSL certificates
- [ ] Configure DNS records
- [ ] Test domain accessibility

### Production Build
- [ ] Run `npm run build`
- [ ] Fix any TypeScript errors
- [ ] Fix any lint errors
- [ ] Test build output locally
- [ ] Deploy to production
- [ ] Run post-deployment tests

### Post-Deployment
- [ ] Verify authentication works
- [ ] Verify BYOK system works
- [ ] Verify admin dashboard works
- [ ] Verify Stripe checkout works
- [ ] Verify crisis detection works
- [ ] Monitor error logs
- [ ] Set up monitoring/alerting

## Development Notes

### BYOK Debug Card
- **Location:** Chat page (development only)
- **Shows:** Mode, Provider, Model, Status, Last Error
- **Environment:** Only visible when NODE_ENV=development
- **Purpose:** Debug BYOK API calls

### Console Logs
- **BYOK DIAGNOSTIC:** Detailed BYOK API call logs
- **ADMIN:** Admin dashboard data loading logs
- **Gemini BYOK:** Gemini-specific API logs

### Crisis Detection
- **Priority:** Runs BEFORE safety check
- **Keywords:** suicide, kill myself, hurt myself, self harm, end my life, want to die, no reason to live, better off dead
- **Response:** Crisis resources (988, Crisis Text Line, findahelpline.com)
- **Bypass:** Skips template matching and moderation

### Percentage-Based Progression
- **Formula:** (completed_tasks + completed_habits) / (total_tasks + total_habits) * 100
- **Evolution Stages:**
  - 0-20%: Egg
  - 21-40%: Baby
  - 41-60%: Young
  - 61-80%: Adult
  - 81-100%: Elder
- **Updates:** Instant via useEffect on habits/tasks state changes

## API Routes

### /api/checkout
- **Method:** POST
- **Purpose:** Create Stripe checkout session
- **Body:** { planId: string }
- **Response:** { url: string } (Stripe checkout URL)

### /api/webhooks/stripe
- **Method:** POST
- **Purpose:** Handle Stripe webhook events
- **Events:**
  - checkout.session.completed
  - customer.subscription.created
  - customer.subscription.updated
  - customer.subscription.deleted
  - invoice.payment_failed
- **Security:** Webhook signature verification

## File Structure

```
src/
├── app/
│   ├── app/
│   │   ├── chat/
│   │   ├── dashboard/
│   │   ├── habits/
│   │   ├── history/
│   │   ├── settings/
│   │   ├── spending/
│   │   └── tasks/
│   ├── admin/
│   ├── api/
│   │   ├── checkout/
│   │   └── webhooks/
│   │       └── stripe/
│   ├── checkout/
│   ├── payment-success/
│   ├── payment-cancelled/
│   ├── pricing/
│   └── ...
├── components/
│   ├── layout/
│   └── ui/
├── contexts/
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
├── lib/
│   ├── aiMode.ts
│   ├── aiSafety.ts
│   ├── audioManager.ts
│   ├── byok.ts
│   ├── dataLoader.ts
│   ├── memorySystem.ts
│   ├── planLogic.ts
│   ├── safetyPolicy.ts
│   ├── supabase.ts
│   └── templateLoader.ts
└── data/
    └── templates/
        ├── coding/
        ├── combined/
        ├── discipline/
        ├── fitness/
        ├── general/
        ├── productivity/
        ├── recovery/
        ├── relationships/
        ├── spending/
        ├── study/
        └── wellness/
```

## Support

For issues or questions:
1. Check browser console for diagnostic logs
2. Review this documentation
3. Check FINAL_AUDIT.md for recent changes
4. Contact development team
