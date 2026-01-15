import React, { useState, useMemo } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuth } from '../hooks/useAuth'
import { useCurrentHousehold } from '../hooks/useCurrentHousehold'
import { useUsers } from '../contexts/UserContext'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { AdminUsersSection, AdminChoresSection, AdminDataSection } from './admin'
import {
  Settings,
  Users,
  Home,
  ClipboardList,
  TrendingUp,
  Activity,
  Shield,
  BarChart3,
  UserCheck,
  Clock,
} from 'lucide-react'

export const AdminControlPanel: React.FC = () => {
  const { user } = useAuth()
  const { state: userState } = useUsers()
  const householdId = useCurrentHousehold()
  const [activeSection, setActiveSection] = useState<'overview' | 'users' | 'households' | 'chores' | 'activity' | 'data'>('overview')

  // Get current user's household membership role (this is what determines admin permissions)
  const currentUserRole = useMemo(() => {
    if (!user?.id) return null
    const currentUserMember = userState.members.find(m => m.id === user.id)
    return (currentUserMember?.role || user?.role || 'member') as 'admin' | 'parent' | 'teen' | 'kid' | 'member'
  }, [user, userState.members])

  // Check if user is admin
  const isAdmin = currentUserRole === 'admin'

  // Queries
  const currentHousehold = useQuery(
    api.households.getHousehold,
    householdId ? { householdId } : 'skip'
  )

  const householdMembers = useQuery(
    api.users.getUsersByHousehold,
    householdId ? { householdId } : 'skip'
  )

  const householdStats = useQuery(
    api.stats.getHouseholdStats,
    householdId ? { householdId } : 'skip'
  )

  const recentActivity = useQuery(
    api.stats.getRecentActivity,
    householdId ? { householdId, limit: 10 } : 'skip'
  )

  const allChores = useQuery(
    api.chores.getChoresByHousehold,
    householdId ? { householdId } : 'skip'
  )

  if (!isAdmin) {
    return (
      <Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
        <CardContent className="p-6 text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-amber-600" />
          <h3 className="text-lg font-semibold mb-2">Admin Access Required</h3>
          <p className="text-muted-foreground">
            You need admin privileges to access the control panel.
          </p>
        </CardContent>
      </Card>
    )
  }

  const totalUsers = householdMembers?.length || 0
  const totalChores = allChores?.length || 0
  const completedChores = allChores?.filter(c => c.status === 'completed').length || 0
  const totalPoints = householdStats?.reduce((sum, stat) => sum + (stat.earnedPoints || 0), 0) || 0

  const sections = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'households', label: 'Households', icon: Home },
    { id: 'chores', label: 'Chores', icon: ClipboardList },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'data', label: 'Data Management', icon: Shield },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="w-8 h-8" />
            Admin Control Panel
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your household and system settings
          </p>
        </div>
        <Badge className="bg-amber-500 text-slate-900 px-3 py-1">
          Admin Mode
        </Badge>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <Button
              key={section.id}
              variant={activeSection === section.id ? 'default' : 'ghost'}
              onClick={() => setActiveSection(section.id as typeof activeSection)}
              className="flex items-center gap-2"
            >
              <Icon className="w-4 h-4" />
              {section.label}
            </Button>
          )
        })}
      </div>

      {/* Overview Section */}
      {activeSection === 'overview' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">Active members</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Chores</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalChores}</div>
              <p className="text-xs text-muted-foreground">{completedChores} completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Points</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPoints.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Earned by all users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalChores > 0 ? Math.round((completedChores / totalChores) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">Chores completed</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Users Section */}
      {activeSection === 'users' && householdId && (
        <AdminUsersSection
          householdId={householdId}
          householdMembers={householdMembers}
          householdStats={householdStats}
        />
      )}

      {/* Households Section */}
      {activeSection === 'households' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              Household Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentHousehold ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Household Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{currentHousehold.name}</span>
                    </div>
                    {currentHousehold.description && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Description:</span>
                        <span className="font-medium">{currentHousehold.description}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Join Code:</span>
                      <span className="font-medium font-mono">{currentHousehold.joinCode || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span className="font-medium">
                        {new Date(currentHousehold.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                {currentHousehold.settings && (
                  <div>
                    <h3 className="font-semibold mb-2">Settings</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Allow Invites:</span>
                        <Badge variant={currentHousehold.settings.allowInvites ? 'default' : 'secondary'}>
                          {currentHousehold.settings.allowInvites ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Require Approval:</span>
                        <Badge variant={currentHousehold.settings.requireApproval ? 'default' : 'secondary'}>
                          {currentHousehold.settings.requireApproval ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Max Members:</span>
                        <span className="font-medium">{currentHousehold.settings.maxMembers}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Home className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No household information available</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Chores Section */}
      {activeSection === 'chores' && (
        <AdminChoresSection allChores={allChores} />
      )}

      {/* Activity Section */}
      {activeSection === 'activity' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity && recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div
                    key={activity._id}
                    className="flex items-center gap-3 p-3 border border-border rounded-lg"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserCheck className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">
                        {activity.userName} completed "{activity.choreTitle}"
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {new Date(activity.completedAt).toLocaleString()}
                        {activity.pointsEarned > 0 && (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-green-600">
                              +{activity.pointsEarned} pts
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Data Management Section */}
      {activeSection === 'data' && householdId && (
        <AdminDataSection householdId={householdId} />
      )}
    </div>
  )
}
