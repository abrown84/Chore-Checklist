import { useState, useCallback, useEffect } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

/**
 * All localStorage keys that might contain app data to migrate
 */
const LEGACY_STORAGE_KEYS = [
  // Core data keys
  'chores',
  'choreAppUsers',
  'choreAppUser',
  'users',
  'user',
  'userStats',
  'levelPersistence',
  'pointDeductions',
  'redemptionRequests',
  // Session/auth keys (no longer needed)
  'choreApp_session',
  'choreApp_encryption_key',
] as const

/**
 * Keys that should be preserved (UI preferences, not core data)
 */
const PRESERVED_KEYS = [
  'theme',
  'pointRedemptionRate',
  'migration_completed',
  'demoChores', // Demo mode only
] as const

/**
 * Check if there's any legacy data in localStorage that needs migration
 */
function hasLocalStorageData(): boolean {
  try {
    for (const key of LEGACY_STORAGE_KEYS) {
      const value = localStorage.getItem(key)
      if (value && value !== '[]' && value !== '{}' && value !== 'null') {
        return true
      }
    }
    return false
  } catch {
    return false
  }
}

/**
 * Get all localStorage data that can be migrated
 */
function getLocalStorageData() {
  const data: {
    chores: any[]
    users: any[]
    userStats: Record<string, any>
    levelPersistence: Record<string, any>
    pointDeductions: Record<string, number>
    redemptionRequests: any[]
  } = {
    chores: [],
    users: [],
    userStats: {},
    levelPersistence: {},
    pointDeductions: {},
    redemptionRequests: [],
  }

  try {
    // Try to get chores from various possible keys
    const choresRaw = localStorage.getItem('chores')
    if (choresRaw) {
      data.chores = JSON.parse(choresRaw)
    }

    // Try to get users from various possible keys
    const usersRaw = localStorage.getItem('choreAppUsers') || localStorage.getItem('users')
    if (usersRaw) {
      data.users = JSON.parse(usersRaw)
    }

    // Get user stats
    const userStatsRaw = localStorage.getItem('userStats')
    if (userStatsRaw) {
      data.userStats = JSON.parse(userStatsRaw)
    }

    // Get level persistence
    const levelPersistenceRaw = localStorage.getItem('levelPersistence')
    if (levelPersistenceRaw) {
      data.levelPersistence = JSON.parse(levelPersistenceRaw)
    }

    // Get point deductions
    const pointDeductionsRaw = localStorage.getItem('pointDeductions')
    if (pointDeductionsRaw) {
      data.pointDeductions = JSON.parse(pointDeductionsRaw)
    }

    // Get redemption requests
    const redemptionRequestsRaw = localStorage.getItem('redemptionRequests')
    if (redemptionRequestsRaw) {
      data.redemptionRequests = JSON.parse(redemptionRequestsRaw)
    }
  } catch (error) {
    console.error('Error reading localStorage data:', error)
  }

  return data
}

/**
 * Clear all legacy localStorage data after successful migration
 */
function clearLegacyLocalStorage(): void {
  try {
    for (const key of LEGACY_STORAGE_KEYS) {
      localStorage.removeItem(key)
    }
    // Also clear any prefixed keys from the storage utility
    const allKeys = Object.keys(localStorage)
    for (const key of allKeys) {
      if (key.startsWith('choreApp_') && !PRESERVED_KEYS.includes(key as any)) {
        localStorage.removeItem(key)
      }
    }
    import.meta.env.DEV && console.log('✓ Cleared legacy localStorage data')
  } catch (error) {
    console.error('Error clearing localStorage:', error)
  }
}

/**
 * Hook for handling data migration from localStorage to Convex
 */
export const useMigration = () => {
  const [isMigrating, setIsMigrating] = useState(false)
  const [migrationError, setMigrationError] = useState<string | null>(null)
  const [migrationSuccess, setMigrationSuccess] = useState(false)
  const [hasAttemptedAutoMigration, setHasAttemptedAutoMigration] = useState(false)

  // Check migration status from Convex
  const checkMigrationStatus = useQuery(api.migrations.checkMigrationStatus)
  const migrateData = useMutation(api.migrations.migrateLocalStorageData)
  const getInstructions = useQuery(api.migrations.getMigrationInstructions)

  // Check if migration was already completed
  const isMigrationCompleted = (() => {
    try {
      return localStorage.getItem('migration_completed') === 'true'
    } catch {
      return false
    }
  })()

  // Determine if migration is needed
  const needsMigration = !isMigrationCompleted && 
    checkMigrationStatus?.needsMigration === true &&
    hasLocalStorageData()

  // Auto-migrate on first load if there's data and user is new
  useEffect(() => {
    if (
      !hasAttemptedAutoMigration &&
      !isMigrationCompleted &&
      checkMigrationStatus?.needsMigration &&
      hasLocalStorageData()
    ) {
      setHasAttemptedAutoMigration(true)
      
      // Auto-migrate silently in the background
      migrateFromLocalStorage().catch(err => {
        console.error('Auto-migration failed:', err)
        // Don't set error state for auto-migration - let user manually retry
      })
    }
  }, [checkMigrationStatus, hasAttemptedAutoMigration, isMigrationCompleted])

  /**
   * Perform migration from localStorage to Convex
   */
  const migrateFromLocalStorage = useCallback(async () => {
    setIsMigrating(true)
    setMigrationError(null)
    setMigrationSuccess(false)

    try {
      // Get all localStorage data
      const data = getLocalStorageData()

      // Check if there's actually data to migrate
      if (data.chores.length === 0 && data.users.length === 0) {
        // No data to migrate - just mark as complete
        localStorage.setItem('migration_completed', 'true')
        setMigrationSuccess(true)
        return { success: true, migratedCount: 0, message: 'No data to migrate' }
      }

      import.meta.env.DEV && console.log('🔄 Starting migration...', {
        choresCount: data.chores.length,
        usersCount: data.users.length,
        hasUserStats: Object.keys(data.userStats).length > 0,
        hasLevelPersistence: Object.keys(data.levelPersistence).length > 0,
        hasPointDeductions: Object.keys(data.pointDeductions).length > 0,
        redemptionRequestsCount: data.redemptionRequests.length,
      })

      // Call Convex migration mutation
      const result = await migrateData({
        chores: data.chores,
        users: data.users,
        userStats: data.userStats,
        levelPersistence: Object.keys(data.levelPersistence).length > 0 ? data.levelPersistence : undefined,
        pointDeductions: Object.keys(data.pointDeductions).length > 0 ? data.pointDeductions : undefined,
        redemptionRequests: data.redemptionRequests.length > 0 ? data.redemptionRequests : undefined,
      })

      if (result.success) {
        import.meta.env.DEV && console.log('✓ Migration successful:', result.message)
        
        // Clear all legacy localStorage data
        clearLegacyLocalStorage()
        
        // Mark migration as complete
        localStorage.setItem('migration_completed', 'true')
        
        setMigrationSuccess(true)
        return result
      } else {
        throw new Error(result.error || 'Migration failed')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('Migration error:', errorMessage)
      setMigrationError(errorMessage)
      throw error
    } finally {
      setIsMigrating(false)
    }
  }, [migrateData])

  /**
   * Skip migration and start fresh (clears localStorage data)
   */
  const skipMigration = useCallback(() => {
    clearLegacyLocalStorage()
    localStorage.setItem('migration_completed', 'true')
    setMigrationSuccess(true)
  }, [])

  /**
   * Reset migration state (for retry)
   */
  const resetMigration = useCallback(() => {
    setMigrationError(null)
    setMigrationSuccess(false)
  }, [])

  return {
    needsMigration,
    migrationReason: checkMigrationStatus?.reason ?? '',
    isMigrating,
    migrationError,
    migrationSuccess,
    migrateFromLocalStorage,
    skipMigration,
    resetMigration,
    instructions: getInstructions,
    hasLocalData: hasLocalStorageData(),
  }
}
