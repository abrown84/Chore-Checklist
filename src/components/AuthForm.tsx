import React, { useState, useEffect, useRef } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { AlertCircle, Mail, Lock, User as UserIcon, ArrowLeft } from 'lucide-react'
import newLogo from '../brand_assets/DGlogo.png'
import { motion } from 'framer-motion'
import { ThemeToggle } from './ThemeToggle'

function Logo({ className = 'h-8 w-8' }: { className?: string }) {
  return <img src={newLogo} alt="The Daily Grind logo" className={className} />
}

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

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Background gradient matching landing page exactly */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_0%,rgba(14,165,233,0.18),transparent_60%),radial-gradient(40%_30%_at_80%_20%,rgba(139,92,246,0.14),transparent_60%),radial-gradient(30%_30%_at_20%_60%,rgba(234,179,8,0.12),transparent_60%)] dark:bg-[radial-gradient(60%_40%_at_50%_0%,rgba(14,165,233,0.18),transparent_60%),radial-gradient(40%_30%_at_80%_20%,rgba(139,92,246,0.14),transparent_60%),radial-gradient(30%_30%_at_20%_60%,rgba(234,179,8,0.12),transparent_60%)]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-secondary text-foreground shadow-inner">
              <Logo className="h-4 w-4 sm:h-6 sm:w-6" />
            </div>
            <div className="text-sm sm:text-lg font-bold tracking-tight">THE DAILY GRIND</div>
            <div className="inline-flex items-center gap-1 rounded-full bg-amber-400 text-slate-900 px-2 py-1 text-xs font-medium">
              Beta
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground" size="sm">
              <a href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Centered Auth Form */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 sm:px-6">
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="w-full max-w-md"
        >
          <Card className="border-border bg-card/40 backdrop-blur-sm shadow-2xl">
            <CardHeader className="pb-6 text-center">
              <div className="space-y-2">
                <CardTitle className="text-2xl font-bold text-foreground">
                  {isSignUp ? 'Create Account' : 'Welcome Back'}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {isSignUp
                    ? 'Join The Daily Grind to start managing your household tasks'
                    : 'Sign in to access your chore dashboard'}
                </CardDescription>
              </div>

              {/* Mode toggle matching landing page style */}
              <div className="mt-6">
                <div className="inline-flex p-1 bg-secondary/60 rounded-lg border border-border w-full">
                  <button
                    type="button"
                    onClick={() => setIsSignUp(false)}
                    className={`flex-1 px-4 py-2 text-sm rounded-md transition-all duration-200 ${
                      !isSignUp 
                        ? 'bg-secondary text-foreground shadow-lg' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSignUp(true)}
                    className={`flex-1 px-4 py-2 text-sm rounded-md transition-all duration-200 ${
                      isSignUp 
                        ? 'bg-secondary text-foreground shadow-lg' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Create Account
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-6 pb-6">
              <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
                {isSignUp && (
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium text-foreground">
                      Full Name
                    </label>
                    <div className="flex items-center gap-3 px-4 py-3 border border-border rounded-lg focus-within:ring-2 focus-within:ring-amber-400/50 focus-within:border-amber-400 bg-input text-foreground transition-all duration-200">
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
                        className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-foreground">
                    Email Address
                  </label>
                  <div className="flex items-center gap-3 px-4 py-3 border border-border rounded-lg focus-within:ring-2 focus-within:ring-amber-400/50 focus-within:border-amber-400 bg-input text-foreground transition-all duration-200">
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
                      className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-medium text-foreground">
                      Password
                    </label>
                    {!isSignUp && (
                      <button type="button" className="text-xs text-muted-foreground hover:text-amber-400 underline-offset-2 hover:underline transition-colors">
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 border border-border rounded-lg focus-within:ring-2 focus-within:ring-amber-400/50 focus-within:border-amber-400 bg-input text-foreground transition-all duration-200">
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
                      className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>

                {!isSignUp && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 text-amber-400 border-border rounded focus:ring-amber-400/50 bg-input"
                      />
                      <label htmlFor="rememberMe" className="text-sm text-muted-foreground">
                        Remember me
                      </label>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/20 backdrop-blur-sm">
                    <div className="flex items-center space-x-2 text-destructive-foreground mb-2">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Authentication Error</span>
                    </div>
                    <p className="text-sm text-destructive-foreground">{error}</p>
                    {!isSignUp && (
                      <div className="mt-3 text-xs text-destructive-foreground/80 space-y-1">
                        <p>• Make sure your email and password are correct</p>
                        <p>• If you don't have an account, click "Create Account" above</p>
                      </div>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-amber-400 hover:bg-amber-300 text-slate-900 font-semibold py-3 px-4 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-amber-400/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-900"></div>
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
                  className="text-sm text-amber-400 hover:text-amber-300 font-medium transition-colors"
                >
                  {isSignUp
                    ? 'Already have an account? Sign in'
                    : "Don't have an account? Create one"}
                </button>
              </div>

              <div className="mt-4 text-center">
                <p className="text-xs text-muted-foreground">
                  By {isSignUp ? 'creating an account' : 'signing in'}, you agree to our{' '}
                  <a href="#" className="text-amber-400 hover:text-amber-300 underline underline-offset-2">terms of service</a>{' '}
                  and{' '}
                  <a href="#" className="text-amber-400 hover:text-amber-300 underline underline-offset-2">privacy policy</a>.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
