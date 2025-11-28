import React, { useState, useEffect } from 'react'
import { useMigration } from '../hooks/useMigration'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { AlertCircle, CheckCircle, Loader2, Database, X } from 'lucide-react'

export const MigrationBanner: React.FC = () => {
  const { 
    needsMigration, 
    migrationReason, 
    isMigrating, 
    migrationError, 
    migrationSuccess,
    migrateFromLocalStorage, 
    skipMigration,
    hasLocalData,
    instructions 
  } = useMigration()
  const [showDetails, setShowDetails] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Show success message briefly after migration
  useEffect(() => {
    if (migrationSuccess) {
      setShowSuccess(true)
      const timer = setTimeout(() => setShowSuccess(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [migrationSuccess])

  // Show success toast
  if (showSuccess) {
    return (
      <div className="fixed top-4 left-4 right-4 z-50 max-w-2xl mx-auto animate-in fade-in slide-in-from-top-2">
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardContent className="pt-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-900 dark:text-green-100 font-medium">
                  Migration completed successfully! Your data is now synced to the cloud.
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSuccess(false)}
                className="text-green-600 hover:text-green-800 hover:bg-green-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!needsMigration || !hasLocalData) {
    return null
  }

  const handleMigration = async () => {
    try {
      await migrateFromLocalStorage()
      // The component will show success message after migration
    } catch (error) {
      console.error('Migration failed:', error)
    }
  }

  const handleSkip = () => {
    if (window.confirm('Are you sure you want to skip migration? Your existing local data will be cleared and you will start fresh.')) {
      skipMigration()
    }
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-2xl mx-auto animate-in fade-in slide-in-from-top-2">
      <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-orange-900 dark:text-orange-100">
                Data Migration Available
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-orange-600 hover:text-orange-800 hover:bg-orange-100 dark:text-orange-400 dark:hover:bg-orange-900/30"
              disabled={isMigrating}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="text-orange-700 dark:text-orange-300">
            {migrationReason === "User not found in Convex" 
              ? "We've upgraded to a new backend system. Migrate your existing data to continue where you left off."
              : "Migrate your local data to our new cloud backend for better performance and cross-device sync."
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {migrationError && (
            <div className="flex items-center gap-2 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <span className="text-sm text-red-700 dark:text-red-300">
                Migration failed: {migrationError}
              </span>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleMigration}
              disabled={isMigrating}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {isMigrating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Migrating...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Migrate Data
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowDetails(!showDetails)}
              className="border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-300 dark:hover:bg-orange-900/20"
            >
              {showDetails ? 'Hide' : 'Show'} Details
            </Button>

            <Button
              variant="ghost"
              onClick={handleSkip}
              disabled={isMigrating}
              className="text-orange-600 hover:text-orange-800 hover:bg-orange-100 dark:text-orange-400 dark:hover:bg-orange-900/30"
            >
              Skip & Start Fresh
            </Button>
          </div>

          {showDetails && instructions && (
            <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-md border border-orange-200 dark:border-orange-800">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                What will be migrated:
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• All your chores and completion history</li>
                <li>• User profiles and statistics</li>
                <li>• Points, levels, and achievements</li>
                <li>• Household settings and members</li>
              </ul>
              
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 mt-4">
                Benefits of migration:
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Real-time sync across all devices</li>
                <li>• Faster performance and better reliability</li>
                <li>• Automatic backups and data protection</li>
                <li>• Enhanced features and future updates</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * @deprecated Use MigrationBanner instead - it now handles success state internally
 */
export const MigrationSuccess: React.FC = () => {
  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-2xl mx-auto animate-in fade-in slide-in-from-top-2">
      <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-900 dark:text-green-100 font-medium">
              Migration completed successfully! Your data is now synced to the cloud.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
