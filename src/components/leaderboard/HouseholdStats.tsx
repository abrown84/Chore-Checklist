import React from 'react'
import { Star, CheckCircle, Target, Users } from 'lucide-react'
import { useHouseholdStats } from '../../hooks/useHouseholdStats'
import { useAnimationDelays } from '../../hooks/useAnimationDelays'
import { APP_CONFIG } from '../../config/constants'

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
  const { getDelayStyle } = useAnimationDelays({ 
    baseDelay: APP_CONFIG.ANIMATION_DELAYS.FADE_IN,
    count: 4 
  })

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card, index) => (
        <div
          key={card.label}
          className={`bg-gradient-to-br ${card.gradient} p-6 rounded-xl border ${card.border} shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 animate-fade-in group`}
          style={getDelayStyle(index)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${card.labelColor} mb-1`}>{card.label}</p>
              <p className={`text-3xl font-bold ${card.textColor} group-hover:scale-105 transition-transform duration-300`}>{card.value}</p>
            </div>
            <div className={`p-3.5 ${card.iconBg} ${card.iconRing} rounded-full shadow-lg animate-float`} style={{ animationDelay: `${0.5 + index * 0.5}s` }}>
              <card.icon className={`w-6 h-6 ${card.iconColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
})

HouseholdStats.displayName = 'HouseholdStats'
