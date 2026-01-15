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
import { Home, UserPlus } from 'lucide-react'
import { Chore } from '../types/chore'

export const ChoreList: React.FC = memo(() => {
  const { state, completeChore, deleteChore, updateChore } = useChores()
  const { state: userState } = useUsers()
  const { forceRefresh } = useStats()
  const householdId = useCurrentHousehold()
  const { isDemoMode } = useDemo()
  
  // Animation state
  const [animatingChores, setAnimatingChores] = useState<Set<string>>(new Set())
  const [completingChores, setCompletingChores] = useState<Set<string>>(new Set())
  
  // Photo upload state
  const [photoUploadChore, setPhotoUploadChore] = useState<{ id: string; title: string } | null>(null)

  // Popup celebration hook
  const { celebrations, addCelebration, removeCelebration } = usePopupCelebrations()

  // Custom hook for chore list logic
  const choreListLogic = useChoreList({
    chores: state.chores,
    animatingChores,
    completingChores
  })

  // Stats are automatically recalculated in the context when chores change
  // No need for explicit effect

  const handleCompleteChore = useCallback((choreId: string, _event?: React.MouseEvent) => {
    // Find the chore to get points
    const chore = state.chores.find(c => c.id === choreId)
    if (!chore) return

    // Show photo upload dialog first (optional)
    setPhotoUploadChore({ id: choreId, title: chore.title })
  }, [state.chores])

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
        import.meta.env.DEV && console.log('✅ Chore completion result:', result)
        if (result && typeof result === 'object' && 'finalPoints' in result) {
          import.meta.env.DEV && console.log(`✅ Points awarded: ${result.finalPoints}`)
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

    // Get click position and trigger multiple popup celebrations (like damage popups in games)
    // Note: event might not be available when called from photo upload, use center of screen
    if (chore) {
      const points = chore.finalPoints || chore.points
      // Use center of screen for celebrations when called from photo upload (no event)
      const clickX = window.innerWidth / 2
      const clickY = window.innerHeight / 2
      
      // Determine celebration type based on various factors
      let celebrationType: 'points' | 'bonus' | 'streak' | 'level' = 'points'
      
      // Check if this is a streak or special completion
      if (chore.bonusMessage) {
        celebrationType = 'bonus'
      }
      
      // Check if user leveled up (you might want to add level tracking logic here)
      const userStats = userState.memberStats.find(stats => stats.userId === currentUserId)
      if (userStats && points >= 30) { // High value chores might indicate level potential
        celebrationType = 'streak'
      }
      
      // Trigger the damage popup style celebration
      addCelebration(points, chore.title, clickX, clickY, celebrationType)
      
      // For extra special chores, add some additional celebration popups
      if (points >= 25) {
        // Add some extra "critical hit" style popups around the main one
        setTimeout(() => {
          addCelebration(
            Math.floor(points * 0.4), 
            'BONUS!', 
            clickX + (Math.random() - 0.5) * 100,
            clickY + (Math.random() - 0.5) * 80,
            'bonus'
          )
        }, 150)
      }
    }
    
    // Remove animation state after a delay - should match the completion animation duration
    setTimeout(() => {
      setAnimatingChores(prev => {
        const newSet = new Set(prev)
        newSet.delete(choreId)
        return newSet
      })
      }, 500) // Match the 500ms completion animation duration
  }, [completeChore, userState.currentUser, state.chores, userState.memberStats, addCelebration, photoUploadChore])

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
        import.meta.env.DEV && console.log('✅ Chore completion result:', result)
        if (result && typeof result === 'object' && 'finalPoints' in result) {
          import.meta.env.DEV && console.log(`✅ Points awarded: ${result.finalPoints}`)
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

    // Trigger celebrations
    const points = chore.finalPoints || chore.points
    const userStats = userState.memberStats.find(stats => stats.userId === currentUserId)
    let celebrationType: 'points' | 'bonus' | 'streak' | 'level' = 'points'
    if (chore.bonusMessage) {
      celebrationType = 'bonus'
    }
    if (userStats && points >= 30) {
      celebrationType = 'streak'
    }
    // Use center of screen for celebrations when no event available
    addCelebration(points, chore.title, window.innerWidth / 2, window.innerHeight / 2, celebrationType)

    setTimeout(() => {
      setAnimatingChores(prev => {
        const newSet = new Set(prev)
        newSet.delete(choreId)
        return newSet
      })
    }, 500)
  }, [completeChore, userState.currentUser, state.chores, userState.memberStats, addCelebration, photoUploadChore, forceRefresh])

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

  // Show message if user is not in a household (but skip in demo mode)
  if (!householdId && !isDemoMode) {
    return (
      <Card className="border-2 border-dashed border-primary/30">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Home className="w-8 h-8 text-primary" />
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
          onClose={handleSkipPhoto}
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
      />
    </div>
  )
})

ChoreList.displayName = 'ChoreList'
