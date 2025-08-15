import React, { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import AuthForm from './AuthForm'
import { ThemeToggle } from './ThemeToggle'
import { Card, CardContent } from './ui/card'
import { ClipboardList, Trophy, Users, Star } from 'lucide-react'
import LandingPage from './LandingPage'
import newLogo from '../brand_assets/DGlogo.png'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading, signIn, signUp } = useAuth()

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

  // If no user, show landing page by default. Switch to auth when URL hash is #signin
  if (!user) {
    if (!showAuth) {
      return <LandingPage />
    }

    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="bg-white dark:bg-card shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <button
                className="flex items-center space-x-3 cursor-pointer"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.hash = ''
                  }
                }}
                aria-label="Go to home"
              >
                <img src={newLogo} alt="The Daily Grind" className="h-8 w-8" />
                <h1 className="text-2xl font-bold text-gray-900">The Daily Grind</h1>
              </button>
            </div>
          </div>
        </header>

        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>

        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid gap-8 lg:grid-cols-2 items-start">
              <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 shadow-lg border-0">
                <CardContent className="p-8">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg mb-4">
                      <span className="text-3xl">🏠</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
                    <p className="text-gray-600 mt-2">Sign in to continue building momentum on your household goals.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <ClipboardList className="w-5 h-5 text-indigo-600" />
                      <span className="text-gray-700">Organize chores by priority, difficulty, and due date</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Trophy className="w-5 h-5 text-yellow-600" />
                      <span className="text-gray-700">Earn points and level up as you complete tasks</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">Collaborate with your household</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Star className="w-5 h-5 text-purple-600" />
                      <span className="text-gray-700">Unlock achievements along the way</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="w-full max-w-md mx-auto lg:ml-auto" id="signin">
                <AuthForm onSignIn={signIn} onSignUp={signUp} />
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // If user is authenticated, render the protected content
  return <>{children}</>
}
