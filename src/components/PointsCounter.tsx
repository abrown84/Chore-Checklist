
import React from 'react'
import { useStats } from '../contexts/StatsContext'
import { useAuth } from '../hooks/useAuth'
import { LEVELS } from '../types/chore'
import { Star, Crown, Target, Trophy, Clock, Flower, Sun, Leaf, Snowflake } from 'lucide-react'
import { useMemo } from 'react'

// Function to get current season based on date
const getCurrentSeason = () => {
  const now = new Date()
  const month = now.getMonth() + 1 // getMonth() returns 0-11, so add 1
  const day = now.getDate()
  
  // Define season boundaries (Northern Hemisphere)
  if ((month === 3 && day >= 20) || month === 4 || month === 5 || (month === 6 && day < 21)) {
    return 'Spring'
  } else if ((month === 6 && day >= 21) || month === 7 || month === 8 || (month === 9 && day < 22)) {
    return 'Summer'
  } else if ((month === 9 && day >= 22) || month === 10 || month === 11 || (month === 12 && day < 21)) {
    return 'Fall'
  } else {
    return 'Winter'
  }
}

// Function to get season icon and colors
const getSeasonInfo = (season: string) => {
  switch (season) {
    case 'Spring':
      return {
        icon: <Flower className="w-3 h-3" />,
        bgColor: 'bg-green-100',
        textColor: 'text-green-800'
      }
    case 'Summer':
      return {
        icon: <Sun className="w-3 h-3" />,
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800'
      }
    case 'Fall':
      return {
        icon: <Leaf className="w-3 h-3" />,
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-800'
      }
    case 'Winter':
      return {
        icon: <Snowflake className="w-3 h-3" />,
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800'
      }
    default:
      return {
        icon: <Clock className="w-3 h-3" />,
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800'
      }
  }
}

export const PointsCounter: React.FC = () => {

  const { getUserStats } = useStats()
  const { user } = useAuth()
  
  // Get current user's stats from StatsContext
  const userStats = user ? getUserStats(user.id) : null
  
  // Use userStats if available, otherwise fall back to default values
  const stats = userStats || {
    earnedPoints: 0,
    currentLevel: 1,
    currentLevelPoints: 0,
    pointsToNextLevel: 100,
    levelPersistenceInfo: undefined
  }
  
  // Calculate progress percentage
  const progressPercentage = useMemo(() => {
    if (stats.pointsToNextLevel <= 0) return 100
    
    const progress = (stats.currentLevelPoints || 0) / stats.pointsToNextLevel
    return Math.min(100, Math.max(0, progress * 100))
  }, [stats.currentLevelPoints, stats.pointsToNextLevel])
  
  // Get level data
  const currentLevelData = LEVELS.find(level => level.level === stats.currentLevel)
  const nextLevelData = LEVELS.find(level => level.level === stats.currentLevel + 1)
  
  // Get level icon based on level
  const getLevelIcon = (level: number) => {
    if (level >= 10) return <Crown className="w-5 h-5 text-amber-600" />
    if (level >= 8) return <Crown className="w-5 h-5 text-pink-600" />
    if (level >= 6) return <Trophy className="w-5 h-5 text-red-600" />
    if (level >= 4) return <Star className="w-5 h-5 text-purple-600" />
    return <Target className="w-5 h-5 text-blue-600" />
  }

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Level Display */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            {getLevelIcon(stats.currentLevel)}
            <span className="text-2xl font-bold text-gray-900">
              Level {stats.currentLevel}
            </span>
            {(() => {
              const currentSeason = getCurrentSeason()
              const seasonInfo = getSeasonInfo(currentSeason)
              return (
                <div className={`flex items-center space-x-1 px-2 py-1 ${seasonInfo.bgColor} ${seasonInfo.textColor} rounded-full text-xs font-medium`}>
                  {seasonInfo.icon}
                  <span>{currentSeason}</span>
                </div>
              )
            })()}
          </div>
          <p className="text-gray-600 mb-1">{currentLevelData?.name}</p>
          <div className="text-xs text-gray-500">{currentLevelData?.icon}</div>
        </div>

        {/* Points Display */}
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Total Points</div>
          <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">
            {stats.earnedPoints}
          </div>
        </div>

        {/* Progress to Next Level */}
        {nextLevelData && (
          <div className="text-center min-w-[120px]">
            <div className="text-sm text-gray-600">Next Level</div>
            <div className="text-lg font-semibold text-purple-600">Lv {nextLevelData.level}</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {stats.pointsToNextLevel} pts needed
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
