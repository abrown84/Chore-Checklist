import React, { useState, useRef, useEffect } from 'react'
import { animate } from 'animejs'
import { Card, CardContent, CardHeader } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { useAuth } from '../../hooks/useAuth'
import { validateEmail, validatePassword, validateName } from '../../utils/validation'
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  X,
  ShieldCheck as ShieldCheckIcon,
} from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signIn, signUp, signInWithOAuth } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<'github' | 'google' | null>(null)
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
  const backdropRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Animate in on mount
  useEffect(() => {
    if (isOpen) {
      // Animate backdrop
      if (backdropRef.current) {
        animate(backdropRef.current, {
          opacity: [0, 1],
          duration: 200,
          ease: 'outQuart',
        })
      }
      // Animate modal - slide down from top
      if (modalRef.current) {
        animate(modalRef.current, {
          opacity: [0, 1],
          scale: [0.97, 1],
          translateY: [-20, 0],
          duration: 350,
          ease: 'outBack',
        })
      }
    }
  }, [isOpen])

  // Help browsers with autofill
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

    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      errors.email = emailValidation.errors[0]
    }

    const passwordValidation = isSignUp
      ? validatePassword(password, confirmPassword)
      : validatePassword(password)

    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors[0]
    }

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
    e.stopPropagation()
    setError('')

    import.meta.env.DEV && console.log('Form submitted', { isSignUp, email: email.substring(0, 3) + '***' })

    if (!validateFields()) {
      import.meta.env.DEV && console.log('Validation failed')
      return
    }

    setIsLoading(true)

    try {
      import.meta.env.DEV && console.log('Attempting', isSignUp ? 'sign-up' : 'sign-in', 'for', email)

      if (isSignUp) {
        await signUp(email, password, name)
      } else {
        await signIn(email, password)
      }

      import.meta.env.DEV && console.log('Auth action completed successfully')

      // Close modal - the reactive queries will update and ProtectedRoute will show the app
      onClose()
      setIsLoading(false)

      if (window.location.hash === '#signin') {
        window.history.replaceState(null, '', window.location.pathname)
      }
    } catch (error) {
      console.error('Auth action failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'An error occurred. Please try again.'
      setError(errorMessage)
      setIsLoading(false)
    }
  }

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    setError('')
    setFieldErrors({})
    if (isSignUp) {
      setEmail('')
      setPassword('')
    }
    setName('')
    setConfirmPassword('')
  }

  const handleOAuthSignIn = async (provider: 'github' | 'google') => {
    setError('')
    setOauthLoading(provider)
    try {
      await signInWithOAuth(provider)
      // OAuth redirects, so we don't need to close the modal
    } catch (error) {
      console.error(`OAuth ${provider} sign-in failed:`, error)
      const errorMessage = error instanceof Error ? error.message : `Failed to sign in with ${provider}`
      setError(errorMessage)
      setOauthLoading(null)
    }
  }

  const getFieldError = (field: string): string | undefined => {
    return fieldErrors[field]
  }

  const hasFieldError = (field: string): boolean => {
    return !!getFieldError(field)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        style={{ opacity: 0 }}
      />
      {/* Modal - positioned near top where sign-in button is */}
      <div
        ref={modalRef}
        className="fixed inset-x-0 top-0 z-50 flex justify-center pt-16 sm:pt-20 px-4"
        onClick={(e) => e.stopPropagation()}
        style={{ opacity: 0 }}
      >
        <Card className="w-full max-w-md border-border bg-card/95 backdrop-blur-md shadow-xl max-h-[90vh] overflow-y-auto">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-heading font-semibold">
                  {isSignUp ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {isSignUp
                    ? "Join your family's chore management system"
                    : 'Sign in to continue managing your chores'
                  }
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field (Sign Up Only) */}
              {isSignUp && (
                <div className="space-y-2">
                  <label htmlFor="modal-name" className="block text-sm font-medium text-foreground">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      ref={nameRef}
                      id="modal-name"
                      name="name"
                      type="text"
                      required={isSignUp}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`pl-10 text-base sm:text-sm min-h-[44px] ${
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
                <label htmlFor="modal-email" className="block text-sm font-medium text-foreground">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    ref={emailRef}
                    id="modal-email"
                    name={isSignUp ? 'email' : 'username'}
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`pl-10 text-base sm:text-sm min-h-[44px] ${
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
                <label htmlFor="modal-password" className="block text-sm font-medium text-foreground">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    ref={passwordRef}
                    id="modal-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pl-10 pr-10 text-base sm:text-sm min-h-[44px] ${
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
                  <label htmlFor="modal-confirmPassword" className="block text-sm font-medium text-foreground">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      id="modal-confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required={isSignUp}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10 text-base sm:text-sm min-h-[44px]"
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="modal-rememberMe"
                      name="rememberMe"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                    />
                    <label htmlFor="modal-rememberMe" className="ml-2 block text-sm text-foreground">
                      Remember me for 30 days
                    </label>
                  </div>
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
                disabled={isLoading || oauthLoading !== null}
                className="w-full bg-amber-400 text-slate-900 hover:bg-amber-300 font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] sm:min-h-[44px]"
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

            {/* OAuth Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            {/* OAuth Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuthSignIn('github')}
                disabled={isLoading || oauthLoading !== null}
                className="min-h-[44px]"
              >
                {oauthLoading === 'github' ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground" />
                ) : (
                  <>
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuthSignIn('google')}
                disabled={isLoading || oauthLoading !== null}
                className="min-h-[44px]"
              >
                {oauthLoading === 'google' ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground" />
                ) : (
                  <>
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </>
                )}
              </Button>
            </div>

            {/* Mode Toggle */}
            <div className="text-center pt-2">
              <p className="text-sm text-muted-foreground">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="ml-1 text-amber-400 hover:text-amber-300 font-medium transition-colors duration-200"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>

            {/* Security Notice */}
            <div className="text-center pt-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-secondary/70 px-3 py-1 text-xs text-muted-foreground ring-1 ring-border">
                <ShieldCheckIcon className="h-3.5 w-3.5" />
                Your data is stored securely
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
