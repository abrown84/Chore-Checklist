import { useEffect, useRef, useState, memo } from 'react'
import { animate, JSAnimation } from 'animejs'

interface AnimatedCounterProps {
  value: number
  duration?: number
  delay?: number
  prefix?: string
  suffix?: string
  className?: string
  formatValue?: (value: number) => string
  onComplete?: () => void
}

/**
 * Smoothly animates a number from one value to another using anime.js
 * Brand-aligned with "Radiant Momentum" - uses outQuart easing
 */
export const AnimatedCounter = memo<AnimatedCounterProps>(({
  value,
  duration = 600,
  delay = 0,
  prefix = '',
  suffix = '',
  className = '',
  formatValue = (v) => Math.round(v).toLocaleString(),
  onComplete
}) => {
  const [displayValue, setDisplayValue] = useState(value)
  const previousValueRef = useRef(value)
  const animationRef = useRef<JSAnimation | null>(null)
  const objectRef = useRef({ value: value })

  useEffect(() => {
    // Skip if value hasn't changed
    if (previousValueRef.current === value) return

    // Cancel any existing animation
    if (animationRef.current) {
      animationRef.current.pause()
    }

    // Animate from previous value to new value
    const startValue = previousValueRef.current
    objectRef.current.value = startValue

    animationRef.current = animate(objectRef.current, {
      value: value,
      duration,
      delay,
      ease: 'outQuart',
      onUpdate: () => {
        setDisplayValue(Math.round(objectRef.current.value))
      },
      onComplete: () => {
        setDisplayValue(value)
        onComplete?.()
      }
    })

    previousValueRef.current = value

    return () => {
      if (animationRef.current) {
        animationRef.current.pause()
      }
    }
  }, [value, duration, delay, onComplete])

  // Set initial value on mount
  useEffect(() => {
    setDisplayValue(value)
    previousValueRef.current = value
    objectRef.current.value = value
  }, [])

  return (
    <span className={className}>
      {prefix}{formatValue(displayValue)}{suffix}
    </span>
  )
})

AnimatedCounter.displayName = 'AnimatedCounter'
