/**
 * Stripe Payment Configuration
 * Payment Links for subscription checkout
 */

// Stripe Payment Links (test mode)
// These are direct checkout URLs - users click and go to Stripe-hosted payment page
export const STRIPE_PAYMENT_LINKS = {
  // Monthly subscription: $4.99/month
  monthly: 'https://buy.stripe.com/test_28E7sL6RNbQV4e5ba8efC00',
  // Yearly subscription: $39.99/year (save ~33%)
  yearly: 'https://buy.stripe.com/test_4gM00j7VR5sx7qh2DCefC01',
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
