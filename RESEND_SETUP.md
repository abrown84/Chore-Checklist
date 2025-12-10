# Resend Email Setup Guide

This guide will help you set up Resend for password reset emails in your Chore Checklist app.

## Step 1: Get Your Resend API Key

1. Go to [resend.com](https://resend.com) and sign in (or create an account)
2. Navigate to **API Keys** in your dashboard
3. Click **Create API Key**
4. Give it a name (e.g., "Chore Checklist Production")
5. Copy the API key (it starts with `re_`)

## Step 2: Set Up Your Sending Domain (Optional but Recommended)

### ❌ Can I Use Vercel's Domain?

**No, you cannot use Vercel's `.vercel.app` domain for email.** Vercel domains are for web hosting only and don't support email DNS records.

### ✅ Using Your Own Custom Domain

If you have a **custom domain** connected to Vercel (e.g., `yourdomain.com`), you can use it for email:

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `yourdomain.com`)
4. Resend will show you DNS records to add:
   - **TXT record** for domain verification
   - **SPF record** for email authentication
   - **DKIM records** for email signing
5. Add these records to your domain's DNS settings (wherever you manage your domain)
6. Wait for verification (usually a few minutes)
7. Once verified, you can use emails like `noreply@yourdomain.com`

**Where to add DNS records:**
- If you bought your domain from: GoDaddy, Namecheap, Google Domains, etc. → Add records in their DNS settings
- If using Cloudflare: Add records in Cloudflare DNS dashboard
- If using Vercel's domain management: You still need to add email records at your domain registrar

### 🧪 For Testing (No Custom Domain Needed)

You can use Resend's default email address for testing:
- `EMAIL_FROM`: `onboarding@resend.dev`
- Works immediately, no setup needed
- Limited to 100 emails/day on free tier
- Good for development and testing

## Step 3: Add Environment Variables to Convex

1. Go to your [Convex Dashboard](https://dashboard.convex.dev)
2. Select your deployment (e.g., `silent-puma-363`)
3. Navigate to **Settings** → **Environment Variables**
4. Click **Add Variable** and add the following:

### Required Variable:
- **Name**: `RESEND_API_KEY`
- **Value**: Your Resend API key (starts with `re_`)
- **Environment**: Select **Production** (and **Development** if you want it in dev too)

### Optional Variable:
- **Name**: `EMAIL_FROM`
- **Value**: The email address to send from (e.g., `noreply@yourdomain.com` or `onboarding@resend.dev`)
- **Environment**: Select **Production** (and **Development** if you want it in dev too)

**Note**: If you don't set `EMAIL_FROM`, it will default to `onboarding@resend.dev`.

## Step 4: Test the Setup

1. After adding the environment variables, your Convex functions will automatically use them
2. Try requesting a password reset:
   - Go to the sign-in page
   - Click "Forgot password?"
   - Enter your email address
   - Check your email for the reset code

## Troubleshooting

### Emails Not Sending

1. **Check API Key**: Verify your `RESEND_API_KEY` is correct in Convex dashboard
2. **Check Email Address**: Make sure the `EMAIL_FROM` address is verified in Resend
3. **Check Resend Dashboard**: Look at the Resend dashboard for any errors or delivery issues
4. **Check Console**: In development, check the Convex function logs for error messages

### Using Default Email Address (No Custom Domain Needed)

If you don't have a custom domain, you can use:
- `EMAIL_FROM`: `onboarding@resend.dev`

**Pros:**
- ✅ Works immediately, no DNS setup needed
- ✅ Perfect for development and testing
- ✅ Good for small projects

**Limitations:**
- ⚠️ Limited to 100 emails per day on free tier
- ⚠️ Emails may go to spam folders
- ⚠️ Not ideal for production with many users

**Recommendation:** Use `onboarding@resend.dev` for now, upgrade to a custom domain when you're ready for production.

### Production Best Practices

1. **Verify Your Domain**: Set up a custom domain in Resend
2. **Use a Professional Email**: Use something like `noreply@yourdomain.com` or `support@yourdomain.com`
3. **Monitor Email Delivery**: Check Resend dashboard regularly for delivery issues
4. **Set Up Webhooks** (Optional): Configure webhooks in Resend to track email events

## Environment Variables Summary

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `RESEND_API_KEY` | ✅ Yes | Your Resend API key | `re_1234567890abcdef` |
| `EMAIL_FROM` | ❌ No | Email address to send from | `noreply@yourdomain.com` |

## Security Notes

- **Never commit API keys to git** - They're stored securely in Convex dashboard
- **Use different API keys** for development and production if needed
- **Rotate API keys** periodically for security
- **Monitor usage** in Resend dashboard to detect any unauthorized use

## Next Steps

Once set up, password reset emails will be sent automatically when users request a password reset. The reset codes expire after 15 minutes for security.






