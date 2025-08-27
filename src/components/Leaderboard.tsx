
import React, { useState } from 'react'
import { Trophy, DollarSign, Coins, Star, Clock, CheckCircle, XCircle, ArrowRight, TrendingUp, Users, Target, Award } from 'lucide-react'
import { useUsers } from '../contexts/UserContext'
import { useStats } from '../hooks/useStats'
import { useChores } from '../contexts/ChoreContext'
import { RANKING_MODES, RankingMode } from '../config/constants'
import { useLeaderboardData } from '../hooks/useLeaderboardData'
import { useRedemption } from '../contexts/RedemptionContext'
import { PersonalProgress } from './leaderboard/PersonalProgress'
import { HouseholdStats } from './leaderboard/HouseholdStats'
import { RankingModeToggle } from './leaderboard/RankingModeToggle'
import { LeaderboardList } from './leaderboard/LeaderboardList'
import { RecentActivity } from './leaderboard/RecentActivity'
import { LevelOverview } from './leaderboard/LevelOverview'
import { AchievementsPreview } from './leaderboard/AchievementsPreview'
import { Button } from '../components/ui/button'

export const Leaderboard: React.FC = React.memo(() => {
  const { state: userState } = useUsers()
  const { getAllUserStats } = useStats()
  const { state: choreState } = useChores()
  const [rankingMode, setRankingMode] = useState<RankingMode>(RANKING_MODES.POINTS)
  
  // Get unified stats from StatsContext (single source of truth)
  const memberStats = getAllUserStats()
  
  // Use redemption context
  const { conversionRate, getHouseholdRedemptionSummary, getPendingRedemptionPoints, getTotalRedeemedValue } = useRedemption()

  // Use custom hook for leaderboard data processing
  const { processedLeaderboard, currentUserStats } = useLeaderboardData({
    memberStats,
    members: userState.members,
    currentUserId: userState.currentUser?.id,
    rankingMode,
    redemptionData: {
      getPendingRedemptionPoints,
      getTotalRedeemedValue
    }
  })

  const handleRankingModeChange = (mode: RankingMode) => {
    setRankingMode(mode)
  }

  // Calculate household redemption potential
  const householdRedemptionValue = memberStats.reduce((total, stats) => {
    return total + (stats.earnedPoints / conversionRate)
  }, 0)

  // Get redemption summary
  const redemptionSummary = getHouseholdRedemptionSummary()

  // Navigate to redemption page
  const navigateToRedemption = () => {
    // You can implement navigation logic here
    // For now, we'll just scroll to the redemption section if it exists
    const redemptionSection = document.getElementById('point-redemption')
    if (redemptionSection) {
      redemptionSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center animate-fade-in">
        <h1 className="text-4xl font-bold text-foreground mb-3 animate-slide-in bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          📊 Daily Grind Dashboard
        </h1>
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

      {/* Redemption Summary - Enhanced Section with Better Theming */}
      <div className="bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 dark:from-green-950/20 dark:via-blue-950/20 dark:to-purple-950/20 border border-green-200 dark:border-green-800 rounded-xl p-6 shadow-lg">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center justify-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full mr-3">
              <Coins className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            Household Redemption Economy
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                  <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Points</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {memberStats.reduce((sum, stats) => sum + stats.earnedPoints, 0).toLocaleString()}
              </p>
            </div>
            
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Lifetime Points</span>
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {(memberStats.reduce((sum, stats) => sum + stats.earnedPoints, 0) + (redemptionSummary.totalApprovedValue * conversionRate)).toLocaleString()}
              </p>
            </div>
            
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Available Value</span>
              </div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${householdRedemptionValue.toFixed(2)}
              </p>
            </div>
            
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Pending</span>
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ${(redemptionSummary.totalPendingPoints / conversionRate).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{redemptionSummary.pendingRequestsCount} requests</p>
            </div>
            
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                  <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Redeemed</span>
              </div>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                ${redemptionSummary.totalApprovedValue.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{redemptionSummary.approvedRequestsCount} approved</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 text-sm text-muted-foreground mb-6">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-primary" />
              <span>Current rate: {conversionRate} points = $1.00</span>
            </div>
            <div className="hidden sm:block text-muted-foreground">•</div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              <span>Total household value: ${(householdRedemptionValue + redemptionSummary.totalApprovedValue).toFixed(2)}</span>
            </div>
          </div>
          
          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Button 
              onClick={navigateToRedemption}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Manage Redemptions
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            {redemptionSummary.pendingRequestsCount > 0 && (
              <div className="flex items-center space-x-2 text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-4 py-2 rounded-lg border border-orange-200 dark:border-orange-700">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {redemptionSummary.pendingRequestsCount} pending request{redemptionSummary.pendingRequestsCount !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Leaderboard Section */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
              <h3 className="text-xl font-semibold text-foreground flex items-center">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mr-3">
                  <Trophy className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
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
              conversionRate={conversionRate}
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
