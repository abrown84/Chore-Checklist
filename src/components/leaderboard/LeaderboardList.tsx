import React from 'react'
import { Star, Target, CheckCircle, DollarSign, Clock, TrendingUp, Award } from 'lucide-react'
import { RANKING_MODES, RankingMode } from '../../config/constants'
import { getEfficiencyBadge, getRankColor, getRankIcon } from '../../hooks/useLeaderboardData'
import { useRedemption } from '../../contexts/RedemptionContext'
import { APP_CONFIG } from '../../config/constants'

interface LeaderboardMember {
  id: string
  name: string
  avatar: string
  currentLevel: number
  currentLevelData?: any
  earnedPoints: number
  efficiencyScore: number
  completedChores: number
  isCurrentUser: boolean
  householdName?: string
}

interface LeaderboardListProps {
  members: LeaderboardMember[]
  rankingMode: RankingMode
  conversionRate?: number
}

export const LeaderboardList: React.FC<LeaderboardListProps> = React.memo(({
  members,
  rankingMode,
  conversionRate = 100,
}) => {
  const { getUserRedemptionStatus } = useRedemption()
  const topMembers = members.slice(0, APP_CONFIG.DISPLAY_LIMITS.LEADERBOARD_TOP)

  return (
    <div className="space-y-3">
      {topMembers.map((member, index) => {
        const efficiencyBadge = getEfficiencyBadge(member.efficiencyScore)
        const redemptionStatus = getUserRedemptionStatus(member.id)
        
        // Calculate different point metrics
        const lifetimePoints = member.earnedPoints + (redemptionStatus.totalRedeemed * conversionRate)
        const availablePoints = member.earnedPoints - redemptionStatus.pendingPoints
        const availableValue = availablePoints > 0 ? (availablePoints / conversionRate) : 0
        const lifetimeValue = lifetimePoints > 0 ? (lifetimePoints / conversionRate) : 0
        
        return (
          <div
            key={member.id}
            className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
              member.isCurrentUser
                ? 'bg-primary/10 dark:bg-primary/20 border-primary/30 dark:border-primary/600 shadow-lg'
                : getRankColor(index)
            } hover:scale-[1.02]`}
          >
            <div className="flex items-center justify-between">
              {/* Rank and User Info */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-card dark:bg-card/80 text-sm font-bold shadow-sm border border-border">
                  {getRankIcon(index)}
                </div>
                <span className="text-xl">{member.avatar}</span>
                <div>
                  <h4 className="font-semibold text-foreground flex items-center">
                    {member.name}
                    {member.isCurrentUser && (
                      <span className="ml-2 text-xs bg-indigo-100/60 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded-full border border-indigo-200 dark:border-indigo-700">
                        You
                      </span>
                    )}
                  </h4>
                  {member.householdName && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {member.householdName}
                    </p>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <span className="mr-1">{member.currentLevelData?.icon || '🌱'}</span>
                      Lv {member.currentLevel}
                    </span>
                    {rankingMode === RANKING_MODES.EFFICIENCY && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${efficiencyBadge.color} animate-fade-in`}>
                        {efficiencyBadge.text}
                      </span>
                    )}
                    {/* Redemption Status Indicator */}
                    {redemptionStatus.hasPendingRequests && (
                      <span className="flex items-center space-x-1 text-orange-600 dark:text-orange-400 bg-orange-100/50 dark:bg-orange-900/30 px-2 py-1 rounded-full border border-orange-200 dark:border-orange-700">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs">Redeeming ${(redemptionStatus.pendingPoints / conversionRate).toFixed(2)}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-6">
                {/* Primary Metric */}
                <div className="text-center">
                  <div className="flex items-center space-x-1">
                    {rankingMode === RANKING_MODES.EFFICIENCY ? (
                      <>
                        <div className="p-1 bg-success/20 dark:bg-success/30 rounded-full">
                          <Target className="w-4 h-4 text-success" />
                        </div>
                        <span className="text-lg font-bold text-foreground">{member.efficiencyScore.toFixed(0)}</span>
                      </>
                    ) : rankingMode === RANKING_MODES.LIFETIME ? (
                      <>
                        <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                          <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{lifetimePoints.toLocaleString()}</span>
                      </>
                    ) : (
                      <>
                        <div className="p-1 bg-warning/20 dark:bg-warning/30 rounded-full">
                          <Star className="w-4 h-4 text-warning" />
                        </div>
                        <span className="text-lg font-bold text-foreground">{member.earnedPoints}</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {rankingMode === RANKING_MODES.EFFICIENCY ? 'Efficiency' : 
                     rankingMode === RANKING_MODES.LIFETIME ? 'Lifetime Points' : 'Current Points'}
                  </p>
                  {rankingMode === RANKING_MODES.LIFETIME && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">${lifetimeValue.toFixed(2)}</p>
                  )}
                </div>

                {/* Lifetime Points - Show when ranking by points */}
                {rankingMode === RANKING_MODES.POINTS && (
                  <div className="text-center">
                    <div className="flex items-center space-x-1">
                      <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                        <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{lifetimePoints.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Lifetime</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">${lifetimeValue.toFixed(2)}</p>
                  </div>
                )}

                {/* Available Points - Show when ranking by points or lifetime */}
                {(rankingMode === RANKING_MODES.POINTS || rankingMode === RANKING_MODES.LIFETIME) && (
                  <div className="text-center">
                    <div className="flex items-center space-x-1">
                      <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                        <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">{availablePoints.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Available</p>
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">${availableValue.toFixed(2)}</p>
                    {/* Show pending redemption if any */}
                    {redemptionStatus.pendingPoints > 0 && (
                      <div className="mt-1 p-1 bg-orange-100 dark:bg-orange-900/30 rounded text-xs text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-700">
                        -${(redemptionStatus.pendingPoints / conversionRate).toFixed(2)} pending
                      </div>
                    )}
                  </div>
                )}

                {/* Completed Chores */}
                <div className="text-center">
                  <div className="flex items-center space-x-1">
                    <div className="p-1 bg-success/20 dark:bg-success/30 rounded-full">
                      <CheckCircle className="w-4 h-4 text-success" />
                    </div>
                    <span className="text-lg font-bold text-foreground">{member.completedChores}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>

                {/* Total Redeemed Value */}
                {redemptionStatus.totalRedeemed > 0 && (
                  <div className="text-center">
                    <div className="flex items-center space-x-1">
                      <div className="p-1 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                        <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="text-lg font-bold text-purple-600 dark:text-purple-400">${redemptionStatus.totalRedeemed.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Redeemed</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}

      {/* View All Link */}
      {members.length > APP_CONFIG.DISPLAY_LIMITS.LEADERBOARD_TOP && (
        <div className="mt-4 text-center">
          <span className="text-sm text-muted-foreground">Showing top {APP_CONFIG.DISPLAY_LIMITS.LEADERBOARD_TOP} members</span>
        </div>
      )}
    </div>
  )
})

LeaderboardList.displayName = 'LeaderboardList'
