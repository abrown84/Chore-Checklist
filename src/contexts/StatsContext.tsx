import React, { createContext, useContext, useMemo, useState } from 'react'
import { Chore } from '../types/chore'
import { User, UserStats } from '../types/user'

interface StatsContextType {
  getUserStats: (userId: string) => UserStats | undefined
  getAllUserStats: () => UserStats[]
  getChoreDistribution: () => Record<string, Chore[]>
  getEfficiencyLeaderboard: () => Array<UserStats & { efficiencyScore: number }>
  getMostEfficientLeader: () => (UserStats & { efficiencyScore: number }) | undefined
  updateUserPoints: (userId: string, pointsToDeduct: number) => void
  refreshStats: () => void
}

const StatsContext = createContext<StatsContextType | null>(null)

interface StatsProviderProps {
  children: React.ReactNode
  chores: Chore[]
  members: User[]
}

export function StatsProvider({ children, chores, members }: StatsProviderProps) {
  // Add state to track deductions and trigger recalculations
  const [deductionsVersion, setDeductionsVersion] = useState(0)

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
      } else if (!chore.completed) {
        // For unassigned, uncompleted chores, don't assign them to anyone
        // They'll be available for anyone to pick up
      }
    })
    
    return distribution
  }, [chores, members])

  // Calculate lifetime efficiency score for a user based on all-time performance
  const calculateEfficiencyScore = (userChores: Chore[], completedChores: Chore[]) => {
    if (userChores.length === 0) return 0

    // 1. Lifetime Completion Rate (30% weight) - Most important factor
    const completionRate = completedChores.length / userChores.length
    
    // 2. Lifetime Timeliness Score (25% weight) - Rewards consistent early completion over time
    let timelinessScore = 0
    let totalTimeliness = 0
    let validTimelinessChores = 0
    
    completedChores.forEach(chore => {
      if (chore.dueDate && chore.completedAt) {
        const dueDateTime = new Date(chore.dueDate)
        if (dueDateTime.getHours() === 0 && dueDateTime.getMinutes() === 0) {
          dueDateTime.setHours(18, 0, 0, 0) // 6 PM
        }
        
        const completedDate = new Date(chore.completedAt)
        const hoursDiff = (dueDateTime.getTime() - completedDate.getTime()) / (1000 * 60 * 60)
        
        if (hoursDiff > 0) {
          // Early completion - bonus (capped at 2x)
          totalTimeliness += Math.min(hoursDiff * 0.05, 1.0)
        } else if (hoursDiff < 0) {
          // Late completion - penalty (capped at -1x)
          totalTimeliness += Math.max(-1.0, hoursDiff * 0.02)
        } else {
          // On-time completion - perfect score
          totalTimeliness += 1.0
        }
        validTimelinessChores++
      }
    })
    
    timelinessScore = validTimelinessChores > 0 ? totalTimeliness / validTimelinessChores : 0
    
    // 3. Lifetime Difficulty Mastery (20% weight) - Rewards long-term handling of different difficulty levels
    const difficultyWeights = { easy: 1, medium: 1.5, hard: 2 }
    let completedDifficultyScore = 0
    let totalDifficultyWeight = 0
    
    // Calculate difficulty score for completed chores
    completedChores.forEach(chore => {
      const weight = difficultyWeights[chore.difficulty as keyof typeof difficultyWeights] || 1
      completedDifficultyScore += weight
    })
    
    // Calculate total difficulty weight for all assigned chores
    userChores.forEach(chore => {
      const weight = difficultyWeights[chore.difficulty as keyof typeof difficultyWeights] || 1
      totalDifficultyWeight += weight
    })
    
    const difficultyBalance = totalDifficultyWeight > 0 ? completedDifficultyScore / totalDifficultyWeight : 0
    
    // 4. Lifetime Consistency & Streaks (15% weight) - Rewards long-term consistent effort
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
      
      // Calculate longest streak from all time
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
    
    // Combine current and longest streak for lifetime consistency score
    // Longest streak gets more weight as it shows historical capability
    const streakConsistency = Math.min((currentStreak * 0.3 + longestStreak * 0.7) / 14, 1.0)
    
    // 5. Lifetime Points Efficiency (10% weight) - Rewards maximizing point gains over time
    const totalPotentialPoints = userChores.reduce((sum, c) => sum + (c.points || 0), 0)
    const pointsEfficiency = totalPotentialPoints > 0 ? 
      completedChores.reduce((sum, c) => sum + (c.finalPoints || c.points || 0), 0) / totalPotentialPoints : 0
    
    // Calculate weighted lifetime efficiency score (0-100 scale)
    const efficiencyScore = (
      completionRate * 30 +
      (timelinessScore + 1) * 12.5 + // Normalize timeliness to 0-2 range, then scale
      difficultyBalance * 20 +
      streakConsistency * 15 +
      pointsEfficiency * 10
    )
    
    return Math.round(efficiencyScore * 100) / 100
  }

  // Efficient user stats calculation with memoization
  const userStats = useMemo(() => {
    return members.map(member => {
      const userChores = choreDistribution[member.id] || []
      const completedChores = userChores.filter(c => c.completed)
      
      // Calculate total points from completed chores
      const baseEarnedPoints = completedChores.reduce((sum, c) => {
        return sum + (c.finalPoints || c.points || 0)
      }, 0)
      
      // Subtract any redeemed points
      const pointDeductions = JSON.parse(localStorage.getItem('pointDeductions') || '{}')
      const userDeductions = pointDeductions[member.id] || 0
      const earnedPoints = Math.max(0, baseEarnedPoints - userDeductions)
      
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
      
      // Calculate level based on earned points
      let currentLevel = 1
      const LEVELS = [
        { level: 1, pointsRequired: 0 },
        { level: 2, pointsRequired: 100 },
        { level: 3, pointsRequired: 250 },
        { level: 4, pointsRequired: 450 },
        { level: 5, pointsRequired: 700 },
        { level: 6, pointsRequired: 1000 },
        { level: 7, pointsRequired: 1350 },
        { level: 8, pointsRequired: 1750 },
        { level: 9, pointsRequired: 2200 },
        { level: 10, pointsRequired: 2700 }
      ]
      
      for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (earnedPoints >= LEVELS[i].pointsRequired) {
          currentLevel = LEVELS[i].level
          break
        }
      }
      
      const currentLevelData = LEVELS.find(level => level.level === currentLevel)
      const nextLevelData = LEVELS.find(level => level.level === currentLevel + 1)
      
      const currentLevelPoints = earnedPoints - (currentLevelData?.pointsRequired || 0)
      const pointsToNextLevel = nextLevelData ? nextLevelData.pointsRequired - earnedPoints : 0
      
      return {
        userId: member.id,
        totalChores: userChores.length,
        completedChores: completedChores.length,
        totalPoints,
        earnedPoints,
        currentStreak,
        longestStreak,
        currentLevel: Math.min(currentLevel, 10),
        currentLevelPoints,
        pointsToNextLevel,
        lastActive: new Date()
      }
    })
  }, [members, choreDistribution, deductionsVersion])

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
  }, [userStats, choreDistribution, deductionsVersion])

  const getUserStats = (userId: string): UserStats | undefined => {
    return userStats.find(stats => stats.userId === userId)
  }

  const getAllUserStats = (): UserStats[] => {
    return userStats
  }

  const getChoreDistribution = (): Record<string, Chore[]> => {
    return choreDistribution
  }

  const getEfficiencyLeaderboard = () => {
    return efficiencyLeaderboard
  }

  const getMostEfficientLeader = () => {
    return efficiencyLeaderboard[0]
  }

  const updateUserPoints = (userId: string, pointsToDeduct: number) => {
    // This function updates the user's earned points by deducting redeemed points
    // Since the stats are calculated from chores, we need to store the deduction separately
    console.log('updateUserPoints called with:', { userId, pointsToDeduct })
    
    const currentDeductions = JSON.parse(localStorage.getItem('pointDeductions') || '{}')
    console.log('Current deductions before update:', currentDeductions)
    
    const userDeductions = currentDeductions[userId] || 0
    currentDeductions[userId] = userDeductions + pointsToDeduct
    
    console.log('Updated deductions:', currentDeductions)
    localStorage.setItem('pointDeductions', JSON.stringify(currentDeductions))
    
    console.log('Incrementing deductionsVersion from', deductionsVersion, 'to', deductionsVersion + 1)
    setDeductionsVersion(prev => prev + 1) // Increment version to trigger recalculation
  }

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    getUserStats,
    getAllUserStats,
    getChoreDistribution,
    getEfficiencyLeaderboard,
    getMostEfficientLeader,
    updateUserPoints,
    refreshStats: () => setDeductionsVersion(prev => prev + 1), // Expose refresh function
  }), [deductionsVersion])

  return (
    <StatsContext.Provider value={contextValue}>
      {children}
    </StatsContext.Provider>
  )
}

export function useStats() {
  const context = useContext(StatsContext)
  if (!context) {
    throw new Error('useStats must be used within a StatsProvider')
  }
  return context
}
