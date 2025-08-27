import React, { createContext, useContext, useState, ReactNode } from 'react'
import { Chore } from '../types/chore'
import { User, UserStats } from '../types/user'
import { defaultChores } from '../utils/defaultChores'
import { LEVELS } from '../types/chore'

interface DemoContextType {
  isDemoMode: boolean
  enterDemoMode: () => void
  exitDemoMode: () => void
  resetDemoMode: () => void
  getDemoChores: () => Chore[]
  getDemoUsers: () => User[]
  getDemoStats: () => UserStats[]
}

const DemoContext = createContext<DemoContextType | undefined>(undefined)

export const useDemo = () => {
  const context = useContext(DemoContext)
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider')
  }
  return context
}

interface DemoProviderProps {
  children: ReactNode
}

export const DemoProvider: React.FC<DemoProviderProps> = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [demoStats, setDemoStats] = useState<UserStats[]>([])
  const [demoChores, setDemoChores] = useState<Chore[]>([])

  const enterDemoMode = () => {
    try {

      
      // Clear any existing user data to prevent conflicts
      try {
        localStorage.removeItem('choreAppUser')
        localStorage.removeItem('choreAppUsers')

      } catch (storageError) {
        console.warn('Could not clear localStorage:', storageError)
      }
      
      // Generate demo data once and store it
      const generatedChores = getDemoChores()
      const generatedStats = getDemoStatsFromChores(generatedChores)
      
      setDemoChores(generatedChores)
      setDemoStats(generatedStats)
      
      setIsDemoMode(true)
      // Store demo mode in localStorage so it persists across page refreshes
      localStorage.setItem('demoMode', 'true')

      
    } catch (error) {
      console.error('Error entering demo mode:', error)
      // If localStorage fails, still set demo mode in state
      setIsDemoMode(true)
    }
  }

  const exitDemoMode = () => {
    try {
      setIsDemoMode(false)
      setDemoStats([])
      setDemoChores([])
      localStorage.removeItem('demoMode')
      localStorage.removeItem('demoChores')

    } catch (error) {
      console.error('Error exiting demo mode:', error)
      // If localStorage fails, still exit demo mode in state
      setIsDemoMode(false)
      setDemoStats([])
      setDemoChores([])
    }
  }

  const resetDemoMode = () => {
    try {
      // Clear all demo-related data
      localStorage.removeItem('demoMode')
      localStorage.removeItem('demoChores')
      localStorage.removeItem('chores')
      localStorage.removeItem('userStats')
      localStorage.removeItem('levelPersistence')
      
      // Reset state
      setIsDemoMode(false)
      setDemoStats([])
      setDemoChores([])
      
      
      // Force a page refresh to ensure clean state
      window.location.reload()
    } catch (error) {
      console.error('Error resetting demo mode:', error)
      // If localStorage fails, still reset demo mode in state and refresh
      setIsDemoMode(false)
      setDemoStats([])
      setDemoChores([])
      window.location.reload()
    }
  }

  // Helper function to calculate demo stats from existing chores
  const getDemoStatsFromChores = (chores: Chore[]): UserStats[] => {
    try {
      const demoUsers = getDemoUsers()
      

      
      return demoUsers.map(user => {
        // Get chores for this user
        const userChores = chores.filter(chore => 
          chore.assignedTo === user.id || chore.completedBy === user.id
        )
        const completedChores = userChores.filter(chore => chore.completed)
        
        // Calculate points - use finalPoints if available, otherwise fall back to base points
        const earnedPoints = completedChores.reduce((sum, chore) => {
          // For demo mode, always use finalPoints if available (includes bonus points)
          const pointsToAdd = chore.finalPoints !== undefined ? chore.finalPoints : chore.points
          return sum + pointsToAdd
        }, 0)
        
        // Calculate level based on points
        let currentLevel = 1
        for (let i = LEVELS.length - 1; i >= 0; i--) {
          if (earnedPoints >= LEVELS[i].pointsRequired) {
            currentLevel = LEVELS[i].level
            break
          }
        }
        
        // Calculate level progress
        const currentLevelData = LEVELS.find(level => level.level === currentLevel)
        const nextLevelData = LEVELS.find(level => level.level === currentLevel + 1)
        
        const currentLevelPoints = Math.max(0, earnedPoints - (currentLevelData?.pointsRequired || 0))
        const pointsToNextLevel = nextLevelData 
          ? Math.max(0, nextLevelData.pointsRequired - earnedPoints)
          : 0
        
        // Calculate streaks (simplified for demo)
        const completedDates = completedChores
          .filter(chore => chore.completedAt)
          .map(chore => new Date(chore.completedAt!).setHours(0, 0, 0, 0))
          .sort((a, b) => b - a)
        
        let currentStreak = 0
        let longestStreak = 0
        if (completedDates.length > 0) {
          const today = new Date().setHours(0, 0, 0, 0)
          let tempStreak = 0
          for (let i = 0; i < completedDates.length; i++) {
            if (completedDates[i] === today - (tempStreak * 24 * 60 * 60 * 1000)) {
              tempStreak++
            } else {
              break
            }
          }
          currentStreak = tempStreak
          longestStreak = Math.max(longestStreak, tempStreak)
        }
        
        const stats: UserStats = {
          userId: user.id,
          userName: user.name,
          totalChores: userChores.length,
          completedChores: completedChores.length,
          totalPoints: userChores.reduce((sum, c) => sum + (c.finalPoints || c.points), 0), // Use finalPoints for total
          earnedPoints,
          currentStreak,
          longestStreak,
          currentLevel,
          currentLevelPoints,
          pointsToNextLevel,
          lastActive: new Date(),
          efficiencyScore: completedChores.length > 0 ? (completedChores.length / userChores.length) * 100 : 0
        }
        

        
        return stats
      })
    } catch (error) {
      console.error('Error calculating demo stats from chores:', error)
      return []
    }
  }

  const getDemoChores = (): Chore[] => {
    // Return stored demo chores if available
    if (demoChores.length > 0) {

      return demoChores
    }
    
    try {

      
      // Create demo chores with sample completion data
      const now = new Date()
      const generatedChores = defaultChores.map((chore, index) => {
        // Increase completion rate to ensure enough points for leveling
        const isCompleted = Math.random() > 0.3 // 70% chance of being completed (was 0.6 = 40%)
        const createdAt = new Date(now.getTime() - (Math.random() * 7 * 24 * 60 * 60 * 1000)) // Random date within last week
        const dueDate = new Date(now.getTime() + (Math.random() * 7 * 24 * 60 * 60 * 1000)) // Random date within next week
        
        // Calculate proper finalPoints for leveling system
        let finalPoints = chore.points // Start with base points
        if (isCompleted) {
          // Add bonus points for completed chores to enable leveling up
          const bonusPoints = Math.floor(Math.random() * 8) + 2 // 2-9 bonus points (was 1-5)
          finalPoints = chore.points + bonusPoints
        }
        
        return {
          ...chore,
          id: `demo-${index + 1}`,
          createdAt,
          dueDate,
          completed: isCompleted,
          completedAt: isCompleted ? new Date(now.getTime() - (Math.random() * 3 * 24 * 60 * 60 * 1000)) : undefined,
          completedBy: isCompleted ? (Math.random() > 0.5 ? 'demo-alex' : 'demo-janice') : undefined,
          finalPoints: finalPoints, // Always set finalPoints for proper leveling calculation
          bonusMessage: isCompleted ? `+${finalPoints - chore.points} bonus` : undefined,
          assignedTo: Math.random() > 0.5 ? 'demo-alex' : 'demo-janice'
        }
      })



      

      
      return generatedChores
    } catch (error) {
      console.error('Error generating demo chores:', error)
      console.error('Error details:', error instanceof Error ? error.message : error)
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
      
      // Fallback to basic chores if demo generation fails
      try {
        const fallbackChores = defaultChores.map((chore, index) => ({
          ...chore,
          id: `demo-${index + 1}`,
          createdAt: new Date(),
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Due tomorrow
          completed: false,
          finalPoints: chore.points, // Ensure fallback chores also have finalPoints
          assignedTo: 'demo-alex'
        }))

        return fallbackChores
      } catch (fallbackError) {
        console.error('Fallback demo chores also failed:', fallbackError)
        // Return empty array as last resort
        return []
      }
    }
  }

  const getDemoUsers = (): User[] => {
    return [
      {
        id: 'demo-alex',
        name: 'Alex',
        email: 'alex@demo.com',
        role: 'admin',
        joinedAt: new Date('2024-01-01'),
        avatar: '👨‍💼',
        isActive: true
      },
      {
        id: 'demo-janice',
        name: 'Janice',
        email: 'janice@demo.com',
        role: 'member',
        joinedAt: new Date('2024-01-15'),
        avatar: '👩‍💼',
        isActive: true
      },
      {
        id: 'demo-jordan',
        name: 'Jordan',
        email: 'jordan@demo.com',
        role: 'member',
        joinedAt: new Date('2024-02-01'),
        avatar: '👨‍🎓',
        isActive: true
      },
      {
        id: 'demo-avery',
        name: 'Avery',
        email: 'avery@demo.com',
        role: 'member',
        joinedAt: new Date('2024-02-15'),
        avatar: '👩‍🎨',
        isActive: true
      }
    ]
  }

  // Return stored demo stats instead of recalculating
  const getDemoStats = (): UserStats[] => {
    if (demoStats.length > 0) {

      return demoStats
    } else {

      const newStats = getDemoStatsFromChores(getDemoChores())
      setDemoStats(newStats)
      return newStats
    }
  }

  // Check for demo mode on mount and restore data if needed
  React.useEffect(() => {
    try {
      const storedDemoMode = localStorage.getItem('demoMode')

      if (storedDemoMode === 'true') {

        setIsDemoMode(true)
        
        // If we're restoring demo mode, we need to regenerate the data
        // since it was cleared when the component unmounted
        if (demoChores.length === 0) {

          const generatedChores = getDemoChores()
          const generatedStats = getDemoStatsFromChores(generatedChores)
          setDemoChores(generatedChores)
          setDemoStats(generatedStats)
        }
      }
    } catch (error) {
      console.error('Error checking localStorage for demo mode:', error)
      // If localStorage is not available, default to false
      setIsDemoMode(false)
    }
  }, [demoChores.length])

  const value: DemoContextType = {
    isDemoMode,
    enterDemoMode,
    exitDemoMode,
    resetDemoMode,
    getDemoChores,
    getDemoUsers,
    getDemoStats
  }

  return (
    <DemoContext.Provider value={value}>
      {children}
    </DemoContext.Provider>
  )
}
