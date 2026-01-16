import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader } from './ui/card'
import { Button } from './ui/button'
import {
  X,
  Check,
  Sparkles,
  Zap,
  Crown,
  Shield,
  Clock,
  Star,
} from 'lucide-react'
import { useSubscription } from '../hooks/useSubscription'
import { BillingInterval, PLANS } from '../types/subscription'
import { cn } from '../utils/cn'
import { EmbeddedCheckoutModal } from './EmbeddedCheckoutModal'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  feature?: string
  featureDescription?: string
}

const benefits = [
  {
    icon: Zap,
    title: 'Unlimited Chores',
    description: 'Create as many chores as you need',
  },
  {
    icon: Crown,
    title: 'Custom Rewards',
    description: 'Design personalized rewards for your family',
  },
  {
    icon: Shield,
    title: 'Photo Verification',
    description: 'Verify completed chores with photos',
  },
  {
    icon: Star,
    title: 'Advanced Analytics',
    description: 'Track detailed progress and insights',
  },
]

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  feature,
  featureDescription,
}) => {
  const { isLoading } = useSubscription()
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('yearly')
  const [showCheckout, setShowCheckout] = useState(false)

  const premiumPlan = PLANS.premium
  const monthlyPrice = premiumPlan.monthlyPrice
  const yearlyPrice = premiumPlan.yearlyPrice
  const yearlyMonthlyEquivalent = yearlyPrice / 12
  const savingsPercent = Math.round(
    ((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12)) * 100
  )

  const handleStartTrial = () => {
    // Open the embedded checkout modal
    setShowCheckout(true)
  }

  const handleCheckoutComplete = () => {
    setShowCheckout(false)
    onClose()
  }

  const handleCheckoutClose = () => {
    setShowCheckout(false)
  }

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
          />
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pointer-events-none"
          >
            <Card className="w-full max-w-lg border-border bg-card/95 backdrop-blur-md shadow-xl max-h-[90vh] overflow-y-auto relative pointer-events-auto">
              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute right-3 top-3 h-8 w-8 z-10"
              >
                <X className="h-4 w-4" />
              </Button>

              <CardHeader className="pb-2 text-center">
                {/* Premium badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="mx-auto mb-4"
                >
                  <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400/20 to-orange-400/20 px-4 py-2 border border-amber-400/30">
                    <Sparkles className="h-5 w-5 text-amber-400" />
                    <span className="text-sm font-semibold text-amber-400">
                      Premium
                    </span>
                  </div>
                </motion.div>

                <h2 className="text-2xl font-heading font-bold text-foreground">
                  Unlock Premium Features
                </h2>

                {feature && (
                  <div className="mt-3 p-3 rounded-lg bg-secondary/50 border border-border">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{feature}</span>
                      {featureDescription && ` - ${featureDescription}`}
                    </p>
                  </div>
                )}
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Benefits grid */}
                <div className="grid grid-cols-2 gap-3">
                  {benefits.map((benefit, index) => {
                    const IconComponent = benefit.icon
                    return (
                      <motion.div
                        key={benefit.title}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.1 }}
                        className="p-3 rounded-lg bg-secondary/30 border border-border/50"
                      >
                        <div className="flex items-start gap-2">
                          <div className="p-1.5 rounded-md bg-amber-400/20">
                            <IconComponent className="h-4 w-4 text-amber-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-foreground truncate">
                              {benefit.title}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                              {benefit.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Billing toggle */}
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2 p-1 rounded-full bg-secondary/50 border border-border">
                    <button
                      onClick={() => setBillingInterval('monthly')}
                      className={cn(
                        'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                        billingInterval === 'monthly'
                          ? 'bg-foreground text-background'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setBillingInterval('yearly')}
                      className={cn(
                        'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2',
                        billingInterval === 'yearly'
                          ? 'bg-foreground text-background'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      Yearly
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400 font-semibold">
                        Save {savingsPercent}%
                      </span>
                    </button>
                  </div>

                  {/* Price display */}
                  <motion.div
                    key={billingInterval}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                  >
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-foreground">
                        ${billingInterval === 'yearly' ? yearlyMonthlyEquivalent.toFixed(2) : monthlyPrice.toFixed(2)}
                      </span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    {billingInterval === 'yearly' && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Billed ${yearlyPrice.toFixed(2)} annually
                      </p>
                    )}
                  </motion.div>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={handleStartTrial}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-amber-400 to-orange-400 text-slate-900 hover:from-amber-300 hover:to-orange-300 font-semibold transition-all duration-200 min-h-[48px]"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Clock className="h-4 w-4" />
                      Start 14-day Free Trial
                    </span>
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Cancel anytime during your trial. No charge until trial ends.
                  </p>
                </div>

                {/* Feature list */}
                <div className="border-t border-border pt-4">
                  <h4 className="text-sm font-medium text-foreground mb-3">
                    Everything in Premium:
                  </h4>
                  <ul className="space-y-2">
                    {PLANS.premium.features.slice(0, 6).map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                        <span>{feature.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Security notice */}
                <div className="text-center pt-2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-secondary/70 px-3 py-1 text-xs text-muted-foreground ring-1 ring-border">
                    <Shield className="h-3.5 w-3.5" />
                    Secure payment powered by Stripe
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  // Use portal to render at document body level, avoiding parent transform/filter issues
  return (
    <>
      {createPortal(modalContent, document.body)}
      <EmbeddedCheckoutModal
        isOpen={showCheckout}
        onClose={handleCheckoutClose}
        billingInterval={billingInterval}
        includeTrial={true}
        onComplete={handleCheckoutComplete}
      />
    </>
  )
}
