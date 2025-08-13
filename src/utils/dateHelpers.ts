/**
 * Date and time utility functions for chore management
 */

/**
 * Sets a due date to 6 PM if no specific time is set
 */
export function normalizeDueDate(dueDate: Date): Date {
  const normalized = new Date(dueDate)
  if (normalized.getHours() === 0 && normalized.getMinutes() === 0) {
    normalized.setHours(18, 0, 0, 0) // 6 PM
  }
  return normalized
}

/**
 * Calculate hours difference between two dates
 */
export function getHoursDifference(date1: Date, date2: Date): number {
  return (date1.getTime() - date2.getTime()) / (1000 * 60 * 60)
}

/**
 * Format time difference into human-readable string
 */
export function formatTimeDifference(hours: number): string {
  const absHours = Math.abs(hours)
  const days = Math.floor(absHours / 24)
  const remainingHours = Math.floor(absHours % 24)
  
  if (days > 0) {
    const dayStr = `${days} day${days > 1 ? 's' : ''}`
    const hourStr = remainingHours > 0 ? ` ${remainingHours} hour${remainingHours > 1 ? 's' : ''}` : ''
    return dayStr + hourStr
  } else {
    return `${remainingHours} hour${remainingHours > 1 ? 's' : ''}`
  }
}

/**
 * Calculate completion status relative to due date
 */
export function getCompletionStatus(completedAt: Date, dueDate: Date) {
  const normalizedDueDate = normalizeDueDate(dueDate)
  const hoursDiff = getHoursDifference(normalizedDueDate, completedAt)
  
  if (hoursDiff > 0) {
    // Early completion
    return {
      type: 'early' as const,
      hours: hoursDiff,
      message: `${formatTimeDifference(hoursDiff)} early`,
      color: 'text-green-600',
      bg: 'bg-green-100',
      icon: '🎯'
    }
  } else if (hoursDiff === 0) {
    return {
      type: 'on-time' as const,
      hours: 0,
      message: 'Completed on time!',
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      icon: '✅'
    }
  } else {
    // Late completion
    return {
      type: 'late' as const,
      hours: Math.abs(hoursDiff),
      message: `${formatTimeDifference(hoursDiff)} late`,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
      icon: '⏰'
    }
  }
}

/**
 * Check if a chore is overdue
 */
export function isOverdue(dueDate: Date): boolean {
  const normalizedDueDate = normalizeDueDate(dueDate)
  return normalizedDueDate < new Date()
}

/**
 * Check if a chore is due soon (within 24 hours)
 */
export function isDueSoon(dueDate: Date): boolean {
  const normalizedDueDate = normalizeDueDate(dueDate)
  const now = new Date()
  const hoursUntilDue = getHoursDifference(normalizedDueDate, now)
  return hoursUntilDue <= 24 && hoursUntilDue >= 0
}

/**
 * Get current due date status for pending chores
 */
export function getCurrentDueStatus(dueDate: Date) {
  const normalizedDueDate = normalizeDueDate(dueDate)
  const now = new Date()
  
  if (isOverdue(dueDate)) {
    const hoursOverdue = getHoursDifference(now, normalizedDueDate)
    return {
      type: 'overdue' as const,
      hours: hoursOverdue,
      message: `${formatTimeDifference(hoursOverdue)} overdue`,
      color: 'text-red-600',
      bg: 'bg-red-100',
      icon: '🚨'
    }
  }
  
  if (isDueSoon(dueDate)) {
    const hoursUntilDue = getHoursDifference(normalizedDueDate, now)
    return {
      type: 'due-soon' as const,
      hours: hoursUntilDue,
      message: `Due in ${formatTimeDifference(hoursUntilDue)}`,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
      icon: '⚠️'
    }
  }
  
  return null
}
