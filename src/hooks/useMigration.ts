import { useState, useCallback } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

export const useMigration = () => {
  const [isMigrating, setIsMigrating] = useState(false)
  const [migrationError, setMigrationError] = useState<string | null>(null)

  const checkMigrationStatus = useQuery(api.migrations.checkMigrationStatus)
  const migrateData = useMutation(api.migrations.migrateLocalStorageData)
  const getInstructions = useQuery(api.migrations.getMigrationInstructions)

  const migrateFromLocalStorage = useCallback(async () => {
    setIsMigrating(true)
    setMigrationError(null)

    try {
      // Get data from localStorage
      const chores = JSON.parse(localStorage.getItem('chores') || '[]')
      const users = JSON.parse(localStorage.getItem('choreAppUsers') || '[]')
      const userStats = JSON.parse(localStorage.getItem('userStats') || '{}')

      if (chores.length === 0 && users.length === 0) {
        throw new Error('No data found in localStorage to migrate')
      }

      // Migrate data to Convex
      const result = await migrateData({
        chores,
        users,
        userStats,
      })

      if (result.success) {
        // Clear localStorage after successful migration
        localStorage.removeItem('chores')
        localStorage.removeItem('choreAppUsers')
        localStorage.removeItem('userStats')
        localStorage.removeItem('userStats')
        localStorage.removeItem('levelPersistence')
        localStorage.removeItem('pointDeductions')
        
        return result
      } else {
        throw new Error(result.error || 'Migration failed')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setMigrationError(errorMessage)
      throw error
    } finally {
      setIsMigrating(false)
    }
  }, [migrateData])

  const needsMigration = checkMigrationStatus?.needsMigration ?? false
  const migrationReason = checkMigrationStatus?.reason ?? ''

  return {
    needsMigration,
    migrationReason,
    isMigrating,
    migrationError,
    migrateFromLocalStorage,
    instructions: getInstructions,
  }
}
