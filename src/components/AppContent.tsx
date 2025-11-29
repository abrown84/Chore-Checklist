import React, { lazy, Suspense } from 'react'
import { ChoreList } from './ChoreList'
import { AddChoreForm } from './AddChoreForm'
import { PointsCounter } from './PointsCounter'
import { LevelUpCelebration } from './LevelUpCelebration'
import { PWAInstaller } from './PWAInstaller'

// Lazy load route-based components for code splitting
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
        <div className="space-y-8">
          {/* Points Counter */}
          <PointsCounter />
          
          {/* Chore List */}
          <ChoreList />
          
          {/* Add Chore Form - Moved to bottom */}
          <AddChoreForm />
        </div>
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

      {/* Celebrations */}
      <LevelUpCelebration />
      
      {/* PWA Installer */}
      <PWAInstaller />
    </>
  )
}



