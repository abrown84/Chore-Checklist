import { useState, useCallback, useEffect } from 'react'
import { UserStats } from '../types/user'

/**
 * @deprecated This hook is deprecated and will be removed in a future version.
 * User stats are now stored in Convex in the `userStats` table.
 * Use the Convex query `api.stats.getHouseholdStats` instead.
 * 
 * This hook is kept only for backward compatibility during the migration period.
 */
export const usePersistentUserStats = () => {
  const [persistentStats, setPersistentStats] = useState<Record<string, UserStats>>(() => {
    // Initialize from localStorage immediately to prevent loss on refresh
    try {
      const savedStats = localStorage.getItem('userStats')
      if (savedStats) {
        const parsed = JSON.parse(savedStats)
        // Convert date strings back to Date objects
        const converted = Object.fromEntries(
          Object.entries(parsed).map(([userId, stats]: [string, any]) => [
            userId,
            {
              ...stats,
              lastActive: new Date(stats.lastActive)
            }
          ])
        )
        return converted
      }
    } catch (error) {
      console.error('Failed to load user stats:', error)
    }
    return {}
  })

  const updateStats = useCallback((userId: string, stats: UserStats) => {
    setPersistentStats(prev => {
      const newStats = {
        ...prev,
        [userId]: stats
      }
      // Immediately save to localStorage to ensure persistence
      localStorage.setItem('userStats', JSON.stringify(newStats))
      return newStats
    })
  }, [])

  const getStats = useCallback((userId: string): UserStats | undefined => {
    return persistentStats[userId]
  }, [persistentStats])

  const getAllStats = useCallback((): Record<string, UserStats> => {
    return persistentStats
  }, [persistentStats])

  // Save user stats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('userStats', JSON.stringify(persistentStats))
  }, [persistentStats])

  return { persistentStats, updateStats, getStats, getAllStats }
}

