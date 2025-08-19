
import React, { useState } from 'react'
import { Trophy } from 'lucide-react'
import { useUsers } from '../contexts/UserContext'
import { useStats } from '../contexts/StatsContext'
import { useChores } from '../contexts/ChoreContext'
import { RANKING_MODES, RankingMode } from '../config/constants'
import { useLeaderboardData } from '../hooks/useLeaderboardData'
import { PersonalProgress } from './leaderboard/PersonalProgress'
import { HouseholdStats } from './leaderboard/HouseholdStats'
import { RankingModeToggle } from './leaderboard/RankingModeToggle'
import { LeaderboardList } from './leaderboard/LeaderboardList'
import { RecentActivity } from './leaderboard/RecentActivity'
import { LevelOverview } from './leaderboard/LevelOverview'
import { AchievementsPreview } from './leaderboard/AchievementsPreview'

export const Leaderboard: React.FC = React.memo(() => {
  const { state: userState } = useUsers()
  const { getAllUserStats } = useStats()
  const { state: choreState } = useChores()
  const [rankingMode, setRankingMode] = useState<RankingMode>(RANKING_MODES.POINTS)
  
  // Get unified stats from StatsContext (single source of truth)
  const memberStats = getAllUserStats()
  
  // Debug logging
  console.log('🔍 Leaderboard Debug Data:', {
    userState: {
      currentUser: userState.currentUser,
      membersCount: userState.members.length,
      members: userState.members
    },
    choreState: {
      choresCount: choreState.chores.length,
      completedChores: choreState.chores.filter(c => c.completed).length
    },
    memberStats: {
      count: memberStats.length,
      stats: memberStats
    }
  })
  
  // Use custom hook for leaderboard data processing
  const { processedLeaderboard, currentUserStats } = useLeaderboardData({
    memberStats,
    members: userState.members,
    currentUserId: userState.currentUser?.id,
    rankingMode,
  })

  // Debug processed leaderboard
  console.log('🔍 Processed Leaderboard:', {
    processedLeaderboard,
    currentUserStats,
    rankingMode
  })

  

  const handleRankingModeChange = (mode: RankingMode) => {
    setRankingMode(mode)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center animate-fade-in">
        <h1 className="text-4xl font-bold text-foreground mb-3 animate-slide-in">📊 Daily Grind Dashboard</h1>
        <p className="text-xl text-muted-foreground animate-fade-in" style={{ animationDelay: '0.2s' }}>
          Track progress, compete, and celebrate achievements together!
        </p>
      </div>

      {/* Personal Progress Hero Section */}
      {userState.currentUser && currentUserStats && (
        <PersonalProgress 
          currentUser={userState.currentUser}
          currentUserStats={currentUserStats}
        />
      )}

      {/* Household Stats Overview */}
      <HouseholdStats 
        memberStats={memberStats}
        chores={choreState.chores}
        membersCount={userState.members.length}
      />

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Leaderboard Section */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-card p-6 rounded-xl border shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
              <h3 className="text-xl font-semibold text-foreground flex items-center">
                <Trophy className="w-6 h-6 mr-2 text-warning" />
                Leaderboard
              </h3>
              
              {/* Ranking Mode Toggle */}
              <RankingModeToggle 
                rankingMode={rankingMode}
                onRankingModeChange={handleRankingModeChange}
              />
            </div>

            {/* Leaderboard List */}
            <LeaderboardList 
              members={processedLeaderboard}
              rankingMode={rankingMode}
            />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <RecentActivity chores={choreState.chores} />

          {/* Quick Level Overview */}
          <LevelOverview 
            members={userState.members}
            memberStats={memberStats}
          />

          {/* Achievements Preview */}
          <AchievementsPreview currentUserStats={currentUserStats} />
        </div>
      </div>

      {/* Empty State */}
      {processedLeaderboard.length === 0 && (
        <div className="text-center py-12 animate-fade-in">
          <div className="text-6xl mb-4 animate-float">🏠</div>
          <h3 className="text-xl font-semibold text-foreground mb-2 animate-slide-in" style={{ animationDelay: '0.2s' }}>
            No Household Members Yet
          </h3>
          <p className="text-muted-foreground animate-fade-in" style={{ animationDelay: '0.4s' }}>
            Add some family members to start competing on the leaderboard!
          </p>
        </div>
      )}
    </div>
  )
})

Leaderboard.displayName = 'Leaderboard'
