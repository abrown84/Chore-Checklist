import React, { createContext, useMemo, useState, useCallback } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import { Chore, LEVELS } from '../types/chore'
import { User, UserStats } from '../types/user'
import { calculateUserLevel, calculateEfficiencyScore } from '../utils/statsCalculations'
import { calculateStreaks } from '../utils/streakCalculations'
import { useCurrentHousehold } from '../hooks/useCurrentHousehold'

interface StatsContextType {
  getUserStats: (userId: string) => UserStats | undefined
  getAllUserStats: () => UserStats[]
  getChoreDistribution: () => Record<string, Chore[]>
  getEfficiencyLeaderboard: () => Array<UserStats & { efficiencyScore: number }>
  getMostEfficientLeader: () => (UserStats & { efficiencyScore: number } | undefined)
  updateUserPoints: (userId: string, pointsToDeduct: number) => void
  refreshStats: () => void
  getCurrentUserStats: () => UserStats | undefined
  forceRefresh: () => void
  setLevelPersistence: (userId: string, level: number, pointsAtRedemption: number, gracePeriodDays?: number) => void
  clearLevelPersistence: (userId: string) => void
  getLevelPersistence: (userId: string) => { level: number; expiresAt: number; pointsAtRedemption: number } | undefined
  persistUserStats: (userId: string, stats: UserStats) => void
}

export const StatsContext = createContext<StatsContextType | null>(null)

interface StatsProviderProps {
  children: React.ReactNode
  chores: Chore[]
  members: User[]
}

export const StatsProvider = ({ children, chores, members }: StatsProviderProps) => {
  // Convex queries and mutations
  const householdId = useCurrentHousehold()
  
  // Get point deductions from Convex for all household members
  const householdDeductions = useQuery(
    api.redemptions.getHouseholdPointDeductions,
    householdId ? { householdId } : "skip"
  )
  
  // Build point deductions map from Convex data
  const pointDeductions = useMemo(() => {
    return householdDeductions || {}
  }, [householdDeductions])
  
  // Get user stats from Convex (for each member)
  const convexStats = useQuery(
    api.stats.getHouseholdStats,
    householdId ? { householdId } : "skip"
  )
  
  // Build level persistence map from Convex stats
  const levelPersistence = useMemo(() => {
    const persistenceMap: Record<string, { level: number; expiresAt: number; pointsAtRedemption: number }> = {}
    if (convexStats) {
      convexStats.forEach(stat => {
        if (stat.levelPersistenceInfo) {
          persistenceMap[stat.userId] = stat.levelPersistenceInfo
        }
      })
    }
    return persistenceMap
  }, [convexStats])
  
  // Mutations
  const setLevelPersistenceMutation = useMutation(api.stats.setLevelPersistenceInStats)
  const clearLevelPersistenceMutation = useMutation(api.stats.clearLevelPersistenceFromStats)
  const recalculateStatsMutation = useMutation(api.stats.recalculateUserStats)
  
  // Refresh trigger for force refreshes
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  
  // Memoized chore distribution calculation
  const choreDistribution = useMemo(() => {
    const distribution: Record<string, Chore[]> = {}
    
    // Initialize arrays for all members
    members.forEach(member => {
      distribution[member.id] = []
    })
    
    // Include users who completed chores but might not be current members
    const completedByUserIds = new Set(
      chores
        .filter(chore => chore.completed && chore.completedBy)
        .map(chore => chore.completedBy!)
    )
    
    completedByUserIds.forEach(userId => {
      if (!distribution[userId]) {
        distribution[userId] = []
      }
    })
    
    // Handle single member case
    if (members.length === 1) {
      const singleMember = members[0]
      distribution[singleMember.id] = [...chores]
      return distribution
    }
    
    // Distribute chores based on completion and assignment
    chores.forEach((chore) => {
      if (chore.completed && chore.completedBy) {
        if (!distribution[chore.completedBy]) {
          distribution[chore.completedBy] = []
        }
        distribution[chore.completedBy].push(chore)
      } else if (chore.assignedTo && distribution[chore.assignedTo]) {
        distribution[chore.assignedTo].push(chore)
      } else if (members.length > 0) {
        const memberIds = members.map(m => m.id)
        const choreIndex = chores.indexOf(chore)
        const assignedMemberId = memberIds[choreIndex % memberIds.length]
        if (distribution[assignedMemberId]) {
          distribution[assignedMemberId].push(chore)
        }
      }
    })
    
    return distribution
  }, [chores, members, refreshTrigger])

  // Memoized user stats calculation
  const userStats = useMemo(() => {
    console.log('🔍 StatsContext: Calculating userStats', {
      membersCount: members.length,
      choreDistributionKeys: Object.keys(choreDistribution),
      pointDeductions: pointDeductions,
      refreshTrigger
    })
    
    // Get all user IDs (members + users who completed chores)
    const allUserIds = new Set([
      ...members.map(m => m.id),
      ...Object.keys(choreDistribution)
    ])
    
    console.log('🔍 StatsContext: All user IDs to process:', Array.from(allUserIds))
    
    return Array.from(allUserIds).map(userId => {
      // Get member info or create minimal representation
      const member = members.find(m => m.id === userId) || {
        id: userId,
        name: `User ${userId}`,
        email: '',
        role: 'member' as const,
        avatar: '👤',
        joinedAt: new Date(),
        isActive: true
      }
      
      const userChores = choreDistribution[userId] || []
      const completedChores = userChores.filter(c => c.completed)
      
      console.log(`🔍 StatsContext: Processing user ${userId} (${member.name})`, {
        totalChores: userChores.length,
        completedChores: completedChores.length,
        userChores: userChores
      })
      
      // Calculate points
      const baseEarnedPoints = completedChores.reduce((sum, c) => {
        const earnedPoints = c.finalPoints !== undefined ? c.finalPoints : c.points
        return sum + earnedPoints
      }, 0)
      
      const resetChoresPoints = userChores.reduce((sum, c) => {
        if (!c.completed && c.finalPoints !== undefined) {
          return sum + c.finalPoints
        }
        return sum
      }, 0)
      
      const totalLifetimePoints = baseEarnedPoints + resetChoresPoints
      const userDeductions = pointDeductions[userId] || 0
      const earnedPoints = Math.max(0, totalLifetimePoints - userDeductions)
      
      console.log(`🔍 StatsContext: Points calculation for ${userId}`, {
        baseEarnedPoints,
        resetChoresPoints,
        totalLifetimePoints,
        userDeductions,
        finalEarnedPoints: earnedPoints
      })
      
      // Calculate other metrics
      const totalPoints = userChores.reduce((sum, c) => sum + (c.points || 0), 0)
      const { currentStreak, longestStreak } = calculateStreaks(completedChores)
      
      // Calculate level with persistence
      const currentLevel = calculateUserLevel(earnedPoints)
      const userLevelPersistence = levelPersistence[userId]
      let finalLevel = currentLevel
      let levelPersistenceInfo: { originalLevel: number; persistedLevel: number; expiresAt: number; pointsAtRedemption: number } | undefined = undefined
      
      // For demo users, always use calculated level (no persistence interference)
      if (userId.startsWith('demo-')) {
        finalLevel = currentLevel
        console.log(`🎯 Demo User: Bypassing level persistence for ${userId}, using calculated level ${currentLevel} (${earnedPoints} points)`)
      } else if (userLevelPersistence && userLevelPersistence.expiresAt > Date.now()) {
        finalLevel = userLevelPersistence.level
        levelPersistenceInfo = {
          originalLevel: currentLevel,
          persistedLevel: userLevelPersistence.level,
          expiresAt: userLevelPersistence.expiresAt,
          pointsAtRedemption: userLevelPersistence.pointsAtRedemption
        }
        
        console.log(`Applying level persistence for user ${userId}:`, {
          currentLevel,
          persistedLevel: userLevelPersistence.level,
          earnedPoints,
          pointsAtRedemption: userLevelPersistence.pointsAtRedemption,
          expiresAt: new Date(userLevelPersistence.expiresAt).toLocaleString()
        })
      }
      
      // Calculate level progress
      const currentLevelData = LEVELS.find(level => level.level === finalLevel)
      const nextLevelData = LEVELS.find(level => level.level === finalLevel + 1)
      
      let currentLevelPoints = 0
      let pointsToNextLevel = 0
      
      if (userLevelPersistence && userLevelPersistence.expiresAt > Date.now()) {
        const originalPoints = userLevelPersistence.pointsAtRedemption
        currentLevelPoints = Math.max(0, originalPoints - (currentLevelData?.pointsRequired || 0))
        pointsToNextLevel = nextLevelData 
          ? Math.max(0, nextLevelData.pointsRequired - originalPoints)
          : 0
      } else {
        currentLevelPoints = Math.max(0, earnedPoints - (currentLevelData?.pointsRequired || 0))
        pointsToNextLevel = nextLevelData 
          ? Math.max(0, nextLevelData.pointsRequired - earnedPoints)
          : 0
      }
      
      // Create stats object
      const calculatedStats: UserStats = {
        userId: userId,
        userName: member.name,
        totalChores: userChores.length,
        completedChores: completedChores.length,
        totalPoints,
        earnedPoints,
        currentStreak,
        longestStreak,
        currentLevel: finalLevel,
        currentLevelPoints,
        pointsToNextLevel,
        lastActive: new Date(),
        levelPersistenceInfo,
        efficiencyScore: calculateEfficiencyScore(userChores, completedChores)
      }
      
      return calculatedStats
    })
  }, [members, choreDistribution, pointDeductions, levelPersistence, refreshTrigger])

  // Stats are now stored in Convex, no need to persist to localStorage
  // The stats are recalculated server-side when chores are completed

  // Memoized efficiency leaderboard
  const efficiencyLeaderboard = useMemo(() => {
    return userStats.map(stats => {
      const userChores = choreDistribution[stats.userId] || []
      const completedChores = userChores.filter(c => c.completed)
      const efficiencyScore = calculateEfficiencyScore(userChores, completedChores)
      
      return {
        ...stats,
        efficiencyScore
      }
    }).sort((a, b) => b.efficiencyScore - a.efficiencyScore)
  }, [userStats, choreDistribution])

  // Context methods
  const getUserStats = useCallback((userId: string): UserStats | undefined => {
    return userStats.find(stats => stats.userId === userId)
  }, [userStats])

  const getAllUserStats = useCallback((): UserStats[] => {
    return userStats
  }, [userStats])

  const getCurrentUserStats = useCallback((): UserStats | undefined => {
    return undefined
  }, [])

  const getChoreDistribution = useCallback((): Record<string, Chore[]> => {
    return choreDistribution
  }, [choreDistribution])

  const getEfficiencyLeaderboard = useCallback(() => {
    return efficiencyLeaderboard
  }, [efficiencyLeaderboard])

  const getMostEfficientLeader = useCallback(() => {
    return efficiencyLeaderboard[0]
  }, [efficiencyLeaderboard])

  const updateUserPoints = useCallback(async (_userId: string, _pointsToDeduct: number) => {
    // Point deductions are now handled through redemption requests in Convex
    // This method is kept for backward compatibility but doesn't directly update deductions
    // Instead, deductions are tracked through the pointDeductions table
    console.log('updateUserPoints called - deductions are now tracked in Convex')
  }, [])

  const refreshStats = useCallback(() => {
    // Stats will automatically recalculate due to memoization
    // In Convex mode, stats are recalculated server-side
    if (householdId && members.length > 0) {
      members.forEach(member => {
        recalculateStatsMutation({
          userId: member.id as Id<"users">,
          householdId,
        }).catch(err => console.error('Error recalculating stats:', err))
      })
    }
  }, [householdId, members, recalculateStatsMutation])

  const forceRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
    refreshStats()
  }, [refreshStats])

  const persistUserStats = useCallback((_userId: string, _stats: UserStats) => {
    // Stats are now stored in Convex, no need to persist manually
    // The stats are recalculated server-side when chores are completed
    console.log('persistUserStats called - stats are now stored in Convex')
  }, [])
  
  const setLevelPersistenceForUser = useCallback(async (
    userId: string, 
    level: number, 
    pointsAtRedemption: number, 
    gracePeriodDays: number = 30
  ) => {
    if (!householdId) return
    
    try {
      await setLevelPersistenceMutation({
        userId: userId as Id<"users">,
        householdId,
        level,
        pointsAtRedemption,
        gracePeriodDays,
      })
    } catch (error) {
      console.error('Error setting level persistence:', error)
    }
  }, [householdId, setLevelPersistenceMutation])
  
  const clearLevelPersistenceForUser = useCallback(async (userId: string) => {
    if (!householdId) return
    
    try {
      await clearLevelPersistenceMutation({
        userId: userId as Id<"users">,
        householdId,
      })
    } catch (error) {
      console.error('Error clearing level persistence:', error)
    }
  }, [householdId, clearLevelPersistenceMutation])

  // Memoized context value
  const contextValue = useMemo(() => ({
    getUserStats,
    getAllUserStats,
    getCurrentUserStats,
    getChoreDistribution,
    getEfficiencyLeaderboard,
    getMostEfficientLeader,
    updateUserPoints,
    refreshStats,
    forceRefresh,
    setLevelPersistence: setLevelPersistenceForUser,
    clearLevelPersistence: clearLevelPersistenceForUser,
    getLevelPersistence: (userId: string) => levelPersistence[userId],
    persistUserStats
  }), [
    getUserStats,
    getAllUserStats,
    getCurrentUserStats,
    getChoreDistribution,
    getEfficiencyLeaderboard,
    getMostEfficientLeader,
    updateUserPoints,
    refreshStats,
    forceRefresh,
    setLevelPersistenceForUser,
    clearLevelPersistenceForUser,
    levelPersistence,
    persistUserStats
  ])

  return (
    <StatsContext.Provider value={contextValue}>
      {children}
    </StatsContext.Provider>
  )
}


