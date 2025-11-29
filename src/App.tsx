import { useState, useEffect } from 'react'
import { Toaster } from 'sonner'
import { useAuth } from './hooks/useAuth'
import { useUsers } from './contexts/UserContext'
import { useDemo } from './contexts/DemoContext'
import { AppHeader } from './components/AppHeader'
import { AppLayout } from './components/AppLayout'
import { AppContent } from './components/AppContent'
import { AppProviders } from './components/AppProviders'
import { ErrorBoundary } from './components/ErrorBoundary'
import { MigrationBanner } from './components/MigrationBanner'

function AppContentWrapper() {
  const { user, signOut } = useAuth()
  const { syncWithAuth } = useUsers()
  const { isDemoMode, exitDemoMode } = useDemo()
  const [activeTab, setActiveTab] = useState('chores')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  // Sync authentication state with UserContext when user changes
  useEffect(() => {
    if (user) {
      syncWithAuth(user)
    }
  }, [user, syncWithAuth])

  const handleSignOut = () => {
    try {
      // CRITICAL: Don't reset user state - this preserves user levels and chore history
      // resetUserState() - REMOVED: This was causing level reset on logout/login
      
      // Don't clear chore state - this preserves chore completion history and points
      // clearChoreState() - REMOVED: This was causing chore data loss
      
      // Call signOut to clear auth state only (chores and levels persist in localStorage)
      signOut()
    } catch (error) {
      console.error('Error during sign out:', error)
      // Force sign out even if there's an error
      signOut()
    }
  }


  const handleGoHome = () => {
    setActiveTab('chores')
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="top-right" />
      
      {/* Migration Banner */}
      <MigrationBanner />
      
      {/* Header */}
      <AppHeader
        user={user}
        isDemoMode={isDemoMode}
        onSignOut={handleSignOut}
        onExitDemo={exitDemoMode}
        onGoHome={handleGoHome}
        onMenuToggle={toggleMobileMenu}
        isMenuOpen={isMobileMenuOpen}
      />

      {/* Layout Container */}
      <AppLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isDemoMode={isDemoMode}
        onSignOut={handleSignOut}
        onExitDemo={exitDemoMode}
        onGoHome={handleGoHome}
        user={user}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuClose={closeMobileMenu}
      >
        <AppContent activeTab={activeTab} />
      </AppLayout>
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <AppContentWrapper />
      </AppProviders>
    </ErrorBoundary>
  )
}
