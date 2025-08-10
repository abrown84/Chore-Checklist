import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { useChores } from '../contexts/ChoreContext'
import { useUsers } from '../contexts/UserContext'
import { Chore, DIFFICULTY_COLORS, PRIORITY_COLORS, LEVELS } from '../types/chore'
import { CheckCircle, Circle, Trash2, Calendar, Clock, Target, Zap, RotateCcw, Filter, Crown, Star, Trophy } from 'lucide-react'

export const ChoreList: React.FC = () => {
  const { state, completeChore, deleteChore, resetChores } = useChores()
  const { recalculateStats, getCurrentUserStats } = useUsers()
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'priority' | 'difficulty' | 'dueDate'>('priority')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [groupByCategory, setGroupByCategory] = useState<boolean>(true)

  // Get current user stats for level display
  const currentUserStats = getCurrentUserStats()
  const currentLevelData = LEVELS.find(level => level.level === (currentUserStats?.currentLevel || 1))
  const nextLevelData = LEVELS.find(level => level.level === (currentUserStats?.currentLevel || 1) + 1)
  
  // Initialize stats when component mounts
  useEffect(() => {
    if (state.chores.length > 0) {
      recalculateStats(state.chores)
    }
  }, []) // Empty dependency array - only run once on mount

  // Get level icon based on level
  const getLevelIcon = (level: number) => {
    if (level >= 10) return <Crown className="w-6 h-6 text-amber-600" />
    if (level >= 8) return <Crown className="w-6 h-6 text-pink-600" />
    if (level >= 6) return <Trophy className="w-6 h-6 text-red-600" />
    if (level >= 4) return <Star className="w-6 h-6 text-purple-600" />
    return <Target className="w-6 h-6 text-blue-600" />
  }

  // Trigger stats recalculation when chores change
  useEffect(() => {
    if (state.chores.length > 0) {
      recalculateStats(state.chores)
    }
  }, [state.chores, recalculateStats])

  // Get unique categories for filtering
  const categories = ['all', ...Array.from(new Set(state.chores.map(chore => chore.category)))]

  // Get category stats
  const getCategoryStats = (category: string) => {
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
  }

  // Group chores by category for better organization
  const getChoresByCategory = () => {
    const grouped: { [key: string]: Chore[] } = {}
    
    state.chores.forEach(chore => {
      if (!grouped[chore.category]) {
        grouped[chore.category] = []
      }
      grouped[chore.category].push(chore)
    })
    
    return grouped
  }

  const filteredChores = state.chores.filter(chore => {
    // Status filter
    if (filter === 'pending' && chore.completed) return false
    if (filter === 'completed' && !chore.completed) return false
    
    // Category filter
    if (categoryFilter !== 'all' && chore.category !== categoryFilter) return false
    
    return true
  })

  const sortedChores = [...filteredChores].sort((a, b) => {
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

  const handleCompleteChore = (chore: Chore) => {
    // Prevent completing already completed chores
    if (chore.completed) {
      return
    }
    
    completeChore(chore.id)
    // You could add a toast notification here
  }

  const handleDeleteChore = (chore: Chore) => {
    if (window.confirm(`Are you sure you want to delete "${chore.title}"?`)) {
      deleteChore(chore.id)
    }
  }

  const handleResetChores = () => {
    if (window.confirm('Are you sure you want to reset all chores to defaults? This will clear all progress and reload the default chore list with fresh dates.')) {
      resetChores()
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <Target className="w-4 h-4 text-red-500" />
      case 'medium': return <Zap className="w-4 h-4 text-yellow-500" />
      case 'low': return <Circle className="w-4 h-4 text-green-500" />
      default: return <Circle className="w-4 h-4 text-gray-500" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'daily': return '📅'
      case 'weekly': return '📆'
      case 'monthly': return '🗓️'
      case 'seasonal': return '🌸'
      default: return '📋'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'daily': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'weekly': return 'bg-green-100 text-green-800 border-green-200'
      case 'monthly': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'seasonal': return 'bg-pink-100 text-pink-800 border-pink-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '🌱'
      case 'medium': return '⭐'
      case 'hard': return '🏆'
      default: return '📋'
    }
  }

  const isOverdue = (chore: Chore) => {
    if (!chore.dueDate || chore.completed) return false
    const dueDateTime = new Date(chore.dueDate)
    // Set due time to 6 PM if no specific time is set
    if (dueDateTime.getHours() === 0 && dueDateTime.getMinutes() === 0) {
      dueDateTime.setHours(18, 0, 0, 0) // 6 PM
    }
    return dueDateTime < new Date()
  }

  const isDueSoon = (chore: Chore) => {
    if (!chore.dueDate || chore.completed) return false
    const dueDateTime = new Date(chore.dueDate)
    // Set due time to 6 PM if no specific time is set
    if (dueDateTime.getHours() === 0 && dueDateTime.getMinutes() === 0) {
      dueDateTime.setHours(18, 0, 0, 0) // 6 PM
    }
    const now = new Date()
    const hoursUntilDue = (dueDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)
    return hoursUntilDue <= 24 && hoursUntilDue >= 0 // Due within 24 hours
  }

  const getDueDateStatus = (chore: Chore) => {
    if (!chore.dueDate) return null
    
    if (chore.completed) {
      const completedDate = new Date(chore.completedAt!)
      const dueDateTime = new Date(chore.dueDate)
      // Set due time to 6 PM if no specific time is set
      if (dueDateTime.getHours() === 0 && dueDateTime.getMinutes() === 0) {
        dueDateTime.setHours(18, 0, 0, 0) // 6 PM
      }
      
      const hoursDiff = (dueDateTime.getTime() - completedDate.getTime()) / (1000 * 60 * 60)
      
      if (hoursDiff > 0) {
        // Early completion
        const daysEarly = Math.floor(hoursDiff / 24)
        const hoursEarly = Math.floor(hoursDiff % 24)
        let message = ''
        if (daysEarly > 0) {
          message = `${daysEarly} day${daysEarly > 1 ? 's' : ''} ${hoursEarly > 0 ? hoursEarly + ' hour' + (hoursEarly > 1 ? 's' : '') : ''} early`
        } else {
          message = `${hoursEarly} hour${hoursEarly > 1 ? 's' : ''} early`
        }
        return { type: 'early', hours: hoursDiff, message, color: 'text-green-600', bg: 'bg-green-100', icon: '🎯' }
      } else if (hoursDiff === 0) {
        return { type: 'on-time', hours: 0, message: 'Completed on time!', color: 'text-blue-600', bg: 'bg-blue-100', icon: '✅' }
      } else {
        // Late completion
        const daysLate = Math.floor(Math.abs(hoursDiff) / 24)
        const hoursLate = Math.floor(Math.abs(hoursDiff) % 24)
        let message = ''
        if (daysLate > 0) {
          message = `${daysLate} day${daysLate > 1 ? 's' : ''} ${hoursLate > 0 ? hoursLate + ' hour' + (hoursLate > 1 ? 's' : '') : ''} late`
        } else {
          message = `${hoursLate} hour${hoursLate > 1 ? 's' : ''} late`
        }
        return { type: 'late', hours: Math.abs(hoursDiff), message, color: 'text-orange-600', bg: 'bg-orange-100', icon: '⏰' }
      }
    }
    
    if (isOverdue(chore)) {
      const dueDateTime = new Date(chore.dueDate)
      if (dueDateTime.getHours() === 0 && dueDateTime.getMinutes() === 0) {
        dueDateTime.setHours(18, 0, 0, 0) // 6 PM
      }
      const now = new Date()
      const hoursOverdue = (now.getTime() - dueDateTime.getTime()) / (1000 * 60 * 60)
      const daysOverdue = Math.floor(hoursOverdue / 24)
      const hoursRemaining = Math.floor(hoursOverdue % 24)
      
      let message = ''
      if (daysOverdue > 0) {
        message = `${daysOverdue} day${daysOverdue > 1 ? 's' : ''} ${hoursRemaining > 0 ? hoursRemaining + ' hour' + (hoursRemaining > 1 ? 's' : '') : ''} overdue`
      } else {
        message = `${hoursRemaining} hour${hoursRemaining > 1 ? 's' : ''} overdue`
      }
      
      return { type: 'overdue', hours: hoursOverdue, message, color: 'text-red-600', bg: 'bg-red-100', icon: '🚨' }
    }
    
    if (isDueSoon(chore)) {
      const dueDateTime = new Date(chore.dueDate)
      if (dueDateTime.getHours() === 0 && dueDateTime.getMinutes() === 0) {
        dueDateTime.setHours(18, 0, 0, 0) // 6 PM
      }
      const now = new Date()
      const hoursUntilDue = (dueDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)
      const daysUntilDue = Math.floor(hoursUntilDue / 24)
      const hoursRemaining = Math.floor(hoursUntilDue % 24)
      
      let message = ''
      if (daysUntilDue > 0) {
        message = `Due in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''} ${hoursRemaining > 0 ? hoursRemaining + ' hour' + (hoursRemaining > 1 ? 's' : '') : ''}`
      } else {
        message = `Due in ${hoursRemaining} hour${hoursRemaining > 1 ? 's' : ''}`
      }
      
      return { type: 'due-soon', hours: hoursUntilDue, message, color: 'text-yellow-600', bg: 'bg-yellow-100', icon: '⚠️' }
    }
    
    return null
  }

  const getDueDateDisplay = (chore: Chore) => {
    if (!chore.dueDate) return null
    
    const status = getDueDateStatus(chore)
    if (!status) return null
    
    const dueDate = new Date(chore.dueDate)
    // Format the date with time if it's set, otherwise show "6 PM" for date-only
    let formattedDate = ''
    if (dueDate.getHours() === 0 && dueDate.getMinutes() === 0) {
      formattedDate = `${dueDate.toLocaleDateString()} at 6:00 PM`
    } else {
      formattedDate = dueDate.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    }
    
    return { status, message: status.message, formattedDate }
  }

  if (state.chores.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 shadow-lg rounded-xl">
        <CardContent className="p-12 text-center">
          <div className="text-8xl mb-6">🏠</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">No chores yet!</h3>
          <p className="text-gray-600 mb-6 text-lg">Add your first chore to start earning points and building good habits.</p>
          <div className="bg-white rounded-lg p-6 shadow-sm max-w-md mx-auto">
            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex items-center justify-between">
                <span>Easy chores</span>
                <span className="font-semibold text-green-600">5 points</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Medium chores</span>
                <span className="font-semibold text-blue-600">10 points</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Hard chores</span>
                <span className="font-semibold text-purple-600">15 points</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Render chores grouped by category if enabled
  const renderGroupedChores = () => {
    if (!groupByCategory) {
      return (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {sortedChores.map((chore) => renderChoreCard(chore))}
        </div>
      )
    }

    const groupedChores = getChoresByCategory()
    const categoryOrder = ['daily', 'weekly', 'monthly', 'seasonal']
    
    return (
      <div className="space-y-8">
        {categoryOrder.map(category => {
          const categoryChores = groupedChores[category]
          if (!categoryChores || categoryChores.length === 0) return null
          
          const filteredCategoryChores = categoryChores.filter(chore => {
            if (filter === 'pending' && chore.completed) return false
            if (filter === 'completed' && !chore.completed) return false
            return true
          })
          
          if (filteredCategoryChores.length === 0) return null
          
          return (
            <div key={category} className="space-y-4">
              {/* Category Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getCategoryIcon(category)}</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 capitalize">{category} Chores</h3>
                    <p className="text-sm text-gray-600">
                      {filteredCategoryChores.filter(c => !c.completed).length} pending, {filteredCategoryChores.filter(c => c.completed).length} completed
                    </p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(category)}`}>
                  {filteredCategoryChores.length} total
                </div>
              </div>
              
              {/* Chores Grid */}
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredCategoryChores.map((chore) => renderChoreCard(chore))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderChoreCard = (chore: Chore) => (
    <Card 
      key={chore.id} 
      className={`transition-all duration-300 hover:shadow-xl hover:scale-105 ${
        chore.completed 
          ? 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-200' 
          : isOverdue(chore)
          ? 'bg-gradient-to-br from-red-50 to-pink-100 border-red-200'
          : 'bg-white hover:border-indigo-300'
      } ${viewMode === 'list' ? 'flex-row' : ''}`}
    >
      <CardContent className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
        <div className={`${viewMode === 'list' ? 'flex items-center space-x-4' : ''}`}>
          {/* Completion Button */}
          <div className={`${viewMode === 'list' ? 'flex-shrink-0' : 'mb-4'}`}>
            <button
              onClick={() => handleCompleteChore(chore)}
              disabled={chore.completed}
              className={`text-3xl transition-transform ${
                chore.completed 
                  ? 'text-green-600 cursor-not-allowed' 
                  : 'text-gray-400 hover:text-indigo-500 hover:scale-110 cursor-pointer'
              }`}
            >
              {chore.completed ? (
                <CheckCircle className="text-green-600" />
              ) : (
                <Circle className="text-gray-400 hover:text-indigo-500" />
              )}
            </button>
          </div>
          
          {/* Chore Content */}
          <div className={`flex-1 ${viewMode === 'list' ? 'min-w-0' : ''}`}>
            <div className="mb-3">
              <h3 className={`text-lg font-semibold ${
                chore.completed ? 'text-green-800 line-through' : 'text-gray-900'
              }`}>
                {chore.title}
              </h3>
              {chore.description && (
                <p className={`text-sm ${
                  chore.completed ? 'text-green-600' : 'text-gray-600'
                } mt-1`}>
                  {chore.description}
                </p>
              )}
            </div>

            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {/* Difficulty Badge */}
              <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${DIFFICULTY_COLORS[chore.difficulty]}`}>
                <span>{getDifficultyIcon(chore.difficulty)}</span>
                <span>{chore.difficulty.charAt(0).toUpperCase() + chore.difficulty.slice(1)}</span>
              </span>

              {/* Priority Badge */}
              <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${PRIORITY_COLORS[chore.priority]}`}>
                {getPriorityIcon(chore.priority)}
                <span>{chore.priority.charAt(0).toUpperCase() + chore.priority.slice(1)}</span>
              </span>

              {/* Category */}
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(chore.category)}`}>
                <span>{getCategoryIcon(chore.category)}</span>
                <span>{chore.category}</span>
              </span>

              {/* Overdue Warning */}
              {isOverdue(chore) && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>Overdue</span>
                </span>
              )}
            </div>

            {/* Due Date with Enhanced Status */}
            {chore.dueDate && (
              <div className="mb-3">
                {(() => {
                  const dueDateInfo = getDueDateDisplay(chore)
                  if (!dueDateInfo) return null
                  
                  return (
                    <div className={`flex items-center justify-between p-2 rounded-lg ${dueDateInfo.status.bg}`}>
                      <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span className={`font-medium ${dueDateInfo.status.color}`}>
                          {dueDateInfo.message}
                        </span>
                      </div>
                      <div className={`text-xs font-medium ${dueDateInfo.status.color}`}>
                        {dueDateInfo.formattedDate}
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}

            {/* Enhanced Completion Info */}
            {chore.completed && chore.completedAt && (
              <div className="mt-3 pt-3 border-t border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-green-600">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span>Completed on {new Date(chore.completedAt).toLocaleDateString()}</span>
                  </div>
                  {chore.dueDate && (() => {
                    const dueDateInfo = getDueDateDisplay(chore)
                    if (!dueDateInfo || dueDateInfo.status.type === 'overdue') return null
                    
                    return (
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${dueDateInfo.status.bg} ${dueDateInfo.status.color}`}>
                        {dueDateInfo.status.icon} {dueDateInfo.message}
                      </span>
                    )
                  })()}
                </div>
                
                {/* Bonus/Penalty Points Display */}
                {chore.finalPoints && chore.finalPoints !== chore.points && (
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">Base points:</span>
                      <span className="text-sm font-medium text-gray-700">{chore.points}</span>
                      <span className="text-xs text-gray-500">→</span>
                      <span className="text-sm font-bold text-green-600">{chore.finalPoints}</span>
                    </div>
                    {chore.bonusMessage && (
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        chore.finalPoints > chore.points 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {chore.bonusMessage}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Side - Points and Actions */}
          <div className={`flex flex-col items-end space-y-3 ${viewMode === 'list' ? 'flex-shrink-0 ml-4' : 'mt-4'}`}>
            {/* Points Display */}
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">
                {chore.points}
              </div>
              <div className="text-xs text-gray-500 font-medium">POINTS</div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteChore(chore)}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Stats and Controls */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 shadow-lg rounded-xl border-0">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            {/* Stats Display */}
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{state.stats.completedChores}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{state.stats.totalChores}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{state.stats.earnedPoints}</div>
                <div className="text-sm text-gray-600">Points</div>
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex items-center space-x-3">
              {/* Reset Button */}
              <Button
                onClick={handleResetChores}
                variant="outline"
                size="sm"
                className="border-orange-300 text-orange-600 hover:bg-orange-50 flex items-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset to Defaults</span>
              </Button>

              {/* Group by Category Toggle */}
              <Button
                onClick={() => setGroupByCategory(!groupByCategory)}
                variant={groupByCategory ? "default" : "outline"}
                size="sm"
                className="flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>{groupByCategory ? 'Grouped' : 'Flat'}</span>
              </Button>

              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 rounded-lg bg-white">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  } rounded-l-lg`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  } rounded-r-lg`}
                >
                  List
                </button>
              </div>

              {/* Filter Buttons */}
              <div className="flex border border-gray-300 rounded-lg bg-white">
                {(['all', 'pending', 'completed'] as const).map((filterOption) => (
                  <button
                    key={filterOption}
                    onClick={() => setFilter(filterOption)}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      filter === filterOption
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-600 hover:bg-gray-50'
                    } ${filterOption === 'all' ? 'rounded-l-lg' : ''} ${
                      filterOption === 'completed' ? 'rounded-r-lg' : ''
                    }`}
                  >
                    {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                  </button>
                ))}
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="priority">Sort by Priority</option>
                <option value="difficulty">Sort by Difficulty</option>
                <option value="dueDate">Sort by Due Date</option>
              </select>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Level Display Section */}
      {currentUserStats ? (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 shadow-md rounded-xl border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex justify-center">
                  {getLevelIcon(currentUserStats.currentLevel)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Level {currentUserStats.currentLevel}
                  </h3>
                  <p className={`text-lg font-medium mb-1 ${currentLevelData?.color || 'text-gray-600'}`}>
                    {currentLevelData?.icon} {currentLevelData?.name || 'Beginner'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {currentUserStats.earnedPoints} total points earned
                  </p>
                </div>
              </div>
              
              {/* Progress to Next Level */}
              {nextLevelData && (
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Progress to Level {nextLevelData.level}
                  </div>
                  <div className="w-32 bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(() => {
                          const pointsForCurrentLevel = currentLevelData?.pointsRequired || 0
                          const pointsForNextLevel = nextLevelData?.pointsRequired || 0
                          const pointsNeeded = pointsForNextLevel - pointsForCurrentLevel
                          
                          if (pointsNeeded <= 0) return 100 // Max level reached
                          
                          const progress = (currentUserStats.currentLevelPoints || 0) / pointsNeeded
                          return Math.min(100, Math.max(0, progress * 100))
                        })()}%` 
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-600">
                    {(() => {
                      const pointsForCurrentLevel = currentLevelData?.pointsRequired || 0
                      const pointsForNextLevel = nextLevelData?.pointsRequired || 0
                      const pointsNeeded = pointsForNextLevel - pointsForCurrentLevel
                      
                      if (pointsNeeded <= 0) return 'Max Level!'
                      
                      return `${currentUserStats.currentLevelPoints || 0} / ${pointsNeeded} points`
                    })()}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gradient-to-r from-gray-50 to-gray-100 shadow-md rounded-xl border-0">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-4xl mb-2">👤</div>
              <h3 className="text-lg font-medium text-gray-700 mb-1">No User Stats Available</h3>
              <p className="text-sm text-gray-500">Complete some chores to see your level progress!</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Stats Bar */}
      {categoryFilter !== 'all' && (
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 shadow-md rounded-xl border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-lg">{getCategoryIcon(categoryFilter)}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{categoryFilter} Progress</h3>
                  <p className="text-sm text-gray-600">
                    {getCategoryStats(categoryFilter).completed} of {getCategoryStats(categoryFilter).total} completed
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {getCategoryStats(categoryFilter).total > 0 
                    ? Math.round((getCategoryStats(categoryFilter).completed / getCategoryStats(categoryFilter).total) * 100)
                    : 0}%
                </div>
                <div className="text-sm text-gray-600">Completion Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chore Cards - Now using the grouped render function */}
      {renderGroupedChores()}

      {/* Empty State for Filtered Results */}
      {sortedChores.length === 0 && state.chores.length > 0 && (
        <Card className="bg-gray-50 shadow rounded-lg">
          <CardContent className="p-8 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No chores found</h3>
            <p className="text-gray-500">Try adjusting your filters or sorting options.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
