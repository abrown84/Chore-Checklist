import { useEffect, useState, useRef } from 'react'
import { useChores } from '../contexts/ChoreContext'
import { LEVELS } from '../types/chore'
import { Star, Crown, Target, Trophy, X } from 'lucide-react'

export const LevelUpCelebration: React.FC = () => {
  const { state } = useChores()
  const [showCelebration, setShowCelebration] = useState(false)
  const [previousLevel, setPreviousLevel] = useState(1)
  const [currentLevel, setCurrentLevel] = useState(1)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (state.stats.currentLevel > previousLevel) {
      setShowCelebration(true)
      setPreviousLevel(state.stats.currentLevel)
      
      // Hide celebration after 2.5 seconds (reduced from 5 seconds)
      const timer = setTimeout(() => {
        setShowCelebration(false)
      }, 2500)
      
      return () => clearTimeout(timer)
    }
  }, [state.stats.currentLevel, previousLevel])

  useEffect(() => {
    setCurrentLevel(state.stats.currentLevel)
  }, [state.stats.currentLevel])

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowCelebration(false)
      }
    }

    if (showCelebration) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCelebration])

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowCelebration(false)
      }
    }

    if (showCelebration) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [showCelebration])

  if (!showCelebration) return null

  const levelData = LEVELS.find(level => level.level === currentLevel)
  
  const getLevelIcon = (level: number) => {
    if (level >= 10) return <Crown className="w-16 h-16 text-amber-600" />
    if (level >= 8) return <Crown className="w-16 h-16 text-pink-600" />
    if (level >= 6) return <Trophy className="w-16 h-16 text-red-600" />
    if (level >= 4) return <Star className="w-16 h-16 text-purple-600" />
    return <Target className="w-16 h-16 text-blue-600" />
  }



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div 
        ref={modalRef}
        className="relative bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl animate-bounce"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl -z-10" />
        
        {/* Fireworks effect */}
        <div className="absolute -top-4 -left-4 text-4xl animate-pulse">🎆</div>
        <div className="absolute -top-4 -right-4 text-4xl animate-pulse">🎇</div>
        <div className="absolute -bottom-4 -left-4 text-4xl animate-pulse">✨</div>
        <div className="absolute -bottom-4 -right-4 text-4xl animate-pulse">🎊</div>
        
        {/* Main content */}
        <div className="mb-6">
          {getLevelIcon(currentLevel)}
        </div>
        
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
          LEVEL UP!
        </h1>
        
        <div className="text-2xl font-semibold mb-2 text-gray-800">
          Level {currentLevel}
        </div>
        
        <div className="text-lg font-medium mb-4 text-gray-600">
          {levelData?.name}
        </div>
        
        <div className="bg-gradient-to-r from-yellow-200 to-orange-200 rounded-lg p-4 mb-6">
          <div className="text-sm font-medium text-gray-700 mb-2">🎁 New Rewards Unlocked:</div>
          <ul className="text-sm text-gray-600 space-y-1">
            {levelData?.rewards.map((reward, index) => (
              <li key={index} className="flex items-center justify-center">
                <Star className="w-4 h-4 text-yellow-500 mr-2" />
                {reward}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="text-sm text-gray-500">
          🎉 Congratulations on your achievement! 🎉
        </div>
        
        {/* Close button */}
        <button
          onClick={() => setShowCelebration(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          aria-label="Close celebration"
        >
          <X className="w-5 h-5" />
        </button>
        
        {/* Click outside hint */}
        <div className="text-xs text-gray-400 mt-4">
          Click outside or press ESC to close
        </div>
      </div>
    </div>
  )
}
