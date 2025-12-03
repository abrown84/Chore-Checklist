import React, { useState, useCallback, memo } from 'react'
import { useChores } from '../contexts/ChoreContext'
import { useUsers } from '../contexts/UserContext'
import { useStats } from '../hooks/useStats'
import { ChorePopupCelebration, usePopupCelebrations } from './ChorePopupCelebration'
import { ChoreFilters } from './chores/ChoreFilters'
import { ChoreDisplay } from './chores/ChoreDisplay'
import { useChoreList } from '../hooks/useChoreList'
import { useCurrentHousehold } from '../hooks/useCurrentHousehold'
import { useDemo } from '../contexts/DemoContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { Home, UserPlus } from 'lucide-react'

export const ChoreList: React.FC = memo(() => {
  const { state, completeChore, deleteChore } = useChores()
  const { state: userState } = useUsers()
  const { forceRefresh } = useStats()
  const householdId = useCurrentHousehold()
  const { isDemoMode } = useDemo()
  
  // Animation state
  const [animatingChores, setAnimatingChores] = useState<Set<string>>(new Set())
  const [completingChores, setCompletingChores] = useState<Set<string>>(new Set())

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

  const handleCompleteChore = useCallback((choreId: string, event?: React.MouseEvent) => {
    // Find the chore to get points
    const chore = state.chores.find(c => c.id === choreId)
    if (!chore) return

    
    
    // Add animation state
    setAnimatingChores(prev => new Set(prev).add(choreId))
    setCompletingChores(prev => new Set(prev).add(choreId))
    
    // Complete the chore with actual current user ID
    const currentUserId = userState.currentUser?.id
    if (!currentUserId) {
      console.warn('Chore completion attempted without a valid current user id. Aborting to preserve correct attribution.')
      return
    }
    
    // Complete the chore and then refresh stats
    Promise.resolve(completeChore(choreId, currentUserId))
      .then((result) => {
        console.log('✅ Chore completion result:', result)
        // Force stats refresh after chore completion to ensure points update
        // Convex queries are reactive and should update automatically,
        // but we'll trigger a refresh to ensure UI updates immediately
        setTimeout(() => {
          forceRefresh()
          console.log('🔄 Forced stats refresh after chore completion')
        }, 1000) // Increased delay to ensure backend has processed
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

    // Get click position and trigger multiple popup celebrations (like damage popups in games)
    if (event) {
      const points = chore.finalPoints || chore.points
      const clickX = event.clientX
      const clickY = event.clientY
      
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
  }, [completeChore, userState.currentUser, state.chores, userState.memberStats, addCelebration])

  const handleDeleteChore = useCallback((choreId: string) => {
    deleteChore(choreId)
  }, [deleteChore])

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
      {/* Popup Celebrations */}
      <ChorePopupCelebration
        celebrations={celebrations}
        onRemove={removeCelebration}
      />
      
      {/* Filters */}
      <ChoreFilters
        filter={choreListLogic.filter}
        categoryFilter={choreListLogic.categoryFilter}
        sortBy={choreListLogic.sortBy}
        categories={choreListLogic.categories}
        onFilterChange={choreListLogic.setFilter}
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
        onAnimationComplete={handleAnimationComplete}
        getCategoryStats={choreListLogic.getCategoryStats}
        filter={choreListLogic.filter}
        onFilterReset={handleFilterReset}
      />
    </div>
  )
})

ChoreList.displayName = 'ChoreList'
