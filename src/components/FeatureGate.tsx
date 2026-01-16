import React, { useState, useEffect, useRef, ReactNode } from 'react'
import { animate } from 'animejs'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Lock, Crown, Sparkles, ArrowRight } from 'lucide-react'
import { useFeatureGate, useFeatureMessage } from '../hooks/useFeatureGate'
import { PremiumFeature } from '../types/subscription'
import { UpgradeModal } from './UpgradeModal'
import { cn } from '../utils/cn'

interface FeatureGateProps {
  feature: PremiumFeature
  children: ReactNode
  fallback?: ReactNode
  currentUsage?: number
  showInlinePrompt?: boolean
  className?: string
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  children,
  fallback,
  currentUsage = 0,
  showInlinePrompt = true,
  className,
}) => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const { hasAccess, isAtLimit, currentLimit } = useFeatureGate({
    feature,
    currentUsage,
    onUpgradePrompt: () => setShowUpgradeModal(true),
  })
  const featureMessage = useFeatureMessage(feature)

  // If user has access and is not at limit, render children
  if (hasAccess && !isAtLimit) {
    return <>{children}</>
  }

  // If custom fallback is provided, use it
  if (fallback) {
    return (
      <>
        {fallback}
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          feature={featureMessage.title}
          featureDescription={featureMessage.description}
        />
      </>
    )
  }

  // Default inline upgrade prompt
  if (showInlinePrompt) {
    return (
      <>
        <FeatureGatePrompt
          feature={feature}
          currentUsage={currentUsage}
          currentLimit={currentLimit}
          onUpgrade={() => setShowUpgradeModal(true)}
          className={className}
        />
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          feature={featureMessage.title}
          featureDescription={featureMessage.description}
        />
      </>
    )
  }

  // Just render the modal trigger if no inline prompt wanted
  return (
    <>
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature={featureMessage.title}
        featureDescription={featureMessage.description}
      />
    </>
  )
}

interface FeatureGatePromptProps {
  feature: PremiumFeature
  currentUsage?: number
  currentLimit?: number | null
  onUpgrade: () => void
  className?: string
}

export const FeatureGatePrompt: React.FC<FeatureGatePromptProps> = ({
  feature,
  currentUsage = 0,
  currentLimit,
  onUpgrade,
  className,
}) => {
  const featureMessage = useFeatureMessage(feature)
  const isAtLimit = currentLimit !== null && currentLimit !== undefined && currentUsage >= currentLimit
  const containerRef = useRef<HTMLDivElement>(null)

  // Animate in on mount
  useEffect(() => {
    if (containerRef.current) {
      animate(containerRef.current, {
        opacity: [0, 1],
        translateY: [10, 0],
        duration: 400,
        ease: 'outQuart',
      })
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn('w-full', className)}
      style={{ opacity: 0 }}
    >
      <Card className="border-amber-400/30 bg-gradient-to-br from-amber-400/5 to-orange-400/5">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Icon */}
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-400/20 border border-amber-400/30">
              <Lock className="h-6 w-6 text-amber-400" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="h-4 w-4 text-amber-400" />
                <h3 className="font-semibold text-foreground">
                  {featureMessage.title}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {isAtLimit ? (
                  <>
                    You've reached the limit of {currentLimit}{' '}
                    {feature.replace(/_/g, ' ')}. Upgrade to Premium for
                    unlimited access.
                  </>
                ) : (
                  featureMessage.description
                )}
              </p>
              {isAtLimit && currentLimit !== null && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-orange-400"
                      style={{ width: '100%' }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {currentUsage}/{currentLimit}
                  </span>
                </div>
              )}
            </div>

            {/* CTA */}
            <Button
              onClick={onUpgrade}
              className="w-full sm:w-auto bg-gradient-to-r from-amber-400 to-orange-400 text-slate-900 hover:from-amber-300 hover:to-orange-300 font-semibold"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Upgrade
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Minimal locked state overlay for components
interface FeatureLockedOverlayProps {
  feature: PremiumFeature
  children: ReactNode
  className?: string
}

export const FeatureLockedOverlay: React.FC<FeatureLockedOverlayProps> = ({
  feature,
  children,
  className,
}) => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const { hasAccess } = useFeatureGate({
    feature,
    onUpgradePrompt: () => setShowUpgradeModal(true),
  })
  const featureMessage = useFeatureMessage(feature)
  const overlayRef = useRef<HTMLDivElement>(null)

  // Animate overlay on mount
  useEffect(() => {
    if (!hasAccess && overlayRef.current) {
      animate(overlayRef.current, {
        opacity: [0, 1],
        duration: 300,
        ease: 'outQuart',
      })
    }
  }, [hasAccess])

  if (hasAccess) {
    return <>{children}</>
  }

  return (
    <>
      <div className={cn('relative', className)}>
        {/* Blurred content */}
        <div className="pointer-events-none select-none blur-sm opacity-50">
          {children}
        </div>

        {/* Overlay */}
        <div
          ref={overlayRef}
          className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-lg"
          style={{ opacity: 0 }}
        >
          <Button
            onClick={() => setShowUpgradeModal(true)}
            variant="outline"
            className="border-amber-400/50 hover:border-amber-400 hover:bg-amber-400/10"
          >
            <Lock className="h-4 w-4 mr-2 text-amber-400" />
            <span>Unlock with Premium</span>
          </Button>
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature={featureMessage.title}
        featureDescription={featureMessage.description}
      />
    </>
  )
}

// Button that checks feature access before action
interface FeatureGatedButtonProps {
  feature: PremiumFeature
  currentUsage?: number
  onClick: () => void
  children: ReactNode
  className?: string
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  disabled?: boolean
}

export const FeatureGatedButton: React.FC<FeatureGatedButtonProps> = ({
  feature,
  currentUsage = 0,
  onClick,
  children,
  className,
  variant = 'default',
  size = 'default',
  disabled = false,
}) => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const { hasAccess, isAtLimit, checkAccess } = useFeatureGate({
    feature,
    currentUsage,
    onUpgradePrompt: () => setShowUpgradeModal(true),
  })
  const featureMessage = useFeatureMessage(feature)

  const handleClick = () => {
    if (checkAccess()) {
      onClick()
    }
  }

  const showLockIcon = !hasAccess || isAtLimit

  return (
    <>
      <Button
        onClick={handleClick}
        className={className}
        variant={variant}
        size={size}
        disabled={disabled}
      >
        {showLockIcon && <Lock className="h-4 w-4 mr-2 text-amber-400" />}
        {children}
      </Button>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature={featureMessage.title}
        featureDescription={featureMessage.description}
      />
    </>
  )
}
