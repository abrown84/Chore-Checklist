import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react'
import { Chore, LEVELS } from '../types/chore'
import { User, UserStats } from '../types/user'

// Custom hook for persistent point deductions
const usePersistentPointDeductions = () => {
  const [pointDeductions, setPointDeductions] = useState<Record<string, number>>(() => {
    // Initialize from localStorage immediately to prevent loss on refresh
    try {
      const savedDeductions = localStorage.getItem('pointDeductions')
      if (savedDeductions) {
        return JSON.parse(savedDeductions)
      }
    } catch (error) {
      console.error('Failed to load point deductions:', error)
    }
    return {}
  })

  const updateDeductions = useCallback((userId: string, pointsToDeduct: number) => {
    setPointDeductions(prev => {
      const newDeductions = {
        ...prev,
        [userId]: (prev[userId] || 0) + pointsToDeduct
      }
      // Immediately save to localStorage to ensure persistence
      localStorage.setItem('pointDeductions', JSON.stringify(newDeductions))
      return newDeductions
    })
  }, [])

  // Save point deductions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('pointDeductions', JSON.stringify(pointDeductions))
  }, [pointDeductions])

  return { pointDeductions, updateDeductions }
}

// Custom hook for level persistence after redemption
const useLevelPersistence = () => {
  const [levelPersistence, setLevelPersistence] = useState<Record<string, { level: number; expiresAt: number; pointsAtRedemption: number }>>(() => {
    try {
      const saved = localStorage.getItem('levelPersistence')
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.error('Failed to load level persistence:', error)
    }
    return {}
  })

  const setLevelPersistenceForUser = useCallback((userId: string, level: number, pointsAtRedemption: number, gracePeriodDays: number = 30) => {
    const expiresAt = Date.now() + (gracePeriodDays * 24 * 60 * 60 * 1000)
    setLevelPersistence(prev => {
      const newPersistence = {
        ...prev,
        [userId]: { level, expiresAt, pointsAtRedemption }
      }
      localStorage.setItem('levelPersistence', JSON.stringify(newPersistence))
      return newPersistence
    })

  }, [])

  const clearLevelPersistence = useCallback((userId: string) => {
    setLevelPersistence(prev => {
      const newPersistence = { ...prev }
      delete newPersistence[userId]
      localStorage.setItem('levelPersistence', JSON.stringify(newPersistence))
      return newPersistence
    })

  }, [])

  // Clean up expired level persistence
  useEffect(() => {
    const now = Date.now()
    const hasExpired = Object.entries(levelPersistence).some(([, data]) => data.expiresAt < now)

    if (hasExpired) {
      setLevelPersistence(prev => {
        const newPersistence = Object.fromEntries(
          Object.entries(prev).filter(([_userId, data]) => data.expiresAt >= now)
        )
        localStorage.setItem('levelPersistence', JSON.stringify(newPersistence))
        return newPersistence
      })
    }
  }, [levelPersistence])

  return { levelPersistence, setLevelPersistenceForUser, clearLevelPersistence }
}

interface StatsContextType {
  getUserStats: (userId: string) => UserStats | undefined
  getAllUserStats: () => UserStats[]
  getChoreDistribution: () => Record<string, Chore[]>
  getEfficiencyLeaderboard: () => Array<UserStats & { efficiencyScore: number }>
  getMostEfficientLeader: () => (UserStats & { efficiencyScore: number } | undefined)
  updateUserPoints: (userId: string, pointsToDeduct: number) => void
  refreshStats: () => void
  // New method to get current user stats efficiently
  getCurrentUserStats: () => UserStats | undefined
  // Force refresh mechanism for external triggers
  forceRefresh: () => void
  // Level persistence management
  setLevelPersistence: (userId: string, level: number, pointsAtRedemption: number, gracePeriodDays?: number) => void
  clearLevelPersistence: (userId: string) => void
  getLevelPersistence: (userId: string) => { level: number; expiresAt: number; pointsAtRedemption: number } | undefined
}

const StatsContext = createContext<StatsContextType | null>(null)

interface StatsProviderProps {
  children: React.ReactNode
  chores: Chore[]
  members: User[]
}

export const StatsProvider = ({ children, chores, members }: StatsProviderProps) => {
  // Use the persistent point deductions hook
  const { pointDeductions, updateDeductions } = usePersistentPointDeductions()
  
  // Use the level persistence hook
  const { levelPersistence, setLevelPersistenceForUser, clearLevelPersistence } = useLevelPersistence()
  
  // Efficient chore distribution calculation with memoization
  const choreDistribution = useMemo(() => {
    const distribution: Record<string, Chore[]> = {}
    
    // Initialize empty arrays for each member
    members.forEach(member => {
      distribution[member.id] = []
    })
    
    // Distribute chores based on who actually completed them or who they're assigned to
    chores.forEach((chore) => {
      if (chore.completed && chore.completedBy) {
        // If chore is completed, assign it to whoever completed it
        if (distribution[chore.completedBy]) {
          distribution[chore.completedBy].push(chore)
        }
      } else if (chore.assignedTo && distribution[chore.assignedTo]) {
        // If chore is explicitly assigned but not completed, assign it to the assigned person
        distribution[chore.assignedTo].push(chore)
      }
      // For unassigned, uncompleted chores, don't assign them to anyone
    })
    
    return distribution
  }, [chores, members])

  // Unified level calculation function
  const calculateUserLevel = useCallback((earnedPoints: number): number => {
    let currentLevel = 1
    
    // Iterate through levels in descending order to find the highest level user qualifies for
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (earnedPoints >= LEVELS[i].pointsRequired) {
        currentLevel = LEVELS[i].level
        break
      }
    }
    
    return currentLevel
  }, [])

  // Calculate lifetime efficiency score for a user based on all-time performance
  const calculateEfficiencyScore = useCallback((userChores: Chore[], completedChores: Chore[]) => {
    if (userChores.length === 0) return 0

    // 1. Lifetime Completion Rate (30% weight) - Most important factor
    const completionRate = completedChores.length / userChores.length
    
    // 2. Lifetime Timeliness Score (25% weight) - Rewards consistent early completion over time
    let timelinessScore = 0
    let totalTimeliness = 0
    let validTimelinessChores = 0
    
    completedChores.forEach(chore => {
      if (chore.completedAt && chore.dueDate) {
        const completedDate = new Date(chore.completedAt)
        const dueDate = new Date(chore.dueDate)
        const timeDiff = dueDate.getTime() - completedDate.getTime()
        const daysDiff = timeDiff / (1000 * 60 * 60 * 24)
        
        // Reward early completion, penalize late completion
        if (daysDiff > 0) {
          // Completed early - reward up to +1
          totalTimeliness += Math.min(1, daysDiff / 7) // Cap at 1 week early
        } else if (daysDiff < 0) {
          // Completed late - penalize up to -1
          totalTimeliness += Math.max(-1, daysDiff / 7) // Cap at 1 week late
        }
        validTimelinessChores++
      }
    })
    
    timelinessScore = validTimelinessChores > 0 ? totalTimeliness / validTimelinessChores : 0
    
    // 3. Difficulty Balance (20% weight) - Rewards tackling harder chores
    const difficultyDistribution = completedChores.reduce((acc, chore) => {
      const difficulty = chore.difficulty || 'medium'
      acc[difficulty] = (acc[difficulty] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const totalCompleted = completedChores.length
    const difficultyBalance = totalCompleted > 0 ? (
      ((difficultyDistribution.hard || 0) * 1.5 + 
       (difficultyDistribution.medium || 0) * 1.0 + 
       (difficultyDistribution.easy || 0) * 0.5) / totalCompleted
    ) : 0
    
    // 4. Streak Consistency (15% weight) - Rewards maintaining streaks
    const completedChoresWithDates = completedChores
      .filter(chore => chore.completedAt)
      .map(chore => new Date(chore.completedAt!).setHours(0, 0, 0, 0))
      .sort((a, b) => b - a)
    
    let longestStreak = 0
    if (completedChoresWithDates.length > 0) {
      let tempStreak = 1
      for (let i = 1; i < completedChoresWithDates.length; i++) {
        const daysDiff = (completedChoresWithDates[i-1] - completedChoresWithDates[i]) / (24 * 60 * 60 * 1000)
        if (daysDiff === 1) {
          tempStreak++
        } else {
          longestStreak = Math.max(longestStreak, tempStreak)
          tempStreak = 1
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak)
    }
    
    const streakConsistency = totalCompleted > 0 ? Math.min(1, longestStreak / totalCompleted) : 0
    
    // 5. Points Efficiency (10% weight) - Rewards earning more points from available chores
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
    const totalPotentialPoints = userChores.reduce((sum, c) => sum + (c.points || 0), 0)
    const pointsEfficiency = totalPotentialPoints > 0 ? totalLifetimePoints / totalPotentialPoints : 0
    
    // Calculate weighted lifetime efficiency score (0-100 scale)
    const efficiencyScore = (
      completionRate * 30 +
      (timelinessScore + 1) * 12.5 + // Normalize timeliness to 0-2 range, then scale
      difficultyBalance * 20 +
      streakConsistency * 15 +
      pointsEfficiency * 10
    )
    
    return Math.round(efficiencyScore * 100) / 100
  }, [])

  // Efficient user stats calculation with memoization - SINGLE SOURCE OF TRUTH
  const userStats = useMemo(() => {
    
    return members.map(member => {
      const userChores = choreDistribution[member.id] || []
      const completedChores = userChores.filter(c => c.completed)
      
      // Calculate total points from completed chores
      // Use finalPoints if available (includes bonuses/penalties), otherwise fall back to base points
      const baseEarnedPoints = completedChores.reduce((sum, c) => {
        // For completed chores, use finalPoints if available, otherwise use base points
        // This ensures we capture all bonuses/penalties that were earned
        const earnedPoints = c.finalPoints !== undefined ? c.finalPoints : c.points
        return sum + earnedPoints
      }, 0)
      
      // Also count points from chores that were completed but reset (preserved in finalPoints)
      const resetChoresPoints = userChores.reduce((sum, c) => {
        // If chore has finalPoints but is not currently completed, it was reset
        // These points should still count toward lifetime total
        if (!c.completed && c.finalPoints !== undefined) {
          return sum + c.finalPoints
        }
        return sum
      }, 0)
      
      // Total lifetime points = completed chore points + reset chore points
      const totalLifetimePoints = baseEarnedPoints + resetChoresPoints
      
      // Subtract any redeemed points from our state
      const userDeductions = pointDeductions[member.id] || 0
      const earnedPoints = Math.max(0, totalLifetimePoints - userDeductions)
      

      
      // Calculate total potential points from all assigned chores
      const totalPoints = userChores.reduce((sum, c) => sum + (c.points || 0), 0)
      
      // Calculate streak efficiently
      const completedChoresWithDates = completedChores
        .filter(chore => chore.completedAt)
        .map(chore => new Date(chore.completedAt!).setHours(0, 0, 0, 0))
        .sort((a, b) => b - a)
      
      let currentStreak = 0
      let longestStreak = 0
      
      if (completedChoresWithDates.length > 0) {
        const today = new Date().setHours(0, 0, 0, 0)
        
        // Calculate current streak
        if (completedChoresWithDates[0] === today) {
          let streak = 1
          for (let i = 1; i < completedChoresWithDates.length; i++) {
            const expectedDate = today - (i * 24 * 60 * 60 * 1000)
            if (completedChoresWithDates[i] === expectedDate) {
              streak++
            } else {
              break
            }
          }
          currentStreak = streak
        }
        
        // Calculate longest streak
        let tempStreak = 1
        for (let i = 1; i < completedChoresWithDates.length; i++) {
          const daysDiff = (completedChoresWithDates[i-1] - completedChoresWithDates[i]) / (24 * 60 * 60 * 1000)
          if (daysDiff === 1) {
            tempStreak++
          } else {
            longestStreak = Math.max(longestStreak, tempStreak)
            tempStreak = 1
          }
        }
        longestStreak = Math.max(longestStreak, tempStreak)
      }
      
      // Calculate level using unified function
      const currentLevel = calculateUserLevel(earnedPoints)
      
      // Check if user has level persistence (recently redeemed points)
      const userLevelPersistence = levelPersistence[member.id]
      let finalLevel = currentLevel
      let levelPersistenceInfo: { originalLevel: number; persistedLevel: number; expiresAt: number; pointsAtRedemption: number } | undefined = undefined
      
      if (userLevelPersistence && userLevelPersistence.expiresAt > Date.now()) {
        // User has active level persistence - use the persisted level
        finalLevel = userLevelPersistence.level
        levelPersistenceInfo = {
          originalLevel: currentLevel,
          persistedLevel: userLevelPersistence.level,
          expiresAt: userLevelPersistence.expiresAt,
          pointsAtRedemption: userLevelPersistence.pointsAtRedemption
        }

      }
      

      
      const currentLevelData = LEVELS.find(level => level.level === finalLevel)
      const nextLevelData = LEVELS.find(level => level.level === finalLevel + 1)
      
      // Fix: Ensure currentLevelPoints is always positive and represents points earned in current level
      const currentLevelPoints = Math.max(0, earnedPoints - (currentLevelData?.pointsRequired || 0))
      
      // Fix: Ensure pointsToNextLevel is always positive and represents points needed for next level
      const pointsToNextLevel = nextLevelData 
        ? Math.max(0, nextLevelData.pointsRequired - earnedPoints)
        : 0
      
      return {
        userId: member.id,
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
        levelPersistenceInfo
      }
    })
  }, [members, choreDistribution, pointDeductions, calculateUserLevel, levelPersistence])

  // Calculate efficiency leaderboard
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
  }, [userStats, choreDistribution, calculateEfficiencyScore])

  const getUserStats = useCallback((userId: string): UserStats | undefined => {
    return userStats.find(stats => stats.userId === userId)
  }, [userStats])

  const getAllUserStats = useCallback((): UserStats[] => {
    return userStats
  }, [userStats])

  const getCurrentUserStats = useCallback((): UserStats | undefined => {
    // This will be used by components that need current user stats
    // The actual current user ID will be passed from the component level
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

  const updateUserPoints = useCallback((userId: string, pointsToDeduct: number) => {
    updateDeductions(userId, pointsToDeduct)
  }, [updateDeductions])

  const refreshStats = useCallback(() => {
    // Force recalculation by updating a dependency
    // Since we're using memoization, this will trigger recalculation
    // But don't interfere with point deductions - they should persist
    // setPointDeductions(prev => ({ ...prev })) // This line is removed as per the new_code
  }, [])

  // Add a force refresh mechanism that can be triggered externally
  const forceRefresh = useCallback(() => {
    // Force recalculation by updating dependencies
    // But preserve point deductions
    // setPointDeductions(prev => ({ ...prev })) // This line is removed as per the new_code
  }, [])

  // Memoize the context value to prevent unnecessary re-renders
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
    clearLevelPersistence,
    getLevelPersistence: (userId: string) => levelPersistence[userId]
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
    clearLevelPersistence,
    levelPersistence
  ])

  return (
    <StatsContext.Provider value={contextValue}>
      {children}
    </StatsContext.Provider>
  )
}

// Export the hook with a consistent name for Fast Refresh compatibility
export const useStats = () => {
  const context = useContext(StatsContext)
  if (!context) {
    throw new Error('useStats must be used within a StatsProvider')
  }
  return context
}
