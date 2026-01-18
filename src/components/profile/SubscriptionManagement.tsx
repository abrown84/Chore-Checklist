import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { useSubscription } from '../../hooks/useSubscription'
import { CreditCard, Crown, Clock, AlertCircle, ExternalLink, Loader2 } from 'lucide-react'

/**
 * Subscription management component for user profile
 * Shows current plan, trial status, and management options
 */
export const SubscriptionManagement: React.FC = React.memo(() => {
  const {
    plan,
    isLoading,
    isPremium,
    isTrial,
    trialDaysRemaining,
    subscription,
    manageSubscription
  } = useSubscription()

  const [isManaging, setIsManaging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleManageSubscription = async () => {
    setIsManaging(true)
    setError(null)
    try {
      await manageSubscription()
    } catch (err) {
      setError('Failed to open subscription management. Please try again.')
      console.error('Manage subscription error:', err)
    } finally {
      setIsManaging(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-8 bg-muted rounded" />
        </CardContent>
      </Card>
    )
  }

  const cancelAtPeriodEnd = subscription?.cancelAtPeriodEnd

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Subscription
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Plan Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isPremium && <Crown className="h-5 w-5 text-yellow-500" />}
            <div>
              <p className="font-medium capitalize">
                {plan === 'premium' ? 'Premium' : 'Free'} Plan
                {isTrial && (
                  <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                    Trial
                  </span>
                )}
              </p>
              <p className="text-sm text-muted-foreground">
                {plan === 'free'
                  ? 'Upgrade to unlock more features'
                  : isTrial
                    ? 'Enjoying your free trial!'
                    : 'Thank you for your support!'}
              </p>
            </div>
          </div>
        </div>

        {/* Trial Days Remaining */}
        {isTrial && trialDaysRemaining !== null && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-blue-700 dark:text-blue-300">
              {trialDaysRemaining === 0
                ? 'Your trial ends today'
                : trialDaysRemaining === 1
                  ? '1 day remaining in trial'
                  : `${trialDaysRemaining} days remaining in trial`}
            </span>
          </div>
        )}

        {/* Cancel at Period End Warning */}
        {cancelAtPeriodEnd && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <span className="text-sm text-yellow-700 dark:text-yellow-300">
              Your subscription will end at the current billing period
            </span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
          </div>
        )}

        {/* Management Button for Premium/Trial Users */}
        {isPremium && (
          <Button
            onClick={handleManageSubscription}
            disabled={isManaging}
            variant="outline"
            className="w-full"
          >
            {isManaging ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Opening...
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4 mr-2" />
                {isTrial ? 'Cancel Trial' : 'Manage Subscription'}
              </>
            )}
          </Button>
        )}

        {/* Info text */}
        {isPremium && (
          <p className="text-xs text-muted-foreground text-center">
            {isTrial
              ? 'Cancel anytime during your trial - no charges until trial ends'
              : 'Update payment method, change plan, or cancel subscription'}
          </p>
        )}
      </CardContent>
    </Card>
  )
})

SubscriptionManagement.displayName = 'SubscriptionManagement'
