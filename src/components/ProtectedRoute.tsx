import React from 'react'
import { Authenticated, Unauthenticated, AuthLoading } from 'convex/react'
import { useDemo } from '../contexts/DemoContext'
import LandingPage from './LandingPage'

interface ProtectedRouteProps {
  children: React.ReactNode
}

/**
 * Loading component for auth state check
 */
function AuthLoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}

/**
 * Content wrapper that handles demo mode
 */
function AuthenticatedContent({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

/**
 * Unauthenticated content that handles demo mode
 */
function UnauthenticatedContent({ children }: { children: React.ReactNode }) {
  const { isDemoMode } = useDemo()
  
  // If in demo mode, show the app content
  if (isDemoMode) {
    return <>{children}</>
  }
  
  // Otherwise show landing page
  return <LandingPage />
}

/**
 * ProtectedRoute component that handles authentication and routing
 * 
 * Uses Convex's built-in auth state components for reliable auth detection:
 * - AuthLoading: Shows while checking initial auth state
 * - Authenticated: User is signed in
 * - Unauthenticated: User is not signed in (shows landing or demo)
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  return (
    <>
      <AuthLoading>
        <AuthLoadingScreen />
      </AuthLoading>
      <Unauthenticated>
        <UnauthenticatedContent>{children}</UnauthenticatedContent>
      </Unauthenticated>
      <Authenticated>
        <AuthenticatedContent>{children}</AuthenticatedContent>
      </Authenticated>
    </>
  )
}
