import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react'
import { Chore, ChoreStats, LEVELS } from '../types/chore'
import { resetChoresToDefaults } from '../utils/defaultChores'
import { isMidnightResetTime, resetDailyChores } from '../utils/midnightReset'

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
        completed: false
      }
      return {
        ...state,
        chores: [...state.chores, newChore]
      }
    }
    
    case 'COMPLETE_CHORE': {
      const choreToComplete = state.chores.find(c => c.id === action.payload.id)
      if (!choreToComplete || choreToComplete.completed) {
        return state
      }
      
      // Calculate bonus/penalty points based on due date
      let finalPoints = choreToComplete.points
      let bonusMessage = ''
      
      if (choreToComplete.dueDate) {
        const dueDateTime = new Date(choreToComplete.dueDate)
        if (dueDateTime.getHours() === 0 && dueDateTime.getMinutes() === 0) {
          dueDateTime.setHours(18, 0, 0, 0) // 6 PM
        }
        
        const completedDate = new Date()
        const hoursDiff = (dueDateTime.getTime() - completedDate.getTime()) / (1000 * 60 * 60)
        
        if (hoursDiff > 0) {
          // Early completion bonus
          const bonusMultiplier = Math.min(hoursDiff * 0.01, 0.5)
          const bonus = Math.round(choreToComplete.points * bonusMultiplier)
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
              bonusMessage: bonusMessage
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
      return {
        ...state,
        chores: action.payload
      }
    }
    
    case 'RESET_CHORES': {
      localStorage.removeItem('chores')
      const freshDefaultChores = resetChoresToDefaults().map(chore => ({
        ...chore,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        completed: false
      }))
      
      return {
        ...state,
        chores: freshDefaultChores
      }
    }
    
    default:
      return state
  }
}

// Efficient stats calculation with memoization
function useChoreStats(chores: Chore[]) {
  return useMemo(() => {
    const totalChores = chores.length
    const completedChores = chores.filter(chore => chore.completed).length
    const totalPoints = chores.reduce((sum, chore) => sum + chore.points, 0)
    const earnedPoints = chores
      .filter(chore => chore.completed)
      .reduce((sum, chore) => sum + (chore.finalPoints || chore.points), 0)
    
    // Calculate streak efficiently
    const completedChoresWithDates = chores
      .filter(chore => chore.completed && chore.completedAt)
      .map(chore => new Date(chore.completedAt!).setHours(0, 0, 0, 0))
      .sort((a, b) => b - a)
    
    let currentStreak = 0
    let longestStreak = 0
    
    if (completedChoresWithDates.length > 0) {
      const today = new Date().setHours(0, 0, 0, 0)
      
      // Calculate current streak
      if (completedChoresWithDates[0] === today) {
        let streak = 1
        for (let i = 1; i < completedChoresWithDates.length; i++) {
          const expectedDate = today - (i * 24 * 60 * 60 * 1000)
          if (completedChoresWithDates[i] === expectedDate) {
            streak++
          } else {
            break
          }
        }
        currentStreak = streak
      }
      
      // Calculate longest streak
      let tempStreak = 1
      for (let i = 1; i < completedChoresWithDates.length; i++) {
        const daysDiff = (completedChoresWithDates[i-1] - completedChoresWithDates[i]) / (24 * 60 * 60 * 1000)
        if (daysDiff === 1) {
          tempStreak++
        } else {
          longestStreak = Math.max(longestStreak, tempStreak)
          tempStreak = 1
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak)
    }
    
    // Calculate level
    let currentLevel = 1
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (earnedPoints >= LEVELS[i].pointsRequired) {
        currentLevel = LEVELS[i].level
        break
      }
    }
    
    const currentLevelData = LEVELS.find(level => level.level === currentLevel)
    const nextLevelData = LEVELS.find(level => level.level === currentLevel + 1)
    
    const currentLevelPoints = earnedPoints - (currentLevelData?.pointsRequired || 0)
    const pointsToNextLevel = nextLevelData ? nextLevelData.pointsRequired - earnedPoints : 0
    
    return {
      totalChores,
      completedChores,
      totalPoints,
      earnedPoints,
      currentStreak,
      longestStreak,
      currentLevel,
      currentLevelPoints,
      pointsToNextLevel,
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
} | null>(null)

export function ChoreProvider({ children, currentUserId }: { children: React.ReactNode; currentUserId?: string }) {
  const [state, dispatch] = useReducer(choreReducer, initialState)
  
  // Calculate stats efficiently with memoization
  const stats = useChoreStats(state.chores)
  
  // Update state when stats change
  useEffect(() => {
    if (JSON.stringify(stats) !== JSON.stringify(state.stats)) {
      dispatch({ type: 'LOAD_CHORES', payload: state.chores })
    }
  }, [stats, state.chores])
  
  // Load chores from localStorage on mount
  useEffect(() => {
    const savedChores = localStorage.getItem('chores')
    
    if (savedChores) {
      try {
        const parsedChores = JSON.parse(savedChores)
        
        if (Array.isArray(parsedChores)) {
          if (parsedChores.length === 0) {
            // Load default chores if empty
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
              assignedTo: chore.assignedTo || undefined
            }))
            dispatch({ type: 'LOAD_CHORES', payload: chores })
          }
        }
      } catch (error) {
        console.error('Failed to load chores from localStorage:', error)
        localStorage.removeItem('chores')
      }
    } else {
      // Load default chores if none exist
      const defaultChores = resetChoresToDefaults().map(chore => ({
        ...chore,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        completed: false
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
      console.warn('Cannot complete chore: no current user ID')
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
  
  return (
    <ChoreContext.Provider value={{
      state: { ...state, stats },
      dispatch,
      addChore,
      completeChore,
      deleteChore,
      updateChore,
      resetChores,
      getCurrentChores
    }}>
      {children}
    </ChoreContext.Provider>
  )
}

export function useChores() {
  const context = useContext(ChoreContext)
  if (!context) {
    throw new Error('useChores must be used within a ChoreProvider')
  }
  return context
}
