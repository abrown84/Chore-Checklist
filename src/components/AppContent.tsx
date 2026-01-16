import React, { lazy, Suspense } from 'react'

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
const AboutPage = lazy(() =>
  import('./AboutPage').then(module => ({ default: module.AboutPage }))
)
const A2UIDemo = lazy(() =>
  import('./A2UIDemo').then(module => ({ default: module.A2UIDemo }))
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

export const AppContent: React.FC<AppContentProps> = ({ activeTab }) => {
  return (
    <>
      {/* Tab Content */}
      {activeTab === 'chores' && (
        <Suspense fallback={<LoadingFallback />}>
          <div className="space-y-8">
            {/* Points Counter */}
            <PointsCounter />

            {/* Chore List */}
            <ChoreList />

            {/* Add Chore Form - Moved to bottom */}
            <AddChoreForm />
          </div>
        </Suspense>
      )}

      {activeTab === 'leaderboard' && (
        <Suspense fallback={<LoadingFallback />}>
          <div className="space-y-6">
            <Leaderboard />
          </div>
        </Suspense>
      )}

      {activeTab === 'household' && (
        <Suspense fallback={<LoadingFallback />}>
          <div className="space-y-6">
            <HouseholdManager />
          </div>
        </Suspense>
      )}

      {activeTab === 'profile' && (
        <Suspense fallback={<LoadingFallback />}>
          <div className="space-y-6">
            <ProfileAndRewards />
          </div>
        </Suspense>
      )}

      {activeTab === 'redemption' && (
        <Suspense fallback={<LoadingFallback />}>
          <div className="space-y-6">
            <PointRedemption />
          </div>
        </Suspense>
      )}

      {activeTab === 'admin' && (
        <Suspense fallback={<LoadingFallback />}>
          <div className="space-y-6">
            <AdminControlPanel />
          </div>
        </Suspense>
      )}

      {activeTab === 'about' && (
        <Suspense fallback={<LoadingFallback />}>
          <div className="space-y-6">
            <AboutPage />
          </div>
        </Suspense>
      )}

      {activeTab === 'a2ui' && (
        <Suspense fallback={<LoadingFallback />}>
          <div className="space-y-6">
            <A2UIDemo />
          </div>
        </Suspense>
      )}

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



