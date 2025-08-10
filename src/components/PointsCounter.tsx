
import { useStats } from '../contexts/StatsContext'
import { useUsers } from '../contexts/UserContext'
import { LEVELS } from '../types/chore'
import { Star, Crown, Target } from 'lucide-react'
import { useEffect } from 'react'

export const PointsCounter: React.FC = () => {
  const { getAllUserStats, refreshStats } = useStats()
  const { state: userState } = useUsers()
  
  // Get current user's stats from StatsContext
  const memberStats = getAllUserStats()
  const currentUser = userState.currentUser
  const currentUserStats = memberStats.find(s => s.userId === currentUser?.id)
  
  // Refresh stats when component mounts
  useEffect(() => {
    refreshStats()
  }, [refreshStats])
  
  // Debug logging
  console.log('PointsCounter - memberStats:', memberStats)
  console.log('PointsCounter - currentUser:', currentUser)
  console.log('PointsCounter - currentUserStats:', currentUserStats)
  console.log('PointsCounter - localStorage pointDeductions:', localStorage.getItem('pointDeductions'))
  
  // Use stats from StatsContext which accounts for redeemed points
  const stats = currentUserStats || {
    currentLevel: 1,
    earnedPoints: 0,
    currentLevelPoints: 0,
    pointsToNextLevel: 100
  }

  const currentLevelData = LEVELS.find(level => level.level === stats.currentLevel)
  const nextLevelData = LEVELS.find(level => level.level === stats.currentLevel + 1)
  const progressToNextLevel = nextLevelData 
    ? (stats.currentLevelPoints / (nextLevelData.pointsRequired - (currentLevelData?.pointsRequired || 0))) * 100
    : 100

  const getLevelIcon = (level: number) => {
    if (level >= 10) return <Crown className="w-5 h-5 text-amber-600" />
    if (level >= 8) return <Crown className="w-5 h-5 text-pink-600" />
    if (level >= 6) return <Crown className="w-5 h-5 text-red-600" />
    if (level >= 4) return <Star className="w-5 h-5 text-purple-600" />
    return <Target className="w-5 h-5 text-blue-600" />
  }

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Level Display */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {getLevelIcon(stats.currentLevel)}
            <div>
              <div className="text-sm text-gray-600">Level</div>
              <div className="text-2xl font-bold text-gray-900">{stats.currentLevel}</div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">{currentLevelData?.name}</div>
            <div className="text-xs text-gray-500">{currentLevelData?.icon}</div>
          </div>
        </div>

        {/* Points Display */}
        <div className="text-center">
          <div className="text-sm text-gray-600">Total Points</div>
          <div className="text-2xl font-bold text-indigo-600">{stats.earnedPoints}</div>
        </div>

        {/* Progress to Next Level */}
        {nextLevelData && (
          <div className="text-center min-w-[120px]">
            <div className="text-sm text-gray-600">Next Level</div>
            <div className="text-lg font-semibold text-purple-600">Lv {nextLevelData.level}</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progressToNextLevel, 100)}%` }}
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
