import { useState, useEffect, useCallback } from 'react'
import { User } from '../types/user'

interface StoredUser {
  id: string
  email: string
  name: string
  password: string // Store password for demo purposes
  role: 'admin' | 'member'
  avatar: string
  joinedAt: Date
  isActive: boolean
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('choreAppUser')
    if (storedUser) {
      try {
        const parsedUser: StoredUser = JSON.parse(storedUser)
        // Convert stored dates back to Date objects
        const userWithDates: User = {
          id: parsedUser.id,
          email: parsedUser.email,
          name: parsedUser.name,
          role: parsedUser.role,
          avatar: parsedUser.avatar,
          joinedAt: new Date(parsedUser.joinedAt),
          isActive: parsedUser.isActive
        }
        setUser(userWithDates)
        
        // Check if this user should be admin (first user in the system)
        const storedUsers = localStorage.getItem('choreAppUsers')
        if (storedUsers) {
          try {
            const users: StoredUser[] = JSON.parse(storedUsers)
            if (users.length > 0 && users[0].id === parsedUser.id && parsedUser.role !== 'admin') {
              // This user is the first user but not an admin, update their role
              const updatedUser = { ...userWithDates, role: 'admin' as const }
              setUser(updatedUser)
              
              // Update stored user
              localStorage.setItem('choreAppUser', JSON.stringify({ ...parsedUser, role: 'admin' }))
              
              // Update in users array
              users[0] = { ...users[0], role: 'admin' }
              localStorage.setItem('choreAppUsers', JSON.stringify(users))
            }
          } catch (error) {
            console.error('Error checking admin status:', error)
          }
        }
      } catch (error) {
        console.error('Error parsing stored user:', error)
      }
    }
    setIsLoading(false)
  }, [])



  const signIn = useCallback(async (email: string, password: string, rememberMe: boolean = true) => {
    setIsLoading(true)
    
    try {
      // Check if user exists in localStorage
      const storedUsers = localStorage.getItem('choreAppUsers')
      let users: StoredUser[] = storedUsers ? JSON.parse(storedUsers) : []
      
      // Find existing user
      const existingUser = users.find(u => u.email === email && u.password === password)
      
      if (existingUser) {
        // Convert stored dates back to Date objects
        const userWithDates: User = {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          role: existingUser.role,
          avatar: existingUser.avatar,
          joinedAt: new Date(existingUser.joinedAt),
          isActive: existingUser.isActive
        }
        
        setUser(userWithDates)
        
        // Store current user if rememberMe is true
        if (rememberMe) {
          localStorage.setItem('choreAppUser', JSON.stringify(existingUser))
        }
        
        return userWithDates
      }
      
      // If no user found, throw an error - authentication is required
      throw new Error('Invalid email or password. Please check your credentials or create a new account.')
      
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    setIsLoading(true)
    
    try {
      // Check if user already exists
      const storedUsers = localStorage.getItem('choreAppUsers')
      let users: StoredUser[] = storedUsers ? JSON.parse(storedUsers) : []
      
      if (users.some(u => u.email === email)) {
        throw new Error('User already exists')
      }
      
      // Create new user
      // First user becomes admin, others become members
      const isFirstUser = users.length === 0
      const newUser: StoredUser = {
        id: Date.now().toString(),
        email: email,
        name: name,
        password: password,
        role: isFirstUser ? 'admin' : 'member',
        avatar: '👤',
        joinedAt: new Date(),
        isActive: true
      }
      
      // Add to users array
      users.push(newUser)
      localStorage.setItem('choreAppUsers', JSON.stringify(users))
      
      // Store current user
      localStorage.setItem('choreAppUser', JSON.stringify(newUser))
      
      // Convert to User type
      const userWithDates: User = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        avatar: newUser.avatar,
        joinedAt: newUser.joinedAt,
        isActive: newUser.isActive
      }
      
      setUser(userWithDates)
      return userWithDates
      
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signOut = useCallback(() => {
    localStorage.removeItem('choreAppUser')
    setUser(null)
  }, [])

  const updateUser = useCallback((updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      
      // Update stored user
      const storedUser = localStorage.getItem('choreAppUser')
      if (storedUser) {
        try {
          const parsedUser: StoredUser = JSON.parse(storedUser)
          const updatedStoredUser: StoredUser = {
            ...parsedUser,
            ...updates
          }
          localStorage.setItem('choreAppUser', JSON.stringify(updatedStoredUser))
          
          // Also update in users array
          const storedUsers = localStorage.getItem('choreAppUsers')
          if (storedUsers) {
            const users: StoredUser[] = JSON.parse(storedUsers)
            const userIndex = users.findIndex(u => u.id === user.id)
            if (userIndex !== -1) {
              users[userIndex] = updatedStoredUser
              localStorage.setItem('choreAppUsers', JSON.stringify(users))
            }
          }
        } catch (error) {
          console.error('Error updating stored user:', error)
        }
      }
    }
  }, [user])

  const promoteToAdmin = useCallback(() => {
    if (user) {
      updateUser({ role: 'admin' })
    }
  }, [user, updateUser])

  const checkAndFixAdminStatus = useCallback(() => {
    // Check if current user should be admin (first user in the system)
    const storedUsers = localStorage.getItem('choreAppUsers')
    if (storedUsers) {
      try {
        const users: StoredUser[] = JSON.parse(storedUsers)
        if (users.length > 0 && users[0].id === user?.id && user?.role !== 'admin') {
          // This user is the first user but not an admin, promote them
          promoteToAdmin()
        }
      } catch (error) {
        console.error('Error checking admin status:', error)
      }
    }
  }, [user, promoteToAdmin])

  return {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateUser,
    promoteToAdmin,
    checkAndFixAdminStatus
  }
}
