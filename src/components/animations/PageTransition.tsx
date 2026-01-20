import React, { memo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Tab order for determining transition direction
const TAB_ORDER = ['chores', 'leaderboard', 'household', 'redemption', 'profile', 'admin', 'about']

interface PageTransitionProps {
  activeTab: string
  children: React.ReactNode
  className?: string
}

/**
 * Animated page transition wrapper using Framer Motion
 * Slides content based on tab navigation direction
 * Brand-aligned with "Radiant Momentum" - smooth, purposeful transitions
 */
export const PageTransition = memo<PageTransitionProps>(({
  activeTab,
  children,
  className = ''
}) => {
  const previousTabRef = useRef(activeTab)
  const directionRef = useRef(1)

  // Determine slide direction based on tab order
  useEffect(() => {
    const prevIndex = TAB_ORDER.indexOf(previousTabRef.current)
    const currentIndex = TAB_ORDER.indexOf(activeTab)

    if (prevIndex !== -1 && currentIndex !== -1) {
      directionRef.current = currentIndex > prevIndex ? 1 : -1
    }

    previousTabRef.current = activeTab
  }, [activeTab])

  const variants = {
    initial: (direction: number) => ({
      x: direction > 0 ? 30 : -30,
      opacity: 0,
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -30 : 30,
      opacity: 0,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.15 }
      }
    })
  }

  return (
    <AnimatePresence mode="wait" custom={directionRef.current}>
      <motion.div
        key={activeTab}
        custom={directionRef.current}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
})

PageTransition.displayName = 'PageTransition'

// Simpler fade transition for modals and overlays
interface FadeTransitionProps {
  show: boolean
  children: React.ReactNode
  className?: string
}

export const FadeTransition = memo<FadeTransitionProps>(({
  show,
  children,
  className = ''
}) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
})

FadeTransition.displayName = 'FadeTransition'

// Scale + Fade for popups and cards
interface ScaleTransitionProps {
  show: boolean
  children: React.ReactNode
  className?: string
  origin?: 'center' | 'top' | 'bottom'
}

export const ScaleTransition = memo<ScaleTransitionProps>(({
  show,
  children,
  className = '',
  origin = 'center'
}) => {
  const originMap = {
    center: 'center center',
    top: 'center top',
    bottom: 'center bottom'
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{
            duration: 0.2,
            ease: [0.22, 1, 0.36, 1] // Custom outQuart
          }}
          style={{ transformOrigin: originMap[origin] }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
})

ScaleTransition.displayName = 'ScaleTransition'
