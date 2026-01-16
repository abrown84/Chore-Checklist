export type SubscriptionPlan = 'free' | 'premium'
export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'canceled'
  | 'past_due'
  | 'incomplete'
  | 'incomplete_expired'
  | 'unpaid'
  | 'paused'
  | 'none'
export type BillingInterval = 'monthly' | 'yearly'

export interface Subscription {
  id: string
  userId: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  billingInterval?: BillingInterval
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  currentPeriodStart?: number
  currentPeriodEnd?: number
  trialStart?: number
  trialEnd?: number
  cancelAtPeriodEnd?: boolean
  createdAt: number
  updatedAt: number
}

// Subscription state for hooks
export interface SubscriptionState {
  subscription: Subscription | null
  isLoading: boolean
  isPremium: boolean
  isTrial: boolean
  isTrialing: boolean // Alias for isTrial for backward compatibility
  plan: SubscriptionPlan
  currentPlan: SubscriptionPlan // Alias for plan for backward compatibility
  trialDaysRemaining: number | null
  // Subscription actions
  startTrial: () => Promise<void>
  subscribe: (plan: SubscriptionPlan, billingInterval: BillingInterval, options?: { includeTrial?: boolean }) => Promise<void>
  cancelSubscription: () => Promise<void>
  manageSubscription: () => Promise<void>
}

// Feature gate state for hooks
export interface FeatureGateState {
  isEnabled: boolean
  isLoading: boolean
  showUpgradePrompt: () => void
}

// Stripe checkout session response
export interface CheckoutSessionResponse {
  sessionUrl: string
}

// Customer portal response
export interface CustomerPortalResponse {
  portalUrl: string
}

export interface PlanDetails {
  id: SubscriptionPlan
  name: string
  description: string
  monthlyPrice: number
  yearlyPrice: number
  features: PlanFeature[]
  isPopular?: boolean
  ctaText: string
  ctaVariant: 'primary' | 'secondary' | 'outline'
}

export interface PlanFeature {
  name: string
  included: boolean
  tooltip?: string
  isPremium?: boolean
}

// Premium features that can be gated
export type PremiumFeature =
  | 'unlimited_chores'
  | 'custom_rewards'
  | 'advanced_analytics'
  | 'photo_verification'
  | 'recurring_chores'
  | 'multiple_households'
  | 'priority_support'
  | 'export_data'
  | 'custom_themes'
  | 'achievements_advanced'

// Feature limits for free plan
export const FREE_PLAN_LIMITS = {
  maxChores: 10,
  maxRewards: 3,
  maxHouseholdMembers: 4,
  maxPhotosPerMonth: 5,
} as const

// Plan definitions
export const PLANS: Record<SubscriptionPlan, PlanDetails> = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Perfect for getting started',
    monthlyPrice: 0,
    yearlyPrice: 0,
    ctaText: 'Current Plan',
    ctaVariant: 'outline',
    features: [
      { name: 'Up to 10 chores', included: true },
      { name: 'Up to 4 household members', included: true },
      { name: 'Basic rewards', included: true },
      { name: 'Leaderboard', included: true },
      { name: 'Level progression', included: true },
      { name: 'Unlimited chores', included: false, isPremium: true },
      { name: 'Custom rewards', included: false, isPremium: true },
      { name: 'Advanced analytics', included: false, isPremium: true },
      { name: 'Photo verification', included: false, isPremium: true },
      { name: 'Priority support', included: false, isPremium: true },
    ],
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    description: 'For households that want more',
    monthlyPrice: 4.99,
    yearlyPrice: 39.99,
    isPopular: true,
    ctaText: 'Start Free Trial',
    ctaVariant: 'primary',
    features: [
      { name: 'Unlimited chores', included: true },
      { name: 'Unlimited household members', included: true },
      { name: 'Custom rewards', included: true },
      { name: 'Leaderboard', included: true },
      { name: 'Level progression', included: true },
      { name: 'Advanced analytics', included: true },
      { name: 'Photo verification', included: true },
      { name: 'Recurring chores', included: true },
      { name: 'Data export', included: true },
      { name: 'Priority support', included: true },
    ],
  },
}

// Feature to plan mapping
export const FEATURE_PLAN_MAP: Record<PremiumFeature, SubscriptionPlan> = {
  unlimited_chores: 'premium',
  custom_rewards: 'premium',
  advanced_analytics: 'premium',
  photo_verification: 'premium',
  recurring_chores: 'premium',
  multiple_households: 'premium',
  priority_support: 'premium',
  export_data: 'premium',
  custom_themes: 'premium',
  achievements_advanced: 'premium',
}
