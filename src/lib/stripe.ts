/**
 * Stripe client utilities for subscription management
 * Handles redirects to Stripe Checkout and Customer Portal
 */

/**
 * Redirect to Stripe Checkout for subscription purchase
 * @param sessionUrl - The Stripe Checkout session URL from the backend
 */
export async function redirectToCheckout(sessionUrl: string): Promise<void> {
  if (!sessionUrl) {
    throw new Error('No checkout session URL provided')
  }

  // Validate URL format
  try {
    const url = new URL(sessionUrl)
    if (!url.hostname.includes('stripe.com') && !url.hostname.includes('checkout.stripe.com')) {
      // Allow localhost for testing
      if (!url.hostname.includes('localhost')) {
        throw new Error('Invalid Stripe checkout URL')
      }
    }
  } catch {
    throw new Error('Invalid checkout session URL')
  }

  // Redirect to Stripe Checkout
  window.location.href = sessionUrl
}

/**
 * Redirect to Stripe Customer Portal for subscription management
 * @param portalUrl - The Stripe Customer Portal URL from the backend
 */
export async function redirectToCustomerPortal(portalUrl: string): Promise<void> {
  if (!portalUrl) {
    throw new Error('No customer portal URL provided')
  }

  // Validate URL format
  try {
    const url = new URL(portalUrl)
    if (!url.hostname.includes('stripe.com') && !url.hostname.includes('billing.stripe.com')) {
      // Allow localhost for testing
      if (!url.hostname.includes('localhost')) {
        throw new Error('Invalid Stripe portal URL')
      }
    }
  } catch {
    throw new Error('Invalid customer portal URL')
  }

  // Redirect to Customer Portal
  window.location.href = portalUrl
}

/**
 * Format price for display
 * @param amount - Price in cents
 * @param currency - Currency code (default: 'usd')
 */
export function formatPrice(amount: number, currency: string = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount / 100)
}

/**
 * Calculate trial days remaining
 * @param trialEnd - Trial end timestamp in milliseconds
 */
export function getTrialDaysRemaining(trialEnd: number | undefined): number {
  if (!trialEnd) return 0

  const now = Date.now()
  const remaining = trialEnd - now
  const days = Math.ceil(remaining / (1000 * 60 * 60 * 24))

  return Math.max(0, days)
}

/**
 * Check if trial is expiring soon (within 3 days)
 * @param trialEnd - Trial end timestamp in milliseconds
 */
export function isTrialExpiringSoon(trialEnd: number | undefined): boolean {
  const daysRemaining = getTrialDaysRemaining(trialEnd)
  return daysRemaining > 0 && daysRemaining <= 3
}

/**
 * Format subscription period end date
 * @param periodEnd - Period end timestamp in milliseconds
 */
export function formatPeriodEnd(periodEnd: number | undefined): string {
  if (!periodEnd) return ''

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(periodEnd))
}
