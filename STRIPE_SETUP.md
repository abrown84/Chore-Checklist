# Stripe Payment Links Setup Guide

## Your Configuration

- **Convex Deployment:** `silent-puma-363`
- **Webhook URL:** `https://silent-puma-363.convex.site/stripe/webhook`

## Payment Links (Already Created)

- **Monthly ($4.99/mo):** https://buy.stripe.com/test_28E7sL6RNbQV4e5ba8efC00
- **Yearly ($39.99/yr):** https://buy.stripe.com/test_4gM00j7VR5sx7qh2DCefC01

---

## Step 1: Configure Payment Link Redirects

For **EACH** payment link, configure the success redirect:

1. Go to [Stripe Dashboard → Payment Links](https://dashboard.stripe.com/test/payment-links)
2. Click on your **Monthly** payment link
3. Click **Edit**
4. Scroll to **After payment** section
5. Select **"Don't show confirmation page"**
6. Enter redirect URL: `http://localhost:5173/?payment=success`
   - (For production: `https://yourdomain.com/?payment=success`)
7. Click **Save**
8. **Repeat for Yearly** payment link

---

## Step 2: Create Webhook Endpoint

1. Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click **"Add endpoint"**
3. Enter endpoint URL:
   ```
   https://silent-puma-363.convex.site/stripe/webhook
   ```
4. Click **"Select events"**
5. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
6. Click **"Add endpoint"**
7. **Copy the Signing Secret** (starts with `whsec_...`)

---

## Step 3: Set Convex Environment Variables

1. Go to [Convex Dashboard](https://dashboard.convex.dev/d/silent-puma-363)
2. Click **Settings** (gear icon) → **Environment Variables**
3. Add these variables:

| Variable | Value |
|----------|-------|
| `STRIPE_SECRET_KEY` | Your Stripe secret key (starts with `sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | The webhook signing secret from Step 2 (starts with `whsec_...`) |

**To find your Stripe Secret Key:**
- Go to [Stripe Dashboard → Developers → API Keys](https://dashboard.stripe.com/test/apikeys)
- Copy the **Secret key** (reveal it first)

---

## Step 4: Test the Integration

1. Start your dev server: `npm run dev`
2. Log in to your app
3. Go to the Pricing page
4. Click **"Start Free Trial"** on Premium
5. Use test card: `4242 4242 4242 4242` (any future expiry, any CVC)
6. Complete checkout
7. You should be redirected back with a success toast!

---

## Webhook Events Reference

| Event | What it does |
|-------|--------------|
| `checkout.session.completed` | Creates subscription record with user ID from Payment Link |
| `customer.subscription.created` | Fills in subscription details (status, period, etc.) |
| `customer.subscription.updated` | Updates subscription when plan changes |
| `customer.subscription.deleted` | Marks subscription as canceled |
| `invoice.payment_succeeded` | Updates subscription to active after payment |
| `invoice.payment_failed` | Marks subscription as past_due |

---

## Troubleshooting

**Webhook not receiving events?**
- Check the webhook URL is exactly: `https://silent-puma-363.convex.site/stripe/webhook`
- Verify the webhook is enabled in Stripe Dashboard
- Check Convex logs for errors

**User not getting premium after payment?**
- Ensure `client_reference_id` is being passed (check browser network tab)
- Check Convex function logs for webhook processing

**Payment link redirecting to wrong URL?**
- Edit the payment link and update the redirect URL
