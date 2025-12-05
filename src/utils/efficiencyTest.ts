import { Chore } from '../types/chore'

// Test utility for efficiency calculation
export const testEfficiencyCalculation = () => {
  // Sample chores for testing
  const sampleChores: Chore[] = [
    {
      id: '1',
      title: 'Easy Chore',
      description: 'Simple task',
      difficulty: 'easy',
      points: 5,
      category: 'daily',
      priority: 'medium',
      completed: true,
      createdAt: new Date('2024-01-01'),
      completedAt: new Date('2024-01-01T10:00:00'),
      dueDate: new Date('2024-01-01T18:00:00'), // Early completion
      assignedTo: 'user1',
      // Removed approval fields - no longer needed
    },
    {
      id: '2',
      title: 'Hard Chore',
      description: 'Difficult task',
      difficulty: 'hard',
      points: 15,
      category: 'weekly',
      priority: 'high',
      completed: true,
      createdAt: new Date('2024-01-01'),
      completedAt: new Date('2024-01-02T20:00:00'),
      dueDate: new Date('2024-01-02T18:00:00'), // Late completion
      assignedTo: 'user1',
      // Removed approval fields - no longer needed
    },
    {
      id: '3',
      title: 'Medium Chore',
      description: 'Medium task',
      difficulty: 'medium',
      points: 10,
      category: 'daily',
      priority: 'medium',
      completed: false,
      createdAt: new Date('2024-01-01'),
      assignedTo: 'user1',
      // Removed approval fields - no longer needed
    }
  ]

  const userChores = sampleChores
  const completedChores = sampleChores.filter(c => c.completed)

  // Manual calculation for verification
  const completionRate = completedChores.length / userChores.length // 2/3 = 0.667
  
  // Timeliness calculation
  let totalTimeliness = 0
  let validTimelinessChores = 0
  
  completedChores.forEach(chore => {
    if (chore.dueDate && chore.completedAt) {
      const dueDateTime = new Date(chore.dueDate)
      if (dueDateTime.getHours() === 0 && dueDateTime.getMinutes() === 0) {
        dueDateTime.setHours(18, 0, 0, 0)
      }
      
      const completedDate = new Date(chore.completedAt)
      const hoursDiff = (dueDateTime.getTime() - completedDate.getTime()) / (1000 * 60 * 60)
      
      if (hoursDiff > 0) {
        // Early completion - bonus
        totalTimeliness += Math.min(hoursDiff * 0.05, 1.0)
      } else if (hoursDiff < 0) {
        // Late completion - penalty
        totalTimeliness += Math.max(-1.0, hoursDiff * 0.02)
      } else {
        // On-time completion - perfect score
        totalTimeliness += 1.0
      }
      validTimelinessChores++
    }
  })
  
  const timelinessScore = validTimelinessChores > 0 ? totalTimeliness / validTimelinessChores : 0
  
  // Difficulty balance
  const difficultyWeights = { easy: 1, medium: 1.5, hard: 2 }
  let completedDifficultyScore = 0
  let totalDifficultyWeight = 0
  
  completedChores.forEach(chore => {
    const weight = difficultyWeights[chore.difficulty as keyof typeof difficultyWeights] || 1
    completedDifficultyScore += weight
  })
  
  userChores.forEach(chore => {
    const weight = difficultyWeights[chore.difficulty as keyof typeof difficultyWeights] || 1
    totalDifficultyWeight += weight
  })
  
  const difficultyBalance = totalDifficultyWeight > 0 ? completedDifficultyScore / totalDifficultyWeight : 0
  
  // Streak consistency (assuming current streak of 1)
  const streakConsistency = 1 / 7
  
  // Points efficiency
  const totalPotentialPoints = userChores.reduce((sum, c) => sum + (c.points || 0), 0)
  
  // Calculate total lifetime points (same logic as main system)
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
  const pointsEfficiency = totalPotentialPoints > 0 ? totalLifetimePoints / totalPotentialPoints : 0
  
  // Final efficiency score
  const efficiencyScore = (
    completionRate * 35 +
    (timelinessScore + 1) * 12.5 +
    difficultyBalance * 20 +
    streakConsistency * 15 +
    pointsEfficiency * 5
  )
  
  console.log('Efficiency Test Results:')
  console.log('Completion Rate:', completionRate.toFixed(3))
  console.log('Timeliness Score:', timelinessScore.toFixed(3))
  console.log('Difficulty Balance:', difficultyBalance.toFixed(3))
  console.log('Streak Consistency:', streakConsistency.toFixed(3))
  console.log('Points Efficiency:', pointsEfficiency.toFixed(3))
  console.log('Final Efficiency Score:', efficiencyScore.toFixed(2))
  
  return {
    completionRate,
    timelinessScore,
    difficultyBalance,
    streakConsistency,
    pointsEfficiency,
    efficiencyScore
  }
}
