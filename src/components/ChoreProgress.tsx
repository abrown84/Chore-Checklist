
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { useChores } from '../contexts/ChoreContext'
import { useStats } from '../hooks/useStats'
import { useAuth } from '../hooks/useAuth'
import { useDemo } from '../contexts/DemoContext'
import { Target, Star, Trophy, Crown, Award, CheckCircle } from 'lucide-react'
import { LEVELS } from '../types/chore'
import { LevelMeme } from './profile/LevelMeme'

export const ChoreProgress: React.FC = () => {
  const { state, resetChores } = useChores()
  const { getUserStats } = useStats()
  const { user } = useAuth()
  const { isDemoMode } = useDemo()
  
  // Get the current user's stats from StatsContext
  const userStats = user ? getUserStats(user.id) : null
  
  // In demo mode, calculate stats directly from chores to ensure consistency
  let stats
  if (isDemoMode && state.chores.length > 0) {
    const completedChores = state.chores.filter(c => c.completed)
    const earnedPoints = completedChores.reduce((sum, c) => sum + (c.finalPoints || c.points), 0)
    
    // Calculate level based on earned points
    let currentLevel = 1
    let currentLevelPoints = earnedPoints
    let pointsToNextLevel = 25 // Default to Level 2 requirement
    
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
      totalChores: state.chores.length,
      completedChores: completedChores.length,
      totalPoints: state.chores.reduce((sum, c) => sum + (c.finalPoints || c.points), 0),
      earnedPoints,
      currentStreak: 0,
      longestStreak: 0,
      currentLevel,
      currentLevelPoints,
      pointsToNextLevel,
      lastActive: new Date()
    }
    

  } else {
    // Use userStats if available, otherwise create fallback stats
    stats = userStats || {
      totalChores: state.chores.length,
      completedChores: state.chores.filter(c => c.completed).length,
      totalPoints: state.chores.reduce((sum, c) => sum + c.points, 0),
      earnedPoints: state.chores.filter(c => c.completed).reduce((sum, c) => sum + (c.finalPoints || c.points), 0),
      currentStreak: 0,
      longestStreak: 0,
      currentLevel: 1,
      currentLevelPoints: 0,
      pointsToNextLevel: 25, // Default to Level 2 requirement
      lastActive: new Date()
    }
  }

  const currentLevelData = LEVELS.find(level => level.level === stats.currentLevel)
  const nextLevelData = LEVELS.find(level => level.level === stats.currentLevel + 1)

  const progressToNextLevel = nextLevelData 
    ? Math.max(0, Math.min(100, (stats.currentLevelPoints / Math.max(1, nextLevelData.pointsRequired - (currentLevelData?.pointsRequired || 0))) * 100))
    : 100



  const getLevelIcon = (level: number) => {
    if (level >= 10) return <Crown className="w-6 h-6 text-amber-600" />
    if (level >= 8) return <Crown className="w-6 h-6 text-pink-600" />
    if (level >= 6) return <Trophy className="w-6 h-6 text-red-600" />
    if (level >= 4) return <Star className="w-6 h-6 text-purple-600" />
    return <Target className="w-6 h-6 text-blue-600" />
  }

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-chart-4/10 to-accent/10 rounded-2xl border border-primary/20 shadow-lg animate-fade-in">
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <CardTitle className="text-base sm:text-lg font-medium text-foreground">Level System</CardTitle>
          <div className="flex flex-wrap gap-2">
            {state.chores.length > 0 && (
              <>
                
                <Button
                  onClick={resetChores}
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-300 hover:bg-red-50 text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">Reset All Chores</span>
                  <span className="sm:hidden">Reset</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        {/* Current Level Display */}
        <div className="text-center">
          <div className="flex justify-center mb-3 sm:mb-4">
            {getLevelIcon(stats.currentLevel)}
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Level {stats.currentLevel}
          </h2>
          <p className={`text-lg sm:text-xl font-medium mb-1 ${currentLevelData?.color}`}>
            {currentLevelData?.icon} {currentLevelData?.name}
          </p>
          {/* Level Meme */}
          {currentLevelData && (
            <div className="mb-3 sm:mb-4 max-w-md mx-auto" style={{ aspectRatio: '4/3' }}>
              <LevelMeme level={currentLevelData} className="h-full w-full" />
            </div>
          )}
          <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
            {stats.earnedPoints} total points earned
          </p>
        </div>

        {/* Progress to Next Level */}
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-1">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">
              {nextLevelData ? `Progress to Level ${nextLevelData.level}` : 'Current Level Progress'}
            </span>
            <span className="text-xs sm:text-sm font-medium text-primary">
              {stats.currentLevelPoints} / {nextLevelData ? (nextLevelData.pointsRequired - (currentLevelData?.pointsRequired || 0)) : '100'} points
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 sm:h-3 mb-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-primary to-chart-4 h-2 sm:h-3 rounded-full transition-all duration-1000 ease-out animate-scale-in"
              style={{ 
                width: `${Math.min(progressToNextLevel, 100)}%`,
                minWidth: '1px'
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1 text-center">
            {stats.pointsToNextLevel} points to next level
          </p>
        </div>

        {/* Current Level Rewards */}
        <div className="bg-card/80 backdrop-blur-sm p-3 sm:p-4 rounded-xl border border-primary/10">
          <h3 className="text-sm sm:text-base font-medium text-foreground mb-2 sm:mb-3 flex items-center">
            <Award className="w-4 h-4 mr-2 text-primary" />
            Current Level Rewards
          </h3>
          <div className="space-y-1 sm:space-y-2">
            {currentLevelData?.rewards.map((reward, index) => (
              <div key={index} className="flex items-start text-xs sm:text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                <span>{reward}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Next Level Preview */}
        {nextLevelData && (
          <div className="bg-card/80 backdrop-blur-sm p-4 rounded-xl border border-primary/10">
            <h3 className="font-medium text-foreground mb-3 flex items-center">
              <Target className="w-4 h-4 mr-2 text-chart-4" />
              Next Level: {nextLevelData.name}
            </h3>
            <div className="space-y-2">
              {nextLevelData.rewards.map((reward, index) => (
                <div key={index} className="flex items-center text-sm text-muted-foreground">
                  <Star className="w-4 h-4 mr-2 text-chart-4" />
                  {reward}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          <div className="bg-card/80 backdrop-blur-sm p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-primary">{stats.totalChores}</div>
            <div className="text-xs text-muted-foreground">Total Chores</div>
          </div>
          
          <div className="bg-card/80 backdrop-blur-sm p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-success">{stats.completedChores}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          
          <div className="bg-card/80 backdrop-blur-sm p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-chart-4">{stats.earnedPoints}</div>
            <div className="text-xs text-muted-foreground">Points Earned</div>
          </div>
          
          <div className="bg-card/80 backdrop-blur-sm p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-warning">{stats.currentStreak}</div>
            <div className="text-xs text-muted-foreground">Day Streak</div>
          </div>
        </div>

        {/* Level Journey */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="font-medium text-foreground mb-3">Level Journey</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {LEVELS.map((level) => (
              <div 
                key={level.level}
                className={`text-center p-2 rounded-lg text-xs ${
                  stats.currentLevel >= level.level 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                <div className="font-medium">{level.icon}</div>
                <div className="font-medium">Lv {level.level}</div>
                <div className="text-xs truncate">{level.name}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
