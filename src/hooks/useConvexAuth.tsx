import { useQuery } from 'convex/react'
import { useAuthActions } from '@convex-dev/auth/react'
import { api } from '../../convex/_generated/api'
import { User } from '../types/user'
import { useMemo, useCallback } from 'react'

/**
 * Hook that integrates Convex Auth with the app's user system
 * This bridges Convex Auth authentication with the users table
 */
export function useConvexAuth() {
  // Get auth actions (signIn, signOut)
  const { signIn: signInAction, signOut: signOutAction } = useAuthActions()
  
  // Check authentication state by querying for current user ID
  const authUserId = useQuery(api.auth.getCurrentUser, {})
  const isLoading = authUserId === undefined
  const isAuthenticated = authUserId !== null && authUserId !== undefined
  
  // Get current user profile from Convex (only if authenticated)
  const convexUser = useQuery(
    api.users.getCurrentUser,
    authUserId ? {} : 'skip'
  )
  
  // Memoize the user object to prevent unnecessary re-renders
  const user: User | null = useMemo(() => {
    if (!convexUser || !convexUser._id) {
      return null
    }
    return {
      id: convexUser._id,
      email: convexUser.email || '',
      name: convexUser.name || '',
      avatar: convexUser.avatarUrl || '👤',
      role: (convexUser.role as User['role']) || 'member',
      joinedAt: new Date(convexUser.createdAt || Date.now()),
      isActive: true,
    }
  }, [convexUser])

  // Memoize signIn function
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      // Create FormData for password provider with flow=signIn
      const formData = new FormData()
      formData.append('email', email)
      formData.append('password', password)
      formData.append('flow', 'signIn')
      
      await signInAction('password', formData)
      // User profile will be loaded via the query
      return { success: true }
    } catch (error: any) {
      console.error('Sign in error:', error)
      throw new Error(error.message || 'Failed to sign in')
    }
  }, [signInAction])

  // Memoize signUp function
  const signUp = useCallback(async (email: string, password: string, name: string) => {
    try {
      // Create FormData for password provider sign up with flow=signUp
      const formData = new FormData()
      formData.append('email', email)
      formData.append('password', password)
      formData.append('name', name)
      formData.append('flow', 'signUp')
      
      // Sign up with Convex Auth
      // The afterUserCreatedOrUpdated callback in convex/auth.ts
      // automatically sets up the user profile with default values
      await signInAction('password', formData)
      
      return { success: true }
    } catch (error: any) {
      console.error('Sign up error:', error)
      throw new Error(error.message || 'Failed to sign up')
    }
  }, [signInAction])

  // Memoize signOut function
  const signOut = useCallback(async () => {
    try {
      await signOutAction()
    } catch (error: any) {
      console.error('Sign out error:', error)
      throw new Error(error.message || 'Failed to sign out')
    }
  }, [signOutAction])

  // Memoize the return value
  return useMemo(() => ({
    user,
    isLoading: isLoading || (isAuthenticated && convexUser === undefined),
    isAuthenticated,
    signIn,
    signUp,
    signOut,
  }), [user, isLoading, isAuthenticated, convexUser, signIn, signUp, signOut])
}
