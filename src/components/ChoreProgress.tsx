
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { useChores } from '../contexts/ChoreContext'
import { Target, Star, Trophy, Crown, Award, CheckCircle } from 'lucide-react'
import { LEVELS } from '../types/chore'

export const ChoreProgress: React.FC = () => {
  const { state, resetChores } = useChores()
  const { stats } = state

  const currentLevelData = LEVELS.find(level => level.level === stats.currentLevel)
  const nextLevelData = LEVELS.find(level => level.level === stats.currentLevel + 1)

  const progressToNextLevel = nextLevelData 
    ? (stats.currentLevelPoints / (nextLevelData.pointsRequired - (currentLevelData?.pointsRequired || 0))) * 100
    : 100



  const handleInspectStorage = () => {
    const savedChores = localStorage.getItem('chores')
    console.log('localStorage chores:', savedChores)
    if (savedChores) {
      try {
        const parsed = JSON.parse(savedChores)
        console.log('Parsed chores:', parsed)
        console.log('Chores array length:', parsed.length)
        console.log('First chore:', parsed[0])
        console.log('All chores completed status:', parsed.map((c: any) => ({ id: c.id, title: c.title, completed: c.completed })))
      } catch (error) {
        console.error('Failed to parse localStorage:', error)
      }
    }
  }

  const getLevelIcon = (level: number) => {
    if (level >= 10) return <Crown className="w-6 h-6 text-amber-600" />
    if (level >= 8) return <Crown className="w-6 h-6 text-pink-600" />
    if (level >= 6) return <Trophy className="w-6 h-6 text-red-600" />
    if (level >= 4) return <Star className="w-6 h-6 text-purple-600" />
    return <Target className="w-6 h-6 text-blue-600" />
  }

  return (
    <Card className="bg-white shadow rounded-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium text-gray-900">Level System</CardTitle>
          <div className="flex space-x-2">
            {state.chores.length > 0 && (
              <>
                <Button
                  onClick={handleInspectStorage}
                  size="sm"
                  variant="outline"
                  className="text-blue-600 border-blue-300 hover:bg-blue-50"
                >
                  Inspect Storage
                </Button>
                <Button
                  onClick={resetChores}
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  Reset All Chores
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Level Display */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            {getLevelIcon(stats.currentLevel)}
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Level {stats.currentLevel}
          </h2>
          <p className={`text-xl font-medium mb-1 ${currentLevelData?.color}`}>
            {currentLevelData?.icon} {currentLevelData?.name}
          </p>
          <p className="text-sm text-gray-600 mb-4">
            {stats.earnedPoints} total points earned
          </p>
        </div>

        {/* Progress to Next Level */}
        {nextLevelData && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progress to Level {nextLevelData.level}</span>
              <span className="text-sm font-medium text-indigo-600">
                {stats.currentLevelPoints} / {nextLevelData.pointsRequired - (currentLevelData?.pointsRequired || 0)} points
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progressToNextLevel, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1 text-center">
              {stats.pointsToNextLevel} points to next level
            </p>
          </div>
        )}

        {/* Current Level Rewards */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center">
            <Award className="w-4 h-4 mr-2 text-blue-600" />
            Current Level Rewards
          </h3>
          <div className="space-y-2">
            {currentLevelData?.rewards.map((reward, index) => (
              <div key={index} className="flex items-center text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                {reward}
              </div>
            ))}
          </div>
        </div>

        {/* Next Level Preview */}
        {nextLevelData && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <Target className="w-4 h-4 mr-2 text-purple-600" />
              Next Level: {nextLevelData.name}
            </h3>
            <div className="space-y-2">
              {nextLevelData.rewards.map((reward, index) => (
                <div key={index} className="flex items-center text-sm text-gray-600">
                  <Star className="w-4 h-4 mr-2 text-purple-500" />
                  {reward}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">{stats.totalChores}</div>
            <div className="text-xs text-gray-500">Total Chores</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completedChores}</div>
            <div className="text-xs text-gray-500">Completed</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.earnedPoints}</div>
            <div className="text-xs text-gray-500">Points Earned</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.currentStreak}</div>
            <div className="text-xs text-gray-500">Day Streak</div>
          </div>
        </div>

        {/* Level Journey */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="font-medium text-gray-900 mb-3">Level Journey</h3>
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
