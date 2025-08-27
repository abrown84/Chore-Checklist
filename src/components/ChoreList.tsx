import React, { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { useChores } from '../contexts/ChoreContext'
import { useUsers } from '../contexts/UserContext'
import { LEVELS } from '../types/chore'
import { ChorePopupCelebration, usePopupCelebrations } from './ChorePopupCelebration'
import { ChoreHeader } from './chores/ChoreHeader'
import { ChoreFilters } from './chores/ChoreFilters'
import { ChoreDisplay } from './chores/ChoreDisplay'
import { useChoreList } from '../hooks/useChoreList'

export const ChoreList: React.FC = memo(() => {
  const { state, completeChore, deleteChore } = useChores()
  const { state: userState } = useUsers()
  
  // Get current user stats from the user state
  const currentUserStats = useMemo(() => {
    if (!userState.currentUser) return null
    return userState.memberStats.find(stats => stats.userId === userState.currentUser?.id) || null
  }, [userState.currentUser, userState.memberStats])
  
  // Get next level data for progress display
  const nextLevelData = useMemo(() => 
    LEVELS.find(level => level.level === (currentUserStats?.currentLevel || 1) + 1), 
    [currentUserStats?.currentLevel]
  )
  
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

  // Trigger stats recalculation when chores change
  useEffect(() => {
    // Stats are automatically recalculated in the context
  }, [state.chores])

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
    completeChore(choreId, currentUserId)

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

  return (
    <div className="space-y-6">
      {/* Popup Celebrations */}
      <ChorePopupCelebration
        celebrations={celebrations}
        onRemove={removeCelebration}
      />
      
      {/* Header with stats and controls */}
      <ChoreHeader
        currentLevel={currentUserStats?.currentLevel || 1}
        currentLevelPoints={currentUserStats?.currentLevelPoints || 0}
        nextLevelPoints={nextLevelData?.pointsRequired || 100}
        viewMode={choreListLogic.viewMode}
        groupByCategory={choreListLogic.groupByCategory}
        onViewModeChange={choreListLogic.setViewMode}
        onGroupByCategoryChange={choreListLogic.setGroupByCategory}
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
