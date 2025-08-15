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
      iconBg: 'bg-info',
      label: 'Total Points',
      value: stats.totalHouseholdPoints,
      gradient: 'from-info/5 to-primary/10',
      border: 'border-info/30',
      textColor: 'text-foreground',
      labelColor: 'text-info',
    },
    {
      icon: CheckCircle,
      iconBg: 'bg-success',
      label: 'Chores Completed',
      value: `${stats.completedHouseholdChores}/${stats.totalHouseholdChores}`,
      gradient: 'from-success/5 to-success/10',
      border: 'border-success/30',
      textColor: 'text-foreground',
      labelColor: 'text-success',
    },
    {
      icon: Target,
      iconBg: 'bg-chart-4',
      label: 'Avg Efficiency',
      value: `${stats.averageEfficiency.toFixed(1)}%`,
      gradient: 'from-chart-4/5 to-accent/10',
      border: 'border-chart-4/30',
      textColor: 'text-foreground',
      labelColor: 'text-chart-4',
    },
    {
      icon: Users,
      iconBg: 'bg-warning',
      label: 'Members',
      value: stats.membersCount,
      gradient: 'from-warning/5 to-warning/10',
      border: 'border-warning/30',
      textColor: 'text-foreground',
      labelColor: 'text-warning',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card, index) => (
        <div
          key={card.label}
          className={`bg-card bg-gradient-to-br ${card.gradient} p-6 rounded-xl border ${card.border} shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in`}
          style={getDelayStyle(index)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${card.labelColor}`}>{card.label}</p>
              <p className={`text-3xl font-bold ${card.textColor}`}>{card.value}</p>
            </div>
            <div className={`p-3 ${card.iconBg} rounded-full animate-float`} style={{ animationDelay: `${0.5 + index * 0.5}s` }}>
              <card.icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
})

HouseholdStats.displayName = 'HouseholdStats'
