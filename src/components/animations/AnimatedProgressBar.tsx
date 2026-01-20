import React, { useEffect, useRef, useState, memo } from 'react'
import { animate, createTimeline, Timeline } from 'animejs'

interface AnimatedProgressBarProps {
  progress: number // 0-100
  duration?: number
  delay?: number
  className?: string
  barClassName?: string
  showLabel?: boolean
  labelPosition?: 'inside' | 'outside'
  height?: string
  onComplete?: () => void
}

/**
 * Animated progress bar with smooth fill animation
 * Brand-aligned with "Radiant Momentum" gradient
 */
export const AnimatedProgressBar = memo<AnimatedProgressBarProps>(({
  progress,
  duration = 800,
  delay = 0,
  className = '',
  barClassName = '',
  showLabel = false,
  labelPosition = 'outside',
  height = 'h-2',
  onComplete
}) => {
  const [displayProgress, setDisplayProgress] = useState(0)
  const previousProgressRef = useRef(0)
  const animationRef = useRef<Timeline | null>(null)
  const objectRef = useRef({ progress: 0 })
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Cancel any existing animation
    if (animationRef.current) {
      animationRef.current.pause()
    }

    const startProgress = previousProgressRef.current
    objectRef.current.progress = startProgress

    // Create timeline for orchestrated animation
    const timeline = createTimeline({
      defaults: { ease: 'outQuart' },
      onComplete: () => {
        setDisplayProgress(progress)
        onComplete?.()
      }
    })

    // Animate the progress value
    timeline.add(objectRef.current, {
      progress: Math.min(100, Math.max(0, progress)),
      duration,
      delay,
      onUpdate: () => {
        setDisplayProgress(Math.round(objectRef.current.progress))
      }
    }, 0)

    // Add pulse effect when reaching milestones (25%, 50%, 75%, 100%)
    const milestones = [25, 50, 75, 100]
    const crossedMilestone = milestones.find(
      m => startProgress < m && progress >= m
    )

    if (crossedMilestone && barRef.current) {
      timeline.add(barRef.current, {
        scale: [1, 1.02, 1],
        duration: 300,
        ease: 'outElastic(1, .5)'
      }, duration * 0.8)
    }

    animationRef.current = timeline
    previousProgressRef.current = progress

    return () => {
      if (animationRef.current) {
        animationRef.current.pause()
      }
    }
  }, [progress, duration, delay, onComplete])

  const clampedProgress = Math.min(100, Math.max(0, displayProgress))

  return (
    <div className={`relative ${className}`}>
      {showLabel && labelPosition === 'outside' && (
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Progress</span>
          <span>{Math.round(clampedProgress)}%</span>
        </div>
      )}
      <div
        ref={barRef}
        className={`w-full bg-muted rounded-full overflow-hidden ${height}`}
      >
        <div
          className={`${height} rounded-full transition-colors duration-200 bg-gradient-to-r from-primary to-chart-4 ${barClassName}`}
          style={{
            width: `${clampedProgress}%`,
            transition: 'none' // Let anime.js handle the animation
          }}
        />
      </div>
      {showLabel && labelPosition === 'inside' && clampedProgress > 10 && (
        <div
          className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white drop-shadow-sm"
        >
          {Math.round(clampedProgress)}%
        </div>
      )}
    </div>
  )
})

AnimatedProgressBar.displayName = 'AnimatedProgressBar'
