import React, { useState } from 'react'
import { Crown, Clock, Sparkles, ChevronRight } from 'lucide-react'
import { useSubscription } from '../hooks/useSubscription'
import { UpgradeModal } from './UpgradeModal'
import { cn } from '../utils/cn'

interface SubscriptionBadgeProps {
  className?: string
  showManageLink?: boolean
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
}

export const SubscriptionBadge: React.FC<SubscriptionBadgeProps> = ({
  className,
  showManageLink = true,
  size = 'md',
  onClick,
}) => {
  const { isPremium, isTrialing, trialDaysRemaining } = useSubscription()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else if (!isPremium || isTrialing) {
      setShowUpgradeModal(true)
    }
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  }

  // Free plan badge
  if (!isPremium && !isTrialing) {
    return (
      <>
        <button
          onClick={handleClick}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full font-medium transition-all duration-200',
            'bg-secondary/70 text-muted-foreground hover:bg-secondary hover:text-foreground',
            'border border-border/50 hover:border-border',
            'hover:scale-[1.02] active:scale-[0.98]',
            sizeClasses[size],
            showManageLink && 'cursor-pointer',
            className
          )}
        >
          <Sparkles className={iconSizes[size]} />
          <span>Free</span>
          {showManageLink && (
            <ChevronRight className={cn(iconSizes[size], 'opacity-50')} />
          )}
        </button>
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
        />
      </>
    )
  }

  // Trial badge
  if (isTrialing && trialDaysRemaining !== null) {
    return (
      <>
        <button
          onClick={handleClick}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full font-medium transition-all duration-200',
            trialDaysRemaining <= 3
              ? 'bg-orange-500/20 text-orange-400 border-orange-500/30 hover:bg-orange-500/30'
              : 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30',
            'border',
            'hover:scale-[1.02] active:scale-[0.98]',
            sizeClasses[size],
            showManageLink && 'cursor-pointer',
            className
          )}
        >
          <Clock className={iconSizes[size]} />
          <span>
            Trial
            {trialDaysRemaining > 0 && (
              <span className="ml-1 opacity-80">
                ({trialDaysRemaining} day{trialDaysRemaining !== 1 ? 's' : ''})
              </span>
            )}
          </span>
          {showManageLink && (
            <ChevronRight className={cn(iconSizes[size], 'opacity-50')} />
          )}
        </button>
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
        />
      </>
    )
  }

  // Premium badge
  return (
    <button
      onClick={handleClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium transition-all duration-200',
        'bg-gradient-to-r from-amber-400/20 to-orange-400/20',
        'text-amber-400 border border-amber-400/30',
        'hover:from-amber-400/30 hover:to-orange-400/30',
        'hover:scale-[1.02] active:scale-[0.98]',
        sizeClasses[size],
        showManageLink && 'cursor-pointer',
        className
      )}
    >
      <Crown className={iconSizes[size]} />
      <span>Premium</span>
      {showManageLink && (
        <ChevronRight className={cn(iconSizes[size], 'opacity-50')} />
      )}
    </button>
  )
}

// Compact version for headers/navigation
export const SubscriptionBadgeCompact: React.FC<{
  className?: string
  onClick?: () => void
}> = ({ className, onClick }) => {
  const { isPremium, isTrialing, trialDaysRemaining } = useSubscription()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else if (!isPremium || isTrialing) {
      setShowUpgradeModal(true)
    }
  }

  if (!isPremium && !isTrialing) {
    return (
      <>
        <button
          onClick={handleClick}
          className={cn(
            'p-2 rounded-full transition-all duration-200',
            'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground',
            'hover:scale-110 active:scale-95',
            className
          )}
          title="Upgrade to Premium"
        >
          <Sparkles className="h-4 w-4" />
        </button>
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
        />
      </>
    )
  }

  if (isTrialing) {
    return (
      <>
        <button
          onClick={handleClick}
          className={cn(
            'p-2 rounded-full transition-all duration-200',
            trialDaysRemaining !== null && trialDaysRemaining <= 3
              ? 'bg-orange-500/20 text-orange-400'
              : 'bg-blue-500/20 text-blue-400',
            'hover:scale-110 active:scale-95',
            className
          )}
          title={`Trial - ${trialDaysRemaining} days remaining`}
        >
          <Clock className="h-4 w-4" />
        </button>
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
        />
      </>
    )
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        'p-2 rounded-full transition-all duration-200',
        'bg-amber-400/20 text-amber-400',
        'hover:scale-110 active:scale-95',
        className
      )}
      title="Premium Member"
    >
      <Crown className="h-4 w-4" />
    </button>
  )
}
