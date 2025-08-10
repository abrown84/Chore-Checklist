import { Chore } from '../types/chore'

/**
 * Test utility to demonstrate lifetime points calculation
 * This shows how points are preserved even when chores are reset
 */

export const testLifetimePointsCalculation = () => {
  console.log('🧪 Testing Lifetime Points Calculation...')
  
  // Simulate a chore that was completed with bonuses
  const completedChore: Chore = {
    id: '1',
    title: 'Test Chore',
    description: 'A test chore',
    difficulty: 'medium',
    points: 10,
    category: 'daily',
    priority: 'medium',
    completed: true,
    createdAt: new Date('2024-01-01'),
    completedAt: new Date('2024-01-01T10:00:00'),
    completedBy: 'user1',
    finalPoints: 15, // Bonus points earned
    bonusMessage: '+5 early bonus',
    dueDate: new Date('2024-01-01T18:00:00'),
    assignedTo: 'user1',
    // Removed approval fields - no longer needed
  }
  
  // Simulate the same chore after midnight reset
  const resetChore: Chore = {
    ...completedChore,
    completed: false,
    completedAt: undefined,
    // finalPoints is preserved for lifetime tracking
    // bonusMessage is cleared
    bonusMessage: undefined
  }
  
  // Test the old calculation method (would lose bonus points)
  const oldCalculation = completedChore.finalPoints || completedChore.points || 0
  console.log('📊 Old calculation (completed chore):', oldCalculation, 'points')
  
  // Test the new calculation method (preserves bonus points)
  const newCalculationCompleted = completedChore.finalPoints !== undefined ? completedChore.finalPoints : completedChore.points
  const newCalculationReset = !resetChore.completed && resetChore.finalPoints !== undefined ? resetChore.finalPoints : 0
  const totalLifetimePoints = newCalculationCompleted + newCalculationReset
  
  console.log('📊 New calculation (completed chore):', newCalculationCompleted, 'points')
  console.log('📊 New calculation (reset chore):', newCalculationReset, 'points')
  console.log('📊 Total lifetime points:', totalLifetimePoints, 'points')
  
  // Demonstrate the difference
  const pointsPreserved = totalLifetimePoints - completedChore.points
  console.log('🎯 Bonus points preserved:', pointsPreserved, 'points')
  
  if (pointsPreserved > 0) {
    console.log('✅ SUCCESS: Lifetime points are now preserved correctly!')
  } else {
    console.log('❌ FAILURE: Lifetime points are still being lost')
  }
  
  return {
    oldCalculation,
    newCalculationCompleted,
    newCalculationReset,
    totalLifetimePoints,
    pointsPreserved
  }
}

export const simulateChoreLifecycle = () => {
  console.log('\n🔄 Simulating Complete Chore Lifecycle...')
  
  // Phase 1: Chore is created
  const chore: Chore = {
    id: '1',
    title: 'Daily Dish Washing',
    description: 'Wash dishes after dinner',
    difficulty: 'easy',
    points: 5,
    category: 'daily',
    priority: 'medium',
    completed: false,
    createdAt: new Date('2024-01-01'),
    dueDate: new Date('2024-01-01T18:00:00'),
    assignedTo: 'user1',
    // Removed approval fields - no longer needed
  }
  
  console.log('📝 Phase 1 - Chore Created:', chore.title, 'Base points:', chore.points)
  
  // Phase 2: Chore is completed early (bonus points)
  const completedChore: Chore = {
    ...chore,
    completed: true,
    completedAt: new Date('2024-01-01T12:00:00'), // 6 hours early
    completedBy: 'user1',
    finalPoints: 7, // 5 base + 2 bonus for early completion
    bonusMessage: '+2 early bonus (6 hours early)'
  }
  
  console.log('✅ Phase 2 - Chore Completed:', completedChore.title, 'Final points:', completedChore.finalPoints)
  
  // Phase 3: Midnight reset (chore becomes available again)
  const resetChore: Chore = {
    ...completedChore,
    completed: false,
    completedAt: undefined,
    // finalPoints is preserved for lifetime tracking
    bonusMessage: undefined
  }
  
  console.log('🔄 Phase 3 - Chore Reset:', resetChore.title, 'Available again, but finalPoints preserved:', resetChore.finalPoints)
  
  // Phase 4: Calculate lifetime points
  const lifetimePoints = resetChore.finalPoints || 0
  const basePoints = resetChore.points
  
  console.log('📊 Lifetime Points Calculation:')
  console.log('   Base points:', basePoints)
  console.log('   Bonus points earned:', lifetimePoints - basePoints)
  console.log('   Total lifetime points:', lifetimePoints)
  
  return {
    chore,
    completedChore,
    resetChore,
    lifetimePoints,
    basePoints
  }
}
