/**
 * Stripe Payment Configuration
 * Embedded Checkout for in-app subscription payments
 */

// Stripe Publishable Key (from environment)
// Required for embedded checkout - add VITE_STRIPE_PUBLISHABLE_KEY to .env.local
export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string

// Stripe Payment Links - kept for fallback/redirect scenarios
const STRIPE_PAYMENT_LINKS = {
  monthly: 'https://buy.stripe.com/9B6bJ04cXdjh6Y3gfc7EQ01',
  yearly: 'https://buy.stripe.com/bJe8wOaBl931dmr5Ay7EQ02',
} as const

/**
 * Build a payment link URL with user tracking parameters
 * @param interval - 'monthly' or 'yearly'
 * @param userId - The user's ID for tracking (client_reference_id)
 * @param email - Optional email to prefill in checkout
 * @returns Full payment link URL with tracking params
 */
export function buildPaymentLinkUrl(
  interval: 'monthly' | 'yearly',
  userId: string,
  email?: string
): string {
  const baseUrl = STRIPE_PAYMENT_LINKS[interval]
  const params = new URLSearchParams()

  // Add client_reference_id so webhook can identify the user
  params.set('client_reference_id', userId)

  // Prefill email if available
  if (email) {
    params.set('prefilled_email', email)
  }

  return `${baseUrl}?${params.toString()}`
}

/**
 * Get the success URL for post-payment redirect
 */
export function getSuccessUrl(): string {
  return `${window.location.origin}/?payment=success`
}

/**
 * Get the cancel URL for abandoned payment redirect
 */
export function getCancelUrl(): string {
  return `${window.location.origin}/?payment=canceled`
}
