import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react'
import { Chore, ChoreStats, LEVELS } from '../types/chore'
import { resetChoresToDefaults } from '../utils/defaultChores'
import { isMidnightResetTime, resetDailyChores } from '../utils/midnightReset'
// Removed useStats import to fix circular dependency

interface ChoreState {
  chores: Chore[]
  stats: ChoreStats
}

type ChoreAction =
  | { type: 'ADD_CHORE'; payload: Omit<Chore, 'id' | 'createdAt' | 'completed'> }
  | { type: 'COMPLETE_CHORE'; payload: { id: string; completedBy: string } }
  | { type: 'DELETE_CHORE'; payload: { id: string } }
  | { type: 'UPDATE_CHORE'; payload: Chore }
  | { type: 'LOAD_CHORES'; payload: Chore[] }
  | { type: 'RESET_CHORES'; payload?: never }
  // Removed APPROVE_CHORE and REJECT_CHORE actions - no longer needed

const initialState: ChoreState = {
  chores: [],
  stats: {
    totalChores: 0,
    completedChores: 0,
    totalPoints: 0,
    earnedPoints: 0,
    currentStreak: 0,
    longestStreak: 0,
    currentLevel: 1,
    currentLevelPoints: 0,
    pointsToNextLevel: 100,
    totalLevels: LEVELS.length
  }
}

function choreReducer(state: ChoreState, action: ChoreAction): ChoreState {
  switch (action.type) {
    case 'ADD_CHORE': {
      const newChore: Chore = {
        ...action.payload,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        completed: false,
        // Removed approval fields - no longer needed
      }
      return {
        ...state,
        chores: [...state.chores, newChore]
      }
    }
    
    case 'COMPLETE_CHORE': {
      const choreToComplete = state.chores.find(chore => chore.id === action.payload.id)
      if (!choreToComplete) return state

      let finalPoints = choreToComplete.points
      let bonusMessage = ''

      // Calculate bonus/penalty based on completion time
      if (choreToComplete.dueDate) {
        const now = new Date()
        const dueDate = new Date(choreToComplete.dueDate)
        const hoursDiff = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60)

        if (hoursDiff > 0) {
          // Early completion bonus
          const bonus = Math.round(choreToComplete.points * 0.2)
          finalPoints += bonus
          
          const daysEarly = Math.floor(hoursDiff / 24)
          const hoursEarly = Math.floor(hoursDiff % 24)
          if (daysEarly > 0) {
            bonusMessage = `+${bonus} early bonus (${daysEarly} day${daysEarly > 1 ? 's' : ''} ${hoursEarly > 0 ? hoursEarly + ' hour' + (hoursEarly > 1 ? 's' : '') : ''} early)`
          } else {
            bonusMessage = `+${bonus} early bonus (${hoursEarly} hour${hoursEarly > 1 ? 's' : ''} early)`
          }
        } else if (hoursDiff < 0) {
          // Late completion penalty
          const penaltyMultiplier = Math.min(Math.abs(hoursDiff) * 0.005, 0.3)
          const penalty = Math.round(choreToComplete.points * penaltyMultiplier)
          finalPoints = Math.max(1, finalPoints - penalty)
          
          const daysLate = Math.floor(Math.abs(hoursDiff) / 24)
          const hoursLate = Math.floor(Math.abs(hoursDiff) % 24)
          if (daysLate > 0) {
            bonusMessage = `-${penalty} late penalty (${daysLate} day${daysLate > 1 ? 's' : ''} ${hoursLate > 0 ? hoursLate + ' hour' + (hoursLate > 1 ? 's' : '') : ''} late)`
          } else {
            bonusMessage = `-${penalty} late penalty (${hoursLate} hour${hoursLate > 1 ? 's' : ''} late)`
          }
        } else {
          // On-time completion
          const onTimeBonus = Math.round(choreToComplete.points * 0.15)
          finalPoints += onTimeBonus
          bonusMessage = `+${onTimeBonus} on-time bonus`
        }
      }
      
      const updatedChores = state.chores.map(chore =>
        chore.id === action.payload.id
          ? { 
              ...chore, 
              completed: true, 
              completedAt: new Date(),
              completedBy: action.payload.completedBy,
              finalPoints: finalPoints,
              bonusMessage: bonusMessage,
              // Removed approval fields - no longer needed
            }
          : chore
      )
      
      return {
        ...state,
        chores: updatedChores
      }
    }
    
    case 'DELETE_CHORE': {
      const updatedChores = state.chores.filter(chore => chore.id !== action.payload.id)
      return {
        ...state,
        chores: updatedChores
      }
    }
    
    case 'UPDATE_CHORE': {
      const updatedChores = state.chores.map(chore =>
        chore.id === action.payload.id ? action.payload : chore
      )
      return {
        ...state,
        chores: updatedChores
      }
    }
    
    case 'LOAD_CHORES': {
      // Ensure all chores have the required fields (approval fields are no longer used)
      const validatedChores = action.payload.map(chore => ({
        ...chore,
        // Removed approval fields - no longer needed
      }))
      
      return {
        ...state,
        chores: validatedChores
      }
    }
    
    case 'RESET_CHORES': {
      localStorage.removeItem('chores')
      const freshDefaultChores = resetChoresToDefaults().map(chore => ({
        ...chore,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        completed: false,
        // Removed approval fields - no longer needed
      }))
      
      return {
        ...state,
        chores: freshDefaultChores
      }
    }
    
    // Removed APPROVE_CHORE and REJECT_CHORE cases - no longer needed
    
    default:
      return state
  }
}

// Basic stats calculation - just counts and points
function useChoreStats(chores: Chore[]) {
  return useMemo(() => {
    const totalChores = chores.length
    const completedChores = chores.filter(chore => chore.completed).length
    const totalPoints = chores.reduce((sum, chore) => sum + chore.points, 0)
    const earnedPoints = chores
      .filter(chore => chore.completed)
      .reduce((sum, chore) => {
        const earnedPoints = chore.finalPoints !== undefined ? chore.finalPoints : chore.points
        return sum + earnedPoints
      }, 0)
    
    return {
      totalChores,
      completedChores,
      totalPoints,
      earnedPoints,
      currentStreak: 0,
      longestStreak: 0,
      currentLevel: 1,
      currentLevelPoints: 0,
      pointsToNextLevel: 100,
      totalLevels: LEVELS.length
    }
  }, [chores])
}

export const ChoreContext = createContext<{
  state: ChoreState
  dispatch: React.Dispatch<ChoreAction>
  addChore: (chore: Omit<Chore, 'id' | 'createdAt' | 'completed'>) => void
  completeChore: (id: string) => void
  deleteChore: (id: string) => void
  updateChore: (chore: Chore) => void
  resetChores: () => void
  getCurrentChores: () => Chore[]
  clearChoreState: () => void
  // Removed approveChore and rejectChore from context
} | null>(null)

export const ChoreProvider = ({ children, currentUserId }: { children: React.ReactNode; currentUserId?: string }) => {
  const [state, dispatch] = useReducer(choreReducer, initialState)
  
  // Calculate basic chore stats efficiently with memoization
  const stats = useChoreStats(state.chores)
  
  // Load chores from localStorage on mount
  useEffect(() => {
    const savedChores = localStorage.getItem('chores')
    
    if (savedChores) {
      try {
        const parsedChores = JSON.parse(savedChores)
        
        if (Array.isArray(parsedChores)) {
          // Check if chores array is effectively empty (no actual chore data)
          const hasValidChores = parsedChores.some(chore => 
            chore && 
            chore.title && 
            chore.title.trim() !== '' && 
            chore.description !== undefined
          )
          
          if (parsedChores.length === 0 || !hasValidChores) {
            // Load default chores if empty or no valid chores
            const defaultChores = resetChoresToDefaults().map(chore => ({
              ...chore,
              id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              createdAt: new Date(),
              completed: false
            }))
            dispatch({ type: 'LOAD_CHORES', payload: defaultChores })
          } else {
            const chores = parsedChores.map((chore: any) => ({
              id: chore.id || Date.now().toString(),
              title: chore.title || 'Untitled Chore',
              description: chore.description || '',
              difficulty: chore.difficulty || 'easy',
              points: typeof chore.points === 'number' ? chore.points : 5,
              category: chore.category || 'daily',
              priority: chore.priority || 'medium',
              completed: Boolean(chore.completed),
              createdAt: chore.createdAt ? new Date(chore.createdAt) : new Date(),
              completedAt: chore.completedAt && chore.completed ? new Date(chore.completedAt) : undefined,
              completedBy: chore.completedBy || undefined,
              dueDate: chore.dueDate ? new Date(chore.dueDate) : undefined,
              assignedTo: chore.assignedTo || undefined,
              // Removed approval fields - no longer needed
            }))
            dispatch({ type: 'LOAD_CHORES', payload: chores })
          }
        }
      } catch (error) {
        console.error('Failed to load chores from localStorage:', error)
        localStorage.removeItem('chores')
        // Load default chores after clearing corrupted localStorage
        const defaultChores = resetChoresToDefaults().map(chore => ({
          ...chore,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          completed: false,
          // Removed approval fields - no longer needed
        }))
        dispatch({ type: 'LOAD_CHORES', payload: defaultChores })
      }
    } else {
      // Load default chores if none exist
      const defaultChores = resetChoresToDefaults().map(chore => ({
        ...chore,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        completed: false,
        // Removed approval fields - no longer needed
      }))
      dispatch({ type: 'LOAD_CHORES', payload: defaultChores })
    }
  }, [])
  
  // Save chores to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chores', JSON.stringify(state.chores))
  }, [state.chores])

  // Check for midnight reset
  useEffect(() => {
    const checkMidnightReset = () => {
      if (isMidnightResetTime()) {
        const resetChores = resetDailyChores(state.chores)
        dispatch({ type: 'LOAD_CHORES', payload: resetChores })
      }
    }
    
    checkMidnightReset()
    const interval = setInterval(checkMidnightReset, 60000)
    
    return () => clearInterval(interval)
  }, [state.chores])
  
  const addChore = useCallback((chore: Omit<Chore, 'id' | 'createdAt' | 'completed'>) => {
    dispatch({ type: 'ADD_CHORE', payload: chore })
  }, [])
  
  const completeChore = useCallback((id: string) => {
    if (!currentUserId) {
      // Silently ignore when no current user ID
      return
    }
    dispatch({ type: 'COMPLETE_CHORE', payload: { id, completedBy: currentUserId } })
  }, [currentUserId])
  
  const deleteChore = useCallback((id: string) => {
    dispatch({ type: 'DELETE_CHORE', payload: { id } })
  }, [])
  
  const updateChore = useCallback((chore: Chore) => {
    dispatch({ type: 'UPDATE_CHORE', payload: chore })
  }, [])
  
  const resetChores = useCallback(() => {
    dispatch({ type: 'RESET_CHORES' })
  }, [])

  const getCurrentChores = useCallback(() => {
    return state.chores
  }, [state.chores])
  
  const clearChoreState = useCallback(() => {
    // Clear chores from localStorage and reset to initial state
    localStorage.removeItem('chores')
    dispatch({ type: 'LOAD_CHORES', payload: [] })
  }, [])
  
  // Removed approveChore and rejectChore functions - no longer needed
  
  return (
    <ChoreContext.Provider value={{
      state: { ...state, stats },
      dispatch,
      addChore,
      completeChore,
      deleteChore,
      updateChore,
      resetChores,
      getCurrentChores,
      clearChoreState
      // Removed approveChore and rejectChore from provider
    }}>
      {children}
    </ChoreContext.Provider>
  )
}

// Export the hook with a consistent name for Fast Refresh compatibility
export const useChores = () => {
  const context = useContext(ChoreContext)
  if (!context) {
    throw new Error('useChores must be used within a ChoreProvider')
  }
  return context
}
