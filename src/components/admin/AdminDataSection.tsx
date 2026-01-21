import React, { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Id } from '../../../convex/_generated/dataModel'
import { toast } from 'sonner'
import { CircleNotch, Warning, XCircle, Shield, Trash, CheckCircle, ArrowCounterClockwise } from '@phosphor-icons/react'

interface AdminDataSectionProps {
  householdId: Id<'households'>
}

type ResetType = 'chores' | 'all' | null

export const AdminDataSection: React.FC<AdminDataSectionProps> = ({ householdId }) => {
  const [activeReset, setActiveReset] = useState<ResetType>(null)
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ type: ResetType; success: boolean; message: string } | null>(null)

  const resetAllChores = useMutation(api.chores.resetAllChores)
  const resetAllData = useMutation(api.chores.resetAllData)

  const handleResetChores = async () => {
    setLoading(true)
    setResult(null)
    try {
      const res = await resetAllChores({ householdId })
      setResult({
        type: 'chores',
        success: true,
        message: `Reset ${res.resetCount} chores to pending. Added ${res.addedCount || 0} default chores.`
      })
      toast.success('Chores reset successfully')
    } catch (error) {
      setResult({
        type: 'chores',
        success: false,
        message: error instanceof Error ? error.message : 'Failed to reset chores'
      })
      toast.error('Reset failed')
    } finally {
      setLoading(false)
      setActiveReset(null)
      setConfirmText('')
    }
  }

  const handleResetAll = async () => {
    setLoading(true)
    setResult(null)
    try {
      const res = await resetAllData({ householdId })
      setResult({
        type: 'all',
        success: true,
        message: res.message || `All data reset. Added ${res.addedChoresCount || 0} default chores.`
      })
      toast.success('All data reset successfully')
    } catch (error) {
      setResult({
        type: 'all',
        success: false,
        message: error instanceof Error ? error.message : 'Failed to reset data'
      })
      toast.error('Reset failed')
    } finally {
      setLoading(false)
      setActiveReset(null)
      setConfirmText('')
    }
  }

  const closeModal = () => {
    if (!loading) {
      setActiveReset(null)
      setConfirmText('')
    }
  }

  return (
    <>
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm">Data Management</h3>
          </div>

          {/* Result Banner */}
          {result && (
            <div className={`p-3 rounded-lg flex items-start gap-3 ${
              result.success
                ? 'bg-green-500/10 border border-green-500/30'
                : 'bg-red-500/10 border border-red-500/30'
            }`}>
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={`text-sm font-medium ${result.success ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                  {result.success ? 'Operation Complete' : 'Operation Failed'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{result.message}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 shrink-0"
                onClick={() => setResult(null)}
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Reset Options */}
          <div className="grid gap-3">
            {/* Reset Chores Card */}
            <button
              onClick={() => setActiveReset('chores')}
              className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <ArrowCounterClockwise className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-amber-700 dark:text-amber-400">Reset Chores</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Reset completed chores to pending and restore defaults
                  </p>
                </div>
                <div className="text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  →
                </div>
              </div>
            </button>

            {/* Reset All Data Card */}
            <button
              onClick={() => setActiveReset('all')}
              className="p-4 rounded-lg border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/20">
                  <Trash className="w-4 h-4 text-red-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-red-700 dark:text-red-400">Reset All Data</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Permanently delete all chores, stats, points, and history
                  </p>
                </div>
                <div className="text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  →
                </div>
              </div>
            </button>
          </div>

          <p className="text-[10px] text-muted-foreground text-center pt-2">
            Household members and account settings are always preserved
          </p>
        </CardContent>
      </Card>

      {/* Modal Backdrop */}
      {activeReset && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          {/* Modal Content */}
          <div
            className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {activeReset === 'chores' ? (
              <>
                {/* Reset Chores Modal */}
                <div className="p-6 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-amber-500/20">
                      <ArrowCounterClockwise className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">Reset Chores</h2>
                      <p className="text-sm text-muted-foreground">Restore chores to their initial state</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="text-sm text-muted-foreground">
                    This action will:
                  </div>
                  <ul className="space-y-2">
                    {[
                      'Reset all completed chores back to pending',
                      'Recalculate due dates based on chore category',
                      'Add any missing default chores',
                      'Preserve chore completion history',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="pt-2 flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={closeModal}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 bg-amber-600 hover:bg-amber-700"
                      onClick={handleResetChores}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <CircleNotch className="w-4 h-4 mr-2 animate-spin" />
                          Resetting...
                        </>
                      ) : (
                        'Reset Chores'
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Reset All Data Modal */}
                <div className="p-6 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-red-500/20">
                      <Warning className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-red-600">Destructive Action</h2>
                      <p className="text-sm text-muted-foreground">This cannot be undone</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                      All household data will be permanently deleted:
                    </p>
                  </div>

                  <ul className="space-y-2">
                    {[
                      'All chores (completed and pending)',
                      'Complete chore history and statistics',
                      'All user points and levels (reset to 0)',
                      'All redemption requests',
                      'All point adjustment records',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <p className="text-sm text-green-700 dark:text-green-400 font-medium flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Default chores will be added after reset
                    </p>
                  </div>

                  <div className="pt-2">
                    <label className="text-sm font-medium block mb-2">
                      Type <span className="font-mono text-red-600">DELETE</span> to confirm:
                    </label>
                    <Input
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder="DELETE"
                      className="font-mono"
                      disabled={loading}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={closeModal}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={handleResetAll}
                      disabled={loading || confirmText !== 'DELETE'}
                    >
                      {loading ? (
                        <>
                          <CircleNotch className="w-4 h-4 mr-2 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        'Delete All Data'
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
