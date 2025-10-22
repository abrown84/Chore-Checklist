import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback, useRef } from 'react'
import { Chore, ChoreStats, LEVELS } from '../types/chore'
import { resetChoresToDefaults } from '../utils/defaultChores'
import { shouldPerformMidnightReset, resetDailyChores } from '../utils/midnightReset'

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
  | { type: 'BATCH_UPDATE'; payload: { chores: Chore[]; stats: ChoreStats } }

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

// Memoized stats calculation function
const calculateStats = (chores: Chore[]): ChoreStats => {
  const completedChores = chores.filter(chore => chore.completed)
  const totalPoints = chores.reduce((sum, chore) => {
    // Use finalPoints if available (includes bonus points), otherwise fall back to base points
    const pointsToAdd = chore.finalPoints !== undefined ? chore.finalPoints : chore.points
    return sum + pointsToAdd
  }, 0)
  const earnedPoints = completedChores.reduce((sum, chore) => {
    // Use finalPoints if available (includes bonus points), otherwise fall back to base points
    const pointsToAdd = chore.finalPoints !== undefined ? chore.finalPoints : chore.points
    return sum + pointsToAdd
  }, 0)
  
  // Calculate streak logic (simplified for performance)
  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0
  
  const sortedCompleted = completedChores
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
  
  for (const chore of sortedCompleted) {
    if (chore.completedAt) {
      const completionDate = new Date(chore.completedAt)
      const today = new Date()
      const diffTime = Math.abs(today.getTime() - completionDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays <= 1) {
        tempStreak++
        currentStreak = Math.max(currentStreak, tempStreak)
      } else {
        longestStreak = Math.max(longestStreak, tempStreak)
        tempStreak = 0
      }
    }
  }
  
  longestStreak = Math.max(longestStreak, tempStreak)
  
  // Calculate level based on earned points
  let currentLevel = 1
  let currentLevelPoints = earnedPoints
  let pointsToNextLevel = 100
  
  for (let i = 0; i < LEVELS.length; i++) {
    if (earnedPoints >= LEVELS[i].pointsRequired) {
      currentLevel = LEVELS[i].level
      currentLevelPoints = earnedPoints - LEVELS[i].pointsRequired
      if (i < LEVELS.length - 1) {
        pointsToNextLevel = LEVELS[i + 1].pointsRequired - earnedPoints
      } else {
        pointsToNextLevel = 0
      }
    } else {
      break
    }
  }
  


  return {
    totalChores: chores.length,
    completedChores: completedChores.length,
    totalPoints,
    earnedPoints,
    currentStreak,
    longestStreak,
    currentLevel,
    currentLevelPoints,
    pointsToNextLevel,
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
      }
      const newChores = [...state.chores, newChore]
      return {
        ...state,
        chores: newChores,
        stats: calculateStats(newChores)
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
              // Persist the final calculated points separately for lifetime tracking and resets
              // Keep points updated for current display while also storing finalPoints
              points: finalPoints,
              finalPoints: finalPoints,
              bonusMessage
            }
          : chore
      )
      

      return {
        ...state,
        chores: updatedChores,
        stats: calculateStats(updatedChores)
      }
    }
    
    case 'DELETE_CHORE': {
      const filteredChores = state.chores.filter(chore => chore.id !== action.payload.id)
      return {
        ...state,
        chores: filteredChores,
        stats: calculateStats(filteredChores)
      }
    }
    
    case 'UPDATE_CHORE': {
      const updatedChores = state.chores.map(chore =>
        chore.id === action.payload.id ? action.payload : chore
      )
      return {
        ...state,
        chores: updatedChores,
        stats: calculateStats(updatedChores)
      }
    }
    
    case 'LOAD_CHORES': {
      console.log('Loading chores:', action.payload.length, 'chores, completed:', action.payload.filter(c => c.completed).length)
      return {
        ...state,
        chores: action.payload,
        stats: calculateStats(action.payload)
      }
    }
    
    case 'RESET_CHORES': {
      const defaultChores = resetChoresToDefaults()
      const choresWithIds = defaultChores.map(chore => ({
        ...chore,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        completed: false
      }))
      return {
        ...state,
        chores: choresWithIds,
        stats: calculateStats(choresWithIds)
      }
    }
    
    case 'BATCH_UPDATE': {
      return {
        chores: action.payload.chores,
        stats: action.payload.stats
      }
    }
    
    default:
      return state
  }
}

// Memoized context value to prevent unnecessary re-renders
const createContextValue = (state: ChoreState, dispatch: React.Dispatch<ChoreAction>) => ({
  state,
  addChore: useCallback((choreData: Omit<Chore, 'id' | 'createdAt' | 'completed'>) => {
    dispatch({ type: 'ADD_CHORE', payload: choreData })
  }, [dispatch]),
  
  completeChore: useCallback((id: string, completedBy: string) => {
    dispatch({ type: 'COMPLETE_CHORE', payload: { id, completedBy } })
  }, [dispatch]),
  
  deleteChore: useCallback((id: string) => {
    dispatch({ type: 'DELETE_CHORE', payload: { id } })
  }, [dispatch]),
  
  updateChore: useCallback((chore: Chore) => {
    dispatch({ type: 'UPDATE_CHORE', payload: chore })
  }, [dispatch]),
  
  resetChores: useCallback(() => {
    dispatch({ type: 'RESET_CHORES' })
  }, [dispatch]),
  
  clearChoreState: useCallback(() => {
    dispatch({ type: 'LOAD_CHORES', payload: [] })
  }, [dispatch]),
  
  repairDefaultUserChores: useCallback(() => {
    // Implementation for repairing chores
    const currentChores = state.chores
    const repairedChores = currentChores.map(chore => 
      chore.assignedTo === 'default-user' 
        ? { ...chore, assignedTo: 'current-user-id' }
        : chore
    )
    dispatch({ type: 'BATCH_UPDATE', payload: { 
      chores: repairedChores, 
      stats: calculateStats(repairedChores) 
    }})
  }, [state.chores, dispatch])
})

export const ChoreContext = createContext<ReturnType<typeof createContextValue> | null>(null)

export const ChoreProvider: React.FC<{ children: React.ReactNode; currentUserId?: string; isDemoMode: boolean; getDemoChores?: () => Chore[] }> = ({ 
  children,
  isDemoMode,
  getDemoChores
}) => {
  const [state, dispatch] = useReducer(choreReducer, initialState)
  const storageTimeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const lastStorageUpdate = useRef<number>(0)
  
    // Debounced storage update to prevent excessive localStorage writes
  const updateStorage = useCallback((chores: Chore[]) => {
    const now = Date.now()

    
    if (now - lastStorageUpdate.current < 1000) { // Debounce to 1 second
      if (storageTimeoutRef.current) {
        clearTimeout(storageTimeoutRef.current)
      }
      storageTimeoutRef.current = setTimeout(() => {
        try {
          localStorage.setItem('chores', JSON.stringify(chores))
          lastStorageUpdate.current = Date.now()

        } catch (error) {
          console.error('Error saving chores to storage:', error)
        }
      }, 1000)
    } else {
      try {
        localStorage.setItem('chores', JSON.stringify(chores))
        lastStorageUpdate.current = now

      } catch (error) {
        console.error('Error saving chores to storage:', error)
      }
    }
  }, [])

  // Load chores from storage on mount
  useEffect(() => {

    try {
      if (isDemoMode && getDemoChores) {
        // In demo mode, try to load stored demo chores first, then generate new ones if needed
        try {
          const storedDemoChores = localStorage.getItem('demoChores')
          if (storedDemoChores) {
            const parsedDemoChores = JSON.parse(storedDemoChores)
            // Convert stored dates back to Date objects
            const demoChoresWithDates = parsedDemoChores.map((chore: any) => ({
              ...chore,
              createdAt: new Date(chore.createdAt),
              dueDate: chore.dueDate ? new Date(chore.dueDate) : null,
              completedAt: chore.completedAt ? new Date(chore.completedAt) : null
            }))

            dispatch({ type: 'LOAD_CHORES', payload: demoChoresWithDates })
            return
          }
        } catch (error) {
          console.warn('Error loading stored demo chores, will generate new ones:', error)
        }
        
        // If no stored demo chores, generate new ones

        const demoChores = getDemoChores()

        dispatch({ type: 'LOAD_CHORES', payload: demoChores })
      } else if (isDemoMode) {
        // Fallback: reset to defaults if getDemoChores is not available

        dispatch({ type: 'RESET_CHORES' })
      } else {
        try {
          const storedChores = localStorage.getItem('chores')
          if (storedChores) {
            const parsedChores = JSON.parse(storedChores)
            // Convert stored dates back to Date objects
            const choresWithDates = parsedChores.map((chore: any) => ({
              ...chore,
              createdAt: new Date(chore.createdAt),
              dueDate: chore.dueDate ? new Date(chore.dueDate) : null,
              completedAt: chore.completedAt ? new Date(chore.completedAt) : null
            }))
            dispatch({ type: 'LOAD_CHORES', payload: choresWithDates })
          } else {
            // If no stored chores exist, create default chores for new users
            dispatch({ type: 'RESET_CHORES' })
          }
        } catch (error) {
          console.error('Error loading chores from storage:', error)
          // On error, create default chores as fallback
          dispatch({ type: 'RESET_CHORES' })
        }
      }
    } catch (error) {
      console.error('ChoreProvider: Error in useEffect:', error)
      console.error('Error details:', error instanceof Error ? error.message : error)
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
      // On error, create default chores as fallback
      dispatch({ type: 'RESET_CHORES' })
    }
  }, [isDemoMode, getDemoChores])

  // Save chores to storage when they change (including demo mode for consistency)
  useEffect(() => {
    if (state.chores.length > 0) {
      if (isDemoMode) {
        // In demo mode, save to a special demo storage key to avoid conflicts
        try {
          localStorage.setItem('demoChores', JSON.stringify(state.chores))

        } catch (error) {
          console.error('Error saving demo chores to storage:', error)
        }
      } else {
        // In regular mode, save to normal storage

        updateStorage(state.chores)
      }
    }
  }, [state.chores, updateStorage, isDemoMode])

  // Midnight reset logic - only run once on mount, not when chores change
  useEffect(() => {
    const checkMidnightReset = () => {
      if (shouldPerformMidnightReset()) {

        const resetChores = resetDailyChores(state.chores)


        dispatch({ type: 'LOAD_CHORES', payload: resetChores })
      }
    }

    const interval = setInterval(checkMidnightReset, 60000) // Check every minute
    return () => clearInterval(interval)
  }, []) // Remove state.chores dependency to prevent recreation of interval

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (storageTimeoutRef.current) {
        clearTimeout(storageTimeoutRef.current)
      }
    }
  }, [])

  const contextValue = useMemo(() => createContextValue(state, dispatch), [state, dispatch])

  return (
    <ChoreContext.Provider value={contextValue}>
      {children}
    </ChoreContext.Provider>
  )
}

export const useChores = () => {
  const context = useContext(ChoreContext)
  if (!context) {
    throw new Error('useChores must be used within a ChoreProvider')
  }
  return context
}
