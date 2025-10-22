import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { Chore, ChoreStats, LEVELS } from '../types/chore'
import { resetChoresToDefaults } from '../utils/defaultChores'

interface ChoreState {
  chores: Chore[]
  stats: ChoreStats
}

interface ChoreContextType {
  state: ChoreState
  addChore: (choreData: Omit<Chore, 'id' | 'createdAt' | 'completed'>) => void
  completeChore: (id: string, completedBy: string) => void
  deleteChore: (id: string) => void
  updateChore: (chore: Chore) => void
  resetChores: () => void
  clearChoreState: () => void
  repairDefaultUserChores: () => void
}

export const ChoreContext = createContext<ChoreContextType | null>(null)

interface ChoreProviderProps {
  children: React.ReactNode
  currentUserId?: string
  isDemoMode: boolean
  getDemoChores?: () => Chore[]
}

// Calculate stats from chores
const calculateStats = (chores: Chore[]): ChoreStats => {
  const completedChores = chores.filter(chore => chore.completed)
  const totalPoints = chores.reduce((sum, chore) => {
    const pointsToAdd = chore.finalPoints !== undefined ? chore.finalPoints : chore.points
    return sum + pointsToAdd
  }, 0)
  const earnedPoints = completedChores.reduce((sum, chore) => {
    const pointsToAdd = chore.finalPoints !== undefined ? chore.finalPoints : chore.points
    return sum + pointsToAdd
  }, 0)
  
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
    currentStreak: 0,
    longestStreak: 0,
    currentLevel,
    currentLevelPoints,
    pointsToNextLevel,
    totalLevels: LEVELS.length
  }
}

export const ChoreProvider: React.FC<ChoreProviderProps> = ({ 
  children,
  isDemoMode,
  getDemoChores
}) => {
  // Initialize chores from localStorage or demo
  const [chores, setChores] = useState<Chore[]>(() => {
    if (isDemoMode && getDemoChores) {
      return getDemoChores()
    }
    
    if (!isDemoMode) {
      try {
        const stored = localStorage.getItem('chores')
        if (stored) {
          const parsed = JSON.parse(stored)
          return parsed.map((chore: any) => ({
            ...chore,
            createdAt: new Date(chore.createdAt),
            dueDate: chore.dueDate ? new Date(chore.dueDate) : null,
            completedAt: chore.completedAt ? new Date(chore.completedAt) : null
          }))
        }
      } catch (error) {
        console.error('Error loading chores:', error)
      }
    }
    return []
  })
  
  // Calculate stats whenever chores change
  const stats = useMemo(() => calculateStats(chores), [chores])
  
  // Save to localStorage (debounced) - FIXED: moved outside of useEffect
  const saveToLocalStorage = useCallback((choresToSave: Chore[]) => {
    if (isDemoMode) {
      // Save demo chores to a separate key
      try {
        localStorage.setItem('demoChores', JSON.stringify(choresToSave))
      } catch (error) {
        console.error('Error saving demo chores:', error)
      }
    } else {
      // Save regular chores
      try {
        localStorage.setItem('chores', JSON.stringify(choresToSave))
      } catch (error) {
        console.error('Error saving chores:', error)
      }
    }
  }, [isDemoMode])
  
  // Save chores when they change (with simple debouncing via useEffect)
  useEffect(() => {
    if (chores.length > 0) {
      const timeout = setTimeout(() => {
        saveToLocalStorage(chores)
      }, 500) // 500ms debounce
      
      return () => clearTimeout(timeout)
    }
  }, [chores, saveToLocalStorage])
  
  // Actions - all defined at top level with useCallback
  const addChore = useCallback((choreData: Omit<Chore, 'id' | 'createdAt' | 'completed'>) => {
    const newChore: Chore = {
      ...choreData,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      completed: false,
    }
    setChores(prev => [...prev, newChore])
  }, [])
  
  const completeChore = useCallback((id: string, completedBy: string) => {
    setChores(prev => prev.map(chore => {
      if (chore.id !== id) return chore
      
      let finalPoints = chore.points
      let bonusMessage = ''
      
      // Calculate bonus/penalty
      if (chore.dueDate) {
        const now = new Date()
        const dueDate = new Date(chore.dueDate)
        const hoursDiff = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60)
        
        if (hoursDiff > 0) {
          const bonus = Math.round(chore.points * 0.2)
          finalPoints += bonus
          bonusMessage = `+${bonus} early bonus`
        } else if (hoursDiff < 0) {
          const penalty = Math.round(chore.points * 0.1)
          finalPoints = Math.max(1, finalPoints - penalty)
          bonusMessage = `-${penalty} late penalty`
        }
      }
      
      return {
        ...chore,
        completed: true,
        completedAt: new Date(),
        completedBy,
        finalPoints,
        bonusMessage
      }
    }))
  }, [])
  
  const deleteChore = useCallback((id: string) => {
    setChores(prev => prev.filter(chore => chore.id !== id))
  }, [])
  
  const updateChore = useCallback((updatedChore: Chore) => {
    setChores(prev => prev.map(chore => 
      chore.id === updatedChore.id ? updatedChore : chore
    ))
  }, [])
  
  const resetChores = useCallback(() => {
    const defaultChores = resetChoresToDefaults()
    const choresWithIds = defaultChores.map(chore => ({
      ...chore,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      completed: false
    }))
    setChores(choresWithIds)
  }, [])
  
  const clearChoreState = useCallback(() => {
    setChores([])
  }, [])
  
  const repairDefaultUserChores = useCallback(() => {
    // Not needed for simple version
  }, [])
  
  const contextValue: ChoreContextType = {
    state: { chores, stats },
    addChore,
    completeChore,
    deleteChore,
    updateChore,
    resetChores,
    clearChoreState,
    repairDefaultUserChores,
  }
  
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
