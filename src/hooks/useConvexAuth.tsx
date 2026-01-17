import { useQuery, useConvexAuth as useConvexAuthState } from 'convex/react'
import { useAuthActions } from '@convex-dev/auth/react'
import { api } from '../../convex/_generated/api'
import { User } from '../types/user'
import { useMemo, useCallback } from 'react'

/**
 * Simple Convex Auth hook
 * Provides authentication state and actions (sign in, sign up, sign out)
 */
export function useConvexAuth() {
  // Get auth state from Convex's built-in hook
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuthState()
  
  // Get auth actions
  const { signIn: signInAction, signOut: signOutAction } = useAuthActions()
  
  // Query current user - only runs when authenticated
  const convexUser = useQuery(
    api.users.getCurrentUser, 
    isAuthenticated ? {} : 'skip'
  )

  // Combined loading state
  const isLoading = isAuthLoading || (isAuthenticated && convexUser === undefined)

  // Map Convex user to frontend User type
  const user: User | null = useMemo(() => {
    if (!convexUser || !convexUser._id) {
      return null
    }
    return {
      id: convexUser._id as string,
      email: convexUser.email || '',
      name: convexUser.name || '',
      avatar: convexUser.avatarUrl || convexUser.image || '👤',
      role: (convexUser.role || 'member') as User['role'],
      joinedAt: convexUser.createdAt ? new Date(convexUser.createdAt) : new Date(),
      isActive: true,
      hasCompletedOnboarding: convexUser.hasCompletedOnboarding,
    }
  }, [convexUser])

  // Sign in
  const signIn = useCallback(async (email: string, password: string) => {
    // Convex Auth expects FormData for password provider
    const formData = new FormData()
    formData.append('email', email.trim())
    formData.append('password', password.trim())
    formData.append('flow', 'signIn')

    try {
      await signInAction('password', formData)
    } catch (error) {
      // Convert generic Convex errors to user-friendly messages
      const message = error instanceof Error ? error.message.toLowerCase() : ''
      if (message.includes('invalid') || message.includes('credential') || message.includes('password') || message.includes('not found')) {
        throw new Error('Invalid email or password. Please try again.')
      }
      if (message.includes('server error')) {
        throw new Error('Invalid email or password. Please try again.')
      }
      throw error
    }
  }, [signInAction])

  // Sign up
  const signUp = useCallback(async (email: string, password: string, name: string) => {
    // Convex Auth expects FormData for password provider
    const formData = new FormData()
    formData.append('email', email.trim())
    formData.append('password', password.trim())
    formData.append('name', name.trim())
    formData.append('flow', 'signUp')

    try {
      await signInAction('password', formData)
    } catch (error) {
      // Convert generic Convex errors to user-friendly messages
      const message = error instanceof Error ? error.message.toLowerCase() : ''
      if (message.includes('already') || message.includes('exists') || message.includes('duplicate')) {
        throw new Error('An account with this email already exists. Try signing in instead.')
      }
      if (message.includes('server error')) {
        throw new Error('Unable to create account. Please try again.')
      }
      throw error
    }
  }, [signInAction])

  // Sign out
  const signOut = useCallback(async () => {
    await signOutAction()
  }, [signOutAction])

  // OAuth sign in (GitHub, Google)
  const signInWithOAuth = useCallback(async (provider: 'github' | 'google') => {
    await signInAction(provider)
  }, [signInAction])

  return {
    user,
    isAuthenticated,
    isLoading,
    signIn,
    signUp,
    signOut,
    signInWithOAuth,
  }
}
