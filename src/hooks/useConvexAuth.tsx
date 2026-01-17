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
    
    await signInAction('password', formData)
  }, [signInAction])

  // Sign up
  const signUp = useCallback(async (email: string, password: string, name: string) => {
    // Convex Auth expects FormData for password provider
    const formData = new FormData()
    formData.append('email', email.trim())
    formData.append('password', password.trim())
    formData.append('name', name.trim())
    formData.append('flow', 'signUp')
    
    await signInAction('password', formData)
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
