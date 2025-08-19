import { useState, useEffect, useCallback } from 'react'
import { flushSync } from 'react-dom'
import { User } from '../types/user'
import { validateEmail, validatePassword, validateName } from '../utils/validation'
import { storage } from '../utils/storage'

interface StoredUser {
  id: string
  email: string
  name: string
  password: string // Store password for demo purposes
  role: 'admin' | 'member'
  avatar: string
  joinedAt: Date
  isActive: boolean
  lastLogin?: Date
  loginAttempts?: number
  lockedUntil?: Date
}

interface SessionData {
  userId: string
  token: string
  expiresAt: number
  lastActivity: number
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sessionExpired, setSessionExpired] = useState(false)

  // Session configuration
  const SESSION_TIMEOUT = 24 * 60 * 60 * 1000 // 24 hours
  const MAX_LOGIN_ATTEMPTS = 5
  const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes
  const INACTIVITY_TIMEOUT = 30 * 60 * 1000 // 30 minutes

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
    if (storedUser) {
      try {
        const parsedUser: StoredUser = JSON.parse(storedUser)
        
        // Check if user account is locked
        if (parsedUser.lockedUntil && new Date() < new Date(parsedUser.lockedUntil)) {
          const remainingTime = Math.ceil((new Date(parsedUser.lockedUntil).getTime() - Date.now()) / 1000 / 60)
          console.warn(`Account is locked for ${remainingTime} more minutes`)
          setSessionExpired(true)
          setIsLoading(false)
          return
        }

        // Check session expiration
        const sessionData = getSessionData()
        if (sessionData && Date.now() > sessionData.expiresAt) {
          console.warn('Session has expired')
          setSessionExpired(true)
          signOut()
          setIsLoading(false)
          return
        }

        // Check inactivity timeout
        if (sessionData && Date.now() - sessionData.lastActivity > INACTIVITY_TIMEOUT) {
          console.warn('Session expired due to inactivity')
          setSessionExpired(true)
          signOut()
          setIsLoading(false)
          return
        }

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

        setUser(userWithDates)
        
        // Update session activity
        updateSessionActivity()
        
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

  // Set up activity monitoring for session timeout
  useEffect(() => {
    const updateActivity = () => updateSessionActivity()
    
    // Update activity on user interactions
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true)
    })

    // Check session status every minute
    const interval = setInterval(() => {
      const sessionData = getSessionData()
      if (sessionData && Date.now() > sessionData.expiresAt) {
        setSessionExpired(true)
        signOut()
      }
    }, 60000)

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true)
      })
      clearInterval(interval)
    }
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

  // Session management functions
  const createSession = (userId: string): void => {
    const sessionData: SessionData = {
      userId,
      token: generateSessionToken(),
      expiresAt: Date.now() + SESSION_TIMEOUT,
      lastActivity: Date.now()
    }
    
    storage.setItem('session', sessionData, { encrypt: true, ttl: SESSION_TIMEOUT })
  }

  const getSessionData = (): SessionData | null => {
    return storage.getItem<SessionData>('session', { encrypt: true })
  }

  const updateSessionActivity = (): void => {
    const sessionData = getSessionData()
    if (sessionData) {
      sessionData.lastActivity = Date.now()
      storage.setItem('session', sessionData, { encrypt: true, ttl: SESSION_TIMEOUT })
    }
  }

  const generateSessionToken = (): string => {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  const clearSession = (): void => {
    storage.removeItem('session')
  }

  // Enhanced sign in with rate limiting and validation
  const signIn = useCallback(async (email: string, password: string, rememberMe: boolean = true) => {
    setIsLoading(true)
    
    try {
      // Input validation
      const emailValidation = validateEmail(email)
      if (!emailValidation.isValid) {
        throw new Error(emailValidation.errors[0])
      }

      const passwordValidation = validatePassword(password)
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors[0])
      }

      // Check if user exists in localStorage
      const storedUsers = localStorage.getItem('choreAppUsers')
      let users: StoredUser[] = storedUsers ? JSON.parse(storedUsers) : []
      
      // Find existing user - compare email and password
      const existingUser = users.find(u => {
        const emailMatch = u.email.toLowerCase() === emailValidation.sanitizedValue!.toLowerCase()
        const passwordMatch = u.password === passwordValidation.sanitizedValue!
        return emailMatch && passwordMatch
      })
      
      if (existingUser) {
        // Check if account is locked
        if (existingUser.lockedUntil && new Date() < new Date(existingUser.lockedUntil)) {
          const remainingTime = Math.ceil((new Date(existingUser.lockedUntil).getTime() - Date.now()) / 1000 / 60)
          throw new Error(`Account is temporarily locked. Please try again in ${remainingTime} minutes.`)
        }

        // Reset login attempts on successful login
        existingUser.loginAttempts = 0
        existingUser.lockedUntil = undefined
        existingUser.lastLogin = new Date()
        
        // Update user in storage
        const userIndex = users.findIndex(u => u.id === existingUser.id)
        if (userIndex !== -1) {
          users[userIndex] = existingUser
          localStorage.setItem('choreAppUsers', JSON.stringify(users))
        }
        
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
        
        // Create session
        createSession(existingUser.id)
        
        // Store current user if rememberMe is true
        if (rememberMe) {
          localStorage.setItem('choreAppUser', JSON.stringify(existingUser))
        }
        
        return userWithDates
      }
      
      // Handle failed login attempt
      const userByEmail = users.find(u => u.email.toLowerCase() === emailValidation.sanitizedValue!.toLowerCase())
      if (userByEmail) {
        userByEmail.loginAttempts = (userByEmail.loginAttempts || 0) + 1
        
        if (userByEmail.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
          userByEmail.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION)
          const userIndex = users.findIndex(u => u.id === userByEmail.id)
          if (userIndex !== -1) {
            users[userIndex] = userByEmail
            localStorage.setItem('choreAppUsers', JSON.stringify(users))
          }
          throw new Error(`Too many failed login attempts. Account is locked for ${Math.ceil(LOCKOUT_DURATION / 1000 / 60)} minutes.`)
        } else {
          const userIndex = users.findIndex(u => u.id === userByEmail.id)
          if (userIndex !== -1) {
            users[userIndex] = userByEmail
            localStorage.setItem('choreAppUsers', JSON.stringify(users))
          }
        }
      }
      
      throw new Error('Invalid email or password. Please check your credentials or create a new account.')
      
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Enhanced sign up with validation
  const signUp = useCallback(async (email: string, password: string, name: string) => {
    setIsLoading(true)
    
    try {
      // Input validation
      const emailValidation = validateEmail(email)
      if (!emailValidation.isValid) {
        throw new Error(emailValidation.errors[0])
      }

      const passwordValidation = validatePassword(password)
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors[0])
      }

      const nameValidation = validateName(name, 'Name')
      if (!nameValidation.isValid) {
        throw new Error(nameValidation.errors[0])
      }

      // Check if user already exists
      const storedUsers = localStorage.getItem('choreAppUsers')
      let users: StoredUser[] = storedUsers ? JSON.parse(storedUsers) : []
      
      if (users.some(u => u.email.toLowerCase() === emailValidation.sanitizedValue!.toLowerCase())) {
        throw new Error('User already exists with this email address')
      }
      
      // Create new user
      // First user becomes admin, others become members
      const isFirstUser = users.length === 0
      const newUser: StoredUser = {
        id: Date.now().toString(),
        email: emailValidation.sanitizedValue!,
        name: nameValidation.sanitizedValue!,
        password: passwordValidation.sanitizedValue!,
        role: isFirstUser ? 'admin' : 'member',
        avatar: '👤',
        joinedAt: new Date(),
        isActive: true,
        lastLogin: new Date(),
        loginAttempts: 0
      }
      
      // Add to users array
      users.push(newUser)
      localStorage.setItem('choreAppUsers', JSON.stringify(users))
      
      // Store current user
      localStorage.setItem('choreAppUser', JSON.stringify(newUser))
      
      // Create session
      createSession(newUser.id)
      
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

  // Enhanced sign out with session cleanup
  const signOut = useCallback(() => {
    try {
      // Clear session
      clearSession()
      
      // Clear stored user
      localStorage.removeItem('choreAppUser')
      
      // Force immediate synchronous state update
      flushSync(() => {
        setUser(null)
        setIsLoading(false)
        setSessionExpired(false)
      })
      
      // Force a re-render by triggering storage event manually for cross-tab sync
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'choreAppUser',
        oldValue: localStorage.getItem('choreAppUser'),
        newValue: null,
        storageArea: localStorage
      }))
    } catch (error) {
      console.error('Error during sign out:', error)
      // Force sign out even if there's an error
      setUser(null)
      setIsLoading(false)
      setSessionExpired(false)
    }
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
    sessionExpired,
    signIn,
    signUp,
    signOut,
    updateUser,
    promoteToAdmin,
    checkAndFixAdminStatus,
    // Session management functions
    createSession,
    getSessionData,
    updateSessionActivity,
    clearSession
  }
}
