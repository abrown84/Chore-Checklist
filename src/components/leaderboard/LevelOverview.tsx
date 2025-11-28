import React from 'react'
import { Award } from 'lucide-react'
import { User } from '../../types/user'
import { UserStats } from '../../types/user'
import { LEVELS } from '../../types/chore'
import { APP_CONFIG } from '../../config/constants'
import { useAnimationDelays } from '../../hooks/useAnimationDelays'

interface LevelOverviewProps {
  members: User[]
  memberStats: UserStats[]
}

export const LevelOverview: React.FC<LevelOverviewProps> = React.memo(({ members, memberStats }) => {
  const { getDelayStyle } = useAnimationDelays({ 
    baseDelay: 0.7,
    count: APP_CONFIG.DISPLAY_LIMITS.LEVEL_OVERVIEW 
  })

  const topMembers = members.slice(0, APP_CONFIG.DISPLAY_LIMITS.LEVEL_OVERVIEW)

  return (
    <div className="bg-card p-6 rounded-xl border shadow-sm animate-fade-in" style={{ animationDelay: '0.6s' }}>
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
        <Award className="w-5 h-5 mr-2 text-chart-4 animate-float" />
        Level Progress
      </h3>
      <div className="space-y-4">
        {topMembers.map((member, index) => {
          const stats = memberStats.find(s => s.userId === member.id)
          const levelData = LEVELS.find(level => level.level === stats?.currentLevel || 1)
          
          return (
            <div 
              key={member.id} 
              className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-all duration-200 hover:scale-[1.02] animate-fade-in"
              style={getDelayStyle(index)}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg animate-float">{member.avatar}</span>
                <div>
                  <p className="font-medium text-foreground text-sm">{member.name || member.email || 'Unknown User'}</p>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm animate-float">{levelData?.icon || '🌱'}</span>
                    <span className="text-xs text-muted-foreground">Lv {stats?.currentLevel || 1}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-foreground">{stats?.earnedPoints || 0}</p>
                <p className="text-xs text-muted-foreground">points</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})

LevelOverview.displayName = 'LevelOverview'
