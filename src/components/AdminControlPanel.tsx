import React, { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuth } from '../hooks/useAuth'
import { useCurrentHousehold } from '../hooks/useCurrentHousehold'
import { useUsers } from '../contexts/UserContext'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { AdminUsersSection, AdminChoresSection, AdminDataSection } from './admin'
import { Gear, Users, TrendUp, Shield, UserCheck, Clock, Sparkle, ListChecks, ChartBar, SquaresFour } from '@phosphor-icons/react'

type TabId = 'dashboard' | 'members' | 'chores' | 'settings'

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: SquaresFour },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'chores', label: 'Chores', icon: ListChecks },
  { id: 'settings', label: 'Settings', icon: Gear },
]

export const AdminControlPanel: React.FC = () => {
  const { user } = useAuth()
  const { state: userState } = useUsers()
  const householdId = useCurrentHousehold()
  const [activeTab, setActiveTab] = useState<TabId>('dashboard')

  const currentUserRole = React.useMemo(() => {
    if (!user?.id) return null
    const member = userState.members.find(m => m.id === user.id)
    return (member?.role || user?.role || 'member') as 'admin' | 'parent' | 'teen' | 'kid' | 'member'
  }, [user, userState.members])

  const isAdmin = currentUserRole === 'admin'

  // Queries
  const currentHousehold = useQuery(api.households.getHousehold, householdId ? { householdId } : 'skip')
  const householdMembers = useQuery(api.users.getUsersByHousehold, householdId ? { householdId } : 'skip')
  const householdStats = useQuery(api.stats.getHouseholdStats, householdId ? { householdId } : 'skip')
  const recentActivity = useQuery(api.stats.getRecentActivity, householdId ? { householdId, limit: 5 } : 'skip')
  const allChores = useQuery(api.chores.getChoresByHousehold, householdId ? { householdId } : 'skip')

  if (!isAdmin) {
    return (
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-8 text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-amber-600" />
          <h3 className="text-lg font-semibold mb-2">Admin Access Required</h3>
          <p className="text-muted-foreground text-sm">You need admin privileges to access the control panel.</p>
        </CardContent>
      </Card>
    )
  }

  // Stats
  const totalUsers = householdMembers?.length || 0
  const totalChores = allChores?.length || 0
  const completedChores = allChores?.filter(c => c.status === 'completed').length || 0
  const pendingChores = totalChores - completedChores
  const totalPoints = householdStats?.reduce((sum, stat) => sum + (stat.earnedPoints || 0), 0) || 0
  const completionRate = totalChores > 0 ? Math.round((completedChores / totalChores) * 100) : 0

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10">
            <Gear className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Manage Household</h1>
            <p className="text-xs text-muted-foreground">{currentHousehold?.name || 'Household'}</p>
          </div>
        </div>
        <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30">Household Admin</Badge>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-lg w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant={activeTab === id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(id)}
            className={`gap-2 ${activeTab === id ? '' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </Button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={Users} label="Members" value={totalUsers} color="blue" />
            <StatCard icon={ListChecks} label="Chores" value={totalChores} sub={`${pendingChores} pending`} color="purple" />
            <StatCard icon={TrendUp} label="Points" value={totalPoints.toLocaleString()} color="amber" />
            <StatCard icon={ChartBar} label="Done" value={`${completionRate}%`} sub={`${completedChores} completed`} color="green" />
          </div>

          {/* Recent Activity */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkle className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm">Recent Activity</h3>
              </div>
              {recentActivity && recentActivity.length > 0 ? (
                <div className="space-y-2">
                  {recentActivity.map((activity) => (
                    <div key={activity._id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <UserCheck className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {activity.userName} <span className="text-muted-foreground font-normal">completed</span> "{activity.choreTitle}"
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(activity.completedAt)}
                          {activity.pointsEarned > 0 && (
                            <span className="text-green-600 font-medium">+{activity.pointsEarned} pts</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
              )}
            </CardContent>
          </Card>

          {/* Household Quick Info */}
          {currentHousehold && (
            <div className="flex flex-wrap gap-3 text-sm">
              <div className="px-3 py-1.5 rounded-full bg-muted/50 flex items-center gap-2">
                <span className="text-muted-foreground">Join Code:</span>
                <code className="font-mono font-medium">{currentHousehold.joinCode}</code>
              </div>
              {currentHousehold.settings && (
                <>
                  <div className="px-3 py-1.5 rounded-full bg-muted/50">
                    Invites: {currentHousehold.settings.allowInvites ? '✓' : '✗'}
                  </div>
                  <div className="px-3 py-1.5 rounded-full bg-muted/50">
                    Max: {currentHousehold.settings.maxMembers} members
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && householdId && (
        <AdminUsersSection
          householdId={householdId}
          householdMembers={householdMembers}
          householdStats={householdStats}
        />
      )}

      {/* Chores Tab */}
      {activeTab === 'chores' && householdId && <AdminChoresSection allChores={allChores} householdId={householdId} />}

      {/* Settings Tab */}
      {activeTab === 'settings' && householdId && <AdminDataSection householdId={householdId} />}
    </div>
  )
}

// Compact stat card component
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color
}: {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
  color: 'blue' | 'purple' | 'amber' | 'green'
}) {
  const colors = {
    blue: 'bg-blue-500/10 text-blue-600',
    purple: 'bg-purple-500/10 text-purple-600',
    amber: 'bg-amber-500/10 text-amber-600',
    green: 'bg-green-500/10 text-green-600',
  }

  return (
    <div className="p-3 rounded-xl border border-border/50 bg-card/50">
      <div className="flex items-center gap-2 mb-1">
        <div className={`p-1.5 rounded-md ${colors[color]}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="text-xl font-bold">{value}</div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </div>
  )
}

// Format time ago helper
function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
