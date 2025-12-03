
import React, { useState } from 'react'
import { Trophy, DollarSign, Coins, Star, Clock, CheckCircle, ArrowRight, TrendingUp, Target, Award } from 'lucide-react'
import { useUsers } from '../contexts/UserContext'
import { useStats } from '../hooks/useStats'
import { useChores } from '../contexts/ChoreContext'
import { useAuth } from '../hooks/useAuth'
import { RANKING_MODES, RankingMode } from '../config/constants'
import { useLeaderboardData } from '../hooks/useLeaderboardData'
import { LEVELS } from '../types/chore'
import { useRedemption } from '../contexts/RedemptionContext'
import { PersonalProgress } from './leaderboard/PersonalProgress'
import { HouseholdStats } from './leaderboard/HouseholdStats'
import { RankingModeToggle } from './leaderboard/RankingModeToggle'
import { LeaderboardList } from './leaderboard/LeaderboardList'
import { RecentActivity } from './leaderboard/RecentActivity'
import { LevelOverview } from './leaderboard/LevelOverview'
import { AchievementsPreview } from './leaderboard/AchievementsPreview'
import { LeaderboardViewToggle, LeaderboardView } from './leaderboard/LeaderboardViewToggle'
import { Button } from '../components/ui/button'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useCurrentHousehold } from '../hooks/useCurrentHousehold'
import { useNavigation } from '../contexts/NavigationContext'

export const Leaderboard: React.FC = React.memo(() => {
  const { state: userState } = useUsers()
  const { getAllUserStats } = useStats()
  const { state: choreState } = useChores()
  const currentHouseholdId = useCurrentHousehold()
  const [rankingMode, setRankingMode] = useState<RankingMode>(RANKING_MODES.POINTS)
  const [leaderboardView, setLeaderboardView] = useState<LeaderboardView>('household')
  
  // Get unified stats from StatsContext (single source of truth)
  const memberStats = getAllUserStats()
  
  const { isAuthenticated } = useAuth()
  
  // Fetch global leaderboard data (only if authenticated and viewing global)
  const globalLeaderboardData = useQuery(
    api.stats.getGlobalLeaderboard,
    leaderboardView === 'global' && isAuthenticated ? {} : 'skip'
  )
  
  // Use redemption context
  const { conversionRate, getHouseholdRedemptionSummary, getPendingRedemptionPoints, getTotalRedeemedValue } = useRedemption()

  // Process household leaderboard data
  const { processedLeaderboard: householdLeaderboard, currentUserStats } = useLeaderboardData({
    memberStats,
    members: userState.members,
    currentUserId: userState.currentUser?.id,
    rankingMode,
    redemptionData: {
      getPendingRedemptionPoints,
      getTotalRedeemedValue
    }
  })

  // Process global leaderboard data (household-level)
  const processedGlobalLeaderboard = React.useMemo(() => {
    if (leaderboardView !== 'global') return []
    
    // Handle loading state
    if (globalLeaderboardData === undefined) {
      console.log('🔍 Global leaderboard: Loading...')
      return []
    }
    
    // Handle error state
    if (globalLeaderboardData === null) {
      console.error('❌ Global leaderboard: Query returned null (error)')
      return []
    }
    
    console.log('🔍 Global leaderboard data received:', globalLeaderboardData)
    
    if (!Array.isArray(globalLeaderboardData) || globalLeaderboardData.length === 0) {
      console.warn('⚠️ Global leaderboard: Empty array or invalid data', globalLeaderboardData)
      return []
    }
    
    return globalLeaderboardData
      .map((household) => {
        // Calculate average level from members
        const avgLevel = household.members.length > 0
          ? Math.round(household.members.reduce((sum: number, m: { level: number }) => sum + m.level, 0) / household.members.length)
          : 1
        
        const currentLevelData = LEVELS.find((level) => level.level === avgLevel)
        const nextLevelData = LEVELS.find((level) => level.level === avgLevel + 1)
        
        const progressToNextLevel = nextLevelData
          ? ((household.totalPoints - (currentLevelData?.pointsRequired || 0)) /
              (nextLevelData.pointsRequired - (currentLevelData?.pointsRequired || 0))) *
            100
          : 100

        return {
          id: household.householdId,
          name: household.householdName,
          email: undefined,
          avatar: '🏠', // House emoji for households
          currentLevel: avgLevel,
          currentLevelData,
          nextLevelData,
          levelProgress: Math.min(Math.max(progressToNextLevel, 0), 100),
          earnedPoints: household.totalPoints,
          efficiencyScore: household.averageEfficiency || 0,
          completedChores: household.completedChores,
          totalChores: household.totalChores,
          completionRate: household.completionRate || 0,
          isCurrentUser: household.householdId === currentHouseholdId,
          householdName: household.householdName,
          memberCount: household.memberCount,
          members: household.members,
        }
      })
      .sort((a, b) => {
        if (rankingMode === RANKING_MODES.POINTS) {
          return b.earnedPoints - a.earnedPoints
        } else if (rankingMode === RANKING_MODES.EFFICIENCY) {
          return b.efficiencyScore - a.efficiencyScore
        } else if (rankingMode === RANKING_MODES.LIFETIME) {
          // For households, lifetime points = current points (we'd need redemption data per household)
          return b.earnedPoints - a.earnedPoints
        } else {
          return b.completedChores - a.completedChores
        }
      })
  }, [globalLeaderboardData, leaderboardView, rankingMode, currentHouseholdId, conversionRate])

  // Select the appropriate leaderboard based on view
  const processedLeaderboard = leaderboardView === 'global' 
    ? processedGlobalLeaderboard 
    : householdLeaderboard

  const handleRankingModeChange = (mode: RankingMode) => {
    setRankingMode(mode)
  }

  // Calculate household redemption potential
  const householdRedemptionValue = memberStats.reduce((total, stats) => {
    return total + (stats.earnedPoints / conversionRate)
  }, 0)

  // Get redemption summary
  const redemptionSummary = getHouseholdRedemptionSummary()

  // Use navigation hook to navigate to redemption tab
  const { navigateToTab } = useNavigation()

  // Navigate to redemption page
  const navigateToRedemption = () => {
    navigateToTab('redemption')
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center animate-fade-in px-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 sm:mb-3 animate-slide-in bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          🏆 Leaderboard
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground animate-fade-in" style={{ animationDelay: '0.2s' }}>
          See how you rank against your household and compete to be at the top!
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
      <div className="bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 dark:from-green-950/20 dark:via-blue-950/20 dark:to-purple-950/20 border border-green-200 dark:border-green-800 rounded-xl p-4 sm:p-6 shadow-lg">
        <div className="text-center">
          <h3 className="text-base sm:text-lg md:text-xl font-semibold text-foreground mb-3 sm:mb-4 flex items-center justify-center flex-wrap gap-2">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
              <Coins className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
            </div>
            <span>Household Redemption Economy</span>
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 md:gap-4 mb-4 md:mb-6">
            <div className="p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="p-1.5 sm:p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Current Points</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-foreground">
                {memberStats.reduce((sum, stats) => sum + stats.earnedPoints, 0).toLocaleString()}
              </p>
            </div>
            
            <div className="p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Lifetime Points</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                {(memberStats.reduce((sum, stats) => sum + stats.earnedPoints, 0) + (redemptionSummary.totalApprovedValue * conversionRate)).toLocaleString()}
              </p>
            </div>
            
            <div className="p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Available Value</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                ${householdRedemptionValue.toFixed(2)}
              </p>
            </div>
            
            <div className="p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Pending</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                ${(redemptionSummary.totalPendingPoints / conversionRate).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{redemptionSummary.pendingRequestsCount} requests</p>
            </div>
            
            <div className="p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="p-1.5 sm:p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Redeemed</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
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
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        
        {/* Leaderboard Section */}
        <div className="xl:col-span-2 space-y-4 md:space-y-6">
          <div className="bg-card p-4 sm:p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="mb-4 md:mb-6 space-y-3 md:space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-semibold text-foreground flex items-center">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mr-3">
                      <Trophy className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    Leaderboard
                  </h3>
                  
                  {/* View Toggle (Household vs Global) - Right next to title */}
                  <LeaderboardViewToggle 
                    view={leaderboardView}
                    onViewChange={setLeaderboardView}
                  />
                </div>
                
                {/* Ranking Mode Toggle */}
                <RankingModeToggle 
                  rankingMode={rankingMode}
                  onRankingModeChange={handleRankingModeChange}
                />
              </div>
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
        <div className="space-y-4 md:space-y-6 mt-6 xl:mt-0">
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
          <div className="text-6xl mb-4 animate-float">
            {leaderboardView === 'global' ? '🌍' : '🏠'}
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2 animate-slide-in" style={{ animationDelay: '0.2s' }}>
            {leaderboardView === 'global' 
              ? 'No Households Found' 
              : 'No Household Members Yet'}
          </h3>
          <p className="text-muted-foreground animate-fade-in" style={{ animationDelay: '0.4s' }}>
            {leaderboardView === 'global' 
              ? 'Households will appear here once they have points. Make sure households have members with points!'
              : 'Add some family members to start competing on the leaderboard!'}
          </p>
          {leaderboardView === 'global' && !isAuthenticated && (
            <p className="text-sm text-red-500 mt-2">Please log in to view the global leaderboard.</p>
          )}
          {leaderboardView === 'global' && isAuthenticated && globalLeaderboardData === undefined && (
            <p className="text-sm text-muted-foreground mt-2">Loading global leaderboard...</p>
          )}
          {leaderboardView === 'global' && isAuthenticated && Array.isArray(globalLeaderboardData) && globalLeaderboardData.length === 0 && (
            <p className="text-sm text-amber-500 mt-2">No households with points found. Make sure households have members with points!</p>
          )}
        </div>
      )}
    </div>
  )
})

Leaderboard.displayName = 'Leaderboard'
