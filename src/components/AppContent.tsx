import React from 'react'
import { ChoreList } from './ChoreList'
import { AddChoreForm } from './AddChoreForm'
import { ChoreProgress } from './ChoreProgress'
import { PointsCounter } from './PointsCounter'
import { ProfileAndRewards } from './ProfileAndRewards'
import { HouseholdManager } from './HouseholdManager'
import { Leaderboard } from './Leaderboard'
import { PointRedemption } from './PointRedemption'
import { LevelUpCelebration } from './LevelUpCelebration'
import { PWAInstaller } from './PWAInstaller'

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
          
          {/* Chore Progress */}
          <ChoreProgress />
          
          {/* Chore List */}
          <ChoreList />
          
          {/* Add Chore Form - Moved to bottom */}
          <AddChoreForm />
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="space-y-6">
          <Leaderboard />
        </div>
      )}

      {activeTab === 'household' && (
        <div className="space-y-6">
          <HouseholdManager />
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="space-y-6">
          <ProfileAndRewards />
        </div>
      )}

      {activeTab === 'redemption' && (
        <div className="space-y-6">
          <PointRedemption />
        </div>
      )}

      {/* Celebrations */}
      <LevelUpCelebration />
      
      {/* PWA Installer */}
      <PWAInstaller />
    </>
  )
}



