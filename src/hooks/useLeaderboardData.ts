import { useMemo } from 'react'
import { User, UserStats } from '../types/user'
// import { Chore } from '../types/chore' // Unused import
import { LEVELS } from '../types/chore'
import { RANKING_MODES, RankingMode, EFFICIENCY_THRESHOLDS } from '../config/constants'

// Removed unused interface - data structure handled in processing

interface UseLeaderboardDataProps {
  memberStats: UserStats[]
  members: User[]
  currentUserId?: string
  rankingMode: RankingMode
  redemptionData?: {
    getPendingRedemptionPoints: (userId: string) => number
    getTotalRedeemedValue: (userId: string) => number
  }
}

export const useLeaderboardData = ({ 
  memberStats, 
  members, 
  currentUserId, 
  rankingMode,
  redemptionData 
}: UseLeaderboardDataProps) => {
  const processedLeaderboard = useMemo(() => {
    console.log('🔍 useLeaderboardData Processing:', {
      inputMemberStats: memberStats,
      inputMembers: members,
      currentUserId,
      rankingMode
    })
    
    return memberStats
      .map((stats) => {
        const user = members.find((m) => m.id === stats.userId)
        if (!user) {
          console.log('⚠️ User not found for stats:', stats.userId, 'Available members:', members.map(m => m.id))
          return null
        }

        console.log('✅ Processing user:', user.name, 'Stats:', stats)
        
        const currentLevelData = LEVELS.find((level) => level.level === stats.currentLevel)
        const nextLevelData = LEVELS.find((level) => level.level === (stats.currentLevel || 1) + 1)
        
        const progressToNextLevel = nextLevelData
          ? ((stats.earnedPoints - (currentLevelData?.pointsRequired || 0)) /
              (nextLevelData.pointsRequired - (currentLevelData?.pointsRequired || 0))) *
            100
          : 100

        const processedItem = {
          ...stats,
          ...user,
          currentLevelData,
          nextLevelData,
          levelProgress: Math.min(Math.max(progressToNextLevel, 0), 100),
          efficiencyScore: stats.efficiencyScore || 0,
          completionRate: stats.totalChores > 0 ? (stats.completedChores / stats.totalChores) * 100 : 0,
          isCurrentUser: user.id === currentUserId,
        }
        
        console.log('✅ Processed item:', processedItem)
        return processedItem
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => {
        if (rankingMode === RANKING_MODES.POINTS) {
          return b.earnedPoints - a.earnedPoints
        } else if (rankingMode === RANKING_MODES.EFFICIENCY) {
          return b.efficiencyScore - a.efficiencyScore
        } else if (rankingMode === RANKING_MODES.LIFETIME && redemptionData) {
          // For lifetime ranking, calculate total points including redeemed
          // Use lifetimePoints if available, otherwise calculate it (for backward compatibility)
          const aLifetimePoints = a.lifetimePoints ?? (a.earnedPoints + (redemptionData.getTotalRedeemedValue(a.userId) * 100))
          const bLifetimePoints = b.lifetimePoints ?? (b.earnedPoints + (redemptionData.getTotalRedeemedValue(b.userId) * 100))
          return bLifetimePoints - aLifetimePoints
        } else {
          return b.completedChores - a.completedChores
        }
      })
  }, [memberStats, members, currentUserId, rankingMode, redemptionData])

  const householdStats = useMemo(() => {
    const totalHouseholdPoints = memberStats.reduce((sum, stats) => sum + stats.earnedPoints, 0)
    const averageEfficiency =
      memberStats.length > 0
        ? memberStats.reduce((sum, stats) => sum + (stats.efficiencyScore || 0), 0) / memberStats.length
        : 0

    return {
      totalHouseholdPoints,
      averageEfficiency,
    }
  }, [memberStats])

  const currentUserStats = useMemo(() => {
    return processedLeaderboard.find((member) => member.isCurrentUser)
  }, [processedLeaderboard])

  return {
    processedLeaderboard,
    householdStats,
    currentUserStats,
  }
}

export const getEfficiencyBadge = (score: number) => {
  if (score >= EFFICIENCY_THRESHOLDS.MASTER)
    return { text: 'Efficiency Master', color: 'bg-success/10 text-success border-success/30' }
  if (score >= EFFICIENCY_THRESHOLDS.HIGHLY_EFFICIENT)
    return { text: 'Highly Efficient', color: 'bg-info/10 text-info border-info/30' }
  if (score >= EFFICIENCY_THRESHOLDS.EFFICIENT)
    return { text: 'Efficient', color: 'bg-success/10 text-success border-success/30' }
  if (score >= EFFICIENCY_THRESHOLDS.GETTING_THERE)
    return { text: 'Getting There', color: 'bg-warning/10 text-warning border-warning/30' }
  return { text: 'Room to Improve', color: 'bg-destructive/10 text-destructive border-destructive/30' }
}

export const getRankColor = (rank: number) => {
  const RANK_CONFIG = {
    COLORS: {
      0: 'bg-warning/10 text-warning border-warning/30',
      1: 'bg-muted text-foreground border-border',
      2: 'bg-chart-3/10 text-chart-3 border-chart-3/30',
      DEFAULT: 'bg-info/10 text-info border-info/30',
    }
  }
  return RANK_CONFIG.COLORS[rank as keyof typeof RANK_CONFIG.COLORS] || RANK_CONFIG.COLORS.DEFAULT
}

export const getRankIcon = (rank: number) => {
  const RANK_ICONS = {
    0: '🥇',
    1: '🥈', 
    2: '🥉',
  }
  return RANK_ICONS[rank as keyof typeof RANK_ICONS] || `${rank + 1}`
}
