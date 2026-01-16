import { useCallback, useMemo } from 'react'
import { PremiumFeature, FeatureGateState } from '../types/subscription'
import { isPremiumFeature, FREE_TIER_LIMITS, FEATURE_DESCRIPTIONS } from '../config/features'
import { useSubscription } from './useSubscription'

// Extended feature gate options for components that need usage tracking
interface UseFeatureGateOptions {
  feature: PremiumFeature
  currentUsage?: number
  onUpgradePrompt?: () => void
}

// Extended feature gate state for components with usage tracking
interface ExtendedFeatureGateState {
  hasAccess: boolean
  isEnabled: boolean
  isAtLimit: boolean
  currentLimit: number | null
  isLoading: boolean
  showUpgradePrompt: () => void
  checkAccess: () => boolean
}

// Map features to their free tier limits
const FEATURE_LIMITS: Partial<Record<PremiumFeature, number>> = {
  unlimited_chores: FREE_TIER_LIMITS.maxChoresPerDay,
  multiple_households: FREE_TIER_LIMITS.maxHouseholds,
  photo_verification: FREE_TIER_LIMITS.maxStoragePhotos,
}

/**
 * Hook to check if a feature is available for the current user
 * Supports both simple feature name and options object
 */
export function useFeatureGate(featureOrOptions: PremiumFeature | UseFeatureGateOptions): FeatureGateState & ExtendedFeatureGateState {
  const { isPremium, isLoading } = useSubscription()

  // Normalize the input
  const options: UseFeatureGateOptions = typeof featureOrOptions === 'string'
    ? { feature: featureOrOptions }
    : featureOrOptions

  const { feature, currentUsage = 0, onUpgradePrompt } = options

  // Get the limit for this feature (null if no limit or premium)
  const currentLimit = useMemo(() => {
    if (isPremium) return null
    return FEATURE_LIMITS[feature] ?? null
  }, [feature, isPremium])

  // Check if feature is enabled (user has premium or feature is free)
  const isEnabled = useMemo(() => {
    if (isPremiumFeature(feature)) {
      return isPremium
    }
    return true
  }, [feature, isPremium])

  // Check if at limit for limited features
  const isAtLimit = useMemo(() => {
    if (isPremium) return false
    if (currentLimit === null) return false
    return currentUsage >= currentLimit
  }, [isPremium, currentLimit, currentUsage])

  // User has access if feature is enabled and not at limit
  const hasAccess = isEnabled && !isAtLimit

  // Function to show upgrade prompt
  const showUpgradePrompt = useCallback(() => {
    if (onUpgradePrompt) {
      onUpgradePrompt()
    } else {
      // Dispatch custom event that can be caught by an upgrade modal component
      const event = new CustomEvent('show-upgrade-prompt', {
        detail: { feature },
      })
      window.dispatchEvent(event)
    }
  }, [feature, onUpgradePrompt])

  // Check access and trigger prompt if needed
  const checkAccess = useCallback(() => {
    if (!hasAccess) {
      showUpgradePrompt()
      return false
    }
    return true
  }, [hasAccess, showUpgradePrompt])

  return {
    // FeatureGateState interface
    isEnabled,
    isLoading,
    showUpgradePrompt,
    // Extended state for components
    hasAccess,
    isAtLimit,
    currentLimit,
    checkAccess,
  }
}

/**
 * Hook to get the message/description for a premium feature
 */
export function useFeatureMessage(feature: PremiumFeature): { title: string; description: string } {
  return useMemo(() => {
    return FEATURE_DESCRIPTIONS[feature] || {
      title: feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: 'This feature requires a premium subscription.',
    }
  }, [feature])
}

/**
 * Hook to check multiple features at once
 * Useful when a component requires multiple premium features
 */
export function useMultipleFeatureGates(features: PremiumFeature[]): {
  allEnabled: boolean
  enabledFeatures: PremiumFeature[]
  disabledFeatures: PremiumFeature[]
  isLoading: boolean
  showUpgradePrompt: (feature?: PremiumFeature) => void
} {
  const { isPremium, isLoading } = useSubscription()

  const { enabledFeatures, disabledFeatures, allEnabled } = useMemo(() => {
    const enabled: PremiumFeature[] = []
    const disabled: PremiumFeature[] = []

    for (const feature of features) {
      if (isPremiumFeature(feature)) {
        if (isPremium) {
          enabled.push(feature)
        } else {
          disabled.push(feature)
        }
      } else {
        enabled.push(feature)
      }
    }

    return {
      enabledFeatures: enabled,
      disabledFeatures: disabled,
      allEnabled: disabled.length === 0,
    }
  }, [features, isPremium])

  const showUpgradePrompt = useCallback(
    (feature?: PremiumFeature) => {
      const event = new CustomEvent('show-upgrade-prompt', {
        detail: { feature: feature || disabledFeatures[0] },
      })
      window.dispatchEvent(event)
    },
    [disabledFeatures]
  )

  return {
    allEnabled,
    enabledFeatures,
    disabledFeatures,
    isLoading,
    showUpgradePrompt,
  }
}
