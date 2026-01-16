import React, { useState, useEffect, useRef, useCallback } from 'react'
import { animate } from 'animejs'
import { useStats } from '../hooks/useStats'
import { useAuth } from '../hooks/useAuth'
import { LEVELS } from '../types/chore'
import { Star, Crown, Trophy, X, Share2, Sparkles, Zap } from 'lucide-react'
import { toast } from 'sonner'

export const LevelUpCelebration: React.FC = () => {
  const { getUserStats } = useStats()
  const { user } = useAuth()
  const [showCelebration, setShowCelebration] = useState(false)
  const [currentLevel, setCurrentLevel] = useState(1)

  const modalRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const levelNumRef = useRef<HTMLDivElement>(null)
  const lastProcessedLevel = useRef<number>(1)

  // Get current user level for F key test
  const userStats = user ? getUserStats(user.id) : null
  const currentUserLevel = userStats?.currentLevel || 1

  const handleClose = useCallback(() => {
    const container = modalRef.current
    if (!container) {
      setShowCelebration(false)
      return
    }

    const overlay = container.querySelector('.celebration-overlay')
    const modal = container.querySelector('.celebration-modal')

    if (!overlay || !modal) {
      setShowCelebration(false)
      return
    }

    // Fade out animation
    animate(modal, {
      scale: [1, 0.8],
      opacity: [1, 0],
      duration: 400,
      ease: 'inQuart',
    })

    animate(overlay, {
      opacity: [1, 0],
      duration: 400,
      ease: 'inQuart',
    })

    setTimeout(() => {
      setShowCelebration(false)
    }, 400)
  }, [])

  // Start celebration with sleek futuristic animations
  const startCelebrationSequence = useCallback(() => {
    setShowCelebration(true)

    // Wait for DOM to be ready
    setTimeout(() => {
      const container = modalRef.current
      const icon = iconRef.current
      const title = titleRef.current
      const levelNum = levelNumRef.current

      if (!container || !icon || !title || !levelNum) return

      const overlay = container.querySelector('.celebration-overlay')
      const modal = container.querySelector('.celebration-modal')

      if (!overlay || !modal) return

      // Background snap fade
      animate(overlay, {
        opacity: [0, 1],
        duration: 400,
        ease: 'outCubic',
      })

      // Modal quick zoom in - no bounce
      animate(modal, {
        scale: [0.85, 1],
        opacity: [0, 1],
        duration: 600,
        ease: 'outCubic',
      })

      // Icon sharp fade + slight scale
      animate(icon, {
        scale: [0.8, 1],
        opacity: [0, 1],
        duration: 500,
        delay: 200,
        ease: 'outCubic',
      })

      // Title fast slide up with sharp timing
      animate(title, {
        translateY: [30, 0],
        opacity: [0, 1],
        duration: 500,
        delay: 300,
        ease: 'outCubic',
      })

      // Level number precise scale
      animate(levelNum, {
        scale: [0.7, 1],
        opacity: [0, 1],
        duration: 600,
        delay: 400,
        ease: 'outCubic',
      })

      // Subtle continuous glow pulse
      animate(icon, {
        scale: [1, 1.05, 1],
        duration: 3000,
        delay: 1000,
        ease: 'inOutCubic',
        loop: true,
      })

      // Auto close after 5 seconds
      setTimeout(() => {
        handleClose()
      }, 5000)
    }, 100)
  }, [handleClose])

  // Share achievement
  const handleShare = useCallback(async () => {
    const levelData = LEVELS.find(level => level.level === currentLevel)
    const shareText = `🎉 I just reached Level ${currentLevel} - ${levelData?.name || 'Champion'}! 🏆\n\nKeeping the house clean and earning rewards with Daily Bag!`

    const shareData = {
      title: `Level ${currentLevel} Achievement!`,
      text: shareText,
      url: window.location.origin,
    }

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData)
        toast.success('Shared successfully!')
      } else {
        await navigator.clipboard.writeText(`${shareText}\n\n${window.location.origin}`)
        toast.success('Copied to clipboard!')
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(`${shareText}\n\n${window.location.origin}`)
          toast.success('Copied to clipboard!')
        } catch {
          toast.error('Could not share')
        }
      }
    }
  }, [currentLevel])

  // Listen for level-up events from the backend
  useEffect(() => {
    console.log('[LevelUp] Component mounted, setting up event listener')

    const handleLevelUp = (event: CustomEvent) => {
      console.log(`[LevelUp] ⚡ Event received!`, event.detail)
      const { newLevel, previousLevel } = event.detail
      console.log(`[LevelUp] Event received: ${previousLevel} → ${newLevel}`)
      console.log(`[LevelUp] lastProcessedLevel: ${lastProcessedLevel.current}`)

      // Prevent duplicate triggers
      if (newLevel > lastProcessedLevel.current) {
        console.log(`[LevelUp] ✅ Triggering celebration!`)
        lastProcessedLevel.current = newLevel
        setCurrentLevel(newLevel)
        startCelebrationSequence()
      } else {
        console.log(`[LevelUp] ❌ Skipping - already processed this level`)
      }
    }

    window.addEventListener('levelUp', handleLevelUp as EventListener)
    console.log('[LevelUp] Event listener registered')

    return () => {
      console.log('[LevelUp] Removing event listener')
      window.removeEventListener('levelUp', handleLevelUp as EventListener)
    }
  }, [startCelebrationSequence])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showCelebration) {
        handleClose()
      }
      // Test with F key - simulates level up event
      if ((e.key === 'f' || e.key === 'F') && !showCelebration) {
        console.log('[LevelUp] F key pressed - triggering test celebration')
        const testLevel = currentUserLevel || 2
        setCurrentLevel(testLevel)
        lastProcessedLevel.current = testLevel - 1 // Set previous to allow trigger
        startCelebrationSequence()
      }
    }

    document.addEventListener('keydown', handleKeyboard)
    return () => document.removeEventListener('keydown', handleKeyboard)
  }, [showCelebration, currentUserLevel, startCelebrationSequence, handleClose])

  if (!showCelebration) return null

  const levelData = LEVELS.find(level => level.level === currentLevel)

  const getLevelIcon = (level: number) => {
    const iconClass = "w-32 h-32 md:w-40 md:h-40"
    const iconStyle = {
      filter: 'drop-shadow(0 0 20px rgba(0, 255, 255, 0.8))',
    }

    if (level >= 10) return <Crown className={`${iconClass} text-cyan-400`} style={iconStyle} />
    if (level >= 8) return <Crown className={`${iconClass} text-cyan-300`} style={iconStyle} />
    if (level >= 6) return <Trophy className={`${iconClass} text-cyan-400`} style={iconStyle} />
    if (level >= 4) return <Star className={`${iconClass} text-cyan-500`} style={iconStyle} />
    return <Zap className={`${iconClass} text-cyan-400`} style={iconStyle} />
  }

  return (
    <div ref={modalRef} className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background overlay */}
      <div className="celebration-overlay absolute inset-0 bg-black/80 backdrop-blur-md" style={{ opacity: 0 }} />

      {/* Particle effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Grid particles */}
        {[...Array(30)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              backgroundColor: 'rgba(0, 255, 255, 0.6)',
              boxShadow: '0 0 8px rgba(0, 255, 255, 0.8)',
              animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}

        {/* Tech lines */}
        {[...Array(20)].map((_, i) => (
          <div
            key={`line-${i}`}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: '-5%',
              width: '1px',
              height: `${20 + Math.random() * 40}px`,
              background: 'linear-gradient(to bottom, transparent, rgba(0, 255, 255, 0.6), transparent)',
              boxShadow: '0 0 4px rgba(0, 255, 255, 0.8)',
              animation: `confettiFall ${3 + Math.random() * 2}s linear infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Main modal */}
      <div
        className="celebration-modal relative max-w-2xl mx-4 p-8 md:p-12 text-center"
        style={{
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(0, 255, 255, 0.3)',
          borderRadius: '8px',
          boxShadow: `
            0 0 40px rgba(0, 255, 255, 0.3),
            0 25px 50px -12px rgba(0, 0, 0, 0.8),
            inset 0 0 60px rgba(0, 255, 255, 0.05)
          `,
          opacity: 0,
        }}
      >
        {/* Scanline overlay */}
        <div className="absolute inset-0 pointer-events-none scanline-overlay" style={{ opacity: 0.1 }} />

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 transition-all duration-200"
          aria-label="Close"
          style={{ borderRadius: '4px' }}
        >
          <X className="w-6 h-6 text-cyan-400" />
        </button>

        {/* Level icon */}
        <div ref={iconRef} className="mb-8" style={{ opacity: 0 }}>
          {getLevelIcon(currentLevel)}
        </div>

        {/* Title */}
        <h1
          ref={titleRef}
          className="text-6xl md:text-8xl font-black mb-6 text-cyan-400"
          style={{
            opacity: 0,
            textShadow: `
              0 0 10px rgba(0, 255, 255, 0.8),
              0 0 20px rgba(0, 255, 255, 0.6),
              0 0 30px rgba(0, 255, 255, 0.4),
              0 2px 4px rgba(0, 0, 0, 0.8)
            `,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            letterSpacing: '0.05em',
          }}
        >
          LEVEL UP
        </h1>

        {/* Level number */}
        <div
          ref={levelNumRef}
          className="inline-flex items-center justify-center w-32 h-32 text-white text-5xl font-black mb-6"
          style={{
            opacity: 0,
            background: 'rgba(0, 255, 255, 0.1)',
            border: '2px solid rgba(0, 255, 255, 0.5)',
            borderRadius: '4px',
            boxShadow: `
              0 0 30px rgba(0, 255, 255, 0.4),
              inset 0 0 20px rgba(0, 255, 255, 0.1)
            `,
            textShadow: '0 0 10px rgba(0, 255, 255, 0.8)',
          }}
        >
          {currentLevel}
        </div>

        {/* Level name */}
        <div
          className="text-2xl font-bold text-cyan-300 mb-8 uppercase tracking-wider"
          style={{
            textShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
          }}
        >
          {levelData?.name}
        </div>

        {/* Rewards */}
        <div
          className="backdrop-blur-sm p-6 mb-6"
          style={{
            background: 'rgba(0, 255, 255, 0.05)',
            border: '1px solid rgba(0, 255, 255, 0.2)',
            borderRadius: '4px',
            boxShadow: 'inset 0 0 20px rgba(0, 255, 255, 0.1)',
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h3
              className="text-lg font-bold text-cyan-400 uppercase tracking-wide"
              style={{ textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}
            >
              Rewards Unlocked
            </h3>
            <Sparkles className="w-5 h-5 text-cyan-400" />
          </div>
          <ul className="space-y-2">
            {levelData?.rewards.map((reward, index) => (
              <li key={index} className="flex items-center justify-center gap-3 text-cyan-100">
                <div
                  className="w-1 h-1 bg-cyan-400"
                  style={{ boxShadow: '0 0 4px rgba(0, 255, 255, 0.8)' }}
                />
                <span className="text-sm">{reward}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Share button */}
        <button
          onClick={handleShare}
          className="flex items-center gap-2 mx-auto px-6 py-3 text-white font-semibold transition-all duration-200 hover:brightness-110"
          style={{
            background: 'rgba(0, 255, 255, 0.2)',
            border: '1px solid rgba(0, 255, 255, 0.5)',
            borderRadius: '4px',
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
            textShadow: '0 0 5px rgba(0, 255, 255, 0.5)',
          }}
        >
          <Share2 className="w-5 h-5" />
          Share Achievement
        </button>

        {/* Hint */}
        <div className="mt-6 text-xs text-cyan-400/50 uppercase tracking-wider">
          Press ESC to close
        </div>
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }

        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 0.8; }
          100% { transform: translateY(100vh) rotate(180deg); opacity: 0; }
        }

        .scanline-overlay {
          background: repeating-linear-gradient(
            0deg,
            rgba(0, 255, 255, 0.03) 0px,
            rgba(0, 255, 255, 0.03) 1px,
            transparent 1px,
            transparent 2px
          );
          animation: scanline 8s linear infinite;
        }

        @keyframes scanline {
          0% { transform: translateY(0); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </div>
  )
}
