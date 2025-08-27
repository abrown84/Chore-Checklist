import React from 'react'
import { Star, Lock, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { LEVELS } from '../../types/chore'

interface RewardsProgressProps {
  currentLevel: number
  currentPoints: number
  getUserStats: (userId: string) => any
  currentUser: any
}

export const RewardsProgress: React.FC<RewardsProgressProps> = ({
  currentLevel,
  currentPoints
}) => {

  const getRewardsForLevel = (level: number) => {
    const rewards: string[] = []
    
    if (level >= 1) rewards.push('Default Avatar', 'Default Theme', 'Default Border', 'Default Background')
    if (level >= 2) rewards.push('Professional Avatar', 'Green Theme', 'Simple Border', 'Subtle Pattern', 'Serif Font')
    if (level >= 3) rewards.push('Bot Style Avatar', 'Blue Theme', 'Custom Avatar Upload', 'Fade In Animation', 'Shadow Effect')
    if (level >= 4) rewards.push('Geometric Avatar', 'Purple-Pink Theme', 'Rounded Border', 'Geometric Pattern', 'Monospace Font')
    if (level >= 5) rewards.push('Persona Avatar', 'Yellow-Orange Theme', 'Slide In Animation', 'Glow Effect')
    if (level >= 6) rewards.push('Lorelei Avatar', 'Red-Pink Theme', 'Gradient Border', 'Gradient Background', 'Display Font')
    if (level >= 7) rewards.push('Micah Avatar', 'Indigo-Purple Theme', 'Bounce Animation')
    if (level >= 8) rewards.push('Mini Avatar', 'Pink-Rose Theme', 'Animated Border', 'Animated Background', 'Handwriting Font')
    if (level >= 9) rewards.push('Shapes Avatar', 'Emerald-Teal Theme', 'Pulse Animation', '3D Effect')
    if (level >= 10) rewards.push('Thumbs Avatar', 'Amber-Yellow Theme')
    
    return rewards
  }

  const getNextLevelRewards = () => {
    const nextLevel = currentLevel + 1
    if (nextLevel > 10) return null
    
    const nextLevelData = LEVELS.find(level => level.level === nextLevel)
    if (!nextLevelData) return null
    
    const pointsToNext = nextLevelData.pointsRequired - currentPoints
    const rewards = getRewardsForLevel(nextLevel).filter(reward => 
      !getRewardsForLevel(currentLevel).includes(reward)
    )
    
    return { level: nextLevel, pointsToNext, rewards, totalPoints: nextLevelData.pointsRequired }
  }

  const nextLevelInfo = getNextLevelRewards()

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Star className="w-5 h-5" />
          <span>Rewards Progress</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Level Rewards */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            ✅ Unlocked Rewards (Level {currentLevel})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {getRewardsForLevel(currentLevel).map((reward, index) => (
              <div key={index} className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-800">{reward}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Next Level Progress */}
        {nextLevelInfo && nextLevelInfo.rewards.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              🔒 Next Level Rewards (Level {nextLevelInfo.level})
            </h4>
            <div className="mb-3">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progress to Level {nextLevelInfo.level}</span>
                <span>{currentPoints} / {nextLevelInfo.totalPoints} points</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentPoints / nextLevelInfo.totalPoints) * 100}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {nextLevelInfo.pointsToNext} more points needed
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {nextLevelInfo.rewards.map((reward: string, index: number) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                  <Lock className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-600">{reward}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Levels Overview */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            📊 All Levels Overview
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {LEVELS.map((level) => {
              const isUnlocked = currentLevel >= level.level
              const isCurrent = currentLevel === level.level
              const rewards = getRewardsForLevel(level.level).filter(reward => 
                !getRewardsForLevel(level.level - 1).includes(reward)
              )
              
              return (
                <div
                  key={level.level}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    isCurrent
                      ? 'border-blue-500 bg-blue-50'
                      : isUnlocked
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {isUnlocked ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Lock className="w-4 h-4 text-gray-400" />
                      )}
                      <span className={`font-medium ${
                        isCurrent ? 'text-blue-700' : isUnlocked ? 'text-green-700' : 'text-gray-500'
                      }`}>
                        Level {level.level}
                      </span>
                    </div>
                    <span className={`text-xs ${
                      isCurrent ? 'text-blue-600' : isUnlocked ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {level.pointsRequired} pts
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mb-2">
                    {level.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {rewards.length} new rewards
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}



