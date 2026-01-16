import { useQuery, useAction } from 'convex/react'
import { useConvexAuth as useConvexAuthState } from 'convex/react'
import { useMemo, useCallback } from 'react'
import { api } from '../../convex/_generated/api'
import { SubscriptionState, SubscriptionPlan, BillingInterval } from '../types/subscription'
import { buildPaymentLinkUrl } from '../config/stripe'

/**
 * Hook to get current subscription status and actions
 * Uses Stripe Payment Links for checkout and the Stripe component for management
 */
export function useSubscription(): SubscriptionState {
  // Get auth state from Convex's built-in hook
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuthState()

  // Query current user for ID and email
  const currentUser = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? {} : 'skip'
  )

  // Query current subscription using the stripe module
  const subscriptionData = useQuery(
    api.stripe.getUserSubscription,
    isAuthenticated ? {} : 'skip'
  )

  // Get Stripe portal action (for managing existing subscriptions)
  const createPortalSessionAction = useAction(api.stripe.createCustomerPortalSession)

  // Combined loading state
  const isLoading = isAuthLoading || (isAuthenticated && subscriptionData === undefined)

  // Subscribe to a plan (redirects to Stripe Payment Link)
  const subscribe = useCallback(async (
    plan: SubscriptionPlan,
    billingInterval: BillingInterval
  ) => {
    if (plan === 'free') {
      console.log('Free plan selected - no checkout needed')
      return
    }

    if (!currentUser?._id) {
      throw new Error('Please sign in to subscribe')
    }

    try {
      // Build payment link URL with user tracking
      const paymentUrl = buildPaymentLinkUrl(
        billingInterval,
        currentUser._id,
        currentUser.email || undefined
      )

      // Redirect to Stripe Payment Link
      window.location.href = paymentUrl
    } catch (error) {
      console.error('Checkout error:', error)
      throw error
    }
  }, [currentUser])

  // Cancel or manage subscription (redirects to Stripe Customer Portal)
  const cancelSubscription = useCallback(async () => {
    try {
      const result = await createPortalSessionAction({
        returnUrl: window.location.origin,
      })

      if (result?.url) {
        window.location.href = result.url
      } else {
        throw new Error('Failed to create portal session')
      }
    } catch (error) {
      console.error('Portal error:', error)
      throw error
    }
  }, [createPortalSessionAction])

  // Manage subscription (same as cancel - portal handles everything)
  const manageSubscription = cancelSubscription

  // Start trial - subscribe to premium monthly
  // Note: Trial periods are configured in Stripe Dashboard on the price itself
  const startTrial = useCallback(async () => {
    await subscribe('premium', 'monthly')
  }, [subscribe])

  // Derive subscription state
  const subscriptionState = useMemo((): SubscriptionState => {
    // Default state when not authenticated or loading
    if (!isAuthenticated || !subscriptionData) {
      return {
        subscription: null,
        isLoading,
        isPremium: false,
        isTrial: false,
        isTrialing: false,
        plan: 'free' as SubscriptionPlan,
        currentPlan: 'free' as SubscriptionPlan,
        trialDaysRemaining: null,
        startTrial,
        subscribe,
        cancelSubscription,
        manageSubscription,
      }
    }

    // Check if currently in trial
    const isTrial = subscriptionData.status === 'trialing'

    // Calculate trial days remaining
    let trialDaysRemaining: number | null = null
    if (isTrial && subscriptionData.trialEnd) {
      const now = Date.now()
      const remaining = subscriptionData.trialEnd - now
      const days = Math.ceil(remaining / (1000 * 60 * 60 * 24))
      trialDaysRemaining = Math.max(0, days)
    }

    return {
      subscription: subscriptionData.stripeSubscriptionId ? {
        id: subscriptionData.stripeSubscriptionId,
        userId: '',
        plan: subscriptionData.plan as SubscriptionPlan,
        status: subscriptionData.status || 'active',
        currentPeriodEnd: subscriptionData.currentPeriodEnd || undefined,
        cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd,
        trialEnd: subscriptionData.trialEnd,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } : null,
      isLoading,
      isPremium: subscriptionData.isPremium,
      isTrial,
      isTrialing: isTrial,
      plan: subscriptionData.plan as SubscriptionPlan,
      currentPlan: subscriptionData.plan as SubscriptionPlan,
      trialDaysRemaining,
      startTrial,
      subscribe,
      cancelSubscription,
      manageSubscription,
    }
  }, [subscriptionData, isAuthenticated, isLoading, startTrial, subscribe, cancelSubscription, manageSubscription])

  return subscriptionState
}
