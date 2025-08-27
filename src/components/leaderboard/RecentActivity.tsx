import React from 'react'
import { Clock, CheckCircle, DollarSign, AlertCircle } from 'lucide-react'
import { Chore } from '../../types/chore'
import { useRedemption } from '../../contexts/RedemptionContext'
import { APP_CONFIG } from '../../config/constants'

interface RecentActivityProps {
  chores: Chore[]
}

export const RecentActivity: React.FC<RecentActivityProps> = React.memo(({ chores }) => {
  const { redemptionRequests } = useRedemption()
  
  // Get recent chore completions
  const recentChores = chores
    .filter(chore => chore.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
    .slice(0, APP_CONFIG.DISPLAY_LIMITS.RECENT_ACTIVITY)

  // Get recent redemption activities
  const recentRedemptions = redemptionRequests
    .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())
    .slice(0, 3)

  // Combine and sort all activities
  const allActivities = [
    ...recentChores.map(chore => ({
      type: 'chore' as const,
      id: chore.id,
      title: `${chore.name} completed`,
      description: `+${chore.points} points`,
      timestamp: new Date(chore.completedAt!),
      icon: <CheckCircle className="w-4 h-4 text-success" />,
      color: 'text-success'
    })),
    ...recentRedemptions.map(req => ({
      type: 'redemption' as const,
      id: req.id,
      title: `${req.userName} requested redemption`,
      description: `${req.pointsRequested} points = $${req.cashAmount}`,
      timestamp: new Date(req.requestedAt),
      icon: <DollarSign className="w-4 h-4 text-blue-600" />,
      color: 'text-blue-600',
      status: req.status
    }))
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  .slice(0, APP_CONFIG.DISPLAY_LIMITS.RECENT_ACTIVITY)

  return (
    <div className="bg-card p-6 rounded-xl border shadow-sm">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
        <Clock className="w-5 h-5 mr-2" />
        Recent Activity
      </h3>
      
      <div className="space-y-3">
        {allActivities.length > 0 ? (
          allActivities.map((activity) => (
            <div key={`${activity.type}-${activity.id}`} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className={`mt-1 ${activity.color}`}>
                {activity.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {activity.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activity.description}
                  {activity.type === 'redemption' && (
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      activity.status === 'pending' 
                        ? 'bg-orange-100 text-orange-800' 
                        : activity.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {activity.status}
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {activity.timestamp.toLocaleDateString()} at {activity.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No recent activity</p>
          </div>
        )}
      </div>

      {/* Activity Summary */}
      {allActivities.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {recentChores.length} chore{recentChores.length !== 1 ? 's' : ''} completed
            </span>
            <span>
              {recentRedemptions.length} redemption{recentRedemptions.length !== 1 ? 's' : ''} requested
            </span>
          </div>
        </div>
      )}
    </div>
  )
})

RecentActivity.displayName = 'RecentActivity'
