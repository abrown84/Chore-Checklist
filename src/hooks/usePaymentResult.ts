import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

/**
 * Hook to handle payment result URL parameters
 * Shows toast notifications for successful/canceled payments
 * and cleans up the URL
 */
export function usePaymentResult() {
  const hasHandled = useRef(false)

  useEffect(() => {
    // Only run once
    if (hasHandled.current) return

    const params = new URLSearchParams(window.location.search)

    // Handle session_id from Stripe embedded checkout return URL
    const sessionId = params.get('session_id')
    if (sessionId && !hasHandled.current) {
      hasHandled.current = true
      // Stripe redirected back after successful checkout
      toast.success('Payment successful!', {
        description: 'Welcome to Daily Bag Premium! Your subscription is now active.',
        duration: 5000,
      })
      // Clean up URL
      cleanupUrl()
      return
    }

    const paymentStatus = params.get('payment')

    if (paymentStatus === 'success') {
      hasHandled.current = true
      toast.success('Payment successful!', {
        description: 'Welcome to Daily Bag Premium! Your subscription is now active.',
        duration: 5000,
      })
      // Clean up URL
      cleanupUrl()
    } else if (paymentStatus === 'canceled') {
      hasHandled.current = true
      toast.info('Payment canceled', {
        description: 'No worries! You can upgrade anytime from the settings.',
        duration: 4000,
      })
      // Clean up URL
      cleanupUrl()
    }

    // Also handle legacy success/canceled params (from old implementation)
    const legacySuccess = params.get('success')
    const legacyCanceled = params.get('canceled')

    if (legacySuccess === 'true' && !hasHandled.current) {
      hasHandled.current = true
      toast.success('Payment successful!', {
        description: 'Welcome to Daily Bag Premium! Your subscription is now active.',
        duration: 5000,
      })
      cleanupUrl()
    } else if (legacyCanceled === 'true' && !hasHandled.current) {
      hasHandled.current = true
      toast.info('Payment canceled', {
        description: 'No worries! You can upgrade anytime from the settings.',
        duration: 4000,
      })
      cleanupUrl()
    }
  }, [])
}

/**
 * Remove payment-related params from URL without page reload
 */
function cleanupUrl() {
  const url = new URL(window.location.href)
  url.searchParams.delete('payment')
  url.searchParams.delete('session_id')
  url.searchParams.delete('success')
  url.searchParams.delete('canceled')

  // Update URL without reload
  window.history.replaceState({}, '', url.pathname + url.search)
}
