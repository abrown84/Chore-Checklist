
import React from 'react'
import { useStats } from '../hooks/useStats'
import { useAuth } from '../hooks/useAuth'
import { useDemo } from '../contexts/DemoContext'
import { useChores } from '../contexts/ChoreContext'
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
        bgColor: 'bg-success/10',
        textColor: 'text-success'
      }
    case 'Summer':
      return {
        icon: <Sun className="w-3 h-3" />,
        bgColor: 'bg-warning/10',
        textColor: 'text-warning'
      }
    case 'Fall':
      return {
        icon: <Leaf className="w-3 h-3" />,
        bgColor: 'bg-chart-3/10',
        textColor: 'text-chart-3'
      }
    case 'Winter':
      return {
        icon: <Snowflake className="w-3 h-3" />,
        bgColor: 'bg-primary/10',
        textColor: 'text-primary'
      }
    default:
      return {
        icon: <Clock className="w-3 h-3" />,
        bgColor: 'bg-muted',
        textColor: 'text-muted-foreground'
      }
  }
}

export const PointsCounter: React.FC = () => {
  const { getUserStats } = useStats()
  const { user } = useAuth()
  const { isDemoMode } = useDemo()
  const { state: choreState } = useChores()
  
  // Get current user's stats from StatsContext
  const userStats = user ? getUserStats(user.id) : null
  
  // In demo mode, calculate stats directly from chores to ensure consistency
  let stats
  if (isDemoMode && choreState.chores.length > 0) {
    const completedChores = choreState.chores.filter(chore => chore.completed)
    const earnedPoints = completedChores.reduce((sum, chore) => {
      const pointsToAdd = chore.finalPoints !== undefined ? chore.finalPoints : chore.points
      return sum + pointsToAdd
    }, 0)
    
    // Calculate level based on earned points
    let currentLevel = 1
    let currentLevelPoints = earnedPoints
    let pointsToNextLevel = 100
    
    for (let i = 0; i < LEVELS.length; i++) {
      if (earnedPoints >= LEVELS[i].pointsRequired) {
        currentLevel = LEVELS[i].level
        currentLevelPoints = earnedPoints - LEVELS[i].pointsRequired
        if (i < LEVELS.length - 1) {
          pointsToNextLevel = LEVELS[i + 1].pointsRequired - earnedPoints
        } else {
          pointsToNextLevel = 0
        }
      } else {
        break
      }
    }
    
    stats = {
      earnedPoints,
      currentLevel,
      currentLevelPoints,
      pointsToNextLevel,
      levelPersistenceInfo: undefined
    }
    
    console.log('🎯 PointsCounter: Demo mode stats calculated from chores:', stats)
  } else {
    // Use userStats if available, otherwise fall back to default values
    stats = userStats || {
      earnedPoints: 0,
      currentLevel: 1,
      currentLevelPoints: 0,
      pointsToNextLevel: 100,
      levelPersistenceInfo: undefined
    }
  }
  
  // Calculate progress percentage correctly based on current level band
  const progressPercentage = useMemo(() => {
    const currentLevelData = LEVELS.find(level => level.level === stats.currentLevel)
    const nextLevelData = LEVELS.find(level => level.level === stats.currentLevel + 1)
    if (!nextLevelData || !currentLevelData) return 100
    
    const bandTotal = Math.max(1, nextLevelData.pointsRequired - currentLevelData.pointsRequired)
    const progress = Math.min(bandTotal, Math.max(0, stats.currentLevelPoints || 0)) / bandTotal
    return Math.round(progress * 100)
  }, [stats.currentLevel, stats.currentLevelPoints])
  
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
    <div className="bg-gradient-to-br from-primary/10 via-chart-4/10 to-accent/10 rounded-2xl p-3 sm:p-4 border border-primary/20 shadow-lg animate-fade-in">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Level Display */}
        <div className="text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-2 mb-2">
            <div className="flex items-center space-x-2">
              {getLevelIcon(stats.currentLevel)}
              <span className="text-xl sm:text-2xl font-bold text-foreground">
                Level {stats.currentLevel}
              </span>
            </div>
            {(() => {
              const currentSeason = getCurrentSeason()
              const seasonInfo = getSeasonInfo(currentSeason)
              return (
                <div className={`flex items-center space-x-1 px-2 py-1 ${seasonInfo.bgColor} ${seasonInfo.textColor} rounded-full text-xs font-medium`}>
                  {seasonInfo.icon}
                  <span className="hidden sm:inline">{currentSeason}</span>
                </div>
              )
            })()}
          </div>
          <p className="text-sm sm:text-base text-muted-foreground mb-1">{currentLevelData?.name}</p>
          <div className="text-xs text-muted-foreground">{currentLevelData?.icon}</div>
        </div>

        {/* Points Display */}
        <div className="text-center">
          <div className="text-xs sm:text-sm text-muted-foreground mb-1">Total Points</div>
          <div className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-chart-4 bg-clip-text text-transparent drop-shadow-sm">
            {stats.earnedPoints}
          </div>
        </div>

        {/* Progress to Next Level */}
        {nextLevelData && (
          <div className="text-center w-full sm:min-w-[120px] sm:w-auto">
            <div className="text-xs sm:text-sm text-muted-foreground">Next Level</div>
            <div className="text-base sm:text-lg font-semibold text-chart-4">Lv {nextLevelData.level}</div>
            <div className="w-full bg-muted rounded-full h-2 mt-1">
              <div 
                className="bg-gradient-to-r from-primary to-chart-4 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {stats.pointsToNextLevel} pts needed
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
