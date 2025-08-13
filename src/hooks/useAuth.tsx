import { useState, useEffect, useCallback } from 'react'
import { flushSync } from 'react-dom'
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
    // Migrate legacy storage keys to new keys if needed
    try {
      const legacyUsers = localStorage.getItem('users')
      const hasNewUsers = localStorage.getItem('choreAppUsers')
      if (!hasNewUsers && legacyUsers) {
        localStorage.setItem('choreAppUsers', legacyUsers)
      }
      const legacyUser = localStorage.getItem('user')
      const hasNewUser = localStorage.getItem('choreAppUser')
      if (!hasNewUser && legacyUser) {
        localStorage.setItem('choreAppUser', legacyUser)
      }
    } catch (error) {
      console.error('Error migrating legacy auth storage keys:', error)
    }

    const storedUser = localStorage.getItem('choreAppUser')
    console.log('useAuth: Raw stored user:', storedUser)
    if (storedUser) {
      try {
        const parsedUser: StoredUser = JSON.parse(storedUser)
        console.log('useAuth: Parsed stored user:', parsedUser)
        console.log('useAuth: Parsed user name:', parsedUser.name)
        // Convert stored dates back to Date objects
        const userWithDates: User = {
          id: parsedUser.id,
          email: parsedUser.email,
          name: parsedUser.name || parsedUser.email.split('@')[0], // Fallback to email username if name is missing
          role: parsedUser.role,
          avatar: parsedUser.avatar,
          joinedAt: new Date(parsedUser.joinedAt),
          isActive: parsedUser.isActive
        }
        console.log('useAuth: Final user object:', userWithDates)
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

  // Sync auth state across multiple hook instances/tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'choreAppUser') {
        if (e.newValue) {
          try {
            const parsedUser: StoredUser = JSON.parse(e.newValue)
            const userWithDates: User = {
              id: parsedUser.id,
              email: parsedUser.email,
              name: parsedUser.name || parsedUser.email.split('@')[0], // Fallback to email username if name is missing
              role: parsedUser.role,
              avatar: parsedUser.avatar,
              joinedAt: new Date(parsedUser.joinedAt),
              isActive: parsedUser.isActive
            }
            setUser(userWithDates)
            setIsLoading(false)
          } catch (error) {
            console.error('Error parsing stored user from storage event:', error)
            setUser(null)
            setIsLoading(false)
          }
        } else {
          // User was removed from storage (signed out)
          setUser(null)
          setIsLoading(false)
        }
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])



  const signIn = useCallback(async (email: string, password: string, rememberMe: boolean = true) => {
    setIsLoading(true)
    
    try {
      // Debug logging
      console.log('Sign in attempt:', { email, password: '***', rememberMe })
      
      // Check if user exists in localStorage
      const storedUsers = localStorage.getItem('choreAppUsers')
      let users: StoredUser[] = storedUsers ? JSON.parse(storedUsers) : []
      
      console.log('Stored users:', users.map(u => ({ email: u.email, name: u.name, role: u.role })))
      
      // Find existing user - compare email and password
      const existingUser = users.find(u => {
        const emailMatch = u.email.toLowerCase() === email.toLowerCase()
        const passwordMatch = u.password === password
        console.log(`Checking user ${u.email}: email match: ${emailMatch}, password match: ${passwordMatch}`)
        return emailMatch && passwordMatch
      })
      
      if (existingUser) {
        console.log('Login successful for user:', existingUser.email)
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
      console.log('No matching user found')
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
      // Debug logging
      console.log('Sign up attempt:', { email, name, password: '***' })
      
      // Check if user already exists
      const storedUsers = localStorage.getItem('choreAppUsers')
      let users: StoredUser[] = storedUsers ? JSON.parse(storedUsers) : []
      
      console.log('Existing users before signup:', users.map(u => ({ email: u.email, name: u.name })))
      
      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('User already exists with this email address')
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
      
      console.log('Sign up successful for user:', newUser.email)
      
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
    const currentStoredUser = localStorage.getItem('choreAppUser')
    console.log('signOut called - stored user:', currentStoredUser ? 'found' : 'not found')
    console.log('localStorage before removal:', currentStoredUser)
    
    const oldValue = currentStoredUser
    localStorage.removeItem('choreAppUser')
    console.log('localStorage after removal:', localStorage.getItem('choreAppUser'))
    
    // Force immediate synchronous state update
    flushSync(() => {
      setUser(null)
      setIsLoading(false)
    })
    
    console.log('setUser(null) and setIsLoading(false) called - signOut completed')
    
    // Force a re-render by triggering storage event manually for cross-tab sync
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'choreAppUser',
      oldValue: oldValue,
      newValue: null,
      storageArea: localStorage
    }))
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
