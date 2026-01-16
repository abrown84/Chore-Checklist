import { PremiumFeature, FEATURE_PLAN_MAP } from '../types/subscription'

// Free tier limitations
export const FREE_TIER_LIMITS = {
  maxHouseholds: 1,
  maxMembersPerHousehold: 4,
  maxChoresPerDay: 20,
  maxStoragePhotos: 50,
} as const

// Premium tier limits (effectively unlimited)
export const PREMIUM_TIER_LIMITS = {
  maxHouseholds: 10,
  maxMembersPerHousehold: 50,
  maxChoresPerDay: 1000,
  maxStoragePhotos: 10000,
} as const

// List of all premium features (derived from FEATURE_PLAN_MAP)
export const PREMIUM_FEATURES: PremiumFeature[] = Object.keys(FEATURE_PLAN_MAP) as PremiumFeature[]

// Feature descriptions for UI display
export const FEATURE_DESCRIPTIONS: Record<PremiumFeature, { title: string; description: string }> = {
  unlimited_chores: {
    title: 'Unlimited Chores',
    description: 'Create as many chores as you need',
  },
  custom_rewards: {
    title: 'Custom Rewards',
    description: 'Create custom rewards for your household',
  },
  advanced_analytics: {
    title: 'Advanced Analytics',
    description: 'Detailed charts and insights about chore completion',
  },
  photo_verification: {
    title: 'Photo Verification',
    description: 'Require photo proof for chore completion',
  },
  recurring_chores: {
    title: 'Recurring Chores',
    description: 'Set up chores that repeat on a schedule',
  },
  multiple_households: {
    title: 'Multiple Households',
    description: 'Manage multiple households from one account',
  },
  priority_support: {
    title: 'Priority Support',
    description: 'Get faster response times from our support team',
  },
  export_data: {
    title: 'Export Data',
    description: 'Export your chore history and statistics',
  },
  custom_themes: {
    title: 'Custom Themes',
    description: 'Personalize the app with custom color themes',
  },
  achievements_advanced: {
    title: 'Advanced Achievements',
    description: 'Unlock additional achievement badges and rewards',
  },
}

// Check if a feature is premium
export function isPremiumFeature(feature: PremiumFeature): boolean {
  return FEATURE_PLAN_MAP[feature] === 'premium'
}

// Get tier limits based on plan
export function getTierLimits(plan: 'free' | 'premium') {
  return plan === 'premium' ? PREMIUM_TIER_LIMITS : FREE_TIER_LIMITS
}
