import React, { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { useAuthActions } from '@convex-dev/auth/react'
import { api } from '../../../convex/_generated/api'
import { Card, CardHeader, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Lock, KeyRound, Check, AlertCircle, Trash2, Mail } from 'lucide-react'
import { useConvexAuth } from '../../hooks/useConvexAuth'

export const PasswordSettings: React.FC = React.memo(() => {
  const hasPassword = useQuery(api.auth.hasPasswordAuth)
  const deleteAccountMutation = useMutation(api.auth.deleteAccount)
  const { signIn } = useAuthActions()
  const { user, signOut } = useConvexAuth()

  // Password reset state
  const [resetStep, setResetStep] = useState<'idle' | 'sent' | 'verify'>('idle')
  const [resetCode, setResetCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isResetting, setIsResetting] = useState(false)
  const [resetError, setResetError] = useState('')
  const [resetSuccess, setResetSuccess] = useState('')

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteEmail, setDeleteEmail] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const handleRequestReset = async () => {
    if (!user?.email) return
    setIsResetting(true)
    setResetError('')

    try {
      const formData = new FormData()
      formData.append('email', user.email)
      formData.append('flow', 'reset')

      await signIn('password', formData)
      setResetStep('verify')
      setResetSuccess('Reset code sent to your email!')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send reset code'
      setResetError(message)
    } finally {
      setIsResetting(false)
    }
  }

  const handleVerifyReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.email) return
    setIsResetting(true)
    setResetError('')

    try {
      const formData = new FormData()
      formData.append('email', user.email)
      formData.append('code', resetCode)
      formData.append('newPassword', newPassword)
      formData.append('flow', 'reset-verification')

      await signIn('password', formData)
      setResetSuccess('Password changed successfully!')
      setResetStep('idle')
      setResetCode('')
      setNewPassword('')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid code or failed to change password'
      setResetError(message)
    } finally {
      setIsResetting(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user?.email) return
    setIsDeleting(true)
    setDeleteError('')

    try {
      await deleteAccountMutation({ confirmEmail: deleteEmail })
      // Sign out after deletion
      await signOut()
      // Redirect to home
      window.location.href = '/'
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete account'
      setDeleteError(message)
      setIsDeleting(false)
    }
  }

  const cancelReset = () => {
    setResetStep('idle')
    setResetCode('')
    setNewPassword('')
    setResetError('')
    setResetSuccess('')
  }

  // Loading state
  if (hasPassword === undefined) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Password Management Card */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Password</h3>
          </div>
        </CardHeader>
        <CardContent>
          {!hasPassword ? (
            <p className="text-sm text-muted-foreground">
              You signed up with a social account (Google or GitHub). To set a password, use the "Forgot Password" option on the sign-in page with your email.
            </p>
          ) : resetStep === 'idle' ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Change your password by requesting a reset code via email.
              </p>
              {resetSuccess && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-sm text-green-600 dark:text-green-400 flex items-center">
                    <Check className="w-4 h-4 mr-2" />
                    {resetSuccess}
                  </p>
                </div>
              )}
              {resetError && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {resetError}
                  </p>
                </div>
              )}
              <Button
                variant="outline"
                onClick={handleRequestReset}
                disabled={isResetting}
                className="mt-2"
              >
                {isResetting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                    Sending...
                  </div>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Reset Code
                  </>
                )}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleVerifyReset} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter the code sent to <strong>{user?.email}</strong> and your new password.
              </p>

              <div className="space-y-2">
                <label htmlFor="reset-code" className="block text-sm font-medium">
                  Reset Code
                </label>
                <Input
                  id="reset-code"
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  placeholder="Enter code from email"
                  required
                  autoComplete="one-time-code"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="new-password" className="block text-sm font-medium">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10"
                    placeholder="Enter new password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
              </div>

              {resetError && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {resetError}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={cancelReset}
                  disabled={isResetting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isResetting || !resetCode || !newPassword}
                  className="bg-amber-400 text-slate-900 hover:bg-amber-300"
                >
                  {isResetting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-900 mr-2" />
                      Verifying...
                    </div>
                  ) : (
                    'Change Password'
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Delete Account Card */}
      <Card className="border-destructive/30 bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            <h3 className="text-lg font-semibold text-destructive">Delete Account</h3>
          </div>
        </CardHeader>
        <CardContent>
          {!showDeleteConfirm ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <Button
                variant="outline"
                className="border-destructive/50 text-destructive hover:bg-destructive/10"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete My Account
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive font-medium">
                  Warning: This will permanently delete:
                </p>
                <ul className="text-sm text-destructive mt-2 list-disc list-inside">
                  <li>Your profile and settings</li>
                  <li>All your chores and history</li>
                  <li>Your household memberships</li>
                  <li>Your subscription (if any)</li>
                </ul>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirm-email" className="block text-sm font-medium">
                  Type your email to confirm: <strong>{user?.email}</strong>
                </label>
                <Input
                  id="confirm-email"
                  type="email"
                  value={deleteEmail}
                  onChange={(e) => setDeleteEmail(e.target.value)}
                  placeholder="Enter your email"
                  autoComplete="off"
                />
              </div>

              {deleteError && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {deleteError}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeleteEmail('')
                    setDeleteError('')
                  }}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || deleteEmail.toLowerCase() !== user?.email?.toLowerCase()}
                >
                  {isDeleting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Deleting...
                    </div>
                  ) : (
                    'Permanently Delete Account'
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
})

PasswordSettings.displayName = 'PasswordSettings'
