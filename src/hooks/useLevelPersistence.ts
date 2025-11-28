import { useState, useCallback, useEffect } from 'react'

/**
 * @deprecated This hook is deprecated and will be removed in a future version.
 * Level persistence is now stored in Convex in the `userStats.levelPersistenceInfo` field.
 * Use the Convex mutations `api.stats.setLevelPersistenceInStats` and 
 * `api.stats.clearLevelPersistenceFromStats` instead.
 * 
 * This hook is kept only for backward compatibility during the migration period.
 */
export const useLevelPersistence = () => {
  const [levelPersistence, setLevelPersistence] = useState<Record<string, { level: number; expiresAt: number; pointsAtRedemption: number }>>(() => {
    try {
      const saved = localStorage.getItem('levelPersistence')
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.error('Failed to load level persistence:', error)
    }
    return {}
  })

  const setLevelPersistenceForUser = useCallback((userId: string, level: number, pointsAtRedemption: number, gracePeriodDays: number = 30) => {
    const expiresAt = Date.now() + (gracePeriodDays * 24 * 60 * 60 * 1000)
    console.log(`Setting level persistence for user ${userId}:`, {
      level,
      pointsAtRedemption,
      gracePeriodDays,
      expiresAt: new Date(expiresAt).toLocaleString()
    })
    
    setLevelPersistence(prev => {
      const newPersistence = {
        ...prev,
        [userId]: { level, expiresAt, pointsAtRedemption }
      }
      localStorage.setItem('levelPersistence', JSON.stringify(newPersistence))
      return newPersistence
    })
  }, [])

  const clearLevelPersistence = useCallback((userId: string) => {
    setLevelPersistence(prev => {
      const newPersistence = { ...prev }
      delete newPersistence[userId]
      localStorage.setItem('levelPersistence', JSON.stringify(newPersistence))
      return newPersistence
    })
  }, [])

  // Clean up expired level persistence
  useEffect(() => {
    const now = Date.now()
    const expiredEntries = Object.entries(levelPersistence).filter(([, data]) => data.expiresAt < now)
    
    if (expiredEntries.length > 0) {
      console.log(`Cleaning up expired level persistence for users:`, expiredEntries.map(([userId, data]) => ({
        userId,
        level: data.level,
        expiredAt: new Date(data.expiresAt).toLocaleString()
      })))
      
      setLevelPersistence(prev => {
        const newPersistence = Object.fromEntries(
          Object.entries(prev).filter(([, data]) => data.expiresAt >= now)
        )
        localStorage.setItem('levelPersistence', JSON.stringify(newPersistence))
        return newPersistence
      })
    }
  }, [levelPersistence])

  return { levelPersistence, setLevelPersistenceForUser, clearLevelPersistence }
}

