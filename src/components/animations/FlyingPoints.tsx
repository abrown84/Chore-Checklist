import React, { useEffect, useRef, memo, useCallback, useState } from 'react'
import { createTimeline } from 'animejs'
import { createPortal } from 'react-dom'

interface FlyingPoint {
  id: string
  value: number
  startX: number
  startY: number
  type: 'points' | 'bonus' | 'streak'
}

interface FlyingPointsProps {
  targetRef: React.RefObject<HTMLElement>
  onPointLanded?: (value: number) => void
}

interface FlyingPointsHandle {
  launch: (point: Omit<FlyingPoint, 'id'>) => void
}

/**
 * Component that renders flying points that animate to a target element
 * Used for visual feedback when earning points
 */
export const FlyingPoints = memo(
  React.forwardRef<FlyingPointsHandle, FlyingPointsProps>(
    ({ targetRef, onPointLanded }, ref) => {
      const [points, setPoints] = useState<FlyingPoint[]>([])
      const containerRef = useRef<HTMLDivElement>(null)

      const launch = useCallback((point: Omit<FlyingPoint, 'id'>) => {
        const id = `point-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        setPoints(prev => [...prev, { ...point, id }])
      }, [])

      // Expose launch method via ref
      React.useImperativeHandle(ref, () => ({ launch }), [launch])

      // Animate each new point
      useEffect(() => {
        if (points.length === 0 || !targetRef.current) return

        const target = targetRef.current.getBoundingClientRect()
        const targetX = target.left + target.width / 2
        const targetY = target.top + target.height / 2

        points.forEach((point) => {
          const element = document.getElementById(point.id)
          if (!element) return

          // Calculate control point for curved path
          const dx = targetX - point.startX
          const dy = targetY - point.startY
          const controlX = point.startX + dx * 0.5 + (Math.random() - 0.5) * 100
          const controlY = point.startY + Math.min(dy * 0.3, -50) // Arc upward

          // Create the animation
          createTimeline({
            defaults: { ease: 'outQuart' },
            onComplete: () => {
              onPointLanded?.(point.value)
              setPoints(prev => prev.filter(p => p.id !== point.id))
            }
          })
          .add(element, {
            translateX: [0, controlX - point.startX, targetX - point.startX],
            translateY: [0, controlY - point.startY, targetY - point.startY],
            scale: [1, 1.3, 0.5],
            opacity: [1, 1, 0],
            duration: 800,
          })
        })
      }, [points, targetRef, onPointLanded])

      if (points.length === 0) return null

      const getPointColor = (type: FlyingPoint['type']) => {
        switch (type) {
          case 'bonus':
            return 'from-amber-400 to-yellow-500 text-amber-900'
          case 'streak':
            return 'from-purple-400 to-pink-500 text-purple-900'
          default:
            return 'from-primary to-chart-4 text-white'
        }
      }

      return createPortal(
        <div
          ref={containerRef}
          className="fixed inset-0 pointer-events-none z-[100]"
          aria-hidden="true"
        >
          {points.map((point) => (
            <div
              key={point.id}
              id={point.id}
              className={`absolute font-bold text-lg px-2 py-1 rounded-full bg-gradient-to-r shadow-lg ${getPointColor(point.type)}`}
              style={{
                left: point.startX,
                top: point.startY,
                transform: 'translate(-50%, -50%)'
              }}
            >
              +{point.value}
            </div>
          ))}
        </div>,
        document.body
      )
    }
  )
)

FlyingPoints.displayName = 'FlyingPoints'

// Hook for using FlyingPoints
export function useFlyingPoints(targetRef: React.RefObject<HTMLElement>) {
  const flyingPointsRef = useRef<FlyingPointsHandle>(null)
  const [totalLanded, setTotalLanded] = useState(0)

  const launchPoints = useCallback((
    value: number,
    startX: number,
    startY: number,
    type: 'points' | 'bonus' | 'streak' = 'points'
  ) => {
    flyingPointsRef.current?.launch({ value, startX, startY, type })
  }, [])

  const handlePointLanded = useCallback((value: number) => {
    setTotalLanded(prev => prev + value)
  }, [])

  const FlyingPointsComponent = useCallback(() => (
    <FlyingPoints
      ref={flyingPointsRef}
      targetRef={targetRef}
      onPointLanded={handlePointLanded}
    />
  ), [targetRef, handlePointLanded])

  return {
    launchPoints,
    totalLanded,
    FlyingPointsComponent
  }
}
