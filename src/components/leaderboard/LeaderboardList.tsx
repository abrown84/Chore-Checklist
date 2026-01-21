import React from 'react'
import { Star, Crosshair, CheckCircle, CurrencyDollar, Clock, TrendUp, Medal, Fire } from '@phosphor-icons/react'
import { RANKING_MODES, RankingMode } from '../../config/constants'
import { getEfficiencyBadge, getRankIcon } from '../../hooks/useLeaderboardData'
import { useRedemption } from '../../contexts/RedemptionContext'
import { APP_CONFIG } from '../../config/constants'
import { getDisplayName } from '../../utils/convexHelpers'
import { Avatar } from '../ui/Avatar'

interface LeaderboardMember {
  id: string
  name: string
  email?: string
  avatar: string
  currentLevel: number
  currentLevelData?: any
  earnedPoints: number
  lifetimePoints?: number
  efficiencyScore: number
  completedChores: number
  isCurrentUser: boolean
  householdName?: string
  memberCount?: number
  members?: Array<{ userId: string; name: string; points: number; level: number }>
  currentStreak?: number
}

interface LeaderboardListProps {
  members: LeaderboardMember[]
  rankingMode: RankingMode
  conversionRate?: number
}

// Get medal styling for top 3 positions - More unique design
const getMedalStyle = (rank: number) => {
  switch (rank) {
    case 0: // Gold - Vibrant golden glow
      return {
        bg: 'bg-gradient-to-r from-yellow-50 via-amber-50 to-yellow-100 dark:from-yellow-950/30 dark:via-amber-950/40 dark:to-yellow-900/30',
        rankBg: 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white',
        border: 'border-l-4 border-yellow-500 dark:border-yellow-400',
        glow: 'shadow-[0_0_20px_rgba(234,179,8,0.3)] dark:shadow-[0_0_20px_rgba(234,179,8,0.2)]',
      }
    case 1: // Silver - Cool metallic
      return {
        bg: 'bg-gradient-to-r from-slate-50 via-gray-50 to-slate-100 dark:from-slate-950/30 dark:via-gray-950/40 dark:to-slate-900/30',
        rankBg: 'bg-gradient-to-br from-slate-400 to-gray-500 text-white',
        border: 'border-l-4 border-slate-400 dark:border-slate-300',
        glow: 'shadow-[0_0_20px_rgba(148,163,184,0.3)] dark:shadow-[0_0_20px_rgba(148,163,184,0.2)]',
      }
    case 2: // Bronze - Warm copper
      return {
        bg: 'bg-gradient-to-r from-orange-50 via-amber-50 to-orange-100 dark:from-orange-950/30 dark:via-amber-950/40 dark:to-orange-900/30',
        rankBg: 'bg-gradient-to-br from-orange-500 to-amber-600 text-white',
        border: 'border-l-4 border-orange-500 dark:border-orange-400',
        glow: 'shadow-[0_0_20px_rgba(249,115,22,0.3)] dark:shadow-[0_0_20px_rgba(249,115,22,0.2)]',
      }
    default:
      return {
        bg: 'bg-white/50 dark:bg-slate-900/30',
        rankBg: 'bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-200',
        border: 'border-l-2 border-gray-200 dark:border-gray-700',
        glow: '',
      }
  }
}

export const LeaderboardList: React.FC<LeaderboardListProps> = React.memo(({
  members,
  rankingMode,
  conversionRate = 100,
}) => {
  const { getUserRedemptionStatus } = useRedemption()
  const topMembers = members.slice(0, APP_CONFIG.DISPLAY_LIMITS.LEADERBOARD_TOP)

  // Empty state
  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <span className="text-6xl mb-4">🏆</span>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Rankings Yet</h3>
        <p className="text-muted-foreground text-sm max-w-xs">
          Complete chores to start earning points and climb the leaderboard!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {topMembers.map((member, index) => {
        const efficiencyBadge = getEfficiencyBadge(member.efficiencyScore)
        const redemptionStatus = getUserRedemptionStatus(member.id)
        const medalStyle = getMedalStyle(index)
        const hasActiveStreak = (member.currentStreak ?? 0) >= 3

        // Calculate different point metrics
        const earnedPoints = member.earnedPoints ?? 0
        const lifetimePoints = member.lifetimePoints ?? (earnedPoints + (redemptionStatus.totalRedeemed * conversionRate))
        const availablePoints = Math.max(0, earnedPoints - (redemptionStatus.pendingPoints || 0))
        const availableValue = availablePoints > 0 ? (availablePoints / conversionRate) : 0
        // lifetimeValue available if needed: lifetimePoints / conversionRate

        const isTop3 = index < 3

        return (
          <div
            key={member.id}
            className={`
              relative overflow-hidden rounded-xl backdrop-blur-sm border transition-all duration-300
              ${medalStyle.bg} ${medalStyle.border} ${medalStyle.glow}
              ${member.isCurrentUser ? 'ring-2 ring-indigo-400/50 dark:ring-indigo-500/50' : ''}
              hover:scale-[1.01] cursor-default group
            `}
          >
            <div className="p-4">
              {/* Header Row: Rank, Avatar, Name */}
              <div className="flex items-start gap-3 mb-3">
                {/* Rank Badge - More prominent */}
                <div className={`
                  flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl font-black text-base sm:text-lg
                  ${medalStyle.rankBg} shadow-lg flex-shrink-0
                  ${isTop3 ? 'animate-pulse' : ''}
                `}>
                  {getRankIcon(index)}
                </div>

                {/* Avatar */}
                <Avatar
                  avatarUrl={member.avatar}
                  userName={member.name}
                  userId={member.id}
                  size="md"
                />

                {/* Name & Status */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h4 className="font-bold text-base text-foreground truncate">
                      {getDisplayName(member.name, member.email)}
                    </h4>
                    {hasActiveStreak && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-500/20 dark:bg-orange-500/30 rounded-full animate-pulse" title={`${member.currentStreak} day streak!`}>
                        <Fire className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                        <span className="text-xs font-bold text-orange-700 dark:text-orange-300">{member.currentStreak}</span>
                      </span>
                    )}
                  </div>

                  {/* Badges Row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {member.isCurrentUser && (
                      <span className="text-xs bg-indigo-500/90 text-white px-2 py-0.5 rounded-full font-medium">
                        You
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      {member.currentLevelData?.icon || '🌱'} Lv {member.currentLevel}
                    </span>
                    {member.memberCount !== undefined && (
                      <span className="text-xs bg-blue-500/20 dark:bg-blue-500/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">
                        {member.memberCount} {member.memberCount === 1 ? 'member' : 'members'}
                      </span>
                    )}
                    {rankingMode === RANKING_MODES.EFFICIENCY && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${efficiencyBadge.color}`}>
                        {efficiencyBadge.text}
                      </span>
                    )}
                  </div>

                  {/* Household Members Preview */}
                  {member.members && member.members.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {member.members.slice(0, 3).map(m => m.name).join(', ')}
                      {member.members.length > 3 && ` +${member.members.length - 3}`}
                    </p>
                  )}
                </div>
              </div>

              {/* Stats Grid - Cleaner layout */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
                {/* Primary Stat */}
                <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-2.5 text-center backdrop-blur-sm">
                  {rankingMode === RANKING_MODES.EFFICIENCY ? (
                    <>
                      <Crosshair className="w-5 h-5 mx-auto mb-1 text-success" />
                      <div className="text-lg font-black text-foreground">{member.efficiencyScore.toFixed(0)}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Efficiency</div>
                    </>
                  ) : rankingMode === RANKING_MODES.LIFETIME ? (
                    <>
                      <Medal className="w-5 h-5 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
                      <div className="text-lg font-black text-blue-600 dark:text-blue-400">{lifetimePoints.toLocaleString()}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Lifetime</div>
                    </>
                  ) : (
                    <>
                      <Star className="w-5 h-5 mx-auto mb-1 text-warning" />
                      <div className="text-lg font-black text-foreground">{earnedPoints.toLocaleString()}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Points</div>
                    </>
                  )}
                </div>

                {/* Completed Chores */}
                <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-2.5 text-center backdrop-blur-sm">
                  <CheckCircle className="w-5 h-5 mx-auto mb-1 text-success" />
                  <div className="text-lg font-black text-foreground">{member.completedChores}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Completed</div>
                </div>

                {/* Available Value */}
                {(rankingMode === RANKING_MODES.POINTS || rankingMode === RANKING_MODES.LIFETIME) && (
                  <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-2.5 text-center backdrop-blur-sm">
                    <CurrencyDollar className="w-5 h-5 mx-auto mb-1 text-green-600 dark:text-green-400" />
                    <div className="text-lg font-black text-green-600 dark:text-green-400">${availableValue.toFixed(0)}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Available</div>
                  </div>
                )}

                {/* Lifetime (when ranking by points) */}
                {rankingMode === RANKING_MODES.POINTS && (
                  <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-2.5 text-center backdrop-blur-sm hidden lg:block">
                    <Medal className="w-5 h-5 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
                    <div className="text-lg font-black text-blue-600 dark:text-blue-400">{lifetimePoints.toLocaleString()}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Lifetime</div>
                  </div>
                )}

                {/* Redeemed Value */}
                {redemptionStatus.totalRedeemed > 0 && (
                  <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-2.5 text-center backdrop-blur-sm hidden lg:block">
                    <TrendUp className="w-5 h-5 mx-auto mb-1 text-purple-600 dark:text-purple-400" />
                    <div className="text-lg font-black text-purple-600 dark:text-purple-400">${redemptionStatus.totalRedeemed.toFixed(0)}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Redeemed</div>
                  </div>
                )}

                {/* Pending Redemptions */}
                {redemptionStatus.hasPendingRequests && (
                  <div className="bg-orange-100/70 dark:bg-orange-900/40 rounded-lg p-2.5 text-center backdrop-blur-sm">
                    <Clock className="w-5 h-5 mx-auto mb-1 text-orange-600 dark:text-orange-400" />
                    <div className="text-lg font-black text-orange-600 dark:text-orange-400">${(redemptionStatus.pendingPoints / conversionRate).toFixed(0)}</div>
                    <div className="text-[10px] text-orange-700 dark:text-orange-300 uppercase tracking-wide">Pending</div>
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
