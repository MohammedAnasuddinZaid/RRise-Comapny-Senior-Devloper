# Stripe Setup Guide for RRise

This guide will help you set up Stripe for processing payments and managing subscriptions for RRise.

## What You'll Need from Stripe

You will need to provide these values to the developer:

1. **Stripe Publishable Key** (starts with `pk_...`)
   - Used in the frontend for creating checkout sessions
   - Safe to include in client-side code

2. **Stripe Secret Key** (starts with `sk_...`)
   - Used in the backend for API calls
   - Never share this publicly or commit to git

3. **Stripe Webhook Signing Secret** (starts with `whsec_...`)
   - Used to verify webhook events are from Stripe
   - Never share this publicly or commit to git

4. **Price IDs for Pro and Ultra plans**
   - These identify the specific subscription products you create
   - Format: `price_pro_xxxxx` and `price_ultra_xxxxx`

## Step-by-Step Setup

### 1. Log into Stripe Dashboard

1. Go to [stripe.com](https://stripe.com)
2. Click "Sign in" in the top right
3. Enter your email and password
4. If you don't have an account, click "Start now" to create one

### 2. Find Your API Keys

1. In the Stripe Dashboard, click **Developers** in the left sidebar
2. Click **API keys**
3. You'll see two sections: **Publishable key** and **Secret key**
4. Copy the **Publishable key** (starts with `pk_`)
5. Copy the **Secret key** (starts with `sk_`)

**Important:** 
- Make sure you're in the correct mode (Test vs Live)
- Test mode is for development and uses fake card numbers
- Live mode is for real payments with real cards

### 3. Create Products and Prices

#### Create Pro Plan Product

1. Click **Products** in the left sidebar
2. Click **Add product**
3. Fill in the product details:
   - **Name:** RRise Pro
   - **Description:** Premium plan with BYOK support and higher limits
   - **Pricing model:** Recurring subscription
   - **Price:** $29/month (or your chosen price)
   - **Currency:** USD (or your preferred currency)
4. Click **Add product**

#### Create Ultra Plan Product

1. Click **Add product** again
2. Fill in the product details:
   - **Name:** RRise Ultra
   - **Description:** Premium tier with unlimited limits and advanced AI
   - **Pricing model:** Recurring subscription
   - **Price:** $99/month (or your chosen price)
   - **Currency:** USD (or your preferred currency)
3. Click **Add product**

### 4. Get Price IDs

1. After creating each product, you'll see a **Pricing** section
2. Copy the **Price ID** for each plan
3. The Price ID will look like: `price_1xxxxx...`
4. Note: The code expects price IDs starting with `price_pro_` and `price_ultra_`
   - You may need to manually rename them or update the code to match your actual price IDs

### 5. Set Up Webhooks

1. Click **Developers** in the left sidebar
2. Click **Webhooks**
3. Click **Add endpoint**
4. Enter your webhook URL:
   - **Development:** `https://your-localhost-url.com/api/webhooks/stripe`
   - **Production:** `https://your-domain.com/api/webhooks/stripe`
5. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
6. Click **Add endpoint**
7. After creating, click on the endpoint to see the **Signing secret**
8. Copy the **Signing secret** (starts with `whsec_`)

### 6. Switch Between Test and Live Mode

**Test Mode:**
- Use fake card numbers for testing
- No real money is charged
- Good for development and testing the flow

**Live Mode:**
- Real payments with real cards
- Actual money is processed
- Only switch to live after thorough testing

To switch modes:
- Click **Test mode** or **Live mode** toggle in the top-right of the Stripe Dashboard
- Your API keys will be different for each mode

## What the Developer Needs From You

Provide these values to add to the `.env.local` file:

```env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PRICE_PRO=price_pro_xxxxx
STRIPE_PRICE_ULTRA=price_ultra_xxxxx

# App URL (for redirect after payment)
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Security Best Practices

**NEVER share these publicly:**
- Stripe Secret Key
- Stripe Webhook Signing Secret
- Any private keys or secrets

**ALWAYS:**
- Keep these in environment variables
- Never commit `.env` files to git
- Rotate keys if they're accidentally exposed
- Use different keys for test and live environments

## Testing the Payment Flow

### Test Card Numbers (Test Mode Only)

Use these card numbers to test different scenarios:

- **Successful payment:** `4242 4242 4242 4242`
- **Payment declined:** `4000 0000 0000 0002`
- **Insufficient funds:** `4000 0025 0000 3155`
- **Expired card:** `4000 0000 0000 0069`

For any card, use:
- **Expiry:** Any future date (e.g., 12/34)
- **CVC:** Any 3 digits (e.g., 123)
- **ZIP:** Any 5 digits (e.g., 12345)

## Troubleshooting

### Webhook Not Receiving Events
- Check that the webhook URL is correct
- Verify the endpoint is deployed and accessible
- Check Stripe Dashboard webhook logs for errors

### Payment Failing
- Verify you're using test card numbers in test mode
- Check that price IDs match what's in the code
- Review webhook logs for error messages

### Plan Not Updating After Payment
- Check that webhook is receiving events
- Verify Supabase service role key is configured
- Check webhook handler logs for errors

## Support

If you encounter issues:
1. Check Stripe Dashboard logs
2. Review webhook events
3. Contact the developer with error messages
4. Stripe support: [stripe.com/help](https://stripe.com/help)

