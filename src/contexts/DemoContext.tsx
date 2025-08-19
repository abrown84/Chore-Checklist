import React, { createContext, useContext, useState, ReactNode } from 'react'
import { Chore } from '../types/chore'
import { User } from '../types/user'
import { defaultChores } from '../utils/defaultChores'

interface DemoContextType {
  isDemoMode: boolean
  enterDemoMode: () => void
  exitDemoMode: () => void
  getDemoChores: () => Chore[]
  getDemoUsers: () => User[]
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

  const enterDemoMode = () => {
    try {
      console.log('Entering demo mode...')
      
      // Clear any existing user data to prevent conflicts
      try {
        localStorage.removeItem('choreAppUser')
        localStorage.removeItem('choreAppUsers')
        console.log('Cleared existing user data from localStorage')
      } catch (storageError) {
        console.warn('Could not clear localStorage:', storageError)
      }
      
      setIsDemoMode(true)
      // Store demo mode in localStorage so it persists across page refreshes
      localStorage.setItem('demoMode', 'true')
      console.log('Demo mode enabled and stored in localStorage')
      
      // Force a small delay to ensure state updates properly
      setTimeout(() => {
        console.log('Demo mode state after delay:', isDemoMode)
      }, 100)
      
    } catch (error) {
      console.error('Error entering demo mode:', error)
      // If localStorage fails, still set demo mode in state
      setIsDemoMode(true)
    }
  }

  const exitDemoMode = () => {
    try {
      setIsDemoMode(false)
      localStorage.removeItem('demoMode')
    } catch (error) {
      console.error('Error exiting demo mode:', error)
      // If localStorage fails, still exit demo mode in state
      setIsDemoMode(false)
    }
  }

  const getDemoChores = (): Chore[] => {
    try {
      console.log('Generating demo chores...')
      console.log('defaultChores available:', !!defaultChores, 'length:', defaultChores?.length)
      
      // Create demo chores with sample completion data
      const now = new Date()
      const demoChores = defaultChores.map((chore, index) => {
        const isCompleted = Math.random() > 0.6 // 40% chance of being completed
        const createdAt = new Date(now.getTime() - (Math.random() * 7 * 24 * 60 * 60 * 1000)) // Random date within last week
        const dueDate = new Date(now.getTime() + (Math.random() * 7 * 24 * 60 * 60 * 1000)) // Random date within next week
        
        return {
          ...chore,
          id: `demo-${index + 1}`,
          createdAt,
          dueDate,
          completed: isCompleted,
          completedAt: isCompleted ? new Date(now.getTime() - (Math.random() * 3 * 24 * 60 * 60 * 1000)) : undefined,
          completedBy: isCompleted ? (Math.random() > 0.5 ? 'demo-alex' : 'demo-janice') : undefined,
          finalPoints: isCompleted ? chore.points + Math.floor(Math.random() * 3) : undefined,
          bonusMessage: isCompleted ? '+2 early bonus' : undefined,
          assignedTo: Math.random() > 0.5 ? 'demo-alex' : 'demo-janice'
        }
      })

      console.log('Generated demo chores:', demoChores.length)
      return demoChores
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
          assignedTo: 'demo-alex'
        }))
        console.log('Using fallback demo chores:', fallbackChores.length)
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

  // Check for demo mode on mount
  React.useEffect(() => {
    try {
      const storedDemoMode = localStorage.getItem('demoMode')
      console.log('Checking localStorage for demo mode:', storedDemoMode)
      if (storedDemoMode === 'true') {
        console.log('Setting demo mode from localStorage')
        setIsDemoMode(true)
      }
    } catch (error) {
      console.error('Error checking localStorage for demo mode:', error)
      // If localStorage is not available, default to false
      setIsDemoMode(false)
    }
  }, [])

  const value: DemoContextType = {
    isDemoMode,
    enterDemoMode,
    exitDemoMode,
    getDemoChores,
    getDemoUsers
  }

  return (
    <DemoContext.Provider value={value}>
      {children}
    </DemoContext.Provider>
  )
}
