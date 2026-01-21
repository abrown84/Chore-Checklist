import { useState, useEffect } from 'react'
import { Toaster } from 'sonner'
import { useMutation } from 'convex/react'
import { api } from '../convex/_generated/api'
import { useAuth } from './hooks/useAuth'
import { useUsers } from './contexts/UserContext'
import { useDemo } from './contexts/DemoContext'
import { usePaymentResult } from './hooks/usePaymentResult'
import { AppHeader } from './components/AppHeader'
import { AppLayout } from './components/AppLayout'
import { AppContent } from './components/AppContent'
import { AppProviders } from './components/AppProviders'
import { ErrorBoundary } from './components/ErrorBoundary'
import { MigrationBanner } from './components/MigrationBanner'
import { OnboardingModal } from './components/OnboardingModal'

function AppContentWrapper() {
  const { user, signOut } = useAuth()
  const { syncWithAuth } = useUsers()
  const { isDemoMode, exitDemoMode } = useDemo()
  const [activeTab, setActiveTab] = useState('chores')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)

  usePaymentResult()

  const completeOnboarding = useMutation(api.onboarding.completeOnboarding)

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)
  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  useEffect(() => {
    if (user) {
      syncWithAuth(user)
    }
  }, [user, syncWithAuth])

  useEffect(() => {
    if (user && user.hasCompletedOnboarding === false && !isDemoMode) {
      setShowOnboarding(true)
    }
  }, [user, isDemoMode])

  const handleOnboardingClose = async (dontShowAgain: boolean) => {
    try {
      await completeOnboarding({ dontShowAgain })
    } catch (error) {
      console.error('Failed to complete onboarding:', error)
    }
    setShowOnboarding(false)
  }

  const handleSignOut = () => {
    try {
      signOut()
    } catch (error) {
      console.error('Error during sign out:', error)
      signOut()
    }
  }

  const handleGoHome = () => setActiveTab('chores')

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <Toaster position="top-right" />
      <MigrationBanner />

      <OnboardingModal
        isOpen={showOnboarding}
        onClose={handleOnboardingClose}
      />

      {/* Mobile Header - hidden on desktop */}
      <div className="lg:hidden">
        <AppHeader
          user={user}
          isDemoMode={isDemoMode}
          onSignOut={handleSignOut}
          onExitDemo={exitDemoMode}
          onGoHome={handleGoHome}
          onMenuToggle={toggleMobileMenu}
          isMenuOpen={isMobileMenuOpen}
        />
      </div>

      {/* Main Layout */}
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
