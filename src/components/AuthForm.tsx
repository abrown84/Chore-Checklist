import React, { useState, useEffect, useRef } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { AlertCircle, UserPlus, LogIn } from 'lucide-react'

interface AuthFormProps {
  onSignIn: (email: string, password: string, rememberMe: boolean) => Promise<any>
  onSignUp: (email: string, password: string, name: string) => Promise<any>
}

export default function AuthForm({ onSignIn, onSignUp }: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const passwordRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)

  // Help browsers with autofill by checking for autofilled values
  useEffect(() => {
    const checkAutofill = () => {
      if (emailRef.current && emailRef.current.value !== email) {
        setEmail(emailRef.current.value)
      }
      if (passwordRef.current && passwordRef.current.value !== password) {
        setPassword(passwordRef.current.value)
      }
    }

    // Check for autofill after a short delay
    const timer = setTimeout(checkAutofill, 100)
    return () => clearTimeout(timer)
  }, [email, password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (isSignUp) {
        await onSignUp(email, password, name)
      } else {
        await onSignIn(email, password, rememberMe)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    setError('')
    // Don't clear email and password when switching to sign-in mode to preserve autofill
    if (isSignUp) {
      // Only clear when switching FROM sign-in TO sign-up
      setEmail('')
      setPassword('')
    }
    setName('')
  }

  return (
    <Card className="w-full shadow-xl border-0 bg-blue-50/80 backdrop-blur-sm">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
          {isSignUp ? <UserPlus className="w-6 h-6 text-white" /> : <LogIn className="w-6 h-6 text-white" />}
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">
          {isSignUp ? 'Create Account' : 'Sign In'}
        </CardTitle>
        <CardDescription className="text-gray-600">
          {isSignUp 
            ? 'Join The Daily Grind to start managing your household tasks' 
            : 'Welcome back! Sign in to access your chore dashboard'
          }
        </CardDescription>
        

      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
          {isSignUp && (
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                required={isSignUp}
                autoComplete="name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              ref={emailRef}
              id="email"
              name={isSignUp ? "email" : "username"}
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
              autoComplete={isSignUp ? "email" : "username"}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              ref={passwordRef}
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {!isSignUp && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="rememberMe" className="text-sm text-gray-600">
                Remember me
              </label>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2 text-red-800">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Login Error</span>
              </div>
              <p className="text-xs text-red-700 mt-1">{error}</p>
              {!isSignUp && (
                <div className="mt-2 text-xs text-red-600">
                  <p>• Make sure your email and password are correct</p>
                  <p>• If you don't have an account, click "Create one" below</p>
                  <p>• Check the browser console for more details</p>
                </div>
              )}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 hover:shadow-lg disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
              </div>
            ) : (
              <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={toggleMode}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            {isSignUp 
              ? 'Already have an account? Sign in' 
              : "Don't have an account? Create one"
            }
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            By {isSignUp ? 'creating an account' : 'signing in'}, you agree to our terms of service and privacy policy.
          </p>
        </div>

        {/* Debug Section - Remove in production */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Debug Info:</h4>
          <button
            type="button"
            onClick={() => {
              const users = localStorage.getItem('choreAppUsers')
              const currentUser = localStorage.getItem('choreAppUser')
              console.log('=== LOCALSTORAGE DEBUG ===')
              console.log('Users:', users ? JSON.parse(users) : 'No users found')
              console.log('Current User:', currentUser ? JSON.parse(currentUser) : 'No current user')
              alert(`Users in storage: ${users ? JSON.parse(users).length : 0}`)
            }}
            className="text-xs bg-blue-500 text-white px-2 py-1 rounded mr-2"
          >
            Check Storage
          </button>
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem('choreAppUsers')
              localStorage.removeItem('choreAppUser')
              alert('Storage cleared!')
            }}
            className="text-xs bg-red-500 text-white px-2 py-1 rounded"
          >
            Clear Storage
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
