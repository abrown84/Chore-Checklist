import React from 'react'
import { Sparkles } from 'lucide-react'
import { User } from '../../types/user'
import { UserStats } from '../../types/user'
import { useUserProgress } from '../../hooks/useUserProgress'
import { useAnimationDelays } from '../../hooks/useAnimationDelays'
import { APP_CONFIG } from '../../config/constants'

interface PersonalProgressProps {
  currentUser: User
  currentUserStats: UserStats
}

export const PersonalProgress: React.FC<PersonalProgressProps> = React.memo(({ 
  currentUser, 
  currentUserStats 
}) => {
  const { currentLevelData, nextLevelData, progressToNextLevel, pointsToNextLevel, isMaxLevel } = 
    useUserProgress({ userStats: currentUserStats })
  
  const { getDelayStyle } = useAnimationDelays({ 
    baseDelay: APP_CONFIG.ANIMATION_DELAYS.FADE_IN,
    count: 4 
  })

  return (
    <div className="bg-gradient-to-br from-primary/10 via-chart-4/10 to-accent/10 p-8 rounded-2xl border border-primary/20 shadow-lg animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        {/* User Level & Avatar */}
        <div className="text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start space-x-4 mb-4">
            <span className="text-6xl animate-float">{currentUser.avatar}</span>
            <div>
              <h2 className="text-3xl font-bold text-foreground animate-slide-in">
                {currentUser.name}
              </h2>
              <div className="flex items-center justify-center lg:justify-start space-x-2 mt-2">
                <span className="text-2xl animate-float">{currentLevelData?.icon || '🌱'}</span>
                <span className="text-xl font-bold text-foreground">
                  Level {currentUserStats.currentLevel}
                </span>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${currentLevelData?.color || 'text-muted-foreground'} bg-card/80`}>
                  {currentLevelData?.name || 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div 
            className="bg-card/80 backdrop-blur-sm p-4 rounded-xl text-center hover:scale-105 transition-all duration-300 animate-scale-in"
            style={getDelayStyle(0)}
          >
            <div className="text-2xl font-bold text-primary">{currentUserStats.earnedPoints}</div>
            <div className="text-sm text-muted-foreground">Total Points</div>
          </div>
          <div 
            className="bg-card/80 backdrop-blur-sm p-4 rounded-xl text-center hover:scale-105 transition-all duration-300 animate-scale-in"
            style={getDelayStyle(1)}
          >
            <div className="text-2xl font-bold text-success">{currentUserStats.completedChores}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </div>
          <div 
            className="bg-card/80 backdrop-blur-sm p-4 rounded-xl text-center hover:scale-105 transition-all duration-300 animate-scale-in"
            style={getDelayStyle(2)}
          >
            <div className="text-2xl font-bold text-chart-4">
              {(currentUserStats.efficiencyScore || 0).toFixed(0)}%
            </div>
            <div className="text-sm text-muted-foreground">Efficiency</div>
          </div>
          <div 
            className="bg-card/80 backdrop-blur-sm p-4 rounded-xl text-center hover:scale-105 transition-all duration-300 animate-scale-in"
            style={getDelayStyle(3)}
          >
            <div className="text-2xl font-bold text-warning">{currentUserStats.currentStreak || 0}</div>
            <div className="text-sm text-muted-foreground">Day Streak</div>
          </div>
        </div>

        {/* Level Progress */}
        <div className="bg-card/80 backdrop-blur-sm p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-foreground mb-4">Level Progress</h3>
          {!isMaxLevel && nextLevelData ? (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Level {nextLevelData.level}</span>
                <span className="text-sm font-medium text-primary">
                  {Math.max(progressToNextLevel, 0).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-3 mb-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-primary to-chart-4 h-3 rounded-full transition-all duration-1000 ease-out animate-scale-in"
                  style={{ width: `${Math.min(Math.max(progressToNextLevel, 0), 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {pointsToNextLevel} points to next level
              </p>
            </div>
          ) : (
            <div className="text-center">
              <Sparkles className="w-8 h-8 text-warning mx-auto mb-2 animate-sparkle" />
              <p className="text-sm font-medium text-success">Max Level Achieved!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

PersonalProgress.displayName = 'PersonalProgress'
