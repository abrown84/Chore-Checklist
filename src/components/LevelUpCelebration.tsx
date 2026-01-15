import React, { useState, useEffect, useRef } from 'react'
import { useStats } from '../hooks/useStats'
import { useAuth } from '../hooks/useAuth'
import { LEVELS } from '../types/chore'
import { Star, Crown, Target, Trophy, X, Award, Sparkles, Zap, Flame, Share2 } from 'lucide-react'
import { toast } from 'sonner'

export const LevelUpCelebration: React.FC = () => {
  const { getUserStats } = useStats()
  const { user } = useAuth()
  const [showCelebration, setShowCelebration] = useState(false)
  const [previousLevel, setPreviousLevel] = useState(1)
  const [currentLevel, setCurrentLevel] = useState(1)
  const [isInitialized, setIsInitialized] = useState(false)
  const [showParticles, setShowParticles] = useState(false)
  const [showFireworks, setShowFireworks] = useState(false)
  const [animationPhase, setAnimationPhase] = useState(0) // 0: entrance, 1: main, 2: rewards, 3: outro
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  // ChoreCelebration-style popup state
  const [showMiniCelebration, setShowMiniCelebration] = useState(false)
  const [miniCelebrationData, setMiniCelebrationData] = useState<{
    points: number
    levelName: string
  } | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const particleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fireworkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const miniCelebrationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastProcessedLevel = useRef<number>(1) // Track the last level we processed to prevent double celebrations
  // const audioRef = useRef<HTMLAudioElement | null>(null) // For future sound effects

  // Enhanced animation sequence
  const startCelebrationSequence = React.useCallback(() => {
    setShowCelebration(true)
    setAnimationPhase(0)
    setShowParticles(true)
    setShowFireworks(true)
    
    // Trigger mini-celebration (ChoreCelebration-style) first
    const levelData = LEVELS.find(level => level.level === currentLevel)
    const levelPoints = levelData?.pointsRequired || (currentLevel * 100) // Fallback calculation
    setMiniCelebrationData({
      points: levelPoints,
      levelName: levelData?.name || `Level ${currentLevel}`
    })
    setShowMiniCelebration(true)
    
    // Hide mini-celebration after 1.5 seconds
    miniCelebrationTimeoutRef.current = setTimeout(() => {
      setShowMiniCelebration(false)
      setMiniCelebrationData(null)
    }, 1500)
    
    // Phase progression with enhanced timing
    setTimeout(() => setAnimationPhase(1), 500)   // Main animation
    setTimeout(() => setAnimationPhase(2), 1500)  // Rewards reveal
    setTimeout(() => setAnimationPhase(3), 4000)  // Outro phase
    
    // Cleanup timing
    particleTimeoutRef.current = setTimeout(() => {
      setShowParticles(false)
    }, 3000)
    
    fireworkTimeoutRef.current = setTimeout(() => {
      setShowFireworks(false)
    }, 4000)
    
    setTimeout(() => {
      setShowCelebration(false)
      setAnimationPhase(0)
    }, 6000)
  }, [currentLevel])

  // Manual trigger function for testing (exposed to window in development)
  const triggerTestLevelUp = React.useCallback(() => {
    startCelebrationSequence()
  }, [startCelebrationSequence])

  // Share achievement function
  const handleShare = React.useCallback(async () => {
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
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${shareText}\n\n${window.location.origin}`)
        toast.success('Copied to clipboard!')
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        // User didn't cancel, there was an actual error
        try {
          await navigator.clipboard.writeText(`${shareText}\n\n${window.location.origin}`)
          toast.success('Copied to clipboard!')
        } catch {
          toast.error('Could not share')
        }
      }
    }
  }, [currentLevel])





  // Get current user's stats from StatsContext (which automatically recalculates when chores change)
  const userStats = user ? getUserStats(user.id) : null
  const currentUserLevel = userStats?.currentLevel || 1
  

  
  // Track previous level separately for reliable comparison
  const prevUserLevelRef = useRef<number>(1)
  






  useEffect(() => {
    if (!user || !userStats) {
      return
    }



    // Initialize previous level from localStorage on first load
    if (!isInitialized) {
      const storedLevel = localStorage.getItem(`choreAppLevel_${user.id}`)

      
      let initialPreviousLevel = 1 // Default to level 1
      
      if (storedLevel) {
        const parsedLevel = parseInt(storedLevel, 10)
        if (!isNaN(parsedLevel)) {
          initialPreviousLevel = parsedLevel

        }
      } else {
        // If no stored level exists, set it to current level to prevent false celebration on first visit
        initialPreviousLevel = currentUserLevel

        // Store the current level immediately to prevent future false celebrations
        localStorage.setItem(`choreAppLevel_${user.id}`, currentUserLevel.toString())
      }
      
      setPreviousLevel(initialPreviousLevel)
      lastProcessedLevel.current = initialPreviousLevel
      prevUserLevelRef.current = initialPreviousLevel // Initialize the ref tracker
      setIsInitialized(true)
      
      // Check if user leveled up since last stored level (for returning users)
      if (currentUserLevel > initialPreviousLevel) {

        
        // Trigger celebration after a short delay to ensure everything is initialized
        setTimeout(() => {
          lastProcessedLevel.current = currentUserLevel
          prevUserLevelRef.current = currentUserLevel
          localStorage.setItem(`choreAppLevel_${user.id}`, currentUserLevel.toString())
          startCelebrationSequence()
        }, 500)
      }
      
      return
    }

    // OLD DETECTION LOGIC - DISABLED IN FAVOR OF ENHANCED SYSTEM
    // This old logic was causing issues with timing and duplicate state updates
  }, [currentUserLevel, previousLevel, user, userStats, isInitialized, startCelebrationSequence])

  useEffect(() => {
    setCurrentLevel(currentUserLevel)
  }, [currentUserLevel])

  // ENHANCED level change detection - this is the main detection system
  useEffect(() => {
    if (!user || !userStats || !isInitialized) {
      return
    }
    
    const currentLevel = userStats.currentLevel || 1
    const previousTrackedLevel = prevUserLevelRef.current
    

    
    // Check if this is a genuine level increase that we haven't processed yet
    if (currentLevel > previousTrackedLevel && currentLevel > lastProcessedLevel.current) {

      
      // Update tracking variables BEFORE triggering celebration
      lastProcessedLevel.current = currentLevel
      prevUserLevelRef.current = currentLevel
      setPreviousLevel(currentLevel)
      localStorage.setItem(`choreAppLevel_${user.id}`, currentLevel.toString())
      
      // Trigger celebration with a small delay for stability
      setTimeout(() => {
        startCelebrationSequence()
      }, 150)
    } else if (currentLevel !== previousTrackedLevel) {
      // Level changed but not an increase (or already processed)

      prevUserLevelRef.current = currentLevel
      setPreviousLevel(currentLevel)
      localStorage.setItem(`choreAppLevel_${user.id}`, currentLevel.toString())
    }
  }, [userStats, user, isInitialized, startCelebrationSequence])

  // Handle click outside to close and mouse tracking for interactive effects
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowCelebration(false)
        setAnimationPhase(0)
      }
    }

    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({
        x: (event.clientX / window.innerWidth) * 100,
        y: (event.clientY / window.innerHeight) * 100
      })
    }

    if (showCelebration) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('mousemove', handleMouseMove)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('mousemove', handleMouseMove)
      }
    }
  }, [showCelebration])

  // Handle escape key to close and F key to test
  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowCelebration(false)
        setAnimationPhase(0)
      }
      // Test level up celebration with F key
      if (event.key === 'f' || event.key === 'F') {
        if (!showCelebration) {
          triggerTestLevelUp()
        }
      }
    }

    document.addEventListener('keydown', handleKeyboard)
    return () => document.removeEventListener('keydown', handleKeyboard)
  }, [showCelebration, triggerTestLevelUp])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (particleTimeoutRef.current) {
        clearTimeout(particleTimeoutRef.current)
      }
      if (fireworkTimeoutRef.current) {
        clearTimeout(fireworkTimeoutRef.current)
      }
      if (miniCelebrationTimeoutRef.current) {
        clearTimeout(miniCelebrationTimeoutRef.current)
      }
    }
  }, [])



  if (!showCelebration) return null

  const levelData = LEVELS.find(level => level.level === currentLevel)
  
  const getLevelIcon = (level: number) => {
    const baseClasses = "w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 drop-shadow-2xl filter"
    const animationClasses = animationPhase >= 1 ? "animate-pulse" : "animate-bounce"
    
    if (level >= 10) return (
      <div className="relative">
        <Crown className={`${baseClasses} text-yellow-500 ${animationClasses}`} />
        <Sparkles className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 text-yellow-300 animate-spin" />
        <Flame className="absolute -bottom-1 -left-1 sm:-bottom-2 sm:-left-2 w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 text-orange-400 animate-pulse" />
      </div>
    )
    if (level >= 8) return (
      <div className="relative">
        <Crown className={`${baseClasses} text-purple-500 ${animationClasses}`} />
        <Zap className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 text-purple-300 animate-bounce" />
      </div>
    )
    if (level >= 6) return (
      <div className="relative">
        <Trophy className={`${baseClasses} text-red-500 ${animationClasses}`} />
        <Star className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 text-yellow-400 animate-spin" />
      </div>
    )
    if (level >= 4) return (
      <div className="relative">
        <Star className={`${baseClasses} text-blue-500 ${animationClasses}`} />
        <Sparkles className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-300 animate-pulse" />
      </div>
    )
    return (
      <div className="relative">
        <Target className={`${baseClasses} text-green-500 ${animationClasses}`} />
      </div>
    )
  }

  return (
    <>
      {/* Mini-celebration (ChoreCelebration style) */}
      {showMiniCelebration && miniCelebrationData && (
        <div className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none">
          {/* Background overlay */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-fade-in" />
          
          {/* Main celebration card (ChoreCelebration style) */}
          <div className="relative bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-3xl shadow-2xl p-8 text-center transform animate-scale-in pointer-events-auto border border-purple-200/50 backdrop-blur-sm">
            {/* Animated background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-100/30 to-orange-100/30 rounded-3xl -z-10 animate-pulse" />
            
            {/* Floating sparkles */}
            <div className="absolute -top-2 -left-2 text-2xl animate-float">✨</div>
            <div className="absolute -top-2 -right-2 text-2xl animate-float" style={{ animationDelay: '0.5s' }}>🌟</div>
            <div className="absolute -bottom-2 -left-2 text-2xl animate-float" style={{ animationDelay: '1s' }}>💫</div>
            <div className="absolute -bottom-2 -right-2 text-2xl animate-float" style={{ animationDelay: '1.5s' }}>⭐</div>
            
            {/* Main celebration emoji with bounce and glow */}
            <div className="text-7xl mb-6 animate-bounce animate-glow">🎉</div>
            
            {/* Title with gradient text and slide-in animation */}
            <h2 className="text-3xl font-bold mb-3 animate-slide-in gradient-text">
              Level Up!
            </h2>
            
            {/* Level name with fade-in */}
            <p className="text-gray-700 mb-6 text-lg font-medium animate-fade-in" style={{ animationDelay: '0.2s' }}>
              {miniCelebrationData.levelName}
            </p>
            
            {/* Points display with scale-in and glow effect */}
            <div className="bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white px-8 py-4 rounded-2xl mb-6 animate-scale-in animate-glow" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center justify-center space-x-3">
                <Crown className="w-6 h-6 animate-sparkle" />
                <span className="text-2xl font-bold">Level {currentLevel} Achieved!</span>
                <Crown className="w-6 h-6 animate-sparkle" style={{ animationDelay: '0.3s' }} />
              </div>
            </div>
            
            {/* Encouragement message with fade-in */}
            <div className="text-sm text-gray-600 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <Trophy className="w-4 h-4 inline mr-2 text-yellow-500" />
              Amazing progress! Your hard work is paying off!
            </div>
          </div>
        </div>
      )}

      {/* Main level-up celebration */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Dynamic background overlay with mouse-reactive gradient */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-black/70 via-purple-900/30 to-black/70 backdrop-blur-xl transition-all duration-1000"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(147, 51, 234, 0.3) 0%, rgba(0, 0, 0, 0.8) 50%)`
          }}
        />
      
      {/* Enhanced fullscreen fireworks and effects overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Enhanced burst rays with dynamic colors */}
        {showFireworks && (
          <>
            {[...Array(16)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 bg-gradient-to-t from-yellow-400 via-orange-500 to-transparent animate-scale-in shadow-lg"
                style={{
                  left: '50%',
                  top: '50%',
                  height: `${40 + Math.random() * 30}vh`,
                  transformOrigin: 'bottom center',
                  transform: `translateX(-50%) rotate(${i * 22.5}deg)`,
                  animationDelay: `${i * 0.05}s`,
                  animationDuration: '2s',
                  background: `linear-gradient(to top, ${['#fbbf24', '#f59e0b', '#d97706', '#dc2626', '#7c3aed', '#c026d3'][Math.floor(Math.random() * 6)]}, transparent)`
                }}
              />
            ))}
            
            {/* Enhanced expanding rings with gradient borders */}
            {[...Array(5)].map((_, i) => (
              <div
                key={`ring-${i}`}
                className="absolute rounded-full animate-scale-in border-4"
                style={{
                  left: '50%',
                  top: '50%',
                  width: `${150 + i * 120}px`,
                  height: `${150 + i * 120}px`,
                  transform: 'translate(-50%, -50%)',
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '3s',
                  borderColor: `${['#fbbf24', '#f59e0b', '#d97706', '#dc2626', '#7c3aed'][i % 5]}${Math.round((0.6 - (i * 0.1)) * 255).toString(16).padStart(2, '0')}`
                }}
              />
            ))}
            
            {/* Enhanced screen-wide sparkle explosion */}
            {[...Array(75)].map((_, i) => (
              <div
                key={`sparkle-${i}`}
                className="absolute animate-firework-explode filter drop-shadow-lg"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  fontSize: `${15 + Math.random() * 20}px`,
                  animationDelay: `${Math.random() * 1.5}s`,
                  color: ['#fbbf24', '#f59e0b', '#d97706', '#dc2626', '#7c3aed', '#c026d3', '#06d6a0'][Math.floor(Math.random() * 7)]
                }}
              >
                {['✨', '⭐', '💫', '🌟', '✴️', '💥'][Math.floor(Math.random() * 6)]}
              </div>
            ))}
            
            {/* Dynamic floating "LEVEL UP" text with 3D effect */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="text-9xl font-black opacity-15 animate-celebration-zoom transform-gpu"
                style={{
                  background: 'linear-gradient(45deg, #fbbf24, #f59e0b, #dc2626, #7c3aed)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '4px 4px 8px rgba(0,0,0,0.3)',
                  transform: `perspective(500px) rotateX(${Math.sin(Date.now() * 0.001) * 10}deg) rotateY(${Math.cos(Date.now() * 0.001) * 10}deg)`
                }}
              >
                LEVEL UP!
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Enhanced main celebration modal with glass morphism and mobile responsiveness */}
      <div 
        ref={modalRef}
        className={`
          relative max-w-6xl mx-2 sm:mx-4 text-center overflow-hidden
          w-full sm:w-auto p-4 sm:p-6 md:p-8 lg:p-12
          transition-all duration-1000 transform-gpu
          ${animationPhase === 0 ? 'scale-50 opacity-0' : ''}
          ${animationPhase === 1 ? 'scale-100 opacity-100 animate-celebration-zoom' : ''}
          ${animationPhase >= 2 ? 'scale-105 opacity-100' : ''}
        `}
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '2rem',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          boxShadow: `
            0 25px 50px -12px rgba(0, 0, 0, 0.5),
            0 0 0 1px rgba(255, 255, 255, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.2)
          `
        }}
      >
        {/* Dynamic animated background gradient */}
        <div 
          className="absolute inset-0 rounded-2xl -z-10 opacity-30"
          style={{
            background: `
              linear-gradient(
                ${45 + Math.sin(Date.now() * 0.002) * 30}deg,
                rgba(251, 191, 36, 0.6),
                rgba(245, 158, 11, 0.6),
                rgba(217, 119, 6, 0.6),
                rgba(220, 38, 38, 0.6),
                rgba(124, 58, 237, 0.6)
              )
            `,
            animation: 'gradient-shift 4s ease-in-out infinite'
          }}
        />
        
        {/* Prismatic light refraction effect */}
        <div 
          className="absolute inset-0 rounded-2xl -z-5 opacity-20"
          style={{
            background: `
              radial-gradient(circle at ${50 + Math.sin(Date.now() * 0.003) * 20}% ${50 + Math.cos(Date.now() * 0.003) * 20}%,
                rgba(255, 0, 255, 0.3) 0%,
                rgba(0, 255, 255, 0.3) 33%,
                rgba(255, 255, 0, 0.3) 66%,
                transparent 100%
              )
            `
          }}
        />
        
        {/* Animated shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-2xl animate-celebration-shine" />
        
        {/* Enhanced corner celebration effects */}
        {showFireworks && (
          <>
            <div className="absolute -top-6 -left-6 text-7xl animate-celebration-bounce filter drop-shadow-lg">🎆</div>
            <div className="absolute -top-6 -right-6 text-7xl animate-celebration-bounce filter drop-shadow-lg" style={{ animationDelay: '0.15s' }}>🎇</div>
            <div className="absolute -bottom-6 -left-6 text-7xl animate-celebration-bounce filter drop-shadow-lg" style={{ animationDelay: '0.3s' }}>🎊</div>
            <div className="absolute -bottom-6 -right-6 text-7xl animate-celebration-bounce filter drop-shadow-lg" style={{ animationDelay: '0.45s' }}>🎉</div>
            
            {/* Enhanced side burst effects with rotation */}
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 text-6xl animate-celebration-spin filter drop-shadow-lg">💥</div>
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 text-6xl animate-celebration-spin filter drop-shadow-lg" style={{ animationDelay: '0.2s' }}>💥</div>
            
            {/* Additional floating celebration icons */}
            <div className="absolute top-1/4 left-1/4 text-4xl animate-float-celebration filter drop-shadow-lg">🏆</div>
            <div className="absolute top-1/4 right-1/4 text-4xl animate-float-celebration filter drop-shadow-lg" style={{ animationDelay: '0.5s' }}>👑</div>
            <div className="absolute bottom-1/4 left-1/4 text-4xl animate-float-celebration filter drop-shadow-lg" style={{ animationDelay: '1s' }}>🎖️</div>
            <div className="absolute bottom-1/4 right-1/4 text-4xl animate-float-celebration filter drop-shadow-lg" style={{ animationDelay: '1.5s' }}>🏅</div>
          </>
        )}
        
        {/* Enhanced floating particle system */}
        {showParticles && (
          <>
            {/* Primary sparkle layer */}
            {[...Array(12)].map((_, i) => (
              <div
                key={`primary-sparkle-${i}`}
                className="absolute animate-float-celebration filter drop-shadow-lg"
                style={{
                  left: `${10 + (i * 7)}%`,
                  top: `${10 + Math.sin(i) * 30}%`,
                  fontSize: `${2 + Math.random() * 1.5}rem`,
                  animationDelay: `${i * 0.2}s`,
                  color: ['#fbbf24', '#f59e0b', '#dc2626', '#7c3aed', '#06d6a0'][i % 5]
                }}
              >
                {['✨', '⭐', '💫', '🌟'][i % 4]}
              </div>
            ))}
            
            {/* Secondary celebration elements */}
            {[...Array(8)].map((_, i) => (
              <div
                key={`secondary-element-${i}`}
                className="absolute animate-celebration-wiggle filter drop-shadow-lg"
                style={{
                  left: `${15 + (i * 10)}%`,
                  top: `${20 + Math.cos(i) * 25}%`,
                  fontSize: '2rem',
                  animationDelay: `${0.5 + i * 0.3}s`,
                  animationDuration: `${2 + Math.random()}s`
                }}
              >
                {['🎭', '🎪', '🎨', '🎸', '🎺', '🎹', '🎻', '🎤'][i]}
              </div>
            ))}
          </>
        )}
        
        {/* Main level icon with enhanced dramatic entrance and mobile responsiveness */}
        <div 
          className={`
            mb-6 sm:mb-8 md:mb-10 transition-all duration-1000 transform-gpu
            ${animationPhase >= 1 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}
          `}
          style={{
            filter: 'drop-shadow(0 20px 25px rgba(0, 0, 0, 0.3))',
            transform: `perspective(500px) rotateY(${animationPhase >= 1 ? '0deg' : '180deg'})`
          }}
        >
          {getLevelIcon(currentLevel)}
        </div>
        
        {/* Enhanced level up title with 3D text effect and mobile responsiveness */}
        <h1 
          className={`
            text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-4 sm:mb-8 text-center transition-all duration-1000
            ${animationPhase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
          `}
          style={{
            background: 'linear-gradient(45deg, #fbbf24, #f59e0b, #dc2626, #7c3aed, #06d6a0)',
            backgroundSize: '300% 300%',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 5px 15px rgba(0,0,0,0.3)',
            animation: animationPhase >= 1 ? 'gradient-shift 3s ease-in-out infinite' : 'none',
            filter: 'drop-shadow(0 0 20px rgba(251, 191, 36, 0.5))'
          }}
        >
          LEVEL UP!
        </h1>
        
        {/* Enhanced level number with glass morphism and mobile responsiveness */}
        <div 
          className={`
            text-4xl sm:text-5xl md:text-6xl font-black mb-4 sm:mb-6 rounded-full 
            w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 
            flex items-center justify-center mx-auto
            transition-all duration-1000 transform-gpu
            ${animationPhase >= 1 ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}
          `}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '3px solid rgba(251, 191, 36, 0.5)',
            boxShadow: `
              0 10px 25px rgba(0, 0, 0, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.3)
            `,
            color: '#fbbf24',
            textShadow: '0 2px 10px rgba(0,0,0,0.5)',
            animation: animationPhase >= 1 ? 'celebration-pulse 2s ease-in-out infinite' : 'none'
          }}
        >
          {currentLevel}
        </div>
        
        {/* Enhanced level name with modern styling and mobile responsiveness */}
        <div 
          className={`
            text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-6 sm:mb-8 md:mb-10 
            px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-full mx-auto inline-block
            transition-all duration-1000
            ${animationPhase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}
          `}
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(8px)',
            border: '2px solid rgba(245, 158, 11, 0.4)',
            color: '#f59e0b',
            textShadow: '0 2px 8px rgba(0,0,0,0.3)',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)'
          }}
        >
          {levelData?.name}
        </div>
        
        {/* Enhanced rewards section with phase-based reveal and mobile responsiveness */}
        <div 
          className={`
            rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 md:mb-10 
            transition-all duration-1000 transform-gpu
            ${animationPhase >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
          `}
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(15px)',
            border: '2px solid rgba(251, 191, 36, 0.3)',
            boxShadow: `
              0 15px 35px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.2)
            `
          }}
        >
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <Award className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 mr-2 sm:mr-3 md:mr-4 text-yellow-400 animate-celebration-spin" />
            <h2 
              className="text-lg sm:text-xl md:text-2xl font-black text-center"
              style={{
                background: 'linear-gradient(45deg, #fbbf24, #f59e0b)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}
            >
              🎉 NEW REWARDS UNLOCKED! 🎉
            </h2>
            <Award className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 ml-2 sm:ml-3 md:ml-4 text-yellow-400 animate-celebration-spin" style={{ animationDelay: '0.5s' }} />
          </div>
          <ul className="space-y-2 sm:space-y-3 md:space-y-4">
            {levelData?.rewards.map((reward, index) => (
              <li 
                key={index} 
                className={`
                  flex items-center justify-center px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 
                  rounded-xl sm:rounded-2xl transition-all duration-500
                  ${animationPhase >= 2 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}
                `}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(8px)',
                  border: '2px solid rgba(245, 158, 11, 0.3)',
                  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
                  transitionDelay: `${0.5 + index * 0.2}s`
                }}
              >
                <Star className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-yellow-500 mr-2 sm:mr-3 md:mr-4 animate-celebration-spin" style={{ animationDelay: `${index * 0.1}s` }} />
                <span 
                  className="text-sm sm:text-base md:text-lg font-semibold text-center"
                  style={{
                    color: '#f59e0b',
                    textShadow: '0 1px 3px rgba(0,0,0,0.3)'
                  }}
                >
                  {reward}
                </span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Enhanced congratulations message with mobile responsiveness */}
        <div 
          className={`
            text-sm sm:text-base md:text-lg lg:text-xl font-bold 
            px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-full 
            transition-all duration-1000
            ${animationPhase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}
          `}
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(8px)',
            border: '2px solid rgba(245, 158, 11, 0.4)',
            color: '#f59e0b',
            textShadow: '0 2px 8px rgba(0,0,0,0.3)',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
            transitionDelay: '1s'
          }}
        >
          🎊 CONGRATULATIONS ON YOUR ACHIEVEMENT! 🎊
        </div>
        
        {/* Enhanced modern confetti system */}
        {showParticles && (
          <>
            {/* Premium confetti cascade */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
              {[...Array(60)].map((_, i) => (
                <div
                  key={`confetti-${i}`}
                  className="absolute animate-confetti-fall filter drop-shadow-lg"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `-20%`,
                    width: `${4 + Math.random() * 6}px`,
                    height: `${8 + Math.random() * 12}px`,
                    backgroundColor: ['#fbbf24', '#f59e0b', '#dc2626', '#7c3aed', '#06d6a0', '#ec4899'][Math.floor(Math.random() * 6)],
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${2 + Math.random() * 3}s`,
                    borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                    transform: `rotate(${Math.random() * 360}deg)`
                  }}
                />
              ))}
            </div>
            
            {/* Floating achievement icons */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
              {[...Array(20)].map((_, i) => (
                <div
                  key={`achievement-${i}`}
                  className="absolute animate-float-celebration filter drop-shadow-lg"
                  style={{
                    left: `${10 + Math.random() * 80}%`,
                    top: `${10 + Math.random() * 80}%`,
                    fontSize: `${1.5 + Math.random() * 1}rem`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${3 + Math.random() * 2}s`,
                    color: ['#fbbf24', '#f59e0b', '#dc2626', '#7c3aed', '#06d6a0'][Math.floor(Math.random() * 5)]
                  }}
                >
                  {[
                    currentLevel >= 10 ? '👑' : currentLevel >= 8 ? '💎' : currentLevel >= 6 ? '🏆' : currentLevel >= 4 ? '⭐' : '🎯',
                    '🎖️', '🏅', '💪', '🔥', '⚡', '🌟', '💫'
                  ][Math.floor(Math.random() * 8)]}
                </div>
              ))}
            </div>
          </>
        )}
        
        {/* Modern close button with glass morphism and mobile responsiveness */}
        <button
          onClick={() => {
            setShowCelebration(false)
            setAnimationPhase(0)
          }}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 p-2 sm:p-3 md:p-4 rounded-full transition-all duration-300 transform hover:scale-110 hover:rotate-90"
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)'
          }}
          aria-label="Close celebration"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white drop-shadow-lg" />
        </button>
        
        {/* Share button */}
        <button
          onClick={handleShare}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-full
            font-semibold transition-all duration-500 transform
            hover:scale-105 active:scale-95
            ${animationPhase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}
          `}
          style={{
            background: 'linear-gradient(135deg, #06d6a0, #00b4d8)',
            color: 'white',
            boxShadow: '0 5px 20px rgba(6, 214, 160, 0.4)',
            transitionDelay: '1.2s'
          }}
        >
          <Share2 className="w-5 h-5" />
          Share Achievement
        </button>

        {/* Enhanced interactive hint with mobile responsiveness */}
        <div
          className={`
            text-xs sm:text-sm font-medium mt-4 sm:mt-6 md:mt-8
            px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full
            transition-all duration-1000
            ${animationPhase >= 2 ? 'opacity-70' : 'opacity-0'}
          `}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#fbbf24',
            textShadow: '0 1px 3px rgba(0,0,0,0.3)',
            transitionDelay: '1.5s'
          }}
        >
          Click outside or press ESC to close
        </div>
      </div>
      </div>
    </>
  )
}
