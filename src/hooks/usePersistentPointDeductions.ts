import { useState, useCallback, useEffect } from 'react'

/**
 * @deprecated This hook is deprecated and will be removed in a future version.
 * Point deductions are now stored in Convex in the `pointDeductions` table.
 * Use the Convex query `api.redemptions.getHouseholdPointDeductions` instead.
 * 
 * This hook is kept only for backward compatibility during the migration period.
 */
export const usePersistentPointDeductions = () => {
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
    console.log(`Updating point deductions for user ${userId}:`, {
      pointsToDeduct,
      previousTotal: pointDeductions[userId] || 0,
      newTotal: (pointDeductions[userId] || 0) + pointsToDeduct
    })
    
    setPointDeductions(prev => {
      const prevDeductions = prev[userId] || 0
      const newDeductions = {
        ...prev,
        [userId]: prevDeductions + pointsToDeduct
      }
      // Immediately save to localStorage to ensure persistence
      localStorage.setItem('pointDeductions', JSON.stringify(newDeductions))
      return newDeductions
    })
  }, [pointDeductions])

  // Save point deductions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('pointDeductions', JSON.stringify(pointDeductions))
  }, [pointDeductions])

  return { pointDeductions, updateDeductions }
}

