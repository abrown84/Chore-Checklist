import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { useDemo } from '../contexts/DemoContext'
import LandingPage from './LandingPage'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const { isDemoMode } = useDemo()

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
    // Always show LandingPage - it has the auth modal built in
    return <LandingPage />
  }

  // User is authenticated or in demo mode
  return <>{children}</>
}
