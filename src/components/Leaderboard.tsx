
import React, { useState } from 'react'
import { Trophy, DollarSign, Coins, Clock, CheckCircle, Target } from 'lucide-react'
import { useUsers } from '../contexts/UserContext'
import { useStats } from '../hooks/useStats'
import { useChores } from '../contexts/ChoreContext'
import { useAuth } from '../hooks/useAuth'
import { RANKING_MODES, RankingMode } from '../config/constants'
import { useLeaderboardData } from '../hooks/useLeaderboardData'
import { LEVELS } from '../types/chore'
import { useRedemption } from '../contexts/RedemptionContext'
import { HouseholdStats } from './leaderboard/HouseholdStats'
import { RankingModeToggle } from './leaderboard/RankingModeToggle'
import { LeaderboardList } from './leaderboard/LeaderboardList'
import { LeaderboardViewToggle, LeaderboardView } from './leaderboard/LeaderboardViewToggle'
import { Button } from '../components/ui/button'
import { Avatar } from '../components/ui/Avatar'
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
      import.meta.env.DEV && console.log('🔍 Global leaderboard: Loading...')
      return []
    }
    
    // Handle error state
    if (globalLeaderboardData === null) {
      console.error('❌ Global leaderboard: Query returned null (error)')
      return []
    }
    
    import.meta.env.DEV && console.log('🔍 Global leaderboard data received:', globalLeaderboardData)
    
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
          earnedPoints: household.totalPoints ?? 0,
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
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Compact Header with Quick Stats */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Leaderboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {leaderboardView === 'household' ? 'Compete with your household' : 'Global household rankings'}
          </p>
        </div>

        {/* Compact Redemption Stats */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-green-500/10 dark:bg-green-500/20 px-4 py-2 rounded-lg border border-green-500/30">
            <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
            <div>
              <div className="text-xs text-muted-foreground">Available</div>
              <div className="text-lg font-black text-green-600 dark:text-green-400">
                ${householdRedemptionValue.toFixed(0)}
              </div>
            </div>
          </div>
          {redemptionSummary.pendingRequestsCount > 0 && (
            <div className="flex items-center gap-2 bg-orange-500/10 dark:bg-orange-500/20 px-4 py-2 rounded-lg border border-orange-500/30">
              <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <div>
                <div className="text-xs text-muted-foreground">Pending</div>
                <div className="text-lg font-black text-orange-600 dark:text-orange-400">
                  {redemptionSummary.pendingRequestsCount}
                </div>
              </div>
            </div>
          )}
          <Button
            onClick={navigateToRedemption}
            size="sm"
            variant="outline"
            className="h-full"
          >
            <Coins className="w-4 h-4 mr-2" />
            Manage
          </Button>
        </div>
      </div>

      {/* Compact Personal Stats + Household Overview */}
      {userState.currentUser && currentUserStats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Your Stats */}
          <div className="lg:col-span-1 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-5 border border-primary/20">
            <div className="flex items-center gap-3 mb-4">
              <Avatar
                avatarUrl={userState.currentUser.avatar}
                userName={userState.currentUser.name}
                userId={userState.currentUser.id}
                size="md"
              />
              <div>
                <h3 className="font-bold text-foreground">Your Progress</h3>
                <p className="text-sm text-muted-foreground">
                  Lv {currentUserStats.currentLevel} • {currentUserStats.earnedPoints.toLocaleString()} pts
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/50 dark:bg-slate-900/50 rounded-lg p-3 text-center">
                <CheckCircle className="w-4 h-4 mx-auto mb-1 text-success" />
                <div className="text-xl font-black text-foreground">{currentUserStats.completedChores}</div>
                <div className="text-[10px] text-muted-foreground uppercase">Completed</div>
              </div>
              <div className="bg-white/50 dark:bg-slate-900/50 rounded-lg p-3 text-center">
                <Target className="w-4 h-4 mx-auto mb-1 text-chart-4" />
                <div className="text-xl font-black text-foreground">{(currentUserStats.efficiencyScore || 0).toFixed(0)}%</div>
                <div className="text-[10px] text-muted-foreground uppercase">Efficiency</div>
              </div>
            </div>
          </div>

          {/* Household Stats */}
          <div className="lg:col-span-2">
            <HouseholdStats
              memberStats={memberStats}
              chores={choreState.chores}
              membersCount={userState.members.length}
            />
          </div>
        </div>
      )}

      {/* Main Rankings */}
      <div className="bg-white/50 dark:bg-slate-900/50 rounded-xl p-6 border backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-foreground">Rankings</h2>
            <LeaderboardViewToggle
              view={leaderboardView}
              onViewChange={setLeaderboardView}
            />
          </div>

          <RankingModeToggle
            rankingMode={rankingMode}
            onRankingModeChange={handleRankingModeChange}
          />
        </div>

        <LeaderboardList
          members={processedLeaderboard}
          rankingMode={rankingMode}
          conversionRate={conversionRate}
        />
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
