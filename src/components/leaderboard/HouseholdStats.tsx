import React from 'react'
import { Star, CheckCircle, Target, Users } from 'lucide-react'
import { useHouseholdStats } from '../../hooks/useHouseholdStats'

interface HouseholdStatsProps {
  memberStats: any[]
  chores: any[]
  membersCount: number
}

export const HouseholdStats: React.FC<HouseholdStatsProps> = React.memo(({
  memberStats,
  chores,
  membersCount
}) => {
  const stats = useHouseholdStats({ memberStats, chores, membersCount })

  const statCards = [
    {
      icon: Star,
      iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      iconRing: 'ring-4 ring-blue-200/50 dark:ring-blue-800/50',
      label: 'Total Points',
      value: stats.totalHouseholdPoints.toLocaleString(),
      gradient: 'from-blue-50 via-indigo-50/50 to-blue-100 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-blue-900/40',
      border: 'border-blue-200 dark:border-blue-800',
      textColor: 'text-foreground',
      labelColor: 'text-blue-600 dark:text-blue-400',
      iconColor: 'text-white',
    },
    {
      icon: CheckCircle,
      iconBg: 'bg-gradient-to-br from-emerald-500 to-green-600',
      iconRing: 'ring-4 ring-emerald-200/50 dark:ring-emerald-800/50',
      label: 'Chores Completed',
      value: `${stats.completedHouseholdChores}/${stats.totalHouseholdChores}`,
      gradient: 'from-emerald-50 via-green-50/50 to-emerald-100 dark:from-emerald-950/40 dark:via-green-950/30 dark:to-emerald-900/40',
      border: 'border-emerald-200 dark:border-emerald-800',
      textColor: 'text-foreground',
      labelColor: 'text-emerald-600 dark:text-emerald-400',
      iconColor: 'text-white',
    },
    {
      icon: Target,
      iconBg: 'bg-gradient-to-br from-purple-500 to-violet-600',
      iconRing: 'ring-4 ring-purple-200/50 dark:ring-purple-800/50',
      label: 'Avg Efficiency',
      value: `${stats.averageEfficiency.toFixed(1)}%`,
      gradient: 'from-purple-50 via-violet-50/50 to-purple-100 dark:from-purple-950/40 dark:via-violet-950/30 dark:to-purple-900/40',
      border: 'border-purple-200 dark:border-purple-800',
      textColor: 'text-foreground',
      labelColor: 'text-purple-600 dark:text-purple-400',
      iconColor: 'text-white',
    },
    {
      icon: Users,
      iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
      iconRing: 'ring-4 ring-amber-200/50 dark:ring-amber-800/50',
      label: 'Members',
      value: stats.membersCount,
      gradient: 'from-amber-50 via-orange-50/50 to-amber-100 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-amber-900/40',
      border: 'border-amber-200 dark:border-amber-800',
      textColor: 'text-foreground',
      labelColor: 'text-amber-600 dark:text-amber-400',
      iconColor: 'text-white',
    },
  ]

  // Empty state if no members
  if (membersCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center bg-card rounded-xl border">
        <span className="text-6xl mb-4">📊</span>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Stats Yet</h3>
        <p className="text-muted-foreground text-sm max-w-xs">
          Add household members and complete chores to see your stats here!
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
      {statCards.map((card) => (
        <div
          key={card.label}
          className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-4 border border-border/50 backdrop-blur-sm hover:scale-[1.02] transition-transform"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-2 ${card.iconBg} rounded-lg`}>
              <card.icon className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground">{card.value}</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide">{card.label}</div>
        </div>
      ))}
    </div>
  )
})

HouseholdStats.displayName = 'HouseholdStats'
