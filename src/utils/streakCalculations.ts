import { Chore } from '../types/chore'

/**
 * Calculate completion streaks for a user based on their completed chores
 */
export const calculateStreaks = (completedChores: Chore[]): {
  currentStreak: number
  longestStreak: number
  totalStreaks: number
  averageStreakLength: number
} => {
  if (completedChores.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalStreaks: 0,
      averageStreakLength: 0
    }
  }

  // Get all completed chore dates, sorted by completion date (newest first)
  const completedDates = completedChores
    .filter(chore => chore.completedAt)
    .map(chore => new Date(chore.completedAt!))
    .sort((a, b) => b.getTime() - a.getTime())

  if (completedDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalStreaks: 0,
      averageStreakLength: 0
    }
  }

  // Calculate current streak (consecutive days from today)
  let currentStreak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  let checkDate = new Date(today)
  let streakIndex = 0
  
  while (streakIndex < completedDates.length) {
    const completedDate = new Date(completedDates[streakIndex])
    completedDate.setHours(0, 0, 0, 0)
    
    if (checkDate.getTime() === completedDate.getTime()) {
      currentStreak++
      checkDate.setDate(checkDate.getDate() - 1) // Move to previous day
      streakIndex++
    } else if (checkDate.getTime() > completedDate.getTime()) {
      // We've moved past this completion date, check next one
      streakIndex++
    } else {
      // Gap found, break current streak
      break
    }
  }

  // Calculate all streaks and find the longest
  let longestStreak = 0
  let totalStreaks = 0
  let totalStreakLength = 0
  let currentStreakLength = 1
  
  for (let i = 1; i < completedDates.length; i++) {
    const prevDate = new Date(completedDates[i - 1])
    const currDate = new Date(completedDates[i])
    
    prevDate.setHours(0, 0, 0, 0)
    currDate.setHours(0, 0, 0, 0)
    
    const daysDiff = (prevDate.getTime() - currDate.getTime()) / (24 * 60 * 60 * 1000)
    
    if (daysDiff === 1) {
      // Consecutive day, continue streak
      currentStreakLength++
    } else {
      // Gap found, end current streak
      longestStreak = Math.max(longestStreak, currentStreakLength)
      totalStreaks++
      totalStreakLength += currentStreakLength
      currentStreakLength = 1
    }
  }
  
  // Don't forget the last streak
  longestStreak = Math.max(longestStreak, currentStreakLength)
  totalStreaks++
  totalStreakLength += currentStreakLength
  
  const averageStreakLength = totalStreaks > 0 ? totalStreakLength / totalStreaks : 0

  return {
    currentStreak,
    longestStreak,
    totalStreaks,
    averageStreakLength: Math.round(averageStreakLength * 100) / 100
  }
}
