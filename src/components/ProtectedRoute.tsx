import React, { lazy, Suspense } from 'react'
import { Authenticated, Unauthenticated, AuthLoading } from 'convex/react'
import { useDemo } from '../contexts/DemoContext'
import { usePasswordFlow } from '../contexts/PasswordFlowContext'
import { AppLoadingScreen } from './AppLoadingScreen'

// Lazy load LandingPage (953 lines) - only needed for unauthenticated users
const LandingPage = lazy(() => import('./LandingPage'))

interface ProtectedRouteProps {
  children: React.ReactNode
}

/**
 * Content wrapper that handles demo mode
 */
function AuthenticatedContent({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

/**
 * Unauthenticated content that handles demo mode and password flows
 */
function UnauthenticatedContent({ children }: { children: React.ReactNode }) {
  const { isDemoMode } = useDemo()
  const { isInPasswordFlow } = usePasswordFlow()

  // If in demo mode, show the app content
  if (isDemoMode) {
    return <>{children}</>
  }

  // If user is in the middle of a password reset/set flow, keep showing
  // app content so they can complete the flow (prevents redirect to landing)
  if (isInPasswordFlow) {
    return <>{children}</>
  }

  // Otherwise show landing page (lazy loaded)
  return (
    <Suspense fallback={<AppLoadingScreen message="Loading page..." />}>
      <LandingPage />
    </Suspense>
  )
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
        <AppLoadingScreen message="Checking authentication..." />
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
