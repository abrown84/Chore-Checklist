import { useState, useMemo, useCallback } from 'react'
import { Chore } from '../types/chore'


interface UseChoreListProps {
  chores: Chore[]
  animatingChores: Set<string>
  completingChores: Set<string>
}

export const useChoreList = ({ chores, animatingChores, completingChores }: UseChoreListProps) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'priority' | 'difficulty' | 'dueDate'>('priority')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [groupByCategory, setGroupByCategory] = useState<boolean>(true)

  // Get unique categories for filtering
  const categories = useMemo(() => 
    ['all', ...Array.from(new Set(chores.map(chore => chore.category)))], 
    [chores]
  )

  // Get category stats
  const getCategoryStats = useCallback((category: string) => {
    if (category === 'all') {
      return {
        total: chores.length,
        completed: chores.filter(c => c.completed).length,
        pending: chores.filter(c => !c.completed).length
      }
    }
    
    const categoryChores = chores.filter(c => c.category === category)
    return {
      total: categoryChores.length,
      completed: categoryChores.filter(c => c.completed).length,
      pending: categoryChores.filter(c => !c.completed).length
    }
  }, [chores])

  const filteredChores = useMemo(() => {
    const filtered = chores.filter(chore => {
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
      totalChores: chores.length, 
      filteredCount: filtered.length, 
      completedCount: chores.filter(c => c.completed).length,
      animatingCount: animatingChores.size,
      completingCount: completingChores.size
    })
    
    return filtered
  }, [chores, categoryFilter, filter, animatingChores, completingChores])

  const sortedChores = useMemo(() => {
    return [...filteredChores].sort((a, b) => {
      switch (sortBy) {
        case 'priority': {
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        }
        case 'difficulty': {
          const difficultyOrder = { hard: 3, medium: 2, easy: 1 }
          return difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty]
        }
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

  return {
    // State
    filter,
    categoryFilter,
    sortBy,
    viewMode,
    groupByCategory,
    
    // Computed values
    categories,
    filteredChores,
    sortedChores,
    groupedChores,
    
    // Actions
    setFilter,
    setCategoryFilter,
    setSortBy,
    setViewMode,
    setGroupByCategory,
    
    // Utilities
    getCategoryStats
  }
}



