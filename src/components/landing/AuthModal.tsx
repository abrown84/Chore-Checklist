import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
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
  const { signIn, signUp } = useAuth()
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      />
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        onClick={(e) => e.stopPropagation()}
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
                disabled={isLoading}
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
      </motion.div>
    </>
  )
}
