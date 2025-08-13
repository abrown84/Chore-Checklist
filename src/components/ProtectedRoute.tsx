import React from 'react'
import { useAuth } from '../hooks/useAuth'
import AuthForm from './AuthForm'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading, signIn, signUp } = useAuth()

  // Debug logging
  console.log('ProtectedRoute render - user:', user, 'isLoading:', isLoading)
  console.log('ProtectedRoute render - user is null?', user === null)
  console.log('ProtectedRoute render - isLoading?', isLoading === true)

  // Show loading state while checking authentication
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

  // If no user, show login page
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-4xl">🏠</span>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              The Daily Grind
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Transform household chores into a fun, rewarding experience with points, levels, and achievements!
            </p>
          </div>
          <AuthForm onSignIn={signIn} onSignUp={signUp} />
        </div>
      </div>
    )
  }

  // If user is authenticated, render the protected content
  return <>{children}</>
}
