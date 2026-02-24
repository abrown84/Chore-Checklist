import { useContext, useMemo } from 'react'
import { useDemo } from '../contexts/DemoContext'
import { useChores } from '../contexts/ChoreContext'
import { StatsContext } from '../contexts/StatsContext'
import { UserStats } from '../types/user'
import { LEVELS } from '../types/chore'

// Calculate demo stats from actual chores (so they update when chores are completed)
const calculateDemoStatsFromChores = (chores: any[], demoUsers: any[]): UserStats[] => {
  return demoUsers.map(user => {
    // Get chores assigned to or completed by this user
    const userChores = chores.filter(chore =>
      chore.assignedTo === user.id || chore.completedBy === user.id
    )
    const completedChores = userChores.filter(chore => chore.completed)

    // Calculate points using finalPoints if available
    const earnedPoints = completedChores.reduce((sum, chore) => {
      const pointsToAdd = chore.finalPoints !== undefined ? chore.finalPoints : chore.points
      return sum + pointsToAdd
    }, 0)

    // Calculate level based on points
    let currentLevel = 1
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (earnedPoints >= LEVELS[i].pointsRequired) {
        currentLevel = LEVELS[i].level
        break
      }
    }

    // Calculate level progress
    const currentLevelData = LEVELS.find(level => level.level === currentLevel)
    const nextLevelData = LEVELS.find(level => level.level === currentLevel + 1)

    const currentLevelPoints = Math.max(0, earnedPoints - (currentLevelData?.pointsRequired || 0))
    const pointsToNextLevel = nextLevelData
      ? Math.max(0, nextLevelData.pointsRequired - earnedPoints)
      : 0

    return {
      userId: user.id,
      userName: user.name,
      totalChores: userChores.length,
      completedChores: completedChores.length,
      totalPoints: userChores.reduce((sum, c) => sum + (c.finalPoints || c.points), 0),
      lifetimePoints: earnedPoints,
      earnedPoints,
      currentStreak: 0,
      longestStreak: 0,
      currentLevel,
      currentLevelPoints,
      pointsToNextLevel,
      lastActive: new Date(),
      efficiencyScore: userChores.length > 0 ? (completedChores.length / userChores.length) * 100 : 0
    }
  })
}

export const useStats = () => {
  const { isDemoMode, getDemoUsers } = useDemo()
  const statsContext = useContext(StatsContext)

  // Get chores from ChoreContext - this updates when chores are completed
  // We need to call this unconditionally to follow React hooks rules
  const { state: choreState } = useChores()
  const chores = choreState.chores

  // Calculate demo stats from actual chores using useMemo for efficiency
  const demoStats = useMemo(() => {
    if (!isDemoMode) return []
    const demoUsers = getDemoUsers()
    return calculateDemoStatsFromChores(chores, demoUsers)
  }, [isDemoMode, chores, getDemoUsers])

  // In demo mode, use calculated stats from actual chores
  if (isDemoMode) {
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
