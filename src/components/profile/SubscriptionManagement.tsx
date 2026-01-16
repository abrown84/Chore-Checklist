import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { useSubscription } from '../../hooks/useSubscription'
import { CreditCard } from 'lucide-react'

/**
 * Subscription management component for user profile
 * Shows current plan and upgrade options
 */
export const SubscriptionManagement: React.FC = React.memo(() => {
  const { plan, isLoading } = useSubscription()

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Subscription
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium capitalize">{plan} Plan</p>
            <p className="text-sm text-muted-foreground">
              {plan === 'free'
                ? 'Upgrade to unlock more features'
                : 'Thank you for your support!'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

SubscriptionManagement.displayName = 'SubscriptionManagement'
