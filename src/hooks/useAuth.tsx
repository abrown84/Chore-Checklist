import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { User } from '../types/user'
import { validateEmail, validatePassword, validateName } from '../utils/validation'
import { useConvexAuth } from './useConvexAuth'

/**
 * Main authentication hook that wraps Convex Auth
 * 
 * This hook provides:
 * - User authentication state from Convex Auth
 * - Session activity tracking for inactivity timeout
 * - Input validation for sign in/up forms
 * 
 * All user data is stored in Convex - NO localStorage fallback for auth.
 * localStorage is only used for:
 * - Session activity tracking (for inactivity warnings)
 * - Migration status flags
 * - UI preferences (theme, etc.)
 */
export function useAuth() {
  // Integrate Convex Auth - this is the single source of truth
  const convexAuth = useConvexAuth()
  
  const [sessionExpired, setSessionExpired] = useState(false)
  const [lastActivity, setLastActivity] = useState(Date.now())
  
  // Use ref for lastActivity in interval to avoid stale closures
  const lastActivityRef = useRef(lastActivity)
  lastActivityRef.current = lastActivity
  
  // Session configuration
  const INACTIVITY_TIMEOUT = 30 * 60 * 1000 // 30 minutes
  const INACTIVITY_WARNING = 25 * 60 * 1000 // Warning at 25 minutes

  // Extract stable references from convexAuth
  const {
    isAuthenticated,
    signOut: convexSignOut,
    signIn: convexSignIn,
    signUp: convexSignUp,
    signInWithOAuth: convexSignInWithOAuth,
    user
  } = convexAuth

  // Track user activity for session timeout
  useEffect(() => {
    if (!isAuthenticated) {
      setSessionExpired(false)
      return
    }

    let lastUpdate = 0
    const THROTTLE_MS = 60000 // Only update once per minute
    
    const updateActivity = () => {
      const now = Date.now()
      if (now - lastUpdate > THROTTLE_MS) {
        lastUpdate = now
        setLastActivity(now)
      }
    }
    
    // Update activity on user interactions (throttled)
    const events = ['mousedown', 'keypress', 'click', 'touchstart', 'scroll']
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true)
    })

    // Check inactivity every minute
    const interval = setInterval(() => {
      const inactiveTime = Date.now() - lastActivityRef.current
      
      if (inactiveTime > INACTIVITY_TIMEOUT) {
        console.warn('Session expired due to inactivity')
        setSessionExpired(true)
        // Auto sign out after inactivity
        convexSignOut().catch(console.error)
      } else if (inactiveTime > INACTIVITY_WARNING) {
        // Could trigger a warning UI here
        import.meta.env.DEV && console.log('Session will expire soon due to inactivity')
      }
    }, 60000)

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true)
      })
      clearInterval(interval)
    }
  }, [isAuthenticated, convexSignOut, INACTIVITY_TIMEOUT, INACTIVITY_WARNING])

  // Enhanced sign in with validation
  const signIn = useCallback(async (email: string, password: string) => {
    // Input validation
    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      throw new Error(emailValidation.errors[0])
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.errors[0])
    }

    try {
      await convexSignIn(email, password)
      setSessionExpired(false)
      setLastActivity(Date.now())
    } catch (error) {
      // Error is already formatted by useConvexAuth
      throw error
    }
  }, [convexSignIn])

  // Enhanced sign up with validation
  const signUp = useCallback(async (email: string, password: string, name: string) => {
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

    try {
      await convexSignUp(email, password, name)
      setSessionExpired(false)
      setLastActivity(Date.now())
    } catch (error) {
      // Error is already formatted by useConvexAuth
      throw error
    }
  }, [convexSignUp])

  // Sign out with cleanup
  const signOut = useCallback(async () => {
    try {
      await convexSignOut()
      setSessionExpired(false)
      setLastActivity(0)
    } catch (error) {
      console.error('Error during sign out:', error)
      // Force sign out state even if there's an error
      setSessionExpired(false)
      setLastActivity(0)
    }
  }, [convexSignOut])

  // OAuth sign in (GitHub, Google)
  const signInWithOAuth = useCallback(async (provider: 'github' | 'google') => {
    try {
      await convexSignInWithOAuth(provider)
      setSessionExpired(false)
      setLastActivity(Date.now())
    } catch (error) {
      throw error
    }
  }, [convexSignInWithOAuth])

  // Update user profile (delegate to Convex)
  const updateUser = useCallback((_updates: Partial<User>) => {
    // User updates are handled through Convex mutations
    // This is a placeholder for components that expect this method
    import.meta.env.DEV && console.log('updateUser called - use Convex mutations directly for user updates')
  }, [])

  // Legacy methods kept for backwards compatibility
  const promoteToAdmin = useCallback(() => {
    import.meta.env.DEV && console.log('promoteToAdmin called - use Convex mutations directly')
  }, [])

  const checkAndFixAdminStatus = useCallback(() => {
    // Admin status is now managed in Convex
    import.meta.env.DEV && console.log('checkAndFixAdminStatus called - admin status managed in Convex')
  }, [])

  // Session management placeholders (for backwards compatibility)
  const createSession = useCallback((_userId: string) => {
    setLastActivity(Date.now())
  }, [])

  const getSessionData = useCallback(() => {
    return {
      userId: user?.id || '',
      token: '',
      expiresAt: Date.now() + INACTIVITY_TIMEOUT,
      lastActivity
    }
  }, [user?.id, lastActivity, INACTIVITY_TIMEOUT])

  const updateSessionActivity = useCallback(() => {
    setLastActivity(Date.now())
  }, [])

  const clearSession = useCallback(() => {
    setLastActivity(0)
  }, [])

  // Memoize the return value to prevent unnecessary re-renders
  return useMemo(() => ({
    user,
    isLoading: convexAuth.isLoading,
    isAuthenticated,
    sessionExpired,
    signIn,
    signUp,
    signOut,
    signInWithOAuth,
    updateUser,
    promoteToAdmin,
    checkAndFixAdminStatus,
    // Session management functions (for backwards compatibility)
    createSession,
    getSessionData,
    updateSessionActivity,
    clearSession
  }), [
    user,
    convexAuth.isLoading,
    isAuthenticated,
    sessionExpired,
    signIn,
    signUp,
    signOut,
    signInWithOAuth,
    updateUser,
    promoteToAdmin,
    checkAndFixAdminStatus,
    createSession,
    getSessionData,
    updateSessionActivity,
    clearSession
  ])
}
