import React, { useState, useRef, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader } from './ui/card'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react'
import { validateEmail, validatePassword, validateName } from '../utils/validation'
import { motion } from 'framer-motion'
import { Logo } from './Logo'
import { PageWrapper } from './PageWrapper'
import { ThemeToggle } from './ThemeToggle'

interface AuthFormProps {
  onSignIn: (email: string, password: string, rememberMe: boolean) => Promise<any>
  onSignUp: (email: string, password: string, name: string) => Promise<any>
}

export default function AuthForm({ onSignIn, onSignUp }: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  
  const passwordRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)

  // Help browsers with autofill by checking for autofilled values
  useEffect(() => {
    const checkAutofill = () => {
      if (emailRef.current && emailRef.current.value !== email) {
        setEmail(emailRef.current.value)
      }
      if (passwordRef.current && passwordRef.current.value !== password) {
        setPassword(passwordRef.current.value)
      }
      if (nameRef.current && nameRef.current.value !== name) {
        setName(nameRef.current.value)
      }
    }

    // Check for autofill after a short delay
    const timer = setTimeout(checkAutofill, 100)
    return () => clearTimeout(timer)
  }, [email, password, name])

  // Clear errors when switching modes
  useEffect(() => {
    setError('')
    setFieldErrors({})
  }, [isSignUp])

  const validateFields = (): boolean => {
    const errors: Record<string, string> = {}
    
    // Validate email
    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      errors.email = emailValidation.errors[0]
    }
    
    // Validate password
    const passwordValidation = isSignUp 
      ? validatePassword(password, confirmPassword)
      : validatePassword(password)
    
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors[0]
    }
    
    // Validate name for sign up
    if (isSignUp) {
      const nameValidation = validateName(name)
      if (!nameValidation.isValid) {
        errors.name = nameValidation.errors[0]
      }
    }
    
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!validateFields()) {
      return
    }
    
    setIsLoading(true)
    
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
    setFieldErrors({})
    // Don't clear email and password when switching to sign-in mode to preserve autofill
    if (isSignUp) {
      // Only clear when switching FROM sign-in TO sign-up
      setEmail('')
      setPassword('')
    }
    setName('')
    setConfirmPassword('')
  }

  const getFieldError = (field: string): string | undefined => {
    return fieldErrors[field]
  }

  const hasFieldError = (field: string): boolean => {
    return !!getFieldError(field)
  }

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <PageWrapper showBackground={true}>
      {/* Header - Same as LandingPage */}
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-secondary text-foreground shadow-inner">
              <Logo className="h-8 w-8 sm:h-10 sm:w-10" />
            </div>
            <div className="text-sm sm:text-lg font-brand font-bold tracking-tight">DAILY BAG</div>
            <Badge className="ml-1 sm:ml-2 bg-amber-400 text-slate-900 text-xs">Beta</Badge>
          </div>
          <nav className="hidden items-center gap-4 lg:gap-6 md:flex">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground">Features</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground">Pricing</a>
            <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground">FAQ</a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Button asChild variant="ghost" className="hidden lg:inline-flex" size="sm">
              <a href="#signin">Sign in</a>
            </Button>
            <Button asChild className="bg-emerald-500 text-slate-900 hover:bg-emerald-400 text-xs sm:text-sm" size="sm">
              <a href="#signin">Get the app</a>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center min-h-screen p-4">
        <motion.div 
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="max-w-md w-full space-y-8"
        >
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-foreground shadow-inner">
                <Logo className="h-8 w-8" />
              </div>
            </div>
            <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-muted-foreground font-body">
              {isSignUp 
                ? 'Join your family\'s chore management system' 
                : 'Sign in to continue managing your chores'
              }
            </p>
          </div>

          {/* Form Card */}
          <Card className="border-border bg-card/40 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-heading font-semibold">
                  {isSignUp ? 'Sign Up' : 'Sign In'}
                </h2>
                <Badge variant="secondary" className="text-xs">
                  {isSignUp ? 'New User' : 'Returning'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Field (Sign Up Only) */}
                {isSignUp && (
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium text-foreground">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        ref={nameRef}
                        id="name"
                        name="name"
                        type="text"
                        required={isSignUp}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`pl-10 ${
                          hasFieldError('name') 
                            ? 'border-destructive bg-destructive/10' 
                            : ''
                        }`}
                        placeholder="Enter your full name"
                        autoComplete="name"
                        autoCapitalize="words"
                        autoCorrect="off"
                        spellCheck={false}
                        maxLength={50}
                      />
                    </div>
                    {getFieldError('name') && (
                      <p className="text-sm text-destructive flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {getFieldError('name')}
                      </p>
                    )}
                  </div>
                )}

                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-foreground">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      ref={emailRef}
                      id="email"
                      name={isSignUp ? 'email' : 'username'}
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`pl-10 ${
                        hasFieldError('email') 
                          ? 'border-destructive bg-destructive/10' 
                          : ''
                      }`}
                      placeholder="Enter your email"
                      autoComplete={isSignUp ? 'email' : 'username'}
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      maxLength={100}
                    />
                  </div>
                  {getFieldError('email') && (
                    <p className="text-sm text-destructive flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {getFieldError('email')}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-foreground">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      ref={passwordRef}
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`pl-10 pr-10 ${
                        hasFieldError('password') 
                          ? 'border-destructive bg-destructive/10' 
                          : ''
                      }`}
                      placeholder="Enter your password"
                      autoComplete={isSignUp ? 'new-password' : 'current-password'}
                      minLength={6}
                      maxLength={128}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {getFieldError('password') && (
                    <p className="text-sm text-destructive flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {getFieldError('password')}
                    </p>
                  )}
                  {isSignUp && (
                    <p className="text-xs text-muted-foreground">
                      Password must be at least 6 characters long
                    </p>
                  )}
                </div>

                {/* Confirm Password Field (Sign Up Only) */}
                {isSignUp && (
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required={isSignUp}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 pr-10"
                        placeholder="Confirm your password"
                        autoComplete="new-password"
                        minLength={6}
                        maxLength={128}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Remember Me (Sign In Only) */}
                {!isSignUp && (
                  <div className="flex items-center">
                    <input
                      id="rememberMe"
                      name="rememberMe"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                    />
                    <label htmlFor="rememberMe" className="ml-2 block text-sm text-foreground">
                      Remember me for 30 days
                    </label>
                  </div>
                )}

                {/* Error Display */}
                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {error}
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-amber-400 text-slate-900 hover:bg-amber-300 font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-900 mr-2"></div>
                      {isSignUp ? 'Creating Account...' : 'Signing In...'}
                    </div>
                  ) : (
                    isSignUp ? 'Create Account' : 'Sign In'
                  )}
                </Button>
              </form>

              {/* Mode Toggle */}
              <div className="text-center pt-2">
                <p className="text-sm text-muted-foreground">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="ml-1 text-primary hover:text-primary/80 font-medium transition-colors duration-200"
                  >
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary/70 px-3 py-1 text-xs text-muted-foreground ring-1 ring-border">
              <ShieldCheck className="h-3.5 w-3.5" />
              Your data is stored locally and encrypted for security
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              This app is designed for family use and runs entirely in your browser
            </p>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  )
}
