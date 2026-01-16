import React, { useState, useEffect, useRef, useMemo } from 'react'
import { animate } from 'animejs'
import { Star, Zap, Plus, Sparkles } from 'lucide-react'

interface PopupCelebration {
  id: string
  points: number
  choreTitle: string
  x: number
  y: number
  timestamp: number
  type?: 'points' | 'bonus' | 'streak' | 'level'
  color?: string
}

interface ChorePopupCelebrationProps {
  celebrations: PopupCelebration[]
  onRemove: (id: string) => void
}

export const ChorePopupCelebration: React.FC<ChorePopupCelebrationProps> = ({
  celebrations,
  onRemove
}) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {celebrations.map((celebration) => (
        <DamagePopupItem
          key={celebration.id}
          celebration={celebration}
          onRemove={onRemove}
        />
      ))}
    </div>
  )
}

interface DamagePopupItemProps {
  celebration: PopupCelebration
  onRemove: (id: string) => void
}

const DamagePopupItem: React.FC<DamagePopupItemProps> = ({ celebration, onRemove }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const sparkleRefs = useRef<(HTMLDivElement | null)[]>([])

  // Generate consistent movement for each popup - memoize to prevent re-generation
  const movement = useMemo(() => ({
    driftX: (Math.random() - 0.5) * 60,
    driftY: -80 - Math.random() * 40,
    rotation: (Math.random() - 0.5) * 15,
  }), [])

  // More sparkles for bigger points - makes high-value completions feel epic
  const sparkleCount = celebration.points >= 30 ? 8 : celebration.points >= 15 ? 5 : 3

  // Pre-generate sparkle positions
  const sparklePositions = useMemo(() =>
    [...Array(sparkleCount)].map((_, i) => ({
      left: '50%',
      top: '50%',
      angle: (i / sparkleCount) * Math.PI * 2,
      distance: 25 + Math.random() * 30,
    })), [sparkleCount])

  useEffect(() => {
    const container = containerRef.current
    const inner = innerRef.current
    const glow = glowRef.current
    const sparkles = sparkleRefs.current.filter(Boolean) as HTMLDivElement[]

    if (!container || !inner || !glow) return

    // Store animation instances for cleanup
    const animations: ReturnType<typeof animate>[] = []

    // Explosive entrance - snap in with dramatic bounce
    const entranceAnim = animate(container, {
      opacity: [0, 1],
      scale: [0.3, 1.5, 0.9, 1.2, 1],
      duration: 500,
      ease: 'outElastic',
    })
    animations.push(entranceAnim)

    // Bouncy arc motion upward with slight curve
    const floatAnim = animate(container, {
      translateY: [0, -30, movement.driftY * 1.2],
      translateX: [0, movement.driftX * 0.3, movement.driftX * 1.5],
      rotate: [0, movement.rotation * 3, movement.rotation],
      duration: 1400,
      delay: 150,
      ease: 'outCubic',
    })
    animations.push(floatAnim)

    // Smooth fade with scale down and blur
    const fadeAnim = animate(container, {
      opacity: [1, 1, 0.7, 0],
      scale: [1, 1.1, 0.8, 0.4],
      filter: ['blur(0px)', 'blur(0px)', 'blur(2px)', 'blur(8px)'],
      duration: 600,
      delay: 1100,
      ease: 'inQuad',
    })
    animations.push(fadeAnim)

    // Punchy inner pulse - heartbeat style
    const pulseAnim = animate(inner, {
      scale: [1, 1.15, 1, 1.08, 1],
      duration: 500,
      delay: 50,
      ease: 'outQuart',
    })
    animations.push(pulseAnim)

    // Expanding glow rings
    const glowAnimation = animate(glow, {
      opacity: [0, 0.9, 0.6, 0],
      scale: [0.5, 1.8, 2.5],
      duration: 1000,
      ease: 'outQuart',
    })
    animations.push(glowAnimation)

    // Sparkle burst - radial explosion pattern
    sparkles.forEach((sparkle, i) => {
      const pos = sparklePositions[i]
      if (!pos) return
      const sparkleAnimation = animate(sparkle, {
        opacity: [0, 1, 1, 0],
        scale: [0, 1.8, 1.2, 0],
        translateX: [0, Math.cos(pos.angle) * pos.distance],
        translateY: [0, Math.sin(pos.angle) * pos.distance - 15],
        rotate: [0, 360],
        duration: 600,
        delay: 80 + i * 30,
        ease: 'outQuart',
      })
      animations.push(sparkleAnimation)
    })

    // Remove the popup after animation completes
    const timer = setTimeout(() => {
      onRemove(celebration.id)
    }, 1800)

    // Cleanup function
    return () => {
      clearTimeout(timer)
      animations.forEach(anim => {
        anim.pause()
        anim.revert()
      })
    }
  }, [celebration.id, onRemove, movement, sparklePositions])

  const getPopupStyle = () => {
    const type = celebration.type || 'points'
    const points = celebration.points

    switch (type) {
      case 'bonus':
        return {
          gradient: 'from-emerald-400 via-green-500 to-emerald-600',
          icon: <Sparkles className="w-3.5 h-3.5" />,
          shadow: 'shadow-emerald-500/50',
          prefix: '+'
        }
      case 'streak':
        return {
          gradient: 'from-amber-400 via-orange-500 to-amber-600',
          icon: <Zap className="w-3.5 h-3.5 fill-current" />,
          shadow: 'shadow-orange-500/50',
          prefix: '🔥'
        }
      case 'level':
        return {
          gradient: 'from-purple-400 via-violet-500 to-purple-600',
          icon: <Star className="w-3.5 h-3.5 fill-current" />,
          shadow: 'shadow-purple-500/50',
          prefix: '⭐'
        }
      default:
        if (points >= 50) {
          return {
            gradient: 'from-rose-400 via-pink-500 to-rose-600',
            icon: <Star className="w-3.5 h-3.5 fill-current" />,
            shadow: 'shadow-rose-500/50',
            prefix: '+'
          }
        } else if (points >= 25) {
          return {
            gradient: 'from-violet-400 via-purple-500 to-violet-600',
            icon: <Sparkles className="w-3.5 h-3.5" />,
            shadow: 'shadow-violet-500/50',
            prefix: '+'
          }
        } else if (points >= 10) {
          return {
            gradient: 'from-blue-400 via-cyan-500 to-blue-600',
            icon: <Plus className="w-3.5 h-3.5" />,
            shadow: 'shadow-blue-500/50',
            prefix: '+'
          }
        } else {
          return {
            gradient: 'from-teal-400 via-emerald-500 to-teal-600',
            icon: <Plus className="w-3.5 h-3.5" />,
            shadow: 'shadow-teal-500/50',
            prefix: '+'
          }
        }
    }
  }

  const style = getPopupStyle()
  const fontSize = Math.min(56, Math.max(36, 36 + celebration.points / 2))

  return (
    <div
      ref={containerRef}
      className="absolute pointer-events-none"
      style={{
        left: celebration.x,
        top: celebration.y,
        transform: 'translate(-50%, -50%)',
        opacity: 0,
      }}
    >
      {/* Main popup */}
      <div ref={innerRef} className="relative">
        {/* Glow effect */}
        <div
          ref={glowRef}
          className={`absolute inset-0 blur-xl ${style.shadow} rounded-full`}
          style={{ opacity: 0 }}
        />

        {/* Main number display - game style with high contrast */}
        <div className="relative flex items-center gap-3">
          {/* Icon with massive glow */}
          <div
            className="text-white scale-150"
            style={{
              filter: 'drop-shadow(0 0 12px rgba(255,255,255,1)) drop-shadow(0 0 24px rgba(255,255,255,0.6))'
            }}
          >
            {style.icon}
          </div>

          {/* Number with thick stroke and multiple shadows for maximum visibility */}
          <div
            className="relative font-black select-none"
            style={{
              fontSize: `${fontSize}px`,
              color: '#FFFFFF',
              textShadow: `
                -4px -4px 0 #000,
                4px -4px 0 #000,
                -4px 4px 0 #000,
                4px 4px 0 #000,
                -4px 0 0 #000,
                4px 0 0 #000,
                0 -4px 0 #000,
                0 4px 0 #000,
                -2px -2px 0 #000,
                2px -2px 0 #000,
                -2px 2px 0 #000,
                2px 2px 0 #000,
                0 0 30px rgba(255, 255, 255, 1),
                0 0 60px rgba(255, 255, 255, 0.8),
                0 6px 20px rgba(0, 0, 0, 0.9)
              `,
              letterSpacing: '-0.02em',
              fontFamily: 'Impact, "Arial Black", sans-serif',
              fontWeight: 900,
              WebkitTextStroke: '1px rgba(255, 255, 255, 0.3)',
            }}
          >
            {style.prefix}{celebration.points}
          </div>
        </div>

        {/* Sparkles - radial burst */}
        {sparklePositions.map((pos, i) => (
          <div
            key={i}
            ref={(el) => { sparkleRefs.current[i] = el }}
            className="absolute w-2 h-2 rounded-full bg-white shadow-lg"
            style={{
              left: pos.left,
              top: pos.top,
              transform: 'translate(-50%, -50%)',
              opacity: 0,
              boxShadow: '0 0 6px 2px rgba(255,255,255,0.8)',
            }}
          />
        ))}
      </div>
    </div>
  )
}

// Hook to manage popup celebrations
export const usePopupCelebrations = () => {
  const [celebrations, setCelebrations] = useState<PopupCelebration[]>([])

  const addCelebration = (
    points: number,
    choreTitle: string,
    x: number,
    y: number,
    type?: 'points' | 'bonus' | 'streak' | 'level'
  ) => {
    const popup: PopupCelebration = {
      id: `celebration-${Date.now()}-${Math.random()}`,
      points,
      choreTitle,
      x: x + (Math.random() - 0.5) * 20,
      y: y + (Math.random() - 0.5) * 20,
      timestamp: Date.now(),
      type: type || 'points'
    }

    setCelebrations(prev => [...prev, popup])

    // Add a smaller bonus popup for high values
    if (points >= 20 && type !== 'bonus') {
      setTimeout(() => {
        const bonusPopup: PopupCelebration = {
          id: `bonus-${Date.now()}-${Math.random()}`,
          points: Math.floor(points * 0.25),
          choreTitle,
          x: x + (Math.random() - 0.5) * 60,
          y: y + (Math.random() - 0.5) * 40,
          timestamp: Date.now(),
          type: 'bonus'
        }
        setCelebrations(prev => [...prev, bonusPopup])
      }, 100)
    }
  }

  const removeCelebration = (id: string) => {
    setCelebrations(prev => prev.filter(c => c.id !== id))
  }

  return {
    celebrations,
    addCelebration,
    removeCelebration
  }
}
