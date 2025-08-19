import { Chore } from '../types/chore'

/**
 * Utility functions for handling midnight resets of chores
 */

/**
 * Check if it's time for a midnight reset
 * Returns true if the current time is between 12:00 AM and 12:01 AM
 */
export function isMidnightResetTime(): boolean {
  const now = new Date()
  const hours = now.getHours()
  const minutes = now.getMinutes()
  
  // Reset window: 12:00 AM to 12:01 AM (very narrow window to prevent multiple resets)
  return hours === 0 && minutes === 0
}

// Track if we've already reset today to prevent multiple resets
let lastResetDate: string | null = null

/**
 * Check if we should perform a midnight reset (prevents multiple resets on the same day)
 */
export function shouldPerformMidnightReset(): boolean {
  const now = new Date()
  const today = now.toDateString()
  
  // If we've already reset today, don't reset again
  if (lastResetDate === today) {
    return false
  }
  
  // Only reset if it's midnight and we haven't reset today
  if (isMidnightResetTime()) {
    lastResetDate = today
    return true
  }
  
  return false
}

/**
 * Check if a chore needs to be reset (daily chores that were completed yesterday)
 */
export function shouldResetChore(chore: Chore): boolean {
  if (chore.category !== 'daily') return false
  if (!chore.completed) return false
  
  const now = new Date()
  const completedDate = chore.completedAt ? new Date(chore.completedAt) : null
  
  if (!completedDate) return false
  
  // Check if the chore was completed yesterday
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(0, 0, 0, 0)
  
  const completedDay = new Date(completedDate)
  completedDay.setHours(0, 0, 0, 0)
  
  return completedDay.getTime() === yesterday.getTime()
}

/**
 * Reset daily chores that were completed yesterday
 * This makes them available again for today
 */
export function resetDailyChores(chores: Chore[]): Chore[] {
  const now = new Date()
  let resetCount = 0
  
  const resetChores = chores.map(chore => {
    if (shouldResetChore(chore)) {
      resetCount++
      console.log(`Resetting daily chore: ${chore.title} (was completed on ${chore.completedAt?.toLocaleDateString()})`)
      
      // Reset the chore for today
      const dueDate = new Date(now)
      dueDate.setHours(18, 0, 0, 0) // 6:00 PM today
      
      return {
        ...chore,
        completed: false,
        completedAt: undefined,
        dueDate,
        // Don't clear finalPoints - preserve for lifetime tracking
        // finalPoints: undefined,
        bonusMessage: undefined,
        // Removed approval fields - no longer needed
      }
    }
    return chore
  })
  
  if (resetCount > 0) {
    console.log(`Total chores reset: ${resetCount}`)
  }
  
  return resetChores
}

/**
 * Get the time until next midnight reset
 * Returns milliseconds until 12:00 AM
 */
export function getTimeUntilMidnightReset(): number {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0) // Set to midnight
  
  return tomorrow.getTime() - now.getTime()
}

/**
 * Format the time until midnight reset in a human-readable format
 */
export function formatTimeUntilMidnightReset(): string {
  const msUntilMidnight = getTimeUntilMidnightReset()
  const hours = Math.floor(msUntilMidnight / (1000 * 60 * 60))
  const minutes = Math.floor((msUntilMidnight % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 0) {
    return `${hours}h ${minutes}m until reset`
  } else {
    return `${minutes}m until reset`
  }
}
