import React, { createContext, useMemo, useState, useCallback } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import { Chore, LEVELS } from '../types/chore'
import { User, UserStats } from '../types/user'
import { calculateUserLevel, calculateEfficiencyScore } from '../utils/statsCalculations'
import { calculateStreaks } from '../utils/streakCalculations'
import { useCurrentHousehold } from '../hooks/useCurrentHousehold'
import { getCurrentSeason, getSeasonId } from '../utils/seasons'
import { useAuth } from '../hooks/useAuth'

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
  const { user: currentUser } = useAuth()
  
  // Query redemption requests directly from Convex (no need for RedemptionProvider)
  const convexRedemptionRequests = useQuery(
    api.redemptions.getHouseholdRedemptionRequests,
    householdId ? { householdId } : "skip"
  )
  
  // Calculate redeemed points from approved redemption requests (no deductions system)
  const redeemedPointsByUser = useMemo(() => {
    if (!convexRedemptionRequests) return {}
    
    const redeemed: Record<string, number> = {}
    convexRedemptionRequests
      .filter(req => req.status === 'approved')
      .forEach(req => {
        // Convert userId to string for consistent key lookup
        const userId = typeof req.userId === 'string' ? req.userId : String(req.userId)
        if (!redeemed[userId]) {
          redeemed[userId] = 0
        }
        redeemed[userId] += req.pointsRequested || 0
      })
    return redeemed
  }, [convexRedemptionRequests])
  
  // Get user stats from Convex (for each member)
  const convexStats = useQuery(
    api.stats.getHouseholdStats,
    householdId ? { householdId } : "skip"
  )
  
  // Build level persistence map from Convex stats
  const levelPersistence = useMemo(() => {
    const persistenceMap: Record<string, { level: number; expiresAt: number; pointsAtRedemption: number }> = {}
    if (convexStats && Array.isArray(convexStats)) {
      convexStats.forEach(stat => {
        if (stat.levelPersistenceInfo && stat.userId) {
          const userIdStr = typeof stat.userId === 'string' ? stat.userId : String(stat.userId)
          persistenceMap[userIdStr] = stat.levelPersistenceInfo
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
    // Get all user IDs (members + users who completed chores + current user + convex stats)
    const allUserIds = new Set([
      ...members.map(m => m.id),
      ...Object.keys(choreDistribution)
    ])
    
    // Add user IDs from Convex stats (convexStats is an array, can be empty but not null when loaded)
    if (convexStats && Array.isArray(convexStats)) {
      convexStats.forEach(stat => {
        if (stat.userId) {
          // Convert Convex Id to string for comparison
          const userIdStr = typeof stat.userId === 'string' ? stat.userId : String(stat.userId)
          allUserIds.add(userIdStr)
        }
      })
    }
    
    // Always include current user even if they're not in members or have no chores
    if (currentUser?.id) {
      allUserIds.add(currentUser.id)
    }
    
    // Create a map of Convex stats by userId for quick lookup
    const convexStatsMap = new Map<string, NonNullable<typeof convexStats>[0]>()
    if (convexStats && Array.isArray(convexStats) && convexStats.length > 0) {
      convexStats.forEach(stat => {
        if (stat.userId) {
          // Convert Convex Id to string for consistent key lookup
          const userIdStr = typeof stat.userId === 'string' ? stat.userId : String(stat.userId)
          convexStatsMap.set(userIdStr, stat)
        }
      })
    }
    
    const stats = Array.from(allUserIds).map(userId => {
      // Get member info or create minimal representation
      // First try members list, then try current user from auth, then create minimal
      let member = members.find(m => m.id === userId)
      
      if (!member && currentUser?.id === userId) {
        // Use current user info if available
        member = {
          id: currentUser.id,
          name: currentUser.name || `User ${userId}`,
          email: currentUser.email || '',
          role: currentUser.role || 'member' as const,
          avatar: currentUser.avatar || '👤',
          joinedAt: currentUser.joinedAt || new Date(),
          isActive: true
        }
      }
      
      if (!member) {
        // Create minimal representation as fallback
        member = {
          id: userId,
          name: `User ${userId}`,
          email: '',
          role: 'member' as const,
          avatar: '👤',
          joinedAt: new Date(),
          isActive: true
        }
      }
      
      const userChores = choreDistribution[userId] || []
      const completedChores = userChores.filter(c => c.completed)
      
      // Try to use Convex stats first (source of truth), fall back to local calculation
      // Ensure userId is a string for map lookup
      const userIdStr = typeof userId === 'string' ? userId : String(userId)
      const convexStat = convexStatsMap.get(userIdStr)
      
      // Debug logging (remove after fixing)
      if (currentUser?.id === userId) {
        import.meta.env.DEV && console.log('🔍 Stats Debug:', {
          userId,
          userIdStr,
          hasConvexStat: !!convexStat,
          convexStatsCount: convexStats?.length ?? 0,
          convexStatsMapSize: convexStatsMap.size,
          convexStatsUserIds: convexStats?.map(s => String(s.userId)) ?? [],
          membersCount: members.length,
          userChoresCount: userChores.length,
          completedChoresCount: completedChores.length
        })
      }
      
      let earnedPoints: number
      let lifetimePoints: number
      let currentLevel: number
      let currentLevelPoints: number
      let pointsToNextLevel: number
      let totalChores: number
      let completedChoresCount: number
      let totalPoints: number
      let currentStreak: number
      let longestStreak: number
      let efficiencyScore: number
      let seasonalPoints: number
      let seasonalLevel: number
      let currentSeasonId: string
      let lastActive: Date
      
      if (convexStat) {
        // Use Convex stats as primary source
        earnedPoints = convexStat.earnedPoints ?? 0
        lifetimePoints = convexStat.lifetimePoints ?? 0
        currentLevel = convexStat.currentLevel ?? 1
        
        // Debug logging - show what we're getting from Convex
        if (currentUser?.id === userId) {
          const calculatedRedeemedPoints = lifetimePoints - earnedPoints
          import.meta.env.DEV && console.log('🔍 Convex Stats for Current User:', {
            userId,
            'Raw earnedPoints from Convex': convexStat.earnedPoints,
            'Raw lifetimePoints from Convex': convexStat.lifetimePoints,
            'Calculated earnedPoints': earnedPoints,
            'Calculated lifetimePoints': lifetimePoints,
            'Calculated pointsRedeemed (lifetime - earned)': calculatedRedeemedPoints,
            'Stats updatedAt': convexStat.updatedAt ? new Date(convexStat.updatedAt).toISOString() : 'unknown',
            'Note': 'earnedPoints should equal lifetimePoints minus any redeemed points'
          })
          
          // Verify the calculation makes sense
          if (earnedPoints < 0) {
            console.error('❌ ERROR: earnedPoints is negative!', { earnedPoints, lifetimePoints })
          }
          if (earnedPoints > lifetimePoints) {
            console.error('❌ ERROR: earnedPoints exceeds lifetimePoints!', { earnedPoints, lifetimePoints })
          }
        }
        currentLevelPoints = convexStat.currentLevelPoints ?? 0
        pointsToNextLevel = convexStat.pointsToNextLevel ?? 0
        totalChores = convexStat.totalChores ?? userChores.length
        completedChoresCount = convexStat.completedChores ?? completedChores.length
        totalPoints = convexStat.totalPoints ?? 0
        currentStreak = convexStat.currentStreak ?? 0
        longestStreak = convexStat.longestStreak ?? 0
        efficiencyScore = convexStat.efficiencyScore ?? 0
        seasonalPoints = convexStat.seasonalPoints ?? 0
        seasonalLevel = convexStat.seasonalLevel ?? 1
        currentSeasonId = convexStat.currentSeason ?? getSeasonId(getCurrentSeason())
        lastActive = convexStat.lastActive ? new Date(convexStat.lastActive) : new Date()
      } else {
        // Fall back to local calculation if Convex stats not available
        // Calculate lifetime points (all points ever earned)
        // Includes: completed chores + incomplete chores with finalPoints (from resets)
        lifetimePoints = userChores.reduce((sum, c) => {
          const points = c.finalPoints !== undefined ? c.finalPoints : c.points || 0
          
          // Count points from completed chores
          if (c.completed && c.completedBy === userId) {
            return sum + points
          }
          
          // Count points from incomplete chores that have finalPoints (chores that were reset)
          if (!c.completed && c.finalPoints !== undefined) {
            return sum + points
          }
          
          return sum
        }, 0)
        
        // Earned points = lifetime points minus redeemed points
        // Redemptions subtract from available balance, but lifetime points stay the same
        // Use userIdStr for consistent lookup
        const redeemedPoints = redeemedPointsByUser[userIdStr] || redeemedPointsByUser[userId] || 0
        earnedPoints = Math.max(0, lifetimePoints - redeemedPoints)
        
        // Debug logging for current user
        if (currentUser?.id === userId) {
          import.meta.env.DEV && console.log('⚠️ Using local calculation (no Convex stats):', {
            lifetimePoints,
            redeemedPoints,
            earnedPoints,
            completedChoresCount: completedChores.length
          })
        }
        
        // Calculate other metrics
        totalPoints = userChores.reduce((sum, c) => sum + (c.points || 0), 0)
        const streakData = calculateStreaks(completedChores)
        currentStreak = streakData.currentStreak
        longestStreak = streakData.longestStreak
        
        // Calculate level based on lifetime points
        currentLevel = calculateUserLevel(lifetimePoints)
        
        totalChores = userChores.length
        completedChoresCount = completedChores.length
        efficiencyScore = calculateEfficiencyScore(userChores, completedChores)
        
        // Calculate seasonal stats
        const currentSeason = getCurrentSeason()
        currentSeasonId = getSeasonId(currentSeason)
        const seasonStartTime = currentSeason.startDate.getTime()
        const seasonEndTime = currentSeason.endDate.getTime()
        
        // Calculate seasonal points (points from chores completed in current season)
        seasonalPoints = completedChores.reduce((sum, chore) => {
          if (chore.completedAt) {
            const completedTime = new Date(chore.completedAt).getTime()
            if (completedTime >= seasonStartTime && completedTime <= seasonEndTime) {
              const points = chore.finalPoints !== undefined ? chore.finalPoints : chore.points
              return sum + points
            }
          }
          return sum
        }, 0)
        
        // Calculate seasonal level based on seasonal points
        seasonalLevel = calculateUserLevel(seasonalPoints)
        
        // Calculate level progress
        const currentLevelData = LEVELS.find(level => level.level === currentLevel)
        const nextLevelData = LEVELS.find(level => level.level === currentLevel + 1)
        
        currentLevelPoints = Math.max(0, lifetimePoints - (currentLevelData?.pointsRequired || 0))
        pointsToNextLevel = nextLevelData 
          ? Math.max(0, nextLevelData.pointsRequired - lifetimePoints)
          : 0
        
        lastActive = new Date()
      }
      
      // Level is based on lifetimePoints, which never decreases
      // So redemptions don't affect level - no need for level persistence
      const finalLevel = currentLevel
      
      // Create stats object
      const calculatedStats: UserStats = {
        userId: userId,
        userName: member.name,
        totalChores,
        completedChores: completedChoresCount,
        totalPoints,
        lifetimePoints, // Total points ever earned
        earnedPoints, // Current usable points (from Convex or calculated)
        currentStreak,
        longestStreak,
        currentLevel: finalLevel, // Level based on lifetime points (immune to redemptions)
        currentLevelPoints,
        pointsToNextLevel,
        lastActive,
        seasonalPoints, // Points earned in current season
        seasonalLevel, // Level based on seasonal points
        currentSeason: currentSeasonId, // Current season identifier
        levelPersistenceInfo: undefined, // Not needed - levels are based on lifetimePoints which never decrease
        efficiencyScore
      }
      
      return calculatedStats
    })
    
    return stats
  }, [members, choreDistribution, redeemedPointsByUser, levelPersistence, refreshTrigger, currentUser?.id, convexStats])

  // Stats are now stored in Convex, no need to persist to localStorage
  // The stats are recalculated server-side when chores are completed

  // Memoized efficiency leaderboard
  // Note: efficiencyScore is already calculated in userStats from Convex or local calculation
  // We only need to ensure it exists and sort by it
  const efficiencyLeaderboard = useMemo(() => {
    return userStats.map(stats => {
      // Use efficiencyScore from stats (already calculated from Convex or locally)
      // Only recalculate if it's missing (shouldn't happen, but safety fallback)
      let efficiencyScore = stats.efficiencyScore
      if (efficiencyScore === undefined) {
        const userChores = choreDistribution[stats.userId] || []
        const completedChores = userChores.filter(c => c.completed)
        efficiencyScore = calculateEfficiencyScore(userChores, completedChores)
      }
      
      return {
        ...stats,
        efficiencyScore: efficiencyScore || 0
      }
    }).sort((a, b) => (b.efficiencyScore || 0) - (a.efficiencyScore || 0))
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
    import.meta.env.DEV && console.log('updateUserPoints called - deductions are now tracked in Convex')
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
    import.meta.env.DEV && console.log('persistUserStats called - stats are now stored in Convex')
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


