import React, { useState, useEffect, useRef } from 'react'
import { Star, Zap, Sparkles, Plus, Minus } from 'lucide-react'

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
  const [isVisible, setIsVisible] = useState(true)
  const elementRef = useRef<HTMLDivElement>(null)
  
  // Generate random movement parameters for each popup
  const [movement] = useState(() => ({
    driftX: (Math.random() - 0.5) * 100, // Random horizontal drift
    driftY: Math.random() * -80 - 40,     // Upward drift with variation
    rotation: (Math.random() - 0.5) * 30, // Random rotation
    scale: 0.8 + Math.random() * 0.6,     // Random size variation
    bounceFactor: 0.7 + Math.random() * 0.6 // Bounce intensity
  }))

  // Determine color and style based on popup type
  const getPopupStyle = () => {
    const type = celebration.type || 'points'
    const points = celebration.points
    
    switch (type) {
      case 'bonus':
        return {
          color: '#22c55e', // Green
          bgColor: 'from-green-400 to-emerald-500',
          textColor: 'text-white',
          glow: 'shadow-green-400/50',
          icon: <Plus className="w-4 h-4" />,
          prefix: '+'
        }
      case 'streak':
        return {
          color: '#f59e0b', // Orange
          bgColor: 'from-yellow-400 to-orange-500',
          textColor: 'text-white',
          glow: 'shadow-orange-400/50',
          icon: <Zap className="w-4 h-4" />,
          prefix: '+'
        }
      case 'level':
        return {
          color: '#8b5cf6', // Purple
          bgColor: 'from-purple-400 to-violet-600',
          textColor: 'text-white',
          glow: 'shadow-purple-400/50',
          icon: <Star className="w-4 h-4" />,
          prefix: 'LVL+'
        }
      default:
        // Dynamic color based on point value
        if (points >= 50) {
          return {
            color: '#dc2626', // Red for high points
            bgColor: 'from-red-400 to-red-600',
            textColor: 'text-white',
            glow: 'shadow-red-400/50',
            icon: <Star className="w-4 h-4" />,
            prefix: '+'
          }
        } else if (points >= 25) {
          return {
            color: '#7c3aed', // Purple for medium points
            bgColor: 'from-purple-400 to-purple-600',
            textColor: 'text-white',
            glow: 'shadow-purple-400/50',
            icon: <Zap className="w-4 h-4" />,
            prefix: '+'
          }
        } else if (points >= 10) {
          return {
            color: '#2563eb', // Blue for moderate points
            bgColor: 'from-blue-400 to-blue-600',
            textColor: 'text-white',
            glow: 'shadow-blue-400/50',
            icon: <Plus className="w-4 h-4" />,
            prefix: '+'
          }
        } else {
          return {
            color: '#059669', // Green for low points
            bgColor: 'from-emerald-400 to-green-500',
            textColor: 'text-white',
            glow: 'shadow-green-400/50',
            icon: <Plus className="w-4 h-4" />,
            prefix: '+'
          }
        }
    }
  }

  const style = getPopupStyle()

  useEffect(() => {
    // Start exit animation after 0.8 seconds (faster dissolve)
    const exitTimer = setTimeout(() => {
      setIsVisible(false)
    }, 800)

    // Remove from parent after animation completes
    const removeTimer = setTimeout(() => {
      onRemove(celebration.id)
    }, 1200)

    return () => {
      clearTimeout(exitTimer)
      clearTimeout(removeTimer)
    }
  }, [celebration.id, onRemove])

  return (
    <div
      ref={elementRef}
      className={`absolute transform transition-all duration-500 ease-out pointer-events-none ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        left: celebration.x,
        top: celebration.y,
        transform: isVisible 
          ? `translate(${movement.driftX}px, ${movement.driftY}px) scale(${movement.scale}) rotate(${movement.rotation}deg)` 
          : `translate(${movement.driftX * 1.5}px, ${movement.driftY * 2}px) scale(${movement.scale * 0.5}) rotate(${movement.rotation * 2}deg)`,
        zIndex: Math.floor(Math.random() * 100) + 1000, // Random stacking
      }}
    >
      {/* Main damage number with game-like styling */}
      <div className={`relative animate-bounce`} style={{ animationDuration: `${0.6 + Math.random() * 0.4}s` }}>
        {/* Glow effect behind text */}
        <div 
          className={`absolute inset-0 blur-sm opacity-70 rounded-lg ${style.glow}`}
          style={{ 
            backgroundColor: style.color,
            transform: 'scale(1.1)'
          }}
        />
        
        {/* Main text container */}
        <div 
          className={`relative bg-gradient-to-br ${style.bgColor} px-3 py-1 rounded-lg border-2 border-white/30 shadow-2xl`}
          style={{
            fontSize: `${Math.max(16, Math.min(32, 16 + celebration.points / 5))}px`, // Size based on points
            fontWeight: '900',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
          }}
        >
          <div className={`flex items-center space-x-1 ${style.textColor} font-black tracking-wider`}>
            {style.icon}
            <span className="font-mono">
              {style.prefix}{celebration.points}
            </span>
          </div>
        </div>
        
        {/* Floating sparkle effects */}
        <div className="absolute -top-1 -right-1">
          <div 
            className="w-2 h-2 rounded-full animate-ping" 
            style={{ 
              backgroundColor: style.color,
              animationDelay: `${Math.random() * 0.5}s`,
              animationDuration: '0.8s'
            }} 
          />
        </div>
        <div className="absolute -bottom-1 -left-1">
          <div 
            className="w-1 h-1 rounded-full animate-pulse" 
            style={{ 
              backgroundColor: style.color,
              animationDelay: `${Math.random() * 0.5}s`
            }} 
          />
        </div>
        
        {/* Random particle trails */}
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full animate-bounce"
            style={{
              backgroundColor: style.color,
              left: `${-10 + Math.random() * 20}px`,
              top: `${-10 + Math.random() * 20}px`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: `${0.8 + Math.random() * 0.4}s`,
              opacity: 0.7
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

  const addCelebration = (points: number, choreTitle: string, x: number, y: number, type?: 'points' | 'bonus' | 'streak' | 'level') => {
    // Create multiple popups for better visual impact
    const popups: PopupCelebration[] = []
    
    // Main points popup
    const mainPopup: PopupCelebration = {
      id: `celebration-${Date.now()}-${Math.random()}`,
      points,
      choreTitle,
      x: x + (Math.random() - 0.5) * 40, // Add some position variation
      y: y + (Math.random() - 0.5) * 20,
      timestamp: Date.now(),
      type: type || 'points'
    }
    popups.push(mainPopup)

    // Add bonus popups for higher point values (like in the image)
    if (points >= 15) {
      // Add a smaller bonus popup
      const bonusPopup: PopupCelebration = {
        id: `bonus-${Date.now()}-${Math.random()}`,
        points: Math.floor(points * 0.3),
        choreTitle,
        x: x + (Math.random() - 0.5) * 80,
        y: y + (Math.random() - 0.5) * 40,
        timestamp: Date.now() + Math.random() * 200, // Slight delay
        type: 'bonus'
      }
      popups.push(bonusPopup)
    }

    if (points >= 30) {
      // Add another variety popup for really high scores
      const streakPopup: PopupCelebration = {
        id: `streak-${Date.now()}-${Math.random()}`,
        points: Math.floor(points * 0.2),
        choreTitle,
        x: x + (Math.random() - 0.5) * 100,
        y: y + (Math.random() - 0.5) * 60,
        timestamp: Date.now() + Math.random() * 400,
        type: 'streak'
      }
      popups.push(streakPopup)
    }

    // Add level up popup if it's a level type
    if (type === 'level') {
      const levelPopup: PopupCelebration = {
        id: `level-${Date.now()}-${Math.random()}`,
        points: 1, // Level number
        choreTitle: 'LEVEL UP!',
        x: x + (Math.random() - 0.5) * 60,
        y: y - 50 + (Math.random() - 0.5) * 30,
        timestamp: Date.now() + Math.random() * 300,
        type: 'level'
      }
      popups.push(levelPopup)
    }
    
    // Add all popups with slight delays for staggered effect
    popups.forEach((popup, index) => {
      setTimeout(() => {
        setCelebrations(prev => [...prev, popup])
      }, index * 100) // 100ms delay between each popup
    })
  }

  const addMultipleCelebrations = (celebrationData: Array<{points: number, x: number, y: number, type?: 'points' | 'bonus' | 'streak' | 'level'}>) => {
    // For when you want to manually create multiple popups (like the image shows)
    celebrationData.forEach((data, index) => {
      setTimeout(() => {
        const popup: PopupCelebration = {
          id: `multi-${Date.now()}-${index}-${Math.random()}`,
          points: data.points,
          choreTitle: '',
          x: data.x + (Math.random() - 0.5) * 30,
          y: data.y + (Math.random() - 0.5) * 30,
          timestamp: Date.now(),
          type: data.type || 'points'
        }
        setCelebrations(prev => [...prev, popup])
      }, index * 50) // Quick succession like in gaming
    })
  }

  const removeCelebration = (id: string) => {
    setCelebrations(prev => prev.filter(c => c.id !== id))
  }

  return {
    celebrations,
    addCelebration,
    addMultipleCelebrations,
    removeCelebration
  }
}
