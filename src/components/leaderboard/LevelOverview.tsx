import React from 'react'
import { Award } from 'lucide-react'
import { User } from '../../types/user'
import { UserStats } from '../../types/user'
import { APP_CONFIG } from '../../config/constants'
import { useAnimationDelays } from '../../hooks/useAnimationDelays'
import { getDisplayName } from '../../utils/convexHelpers'
import { Avatar } from '../ui/Avatar'

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

  // Empty state
  if (members.length === 0) {
    return (
      <div className="bg-card p-6 rounded-xl border shadow-sm animate-fade-in" style={{ animationDelay: '0.6s' }}>
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Award className="w-5 h-5 mr-2 text-chart-4 animate-float" />
          Level Progress
        </h3>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <span className="text-5xl mb-3">🌟</span>
          <h4 className="text-base font-semibold text-foreground mb-1">No Members Yet</h4>
          <p className="text-muted-foreground text-sm max-w-[180px]">
            Add family members to track their progress!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card p-6 rounded-xl border shadow-sm animate-fade-in" style={{ animationDelay: '0.6s' }}>
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
        <Award className="w-5 h-5 mr-2 text-chart-4 animate-float" />
        Level Progress
      </h3>
      <div className="space-y-4">
        {topMembers.map((member, index) => {
          const stats = memberStats.find(s => s.userId === member.id)
          return (
            <div 
              key={member.id} 
              className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-all duration-200 hover:scale-[1.02] animate-fade-in"
              style={getDelayStyle(index)}
            >
              <div className="flex items-center space-x-3">
                <Avatar 
                  avatarUrl={member.avatar}
                  userName={member.name}
                  userId={member.id}
                  size="sm"
                />
                <div>
                  <p className="font-medium text-foreground text-sm">{getDisplayName(member.name, member.email)}</p>
                  <div className="flex items-center space-x-1">
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
