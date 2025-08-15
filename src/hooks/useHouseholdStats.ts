import { useMemo } from 'react'
import { UserStats } from '../types/user'
import { Chore } from '../types/chore'

interface UseHouseholdStatsProps {
  memberStats: UserStats[]
  chores: Chore[]
  membersCount: number
}

export const useHouseholdStats = ({ memberStats, chores, membersCount }: UseHouseholdStatsProps) => {
  const stats = useMemo(() => {
    const totalHouseholdPoints = memberStats.reduce((sum, stats) => sum + stats.earnedPoints, 0)
    const totalHouseholdChores = chores.length
    const completedHouseholdChores = chores.filter((c) => c.completed).length
    const averageEfficiency =
      memberStats.length > 0
        ? memberStats.reduce((sum, stats) => sum + (stats.efficiencyScore || 0), 0) / memberStats.length
        : 0

    return {
      totalHouseholdPoints,
      totalHouseholdChores,
      completedHouseholdChores,
      averageEfficiency,
      membersCount,
      completionRate: totalHouseholdChores > 0 ? (completedHouseholdChores / totalHouseholdChores) * 100 : 0,
    }
  }, [memberStats, chores, membersCount])

  return stats
}
