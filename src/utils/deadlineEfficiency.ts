import { Chore } from '../types/chore'
import { normalizeDueDate, getHoursDifference } from './dateHelpers'

export interface DeadlineEfficiencyMetrics {
  totalChoresWithDeadlines: number
  completedOnTime: number
  completedEarly: number
  completedLate: number
  overdueChores: number
  dueSoonChores: number
  averageCompletionTime: number // hours before/after deadline
  onTimeRate: number // percentage
  earlyRate: number // percentage
  lateRate: number // percentage
}

/**
 * Calculate deadline-based efficiency metrics for a user
 */
export function calculateDeadlineEfficiency(chores: Chore[]): DeadlineEfficiencyMetrics {
  const pendingChores = chores.filter(c => !c.completed && c.dueDate)
  const completedChores = chores.filter(c => c.completed && c.dueDate)
  
  const overdueChores = pendingChores.filter(c => {
    const normalizedDue = normalizeDueDate(c.dueDate!)
    return normalizedDue < new Date()
  }).length
  
  const dueSoonChores = pendingChores.filter(c => {
    const normalizedDue = normalizeDueDate(c.dueDate!)
    const now = new Date()
    const hoursUntilDue = getHoursDifference(normalizedDue, now)
    return hoursUntilDue <= 24 && hoursUntilDue >= 0
  }).length
  
  let completedOnTime = 0
  let completedEarly = 0
  let completedLate = 0
  let totalCompletionTime = 0
  
  completedChores.forEach(chore => {
    if (!chore.completedAt || !chore.dueDate) return
    
    const completedDate = new Date(chore.completedAt)
    const normalizedDue = normalizeDueDate(chore.dueDate)
    const hoursDiff = getHoursDifference(normalizedDue, completedDate)
    
    totalCompletionTime += hoursDiff
    
    if (hoursDiff > 0) {
      completedEarly++
    } else if (hoursDiff < 0) {
      completedLate++
    } else {
      completedOnTime++
    }
  })
  
  const totalChoresWithDeadlines = pendingChores.length + completedChores.length
  const averageCompletionTime = completedChores.length > 0 
    ? totalCompletionTime / completedChores.length 
    : 0
  
  const onTimeRate = completedChores.length > 0 
    ? (completedOnTime / completedChores.length) * 100 
    : 0
  
  const earlyRate = completedChores.length > 0 
    ? (completedEarly / completedChores.length) * 100 
    : 0
  
  const lateRate = completedChores.length > 0 
    ? (completedLate / completedChores.length) * 100 
    : 0
  
  return {
    totalChoresWithDeadlines,
    completedOnTime,
    completedEarly,
    completedLate,
    overdueChores,
    dueSoonChores,
    averageCompletionTime,
    onTimeRate,
    earlyRate,
    lateRate
  }
}

/**
 * Get a human-readable efficiency rating based on deadline performance
 */
export function getDeadlineEfficiencyRating(metrics: DeadlineEfficiencyMetrics): {
  rating: 'excellent' | 'good' | 'fair' | 'poor'
  score: number
  message: string
} {
  // Calculate a score from 0-100
  let score = 0
  
  // On-time rate (40% weight)
  score += metrics.onTimeRate * 0.4
  
  // Early completion bonus (30% weight)
  score += metrics.earlyRate * 0.3
  
  // Late completion penalty (20% weight)
  score += (100 - metrics.lateRate) * 0.2
  
  // Overdue chores penalty (10% weight)
  const overdueRate = metrics.totalChoresWithDeadlines > 0
    ? (metrics.overdueChores / metrics.totalChoresWithDeadlines) * 100
    : 0
  score += (100 - overdueRate) * 0.1
  
  let rating: 'excellent' | 'good' | 'fair' | 'poor'
  let message: string
  
  if (score >= 80) {
    rating = 'excellent'
    message = 'Outstanding deadline performance!'
  } else if (score >= 60) {
    rating = 'good'
    message = 'Good deadline management'
  } else if (score >= 40) {
    rating = 'fair'
    message = 'Room for improvement on deadlines'
  } else {
    rating = 'poor'
    message = 'Focus on meeting deadlines'
  }
  
  return { rating, score: Math.round(score), message }
}






