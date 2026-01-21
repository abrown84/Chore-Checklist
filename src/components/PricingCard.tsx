import React, { useRef, useEffect } from 'react'
import { animate } from 'animejs'
import { Card, CardContent, CardHeader } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Check, X, Crown, Sparkle } from '@phosphor-icons/react'
import { PlanDetails, BillingInterval, SubscriptionPlan } from '../types/subscription'
import { cn } from '../utils/cn'

interface PricingCardProps {
  plan: PlanDetails
  billingInterval: BillingInterval
  isCurrentPlan?: boolean
  onSelect: (planId: SubscriptionPlan) => void
  isLoading?: boolean
  index?: number
}

export const PricingCard: React.FC<PricingCardProps> = ({
  plan,
  billingInterval,
  isCurrentPlan = false,
  onSelect,
  isLoading = false,
  index = 0,
}) => {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (cardRef.current) {
      animate(cardRef.current, {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 500,
        delay: index * 100,
        ease: 'outQuart',
      })
    }
  }, [])
  const price = billingInterval === 'yearly' ? plan.yearlyPrice / 12 : plan.monthlyPrice
  const totalPrice = billingInterval === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice
  const isFreePlan = plan.id === 'free'
  const isPremiumPlan = plan.id === 'premium'

  const getCtaText = () => {
    if (isCurrentPlan) return 'Current Plan'
    if (isFreePlan) return 'Get Started Free'
    return plan.ctaText
  }

  const getCtaVariant = (): 'default' | 'outline' | 'secondary' => {
    if (isCurrentPlan) return 'outline'
    if (isPremiumPlan) return 'default'
    return 'secondary'
  }

  return (
    <div
      ref={cardRef}
      className="relative opacity-0"
    >
      {/* Popular badge */}
      {plan.isPopular && !isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <Badge className="bg-gradient-to-r from-amber-400 to-orange-400 text-slate-900 border-0 px-3 py-1">
            <Sparkle className="h-3 w-3 mr-1" />
            Most Popular
          </Badge>
        </div>
      )}

      {/* Current plan badge */}
      {isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-3 py-1">
            <Check className="h-3 w-3 mr-1" />
            Current Plan
          </Badge>
        </div>
      )}

      <Card
        className={cn(
          'h-full transition-all duration-300',
          plan.isPopular && !isCurrentPlan
            ? 'border-amber-400/50 shadow-lg shadow-amber-400/10 hover:shadow-amber-400/20'
            : 'border-border hover:border-border/80',
          isCurrentPlan && 'border-green-500/30 bg-green-500/5'
        )}
      >
        <CardHeader className="text-center pb-4 pt-8">
          {/* Plan icon */}
          <div className="mx-auto mb-4">
            <div
              className={cn(
                'inline-flex items-center justify-center w-14 h-14 rounded-2xl',
                isPremiumPlan
                  ? 'bg-gradient-to-br from-amber-400/20 to-orange-400/20 border border-amber-400/30'
                  : 'bg-secondary/50 border border-border'
              )}
            >
              {isPremiumPlan ? (
                <Crown className="h-7 w-7 text-amber-400" />
              ) : (
                <Sparkle className="h-7 w-7 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Plan name */}
          <h3 className="text-xl font-heading font-bold text-foreground">
            {plan.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>

          {/* Price */}
          <div className="mt-4">
            {isFreePlan ? (
              <div className="text-4xl font-bold text-foreground">Free</div>
            ) : (
              <>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-foreground">
                    ${price.toFixed(2)}
                  </span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                {billingInterval === 'yearly' && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Billed ${totalPrice.toFixed(2)} annually
                  </p>
                )}
              </>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* CTA Button */}
          <Button
            onClick={() => onSelect(plan.id)}
            disabled={isCurrentPlan || isLoading}
            variant={getCtaVariant()}
            className={cn(
              'w-full min-h-[48px] font-semibold',
              isPremiumPlan &&
                !isCurrentPlan &&
                'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-900 hover:from-amber-300 hover:to-orange-300'
            )}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                Processing...
              </div>
            ) : (
              getCtaText()
            )}
          </Button>

          {/* Features list */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">
              {isFreePlan ? 'Includes:' : 'Everything in Free, plus:'}
            </h4>
            <ul className="space-y-2.5">
              {plan.features.map((feature, featureIndex) => (
                <li
                  key={featureIndex}
                  className={cn(
                    'flex items-start gap-2 text-sm',
                    feature.included
                      ? 'text-foreground'
                      : 'text-muted-foreground/50'
                  )}
                >
                  {feature.included ? (
                    <Check
                      className={cn(
                        'h-4 w-4 mt-0.5 flex-shrink-0',
                        feature.isPremium ? 'text-amber-400' : 'text-green-400'
                      )}
                    />
                  ) : (
                    <X className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground/30" />
                  )}
                  <span
                    className={cn(
                      feature.isPremium && feature.included && 'text-amber-400'
                    )}
                  >
                    {feature.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
