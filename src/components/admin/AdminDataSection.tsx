import React, { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Id } from '../../../convex/_generated/dataModel'
import { toast } from 'sonner'
import {
  Shield,
  RotateCcw,
  Loader2,
  AlertTriangle,
} from 'lucide-react'

interface AdminDataSectionProps {
  householdId: Id<'households'>
}

export const AdminDataSection: React.FC<AdminDataSectionProps> = ({
  householdId,
}) => {
  const [showResetChoresConfirm, setShowResetChoresConfirm] = useState(false)
  const [showResetAllDataConfirm, setShowResetAllDataConfirm] = useState(false)
  const [isResettingChores, setIsResettingChores] = useState(false)
  const [isResettingAllData, setIsResettingAllData] = useState(false)

  const resetAllChores = useMutation(api.chores.resetAllChores)
  const resetAllData = useMutation(api.chores.resetAllData)

  const handleResetChores = async () => {
    if (!householdId) return
    setIsResettingChores(true)
    try {
      const result = await resetAllChores({ householdId })
      setShowResetChoresConfirm(false)
      toast.success(
        result.message ||
        `Successfully reset ${result.resetCount} chore(s) and added ${result.addedCount || 0} default chore(s).`
      )
    } catch (error) {
      console.error('Error resetting chores:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to reset chores. Please try again.')
    } finally {
      setIsResettingChores(false)
    }
  }

  const handleResetAllData = async () => {
    if (!householdId) return
    setIsResettingAllData(true)
    try {
      const result = await resetAllData({ householdId })
      setShowResetAllDataConfirm(false)
      toast.success(result.message || 'All data has been reset successfully.')
    } catch (error) {
      console.error('Error resetting all data:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to reset all data. Please try again.')
    } finally {
      setIsResettingAllData(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-600" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Reset Chores */}
          <div>
            <h3 className="font-medium text-orange-900 dark:text-orange-100 mb-2 flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Reset Chores
            </h3>
            <p className="text-sm text-orange-700 dark:text-orange-300 mb-3 break-words">
              Reset all completed chores back to pending status and add any missing default chores. This will clear completion data, update due dates based on each chore's category, and ensure all default chores are available.
            </p>
            <Button
              onClick={() => setShowResetChoresConfirm(true)}
              variant="outline"
              size="sm"
              className="border-orange-500 text-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900/50 font-semibold"
              disabled={isResettingChores}
            >
              {isResettingChores ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset All Chores
                </>
              )}
            </Button>
            {showResetChoresConfirm && (
              <div className="mt-3 p-3 bg-orange-100 dark:bg-orange-900/30 border-2 border-orange-400 rounded-lg">
                <p className="text-xs font-semibold text-orange-900 dark:text-orange-100 mb-2">
                  ⚠️ Confirm Reset
                </p>
                <p className="text-xs text-orange-800 dark:text-orange-200 mb-3 break-words">
                  This will reset all completed chores to pending status and add default chores:
                </p>
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-xs text-orange-800 dark:text-orange-200 mb-3">
                  <li>All completed chores will be set to pending</li>
                  <li>Completion data will be cleared</li>
                  <li>Due dates will be recalculated based on category</li>
                  <li>Default chores that don't exist will be added</li>
                  <li>Chore completion history will be preserved</li>
                </ul>
                <div className="flex space-x-2">
                  <Button
                    onClick={handleResetChores}
                    size="sm"
                    className="bg-orange-700 hover:bg-orange-800 flex-1 text-xs"
                    disabled={isResettingChores}
                  >
                    {isResettingChores ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      'Yes, Reset Chores'
                    )}
                  </Button>
                  <Button
                    onClick={() => setShowResetChoresConfirm(false)}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    disabled={isResettingChores}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-orange-300 dark:border-orange-700"></div>

          {/* Reset All Data */}
          <div>
            <h3 className="font-medium text-red-900 dark:text-red-100 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Reset All Data
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mb-3 break-words">
              This will permanently delete all chores, completion history, user stats, points, levels, redemption requests, and point deductions for this household. This action cannot be undone.
            </p>
            <Button
              onClick={() => setShowResetAllDataConfirm(true)}
              variant="outline"
              size="sm"
              className="border-red-500 text-red-700 hover:bg-red-100 dark:hover:bg-red-900/50 font-semibold"
              disabled={isResettingAllData}
            >
              {isResettingAllData ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset All Data
                </>
              )}
            </Button>
            {showResetAllDataConfirm && (
              <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/30 border-2 border-red-400 rounded-lg">
                <p className="text-xs font-semibold text-red-900 dark:text-red-100 mb-2">
                  ⚠️ WARNING: This action cannot be undone!
                </p>
                <p className="text-xs text-red-800 dark:text-red-200 mb-3 break-words">
                  Resetting all data will permanently delete:
                </p>
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-xs text-red-800 dark:text-red-200 mb-3">
                  <li>All chores (completed and pending)</li>
                  <li>All chore completion history</li>
                  <li>All user stats and statistics</li>
                  <li>All user points and levels (reset to 0 and 1)</li>
                  <li>All redemption requests</li>
                  <li>All point deduction records</li>
                </ul>
                <p className="text-xs font-semibold text-red-800 dark:text-red-200 mb-3">
                  Household members and settings will be preserved.
                </p>
                <div className="flex space-x-2">
                  <Button
                    onClick={handleResetAllData}
                    size="sm"
                    className="bg-red-700 hover:bg-red-800 flex-1 text-xs"
                    disabled={isResettingAllData}
                  >
                    {isResettingAllData ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      'Yes, Reset All Data'
                    )}
                  </Button>
                  <Button
                    onClick={() => setShowResetAllDataConfirm(false)}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    disabled={isResettingAllData}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
