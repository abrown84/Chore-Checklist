import React, { useState } from 'react'
import { useMigration } from '../hooks/useMigration'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { AlertCircle, CheckCircle, Loader2, Database } from 'lucide-react'

export const MigrationBanner: React.FC = () => {
  const { needsMigration, migrationReason, isMigrating, migrationError, migrateFromLocalStorage, instructions } = useMigration()
  const [showDetails, setShowDetails] = useState(false)

  if (!needsMigration) {
    return null
  }

  const handleMigration = async () => {
    try {
      await migrateFromLocalStorage()
      // The component will re-render and hide itself after successful migration
    } catch (error) {
      console.error('Migration failed:', error)
    }
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-2xl mx-auto">
      <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-orange-900 dark:text-orange-100">
              Data Migration Available
            </CardTitle>
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
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-700 dark:text-red-300">
                Migration failed: {migrationError}
              </span>
            </div>
          )}

          <div className="flex gap-2">
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

export const MigrationSuccess: React.FC = () => {
  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-2xl mx-auto">
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
