import React, { useState, useEffect, useRef } from 'react'
import { useChores } from '../contexts/ChoreContext'
import { CheckCircle, Star, Zap } from 'lucide-react'

export const ChoreCelebration: React.FC = () => {
  const { state } = useChores()
  const [currentCelebration, setCurrentCelebration] = useState<{
    points: number
    choreTitle: string
  } | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [showParticles, setShowParticles] = useState(false)
  const lastCompletedChoreId = useRef<string | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const particleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Find the chore that was just completed by looking for the most recent completedAt timestamp
    const completedChores = state.chores.filter(chore => chore.completed && chore.completedAt)
    
    if (completedChores.length === 0) return
    
    // Find the most recently completed chore
    const mostRecentCompleted = completedChores.reduce((latest, current) => {
      if (!latest.completedAt) return current
      if (!current.completedAt) return latest
      return new Date(current.completedAt) > new Date(latest.completedAt) ? current : latest
    })
    
    // Check if this is a newly completed chore (different from last one we showed)
    if (mostRecentCompleted.id !== lastCompletedChoreId.current) {
      lastCompletedChoreId.current = mostRecentCompleted.id
      
      // Clear any existing timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (particleTimeoutRef.current) {
        clearTimeout(particleTimeoutRef.current)
      }
      
      // Set the new celebration
      const celebrationPoints = mostRecentCompleted.finalPoints || mostRecentCompleted.points

      
      setCurrentCelebration({
        points: celebrationPoints,
        choreTitle: mostRecentCompleted.title
      })
      
      // Show celebration with entrance animation
      setIsVisible(true)
      setShowParticles(true)
      
      // Hide particles after 0.8 seconds (faster)
      particleTimeoutRef.current = setTimeout(() => {
        setShowParticles(false)
      }, 800)
      
      // Hide celebration after 1.2 seconds (much faster dissolve)
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false)
        setCurrentCelebration(null)
      }, 1200)
    }
  }, [state.chores])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (particleTimeoutRef.current) {
        clearTimeout(particleTimeoutRef.current)
      }
    }
  }, [])

  if (!isVisible || !currentCelebration) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      {/* Background overlay with fade-in */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-fade-in" />
      
      {/* Main celebration card */}
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
          Chore Completed!
        </h2>
        
        {/* Chore title with fade-in */}
        <p className="text-gray-700 mb-6 text-lg font-medium animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {currentCelebration.choreTitle}
        </p>
        
        {/* Points display with scale-in and glow effect */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white px-8 py-4 rounded-2xl mb-6 animate-scale-in animate-glow" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-center space-x-3">
            <Star className="w-6 h-6 animate-sparkle" />
            <span className="text-2xl font-bold">+{currentCelebration.points} Points!</span>
            <Zap className="w-6 h-6 animate-sparkle" style={{ animationDelay: '0.3s' }} />
          </div>
        </div>
        
        {/* Encouragement message with fade-in */}
        <div className="text-sm text-gray-600 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <CheckCircle className="w-4 h-4 inline mr-2 text-green-500" />
          Great job! Keep it up!
        </div>
        
        {/* Particle effects */}
        {showParticles && (
          <>
            {/* Confetti particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 animate-float"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'][Math.floor(Math.random() * 6)],
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${2 + Math.random() * 2}s`
                  }}
                />
              ))}
            </div>
            
            {/* Sparkle particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
              {[...Array(15)].map((_, i) => (
                <div
                  key={i}
                  className="absolute text-yellow-400 animate-sparkle"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    fontSize: `${12 + Math.random() * 8}px`,
                    animationDelay: `${Math.random() * 1.5}s`,
                    animationDuration: `${1 + Math.random() * 1}s`
                  }}
                >
                  ✨
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
