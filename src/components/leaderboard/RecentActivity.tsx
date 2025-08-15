import React from 'react'
import { Activity } from 'lucide-react'
import { Chore } from '../../types/chore'
import { APP_CONFIG } from '../../config/constants'
import { useAnimationDelays } from '../../hooks/useAnimationDelays'

interface RecentActivityProps {
  chores: Chore[]
}

export const RecentActivity: React.FC<RecentActivityProps> = React.memo(({ chores }) => {
  const { getDelayStyle } = useAnimationDelays({ 
    baseDelay: 0.5,
    count: APP_CONFIG.DISPLAY_LIMITS.RECENT_ACTIVITY 
  })

  const recentChores = chores.slice(0, APP_CONFIG.DISPLAY_LIMITS.RECENT_ACTIVITY)

  return (
    <div className="bg-card p-6 rounded-xl border shadow-sm animate-fade-in" style={{ animationDelay: '0.4s' }}>
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
        <Activity className="w-5 h-5 mr-2 text-info animate-float" />
        Recent Activity
      </h3>
      <div className="space-y-3">
        {recentChores.map((chore, index) => (
          <div 
            key={chore.id} 
            className="flex items-center justify-between p-3 bg-card rounded-lg hover:bg-accent transition-all duration-200 hover:scale-[1.02] animate-fade-in"
            style={getDelayStyle(index)}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${chore.completed ? 'bg-success' : 'bg-warning'} animate-pulse`} />
              <div>
                <p className="font-medium text-foreground text-sm">{chore.title}</p>
                <p className="text-xs text-muted-foreground">{chore.assignedTo}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-sm text-foreground">{chore.points} pts</p>
              <p className="text-xs text-muted-foreground">{chore.difficulty}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})

RecentActivity.displayName = 'RecentActivity'
