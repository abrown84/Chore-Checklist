import React, { useState, useEffect, useRef } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { AlertCircle, UserPlus, LogIn, Mail, Lock, User as UserIcon } from 'lucide-react'
 

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
    <Card className="w-full max-w-md mx-auto shadow-xl rounded-xl border border-border bg-card/60 backdrop-blur">
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              {isSignUp ? <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" /> : <LogIn className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />}
            </div>
            <div>
              <CardTitle className="text-lg sm:text-xl lg:text-2xl font-heading font-bold leading-tight">
                {isSignUp ? 'Create Account' : 'Sign In'}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm font-body">
                {isSignUp
                  ? 'Join The Daily Grind to start managing your household tasks'
                  : 'Welcome back! Sign in to access your chore dashboard'}
              </CardDescription>
            </div>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="mt-3 sm:mt-4">
          <div className="inline-flex p-1 bg-muted rounded-lg border border-border w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`flex-1 sm:flex-none px-3 py-1.5 text-xs sm:text-sm rounded-md transition-colors ${!isSignUp ? 'bg-background text-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`flex-1 sm:flex-none px-3 py-1.5 text-xs sm:text-sm rounded-md transition-colors ${isSignUp ? 'bg-background text-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Create Account
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-4 sm:px-6">
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4" autoComplete="on">
          {isSignUp && (
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-foreground">
                Full Name
              </label>
              <div className="flex items-center gap-2 px-3 py-2 border border-input rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:border-ring bg-background text-foreground">
                <UserIcon className="w-4 h-4 text-muted-foreground" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                  required={isSignUp}
                  autoComplete="name"
                  className="flex-1 bg-transparent outline-none"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              Email Address
            </label>
            <div className="flex items-center gap-2 px-3 py-2 border border-input rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:border-ring bg-background text-foreground">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <input
                ref={emailRef}
                id="email"
                name={isSignUp ? 'email' : 'username'}
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
                autoComplete={isSignUp ? 'email' : 'username'}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                className="flex-1 bg-transparent outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Password
              </label>
              {!isSignUp && (
                <button type="button" className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline">
                  Forgot password?
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 px-3 py-2 border border-input rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:border-ring bg-background text-foreground">
              <Lock className="w-4 h-4 text-muted-foreground" />
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
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                className="flex-1 bg-transparent outline-none"
              />
            </div>
          </div>

          {!isSignUp && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-primary border-input rounded focus:ring-ring"
                />
                <label htmlFor="rememberMe" className="text-sm text-muted-foreground">
                  Remember me
                </label>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40">
              <div className="flex items-center space-x-2 text-red-800 dark:text-red-300">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Login Error</span>
              </div>
              <p className="text-xs text-red-700 dark:text-red-300/90 mt-1">{error}</p>
              {!isSignUp && (
                <div className="mt-2 text-xs text-red-600 dark:text-red-400">
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
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 px-4 rounded-lg transition-all duration-200 hover:shadow-lg disabled:opacity-50"
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
            className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Create one"}
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            By {isSignUp ? 'creating an account' : 'signing in'}, you agree to our terms of service and privacy policy.
          </p>
        </div>


      </CardContent>
    </Card>
  )
}
