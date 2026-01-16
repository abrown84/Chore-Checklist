import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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

  const handleClose = () => {
    onClose(dontShowAgain)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {features.map((feature, index) => {
                    const IconComponent = feature.icon
                    return (
                      <div
                        key={index}
                        className="p-4 rounded-lg bg-secondary/50 border border-border"
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
