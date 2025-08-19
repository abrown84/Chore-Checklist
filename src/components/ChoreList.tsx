import React, { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { useChores } from '../contexts/ChoreContext'
import { useUsers } from '../contexts/UserContext'
import { Chore, DIFFICULTY_COLORS, PRIORITY_COLORS, CATEGORY_COLORS, LEVELS } from '../types/chore'
import { CheckCircle, Trash2, Calendar, Clock, Target, Filter, Crown, Star, Trophy } from 'lucide-react'
import { isOverdue as checkIsOverdue, getCurrentDueStatus, normalizeDueDate } from '../utils/dateHelpers'
import { ChorePopupCelebration, usePopupCelebrations } from './ChorePopupCelebration'

// Memoized chore item component to prevent unnecessary re-renders
const ChoreItem = memo<{
  chore: Chore
  onComplete: (id: string, event?: React.MouseEvent) => void
  onDelete: (id: string) => void
  isAnimating: boolean
  isCompleting: boolean
  onAnimationComplete: (id: string) => void
  index: number
}>(({ chore, onComplete, onDelete, isAnimating, isCompleting, onAnimationComplete, index }) => {
  const isOverdue = chore.dueDate ? checkIsOverdue(chore.dueDate) : false
  const dueStatus = chore.dueDate ? getCurrentDueStatus(chore.dueDate) : null
  
  // Handle animation completion
  useEffect(() => {
    if (isCompleting) {
      const timer = setTimeout(() => {
        onAnimationComplete(chore.id)
      }, 500) // Fade out duration
      return () => clearTimeout(timer)
    }
  }, [isCompleting, chore.id, onAnimationComplete])
  
  return (
    <div
      className={`transition-all duration-500 ease-in-out ${
        isCompleting 
          ? 'opacity-0 scale-95 -translate-y-2 max-h-0 overflow-hidden' 
          : 'opacity-100 scale-100 translate-y-0 max-h-[500px]'
      }`}
      style={{
        transitionDelay: isCompleting ? '0ms' : `${index * 50}ms`
      }}
    >
      <Card 
        key={chore.id} 
        className={`transition-all duration-300 bg-card/80 backdrop-blur-sm border ${
          isAnimating ? 'scale-105 shadow-lg' : 'hover:shadow-md'
        } ${
          chore.completed 
            ? 'bg-success/10 border-success/30 dark:bg-success/10 dark:border-success/30' 
            : isOverdue 
              ? 'bg-destructive/10 border-destructive/30 dark:bg-destructive/10 dark:border-destructive/30' 
              : `${CATEGORY_COLORS[chore.category]} hover:shadow-lg`
        } ${
          !chore.completed ? 'cursor-pointer' : 'cursor-default'
        }`}
        onClick={(e) => !chore.completed && onComplete(chore.id, e)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className={`font-semibold text-lg ${
                  chore.completed ? 'line-through text-gray-500' : 'text-gray-900'
                }`}>
                  {chore.title}
                </h3>
                {chore.completed && chore.bonusMessage && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {chore.bonusMessage}
                  </span>
                )}
              </div>
              
              <p className={`text-sm mb-3 ${
                chore.completed ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {chore.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  DIFFICULTY_COLORS[chore.difficulty]
                }`}>
                  {chore.difficulty}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  PRIORITY_COLORS[chore.priority]
                }`}>
                  {chore.priority}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  chore.category === 'daily' ? 'bg-emerald-100 text-emerald-800' :
                  chore.category === 'weekly' ? 'bg-blue-100 text-blue-800' :
                  chore.category === 'monthly' ? 'bg-purple-100 text-purple-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {chore.category}
                </span>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                  {chore.points} pts
                </span>
              </div>
              
              {chore.dueDate && (
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                  <Calendar className="w-4 h-4" />
                  <span>Due: {normalizeDueDate(chore.dueDate).toLocaleDateString()}</span>
                  {dueStatus && (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      dueStatus.type === 'overdue' ? 'bg-red-100 text-red-800' :
                      dueStatus.type === 'due-soon' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {dueStatus.type === 'overdue' ? 'Overdue' :
                       dueStatus.type === 'due-soon' ? 'Due Soon' : 'On Time'}
                    </span>
                  )}
                </div>
              )}
              
              {chore.completed && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>Completed: {chore.completedAt?.toLocaleDateString()}</span>
                  {chore.completedBy && (
                    <span>by {chore.completedBy}</span>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex flex-col items-end space-y-2 ml-4">
              {!chore.completed ? (
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    onComplete(chore.id, e)
                  }}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  title="Mark as complete"
                >
                  <CheckCircle className="w-4 h-4" />
                </Button>
              ) : (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">Completed!</span>
                </div>
              )}
              
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(chore.id)
                }}
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Delete chore"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})

ChoreItem.displayName = 'ChoreItem'

export const ChoreList: React.FC = memo(() => {
  const { state, completeChore, deleteChore } = useChores()
  const { state: userState } = useUsers()
  
  // Get current user stats from the user state
  const currentUserStats = useMemo(() => {
    if (!userState.currentUser) return null
    return userState.memberStats.find(stats => stats.userId === userState.currentUser?.id) || null
  }, [userState.currentUser, userState.memberStats])
  
  // Stats are automatically recalculated in the context
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'priority' | 'difficulty' | 'dueDate'>('priority')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [groupByCategory, setGroupByCategory] = useState<boolean>(true)
  const [animatingChores, setAnimatingChores] = useState<Set<string>>(new Set())
  const [completingChores, setCompletingChores] = useState<Set<string>>(new Set())

  // Popup celebration hook
  const { celebrations, addCelebration, removeCelebration } = usePopupCelebrations()



  // Get next level data for progress display
  const nextLevelData = useMemo(() => 
    LEVELS.find(level => level.level === (currentUserStats?.currentLevel || 1) + 1), 
    [currentUserStats?.currentLevel]
  )
  
  // Get level icon based on level
  const getLevelIcon = useCallback((level: number) => {
    if (level >= 10) return <Crown className="w-6 h-6 text-amber-600" />
    if (level >= 8) return <Crown className="w-6 h-6 text-pink-600" />
    if (level >= 6) return <Trophy className="w-6 h-6 text-red-600" />
    if (level >= 4) return <Star className="w-6 h-6 text-purple-600" />
    return <Target className="w-6 h-6 text-blue-600" />
  }, [])

  // Trigger stats recalculation when chores change
  useEffect(() => {
    // Stats are automatically recalculated in the context
  }, [state.chores])

  // Get unique categories for filtering
  const categories = useMemo(() => 
    ['all', ...Array.from(new Set(state.chores.map(chore => chore.category)))], 
    [state.chores]
  )

  // Get category stats
  const getCategoryStats = useCallback((category: string) => {
    if (category === 'all') {
      return {
        total: state.chores.length,
        completed: state.chores.filter(c => c.completed).length,
        pending: state.chores.filter(c => !c.completed).length
      }
    }
    
    const categoryChores = state.chores.filter(c => c.category === category)
    return {
      total: categoryChores.length,
      completed: categoryChores.filter(c => c.completed).length,
      pending: categoryChores.filter(c => !c.completed).length
    }
  }, [state.chores])

  const filteredChores = useMemo(() => {
    const filtered = state.chores.filter(chore => {
      // Category filter
      if (categoryFilter !== 'all' && chore.category !== categoryFilter) return false
      
      // Don't show chores that are in the process of completing
      if (completingChores.has(chore.id)) return false
      
      // Show animating chores regardless of completion status
      if (animatingChores.has(chore.id)) return true
      
      // Status filter
      switch (filter) {
        case 'pending':
          return !chore.completed
        case 'completed':
          return chore.completed
        case 'all':
        default:
          return true // Show all chores when filter is 'all'
      }
    })
    
      // Debug logging to help identify filtering issues
  console.log('Filter state:', { 
    filter, 
    categoryFilter, 
    totalChores: state.chores.length, 
    filteredCount: filtered.length, 
    completedCount: state.chores.filter(c => c.completed).length,
    animatingCount: animatingChores.size,
    completingCount: completingChores.size
  })
    
    return filtered
  }, [state.chores, categoryFilter, filter, animatingChores, completingChores])

  const sortedChores = useMemo(() => {
    return [...filteredChores].sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case 'difficulty':
          const difficultyOrder = { hard: 3, medium: 2, easy: 1 }
          return difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty]
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        default:
          return 0
      }
    })
  }, [filteredChores, sortBy])

  const handleCompleteChore = useCallback((choreId: string, event?: React.MouseEvent) => {
    // Find the chore to get points
    const chore = state.chores.find(c => c.id === choreId)
    if (!chore) return

    console.log('Starting completion animation for chore:', choreId, chore.title)
    
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
    console.log('Animation completed for chore:', choreId)
    setCompletingChores(prev => {
      const newSet = new Set(prev)
      newSet.delete(choreId)
      return newSet
    })
  }, [])



  const groupedChores = useMemo(() => {
    if (!groupByCategory) return { 'All Chores': sortedChores }
    
    // When grouping by category, we need to apply the same filtering logic
    const grouped: { [key: string]: Chore[] } = {}
    
    filteredChores.forEach(chore => {
      if (!grouped[chore.category]) {
        grouped[chore.category] = []
      }
      grouped[chore.category].push(chore)
    })
    
    return grouped
  }, [groupByCategory, sortedChores, filteredChores])

  return (
    <div className="space-y-6">
      {/* Popup Celebrations */}
      <ChorePopupCelebration
        celebrations={celebrations}
        onRemove={removeCelebration}
      />
      {/* Header with stats and controls */}
      <div className="bg-gradient-to-br from-primary/10 via-chart-4/10 to-accent/10 rounded-lg shadow-sm border border-primary/20 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {getLevelIcon(currentUserStats?.currentLevel || 1)}
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Level {currentUserStats?.currentLevel || 1}
                </h2>
                <p className="text-sm text-gray-600">
                  {currentUserStats?.currentLevelPoints || 0} / {nextLevelData?.pointsRequired || 100} points to next level
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              variant="outline"
              size="sm"
              title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
            >
              {viewMode === 'grid' ? '📋' : '🔲'}
            </Button>
            <Button
              onClick={() => setGroupByCategory(!groupByCategory)}
              variant="outline"
              size="sm"
              title={groupByCategory ? 'Ungroup chores' : 'Group by category'}
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card/80 backdrop-blur-sm rounded-lg shadow-sm border p-4">
        <div className="flex flex-wrap gap-4">
          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <div className="flex space-x-1">
              {(['all', 'pending', 'completed'] as const).map((status) => (
                <Button
                  key={status}
                  onClick={() => setFilter(status)}
                  variant={filter === status ? 'default' : 'outline'}
                  size="sm"
                  className="capitalize"
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((category) => (
                <option key={category} value={category} className="capitalize">
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'priority' | 'difficulty' | 'dueDate')}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="priority">Priority</option>
              <option value="difficulty">Difficulty</option>
              <option value="dueDate">Due Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chores Display */}
      <div className="space-y-6">
        {Object.entries(groupedChores).map(([category, chores]) => (
          <div key={category} className="space-y-4">
            {groupByCategory && (
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 capitalize">
                  {category} Chores
                </h3>
                <div className="text-sm text-gray-600">
                  {getCategoryStats(category).completed} / {getCategoryStats(category).total} completed
                </div>
              </div>
            )}
            
            <div className={`grid gap-4 transition-all duration-500 ease-in-out ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {chores.map((chore, index) => (
                <ChoreItem
                  key={chore.id}
                  chore={chore}
                  onComplete={handleCompleteChore}
                  onDelete={handleDeleteChore}
                  isAnimating={animatingChores.has(chore.id)}
                  isCompleting={completingChores.has(chore.id)}
                  onAnimationComplete={handleAnimationComplete}
                  index={index}
                />
              ))}
            </div>
          </div>
        ))}
        
        {sortedChores.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No chores found</h3>
            <p className="text-gray-600 mb-4">
              {filter === 'completed' 
                ? "You haven't completed any chores yet. Keep up the good work!"
                : filter === 'pending'
                ? "All chores are completed! Great job!"
                : "No chores match your current filters. Try adjusting your search criteria."
              }
            </p>
            {filter !== 'all' && (
              <Button
                onClick={() => setFilter('all')}
                variant="outline"
                size="sm"
              >
                Show all chores
              </Button>
            )}
          </div>
        )}
      </div>

      
    </div>
  )
})

ChoreList.displayName = 'ChoreList'
