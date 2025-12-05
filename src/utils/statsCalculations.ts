import { Chore, LEVELS } from '../types/chore'

/**
 * Calculate user level based on lifetime points (all points ever earned)
 */
export const calculateUserLevel = (lifetimePoints: number): number => {
  let currentLevel = 1
  
  // Iterate through levels in descending order to find the highest level user qualifies for
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (lifetimePoints >= LEVELS[i].pointsRequired) {
      currentLevel = LEVELS[i].level
      break
    }
  }
  
  return currentLevel
}

/**
 * Calculate lifetime efficiency score for a user based on all-time performance
 */
export const calculateEfficiencyScore = (userChores: Chore[], completedChores: Chore[]): number => {
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
  const totalLifetimePoints = userChores.reduce((sum, c) => {
    const points = c.finalPoints !== undefined ? c.finalPoints : c.points || 0
    
    // Count points from completed chores
    if (c.completed) {
      return sum + points
    }
    
    // Count points from incomplete chores that have finalPoints (chores that were reset)
    if (!c.completed && c.finalPoints !== undefined) {
      return sum + points
    }
    
    return sum
  }, 0)
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
}

