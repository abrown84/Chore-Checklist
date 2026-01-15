import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Chore, ChoreStats, LEVELS } from '../types/chore'
import { resetChoresToDefaults } from '../utils/defaultChores'
import { convexChoreToChore, choreToConvexArgs } from '../utils/convexHelpers'
import { Id } from '../../convex/_generated/dataModel'

interface ChoreState {
  chores: Chore[]
  stats: ChoreStats
}

interface ChoreContextType {
  state: ChoreState
  addChore: (choreData: Omit<Chore, 'id' | 'createdAt' | 'completed'>) => void
  completeChore: (id: string, completedBy: string, proofPhotoId?: string) => void
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
  householdId?: Id<"households">
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
  let pointsToNextLevel = 25 // Default to Level 2 requirement
  
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
  getDemoChores,
  householdId
}) => {
  // Convex queries and mutations
  const convexChores = useQuery(
    api.chores.getChoresByHousehold,
    !isDemoMode && householdId ? { householdId } : "skip"
  );
  const addChoreMutation = useMutation(api.chores.addChore);
  const completeChoreMutation = useMutation(api.chores.completeChore);
  const updateChoreMutation = useMutation(api.chores.updateChore);
  const deleteChoreMutation = useMutation(api.chores.deleteChore);

  // Initialize chores: from demo function in demo mode, empty in Convex mode (will be populated by query)
  const [chores, setChores] = useState<Chore[]>(() => {
    if (isDemoMode && getDemoChores) {
      return getDemoChores()
    }
    // In Convex mode, start empty - the useEffect will populate from Convex query
    return []
  })

  // Update chores from Convex when data is available
  useEffect(() => {
    if (!isDemoMode && convexChores && householdId) {
      const convertedChores = convexChores.map((convexChore: any) => 
        convexChoreToChore(convexChore, (convexChore as any).proofPhotoUrl)
      );
      setChores(convertedChores);
    } else if (!isDemoMode && convexChores === null && householdId) {
      // No chores found in Convex - clear local state
      setChores([]);
    }
  }, [convexChores, isDemoMode, householdId]);
  
  // Calculate stats whenever chores change
  const stats = useMemo(() => calculateStats(chores), [chores])
  
  // Save demo chores to localStorage (only for demo mode)
  useEffect(() => {
    if (isDemoMode && chores.length > 0) {
      try {
        localStorage.setItem('demoChores', JSON.stringify(chores))
      } catch (error) {
        console.error('Error saving demo chores:', error)
      }
    }
  }, [chores, isDemoMode])
  
  // Actions - all defined at top level with useCallback
  const addChore = useCallback(async (choreData: Omit<Chore, 'id' | 'createdAt' | 'completed'>) => {
    if (isDemoMode) {
      // Demo mode: use local state
      const newChore: Chore = {
        ...choreData,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        completed: false,
      }
      setChores(prev => [...prev, newChore])
    } else if (householdId) {
      // Convex mode: use mutation
      try {
        const args = choreToConvexArgs(choreData, householdId);
        await addChoreMutation(args);
        // The query will automatically update chores via useEffect
      } catch (error) {
        console.error('Error adding chore:', error);
        throw error;
      }
    } else {
      // No household ID - cannot add chore
      throw new Error('Cannot add chore: no household ID. Please ensure you are logged in and have a household.');
    }
  }, [isDemoMode, householdId, addChoreMutation])
  
  const completeChore = useCallback(async (id: string, completedBy: string, proofPhotoId?: string) => {
    if (isDemoMode) {
      // Demo mode: use local state
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
    } else if (householdId) {
      // Convex mode: use mutation
      try {
        import.meta.env.DEV && console.log(`[ChoreContext] Completing chore ${id} for user ${completedBy}`);
        const result = await completeChoreMutation({
          choreId: id as Id<"chores">,
          completedBy: completedBy as Id<"users">,
          proofPhotoId: proofPhotoId as Id<"_storage"> | undefined,
        });
        import.meta.env.DEV && console.log('✅ Chore completed successfully:', result);
        import.meta.env.DEV && console.log(`✅ Points awarded: ${result.finalPoints}`);
        // The query will automatically update chores via useEffect
        // Force a small delay to ensure Convex query has updated
        // StatsContext will recalculate when chores prop changes
        return result;
      } catch (error) {
        console.error('❌ Error completing chore:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error completing chore';
        console.error('Error details:', errorMessage);
        throw error;
      }
    } else {
      // No household ID - cannot complete chore
      throw new Error('Cannot complete chore: no household ID. Please ensure you are logged in and have a household.');
    }
  }, [isDemoMode, householdId, completeChoreMutation])
  
  const deleteChore = useCallback(async (id: string) => {
    if (isDemoMode) {
      // Demo mode: use local state
      setChores(prev => prev.filter(chore => chore.id !== id))
    } else if (householdId) {
      // Convex mode: use mutation
      try {
        await deleteChoreMutation({ choreId: id as Id<"chores"> });
        // The query will automatically update chores via useEffect
      } catch (error) {
        console.error('Error deleting chore:', error);
        throw error;
      }
    } else {
      // No household ID - cannot delete chore
      throw new Error('Cannot delete chore: no household ID. Please ensure you are logged in and have a household.');
    }
  }, [isDemoMode, householdId, deleteChoreMutation])
  
  const updateChore = useCallback(async (updatedChore: Chore) => {
    if (isDemoMode) {
      // Demo mode: use local state
      setChores(prev => prev.map(chore => 
        chore.id === updatedChore.id ? updatedChore : chore
      ))
    } else if (householdId) {
      // Convex mode: use mutation
      try {
        await updateChoreMutation({
          choreId: updatedChore.id as Id<"chores">,
          title: updatedChore.title,
          description: updatedChore.description || undefined,
          points: updatedChore.points,
          difficulty: updatedChore.difficulty,
          category: updatedChore.category,
          priority: updatedChore.priority,
          assignedTo: updatedChore.assignedTo as Id<"users"> | undefined,
          dueDate: updatedChore.dueDate ? updatedChore.dueDate.getTime() : undefined,
        });
        // The query will automatically update chores via useEffect
      } catch (error) {
        console.error('Error updating chore:', error);
        throw error;
      }
    } else {
      // No household ID - cannot update chore
      throw new Error('Cannot update chore: no household ID. Please ensure you are logged in and have a household.');
    }
  }, [isDemoMode, householdId, updateChoreMutation])
  
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
