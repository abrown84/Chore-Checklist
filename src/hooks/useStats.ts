import { useContext } from 'react'
import { useDemo } from '../contexts/DemoContext'
import { StatsContext } from '../contexts/StatsContext'
import { UserStats } from '../types/user'

export const useStats = () => {
  const { isDemoMode, getDemoStats } = useDemo()
  const statsContext = useContext(StatsContext)
  
  // In demo mode, use demo stats
  if (isDemoMode) {
    const demoStats = getDemoStats()
    
    return {
      getUserStats: (userId: string): UserStats | undefined => {
        return demoStats.find(stats => stats.userId === userId)
      },
      getAllUserStats: (): UserStats[] => {
        return demoStats
      },
      getCurrentUserStats: (): UserStats | undefined => {
        // Return the first demo user as current user for demo mode
        return demoStats[0]
      },
      getChoreDistribution: () => {
        // Return empty distribution for demo mode since we handle it differently
        return {}
      },
      getEfficiencyLeaderboard: () => {
        return demoStats.map(stats => ({
          ...stats,
          efficiencyScore: stats.efficiencyScore || 0
        })).sort((a, b) => b.efficiencyScore - a.efficiencyScore)
      },
      getMostEfficientLeader: () => {
        const leaderboard = demoStats.map(stats => ({
          ...stats,
          efficiencyScore: stats.efficiencyScore || 0
        })).sort((a, b) => b.efficiencyScore - a.efficiencyScore)
        return leaderboard[0]
      },
      updateUserPoints: () => {
        // No-op in demo mode
      },
      refreshStats: () => {
        // No-op in demo mode
      },
      forceRefresh: () => {
        // No-op in demo mode
      },
      setLevelPersistence: () => {
        // No-op in demo mode
      },
      clearLevelPersistence: () => {
        // No-op in demo mode
      },
      getLevelPersistence: () => {
        // No-op in demo mode
        return undefined
      },
      persistUserStats: () => {
        // No-op in demo mode
      }
    }
  }
  
  // In regular mode, use the main stats context
  if (!statsContext) {
    throw new Error('useStats must be used within a StatsProvider')
  }
  
  return statsContext
}
