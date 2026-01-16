import React, { useState, useRef, useEffect, useCallback } from 'react'
import { animate, stagger } from 'animejs'
import { Card, CardContent, CardHeader } from './ui/card'
import { Button } from './ui/button'
import { Star, TrendingUp, Trophy, Gift } from 'lucide-react'

interface OnboardingModalProps {
  isOpen: boolean
  onClose: (dontShowAgain: boolean) => void
}

const features = [
  {
    icon: Star,
    title: 'Earn Points',
    description: 'Complete chores to earn XP based on difficulty',
  },
  {
    icon: TrendingUp,
    title: 'Level Up',
    description: 'Progress through 10 levels with unique rewards',
  },
  {
    icon: Trophy,
    title: 'Compete',
    description: 'See how you rank on the household leaderboard',
  },
  {
    icon: Gift,
    title: 'Get Rewards',
    description: 'Redeem points for real rewards',
  },
]

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimatingOut, setIsAnimatingOut] = useState(false)

  const backdropRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)

  // Handle mount animation
  useEffect(() => {
    if (isOpen && !isVisible) {
      setIsVisible(true)
    }
  }, [isOpen, isVisible])

  // Animate in when visible
  useEffect(() => {
    if (isVisible && backdropRef.current && modalRef.current && featuresRef.current) {
      // Backdrop fade in
      animate(backdropRef.current, {
        opacity: [0, 1],
        duration: 200,
        ease: 'linear',
      })

      // Modal entrance with spring-like bounce
      animate(modalRef.current, {
        opacity: [0, 1],
        scale: [0.95, 1],
        translateY: [20, 0],
        duration: 400,
        ease: 'outBack',
      })

      // Stagger animate feature cards
      const featureCards = featuresRef.current.querySelectorAll('.feature-card')
      if (featureCards.length > 0) {
        animate(featureCards, {
          opacity: [0, 1],
          translateY: [10, 0],
          duration: 300,
          delay: stagger(80, { start: 200 }),
          ease: 'outQuart',
        })
      }
    }
  }, [isVisible])

  const handleClose = useCallback(async () => {
    if (isAnimatingOut || !backdropRef.current || !modalRef.current) return

    setIsAnimatingOut(true)

    // Animate out - use .then() which returns a Promise
    const backdropAnimation = animate(backdropRef.current, {
      opacity: [1, 0],
      duration: 200,
      ease: 'linear',
    })

    const modalAnimation = animate(modalRef.current, {
      opacity: [1, 0],
      scale: [1, 0.95],
      translateY: [0, 20],
      duration: 200,
      ease: 'inQuart',
    })

    await Promise.all([backdropAnimation.then(), modalAnimation.then()])

    setIsVisible(false)
    setIsAnimatingOut(false)
    onClose(dontShowAgain)
  }, [isAnimatingOut, dontShowAgain, onClose])

  // Reset state when modal is closed externally
  useEffect(() => {
    if (!isOpen && isVisible && !isAnimatingOut) {
      setIsVisible(false)
    }
  }, [isOpen, isVisible, isAnimatingOut])

  if (!isVisible) return null

  return (
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={handleClose}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        style={{ opacity: 0 }}
      />
      {/* Modal */}
      <div
        ref={modalRef}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        onClick={(e) => e.stopPropagation()}
        style={{ opacity: 0, transform: 'scale(0.95) translateY(20px)' }}
      >
        <Card className="w-full max-w-md border-border bg-card/95 backdrop-blur-md shadow-xl max-h-[90vh] overflow-y-auto">
          <CardHeader className="pb-4">
            <div className="text-center">
              <h2 className="text-xl font-heading font-semibold">
                Welcome to Daily Bag!
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Here's what you can do
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Feature Grid */}
            <div ref={featuresRef} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {features.map((feature, index) => {
                const IconComponent = feature.icon
                return (
                  <div
                    key={index}
                    className="feature-card p-4 rounded-lg bg-secondary/50 border border-border"
                    style={{ opacity: 0 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-md bg-amber-400/20">
                        <IconComponent className="h-5 w-5 text-amber-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">
                          {feature.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Checkbox */}
            <div className="flex items-center">
              <input
                id="onboarding-dont-show"
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
              />
              <label
                htmlFor="onboarding-dont-show"
                className="ml-2 block text-sm text-foreground"
              >
                Don't show this again
              </label>
            </div>

            {/* Button */}
            <Button
              onClick={handleClose}
              className="w-full bg-amber-400 text-slate-900 hover:bg-amber-300 font-medium transition-colors duration-200"
            >
              Get Started
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
