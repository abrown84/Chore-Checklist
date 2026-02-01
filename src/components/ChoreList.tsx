import React, { useState, useCallback, memo } from 'react'
import { useChores } from '../contexts/ChoreContext'
import { useUsers } from '../contexts/UserContext'
import { useStats } from '../hooks/useStats'
import { ChorePopupCelebration, usePopupCelebrations } from './ChorePopupCelebration'
import { ChoreFilters } from './chores/ChoreFilters'
import { ChoreDisplay } from './chores/ChoreDisplay'
import { PhotoUploadDialog } from './chores/PhotoUploadDialog'
import { useChoreList } from '../hooks/useChoreList'
import { useCurrentHousehold } from '../hooks/useCurrentHousehold'
import { useDemo } from '../contexts/DemoContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { House, UserPlus } from '@phosphor-icons/react'
import { Chore } from '../types/chore'

// Module-level celebration tracker - persists across renders and HMR
const celebratedChores = new Map<string, number>()

export const ChoreList: React.FC = memo(() => {
  const { state, completeChore, deleteChore, updateChore, reorderChores } = useChores()
  const { state: userState } = useUsers()
  const { forceRefresh } = useStats()
  const householdId = useCurrentHousehold()
  const { isDemoMode } = useDemo()

  // Animation state
  const [animatingChores, setAnimatingChores] = useState<Set<string>>(new Set())
  const [completingChores, setCompletingChores] = useState<Set<string>>(new Set())

  // Photo upload state
  const [photoUploadChore, setPhotoUploadChore] = useState<{ id: string; title: string; clickX: number; clickY: number } | null>(null)

  // Popup celebration hook
  const { celebrations, addCelebration, removeCelebration } = usePopupCelebrations()

  // Helper to trigger celebration only once per chore (uses module-level tracker)
  const triggerCelebration = useCallback((
    choreId: string,
    points: number,
    choreTitle: string,
    clickX: number,
    clickY: number,
    celebrationType: 'points' | 'bonus' | 'streak' | 'level'
  ) => {
    const now = Date.now()
    const lastCelebrated = celebratedChores.get(choreId)

    // Block if celebrated within the last 2 seconds
    if (lastCelebrated && now - lastCelebrated < 2000) {
      console.log('[Celebration] BLOCKED duplicate for chore:', choreId, 'time since last:', now - lastCelebrated, 'ms')
      return
    }

    // Mark as celebrated with timestamp
    celebratedChores.set(choreId, now)
    console.log('[Celebration] Triggering for chore:', choreId)

    // Trigger the celebration
    addCelebration(points, choreTitle, clickX, clickY, celebrationType)

    // Clean up old entries after 10 seconds
    setTimeout(() => {
      const timestamp = celebratedChores.get(choreId)
      if (timestamp && Date.now() - timestamp >= 10000) {
        celebratedChores.delete(choreId)
      }
    }, 10000)
  }, [addCelebration])

  // Simple close handler for dialog (no celebration trigger)
  const handleClosePhotoDialog = useCallback(() => {
    setPhotoUploadChore(null)
  }, [])

  // Custom hook for chore list logic
  const choreListLogic = useChoreList({
    chores: state.chores,
    animatingChores,
    completingChores
  })

  // Stats are automatically recalculated in the context when chores change
  // No need for explicit effect

  const handleCompleteChore = useCallback((choreId: string, event?: React.MouseEvent) => {
    console.log('[DEBUG] handleCompleteChore called:', choreId)
    // Find the chore to get points
    const chore = state.chores.find(c => c.id === choreId)
    if (!chore) return

    // Prevent double-trigger if dialog is already open for this chore
    if (photoUploadChore?.id === choreId) {
      console.log('[DEBUG] Skipping - dialog already open for this chore')
      return
    }

    // Capture click coordinates or use center of screen as fallback
    const clickX = event?.clientX ?? window.innerWidth / 2
    const clickY = event?.clientY ?? window.innerHeight / 2

    // Show photo upload dialog first (optional)
    console.log('[DEBUG] Opening photo dialog for:', choreId)
    setPhotoUploadChore({ id: choreId, title: chore.title, clickX, clickY })
  }, [state.chores, photoUploadChore?.id])

  const handlePhotoUploaded = useCallback(async (storageId: string) => {
    if (!photoUploadChore) return

    const choreId = photoUploadChore.id
    
    // Add animation state
    setAnimatingChores(prev => new Set(prev).add(choreId))
    setCompletingChores(prev => new Set(prev).add(choreId))
    
    // Complete the chore with actual current user ID and photo
    const currentUserId = userState.currentUser?.id
    if (!currentUserId) {
      console.warn('Chore completion attempted without a valid current user id. Aborting to preserve correct attribution.')
      setPhotoUploadChore(null)
      return
    }
    
    // Complete the chore with photo and then refresh stats
    const chore = state.chores.find(c => c.id === choreId)
    if (!chore) {
      setPhotoUploadChore(null)
      return
    }

    Promise.resolve(completeChore(choreId, currentUserId, storageId))
      .then((result: any) => {
        console.log('✅ Chore completion result:', result)
        if (result && typeof result === 'object' && 'finalPoints' in result) {
          console.log(`✅ Points awarded: ${result.finalPoints}`)
        }

        // Check if user leveled up from backend
        console.log('[LevelUp] Checking result for leveledUp:', {
          hasResult: !!result,
          leveledUp: result?.leveledUp,
          newLevel: result?.newLevel,
          previousLevel: result?.previousLevel,
          fullResult: result
        })

        if (result?.leveledUp) {
          console.log(`🎉 DISPATCHING LEVEL UP EVENT! ${result.previousLevel} → ${result.newLevel}`)
          // Dispatch custom event for LevelUpCelebration to catch
          window.dispatchEvent(new CustomEvent('levelUp', {
            detail: {
              newLevel: result.newLevel,
              previousLevel: result.previousLevel
            }
          }))
        } else {
          console.log('[LevelUp] No level up in result')
        }

        // Convex queries are reactive and will automatically update when the userStats table changes
        // The completeChore mutation already calls calculateUserStats which updates the stats
        // No need to force refresh - it may cause race conditions or overwrite the stats
        // The query will automatically refresh when the stats are saved
      })
      .catch((error) => {
        console.error('❌ Error completing chore:', error)
        // Remove animation state on error
        setAnimatingChores(prev => {
          const newSet = new Set(prev)
          newSet.delete(choreId)
          return newSet
        })
        setCompletingChores(prev => {
          const newSet = new Set(prev)
          newSet.delete(choreId)
          return newSet
        })
      })
      .finally(() => {
        setPhotoUploadChore(null)
      })

    // Trigger celebration (guarded against duplicates)
    if (chore && photoUploadChore) {
      const points = chore.finalPoints || chore.points
      let celebrationType: 'points' | 'bonus' | 'streak' | 'level' = 'points'
      if (chore.bonusMessage) celebrationType = 'bonus'
      const userStats = userState.memberStats.find(stats => stats.userId === currentUserId)
      if (userStats && points >= 30) celebrationType = 'streak'

      triggerCelebration(choreId, points, chore.title, photoUploadChore.clickX, photoUploadChore.clickY, celebrationType)
    }
    
    // Remove animation state after a delay - should match the completion animation duration
    setTimeout(() => {
      setAnimatingChores(prev => {
        const newSet = new Set(prev)
        newSet.delete(choreId)
        return newSet
      })
      }, 500) // Match the 500ms completion animation duration
  }, [completeChore, userState.currentUser, state.chores, userState.memberStats, triggerCelebration, photoUploadChore])

  const handleSkipPhoto = useCallback(async () => {
    if (!photoUploadChore) return

    const choreId = photoUploadChore.id
    
    // Add animation state
    setAnimatingChores(prev => new Set(prev).add(choreId))
    setCompletingChores(prev => new Set(prev).add(choreId))
    
    // Complete the chore without photo
    const currentUserId = userState.currentUser?.id
    if (!currentUserId) {
      console.warn('Chore completion attempted without a valid current user id. Aborting to preserve correct attribution.')
      setPhotoUploadChore(null)
      return
    }
    
    const chore = state.chores.find(c => c.id === choreId)
    if (!chore) {
      setPhotoUploadChore(null)
      return
    }

    Promise.resolve(completeChore(choreId, currentUserId))
      .then((result: any) => {
        console.log('✅ Chore completion result (skip photo):', result)
        if (result && typeof result === 'object' && 'finalPoints' in result) {
          console.log(`✅ Points awarded: ${result.finalPoints}`)
        }

        // Check if user leveled up from backend
        console.log('[LevelUp] Checking result for leveledUp:', {
          hasResult: !!result,
          leveledUp: result?.leveledUp,
          newLevel: result?.newLevel,
          previousLevel: result?.previousLevel,
          fullResult: result
        })

        if (result?.leveledUp) {
          console.log(`🎉 DISPATCHING LEVEL UP EVENT! ${result.previousLevel} → ${result.newLevel}`)
          // Dispatch custom event for LevelUpCelebration to catch
          window.dispatchEvent(new CustomEvent('levelUp', {
            detail: {
              newLevel: result.newLevel,
              previousLevel: result.previousLevel
            }
          }))
        } else {
          console.log('[LevelUp] No level up in result')
        }

        // Convex queries are reactive and will automatically update when the userStats table changes
        // The completeChore mutation already calls calculateUserStats which updates the stats
        // No need to force refresh - it may cause race conditions or overwrite the stats
      })
      .catch((error) => {
        console.error('❌ Error completing chore:', error)
        setAnimatingChores(prev => {
          const newSet = new Set(prev)
          newSet.delete(choreId)
          return newSet
        })
        setCompletingChores(prev => {
          const newSet = new Set(prev)
          newSet.delete(choreId)
          return newSet
        })
      })
      .finally(() => {
        setPhotoUploadChore(null)
      })

    // Trigger celebration (guarded against duplicates)
    if (photoUploadChore) {
      const points = chore.finalPoints || chore.points
      let celebrationType: 'points' | 'bonus' | 'streak' | 'level' = 'points'
      if (chore.bonusMessage) celebrationType = 'bonus'
      const userStats = userState.memberStats.find(stats => stats.userId === currentUserId)
      if (userStats && points >= 30) celebrationType = 'streak'

      triggerCelebration(choreId, points, chore.title, photoUploadChore.clickX, photoUploadChore.clickY, celebrationType)
    }

    setTimeout(() => {
      setAnimatingChores(prev => {
        const newSet = new Set(prev)
        newSet.delete(choreId)
        return newSet
      })
    }, 500)
  }, [completeChore, userState.currentUser, state.chores, userState.memberStats, triggerCelebration, photoUploadChore])

  const handleDeleteChore = useCallback((choreId: string) => {
    deleteChore(choreId)
  }, [deleteChore])

  const handleEditChore = useCallback(async (updatedChore: Chore) => {
    try {
      await updateChore(updatedChore)
    } catch (error) {
      console.error('Error updating chore:', error)
    }
  }, [updateChore])

  const handleAnimationComplete = useCallback((choreId: string) => {
    
    setCompletingChores(prev => {
      const newSet = new Set(prev)
      newSet.delete(choreId)
      return newSet
    })
  }, [])

  const handleFilterReset = useCallback(() => {
    choreListLogic.setFilter('all')
  }, [choreListLogic])

  const handleReorder = useCallback(async (category: string, choreIds: string[]) => {
    try {
      await reorderChores(category, choreIds)
    } catch (error) {
      console.error('Error reordering chores:', error)
    }
  }, [reorderChores])

  // Show message if user is not in a household (but skip in demo mode)
  if (!householdId && !isDemoMode) {
    return (
      <Card className="border-2 border-dashed border-primary/30">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <House className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Join a Household to See Chores</CardTitle>
          <CardDescription className="text-base mt-2">
            You need to be part of a household to view and manage chores. Join an existing household or create a new one to get started!
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <div className="flex items-center justify-center text-sm text-muted-foreground">
              <UserPlus className="w-4 h-4 mr-2" />
              <span>Go to the <strong>Household</strong> tab to join or create a household</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Photo Upload Dialog */}
      {photoUploadChore && (
        <PhotoUploadDialog
          open={!!photoUploadChore}
          onClose={handleClosePhotoDialog}
          onSkip={handleSkipPhoto}
          onPhotoUploaded={handlePhotoUploaded}
          choreTitle={photoUploadChore.title}
        />
      )}
      
      {/* Popup Celebrations */}
      <ChorePopupCelebration
        celebrations={celebrations}
        onRemove={removeCelebration}
      />
      
      {/* Filters */}
      <ChoreFilters
        filter={choreListLogic.filter}
        deadlineFilter={choreListLogic.deadlineFilter}
        categoryFilter={choreListLogic.categoryFilter}
        sortBy={choreListLogic.sortBy}
        categories={choreListLogic.categories}
        onFilterChange={choreListLogic.setFilter}
        onDeadlineFilterChange={choreListLogic.setDeadlineFilter}
        onCategoryFilterChange={choreListLogic.setCategoryFilter}
        onSortByChange={choreListLogic.setSortBy}
      />

      {/* Chores Display */}
      <ChoreDisplay
        groupedChores={choreListLogic.groupedChores}
        groupByCategory={choreListLogic.groupByCategory}
        viewMode={choreListLogic.viewMode}
        animatingChores={animatingChores}
        completingChores={completingChores}
        onComplete={handleCompleteChore}
        onDelete={handleDeleteChore}
        onEdit={handleEditChore}
        onAnimationComplete={handleAnimationComplete}
        getCategoryStats={choreListLogic.getCategoryStats}
        filter={choreListLogic.filter}
        onFilterReset={handleFilterReset}
        sortBy={choreListLogic.sortBy}
        onReorder={handleReorder}
      />
    </div>
  )
})

ChoreList.displayName = 'ChoreList'
