import React, { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useDemo } from '../contexts/DemoContext'
import AuthForm from './AuthForm'
import LandingPage from './LandingPage'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading, signIn, signUp } = useAuth()
  const { isDemoMode } = useDemo()

  // Manage whether to show auth form or landing page (must be top-level hook usage)
  const [showAuth, setShowAuth] = useState<boolean>(
    typeof window !== 'undefined' && window.location.hash === '#signin'
  )

  useEffect(() => {
    const onHashChange = () => {
      setShowAuth(typeof window !== 'undefined' && window.location.hash === '#signin')
    }
    window.addEventListener('hashchange', onHashChange)
    // sync on mount
    onHashChange()
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  // Always render the same structure, but conditionally show content
  // This ensures hooks are called in the same order every time
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user && !isDemoMode) {
    if (showAuth) {
      return <AuthForm onSignIn={signIn} onSignUp={signUp} />
    } else {
      return <LandingPage />
    }
  }

  // User is authenticated or in demo mode
  return <>{children}</>
}
