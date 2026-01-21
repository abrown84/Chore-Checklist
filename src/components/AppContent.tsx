import React, { lazy, Suspense } from 'react'
import { PageTransition } from './animations'

// Lazy load ALL tab components for optimal code splitting
const ChoreList = lazy(() =>
  import('./ChoreList').then(module => ({ default: module.ChoreList }))
)
const AddChoreForm = lazy(() =>
  import('./AddChoreForm').then(module => ({ default: module.AddChoreForm }))
)
const PointsCounter = lazy(() =>
  import('./PointsCounter').then(module => ({ default: module.PointsCounter }))
)
const LevelUpCelebration = lazy(() =>
  import('./LevelUpCelebration').then(module => ({ default: module.LevelUpCelebration }))
)
const PWAInstaller = lazy(() =>
  import('./PWAInstaller').then(module => ({ default: module.PWAInstaller }))
)
const Leaderboard = lazy(() =>
  import('./Leaderboard').then(module => ({ default: module.Leaderboard }))
)
const HouseholdManager = lazy(() =>
  import('./HouseholdManager').then(module => ({ default: module.HouseholdManager }))
)
const ProfileAndRewards = lazy(() =>
  import('./ProfileAndRewards').then(module => ({ default: module.ProfileAndRewards }))
)
const PointRedemption = lazy(() =>
  import('./PointRedemption').then(module => ({ default: module.PointRedemption }))
)
const AdminControlPanel = lazy(() =>
  import('./AdminControlPanel').then(module => ({ default: module.AdminControlPanel }))
)
const SiteAdminPanel = lazy(() =>
  import('./SiteAdminPanel').then(module => ({ default: module.SiteAdminPanel }))
)
const AboutPage = lazy(() =>
  import('./AboutPage').then(module => ({ default: module.AboutPage }))
)

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
)

interface AppContentProps {
  activeTab: string
}

// Render the appropriate tab content
const renderTabContent = (tab: string) => {
  switch (tab) {
    case 'chores':
      return (
        <div className="space-y-8">
          <PointsCounter />
          <ChoreList />
          <AddChoreForm />
        </div>
      )
    case 'leaderboard':
      return (
        <div className="space-y-6">
          <Leaderboard />
        </div>
      )
    case 'household':
      return (
        <div className="space-y-6">
          <HouseholdManager />
        </div>
      )
    case 'profile':
      return (
        <div className="space-y-6">
          <ProfileAndRewards />
        </div>
      )
    case 'redemption':
      return (
        <div className="space-y-6">
          <PointRedemption />
        </div>
      )
    case 'admin':
      return (
        <div className="space-y-6">
          <AdminControlPanel />
        </div>
      )
    case 'siteAdmin':
      return (
        <div className="space-y-6">
          <SiteAdminPanel />
        </div>
      )
    case 'about':
      return (
        <div className="space-y-6">
          <AboutPage />
        </div>
      )
    default:
      return null
  }
}

export const AppContent: React.FC<AppContentProps> = ({ activeTab }) => {
  return (
    <>
      {/* Tab Content with Page Transitions */}
      <Suspense fallback={<LoadingFallback />}>
        <PageTransition activeTab={activeTab}>
          {renderTabContent(activeTab)}
        </PageTransition>
      </Suspense>

      {/* Celebrations */}
      <Suspense fallback={null}>
        <LevelUpCelebration />
      </Suspense>

      {/* PWA Installer */}
      <Suspense fallback={null}>
        <PWAInstaller />
      </Suspense>
    </>
  )
}



