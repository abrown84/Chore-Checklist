import React from 'react'
import { Star, Target, CheckCircle } from 'lucide-react'
import { RANKING_MODES, RankingMode } from '../../config/constants'
import { getEfficiencyBadge, getRankColor, getRankIcon } from '../../hooks/useLeaderboardData'
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
}

interface LeaderboardListProps {
  members: LeaderboardMember[]
  rankingMode: RankingMode
}

export const LeaderboardList: React.FC<LeaderboardListProps> = React.memo(({
  members,
  rankingMode,
}) => {
  const topMembers = members.slice(0, APP_CONFIG.DISPLAY_LIMITS.LEADERBOARD_TOP)

  return (
    <div className="space-y-3">
      {topMembers.map((member, index) => {
        const efficiencyBadge = getEfficiencyBadge(member.efficiencyScore)
        
        return (
          <div
            key={member.id}
            className={`p-4 rounded-lg border transition-colors duration-200 hover:shadow-sm ${
              member.isCurrentUser
                ? 'bg-primary/10 border-primary/30'
                : getRankColor(index)
            }`}
          >
            <div className="flex items-center justify-between">
              {/* Rank and User Info */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-card text-sm font-bold shadow-sm">
                  {getRankIcon(index)}
                </div>
                <span className="text-xl">{member.avatar}</span>
                <div>
                  <h4 className="font-semibold text-foreground flex items-center">
                    {member.name}
                    {member.isCurrentUser && (
                      <span className="ml-2 text-xs bg-indigo-100/60 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded-full">
                        You
                      </span>
                    )}
                  </h4>
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
                        <Target className="w-4 h-4 text-success" />
                        <span className="text-lg font-bold text-foreground">{member.efficiencyScore.toFixed(0)}</span>
                      </>
                    ) : (
                      <>
                        <Star className="w-4 h-4 text-warning" />
                        <span className="text-lg font-bold text-foreground">{member.earnedPoints}</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {rankingMode === RANKING_MODES.EFFICIENCY ? 'Efficiency' : 'Points'}
                  </p>
                </div>

                {/* Completed Chores */}
                <div className="text-center">
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-lg font-bold text-foreground">{member.completedChores}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
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
