import React, { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuth } from '../hooks/useAuth'
import { useCurrentHousehold } from '../hooks/useCurrentHousehold'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Id } from '../../convex/_generated/dataModel'
import { toast } from 'sonner'
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
  Edit,
  Trash2,
  Save,
  X,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'

export const AdminControlPanel: React.FC = () => {
  const { user } = useAuth()
  const householdId = useCurrentHousehold()
  const [activeSection, setActiveSection] = useState<'overview' | 'users' | 'households' | 'chores' | 'activity'>('overview')
  const [editingUserId, setEditingUserId] = useState<Id<'users'> | null>(null)
  const [editingChoreId, setEditingChoreId] = useState<Id<'chores'> | null>(null)
  const [choreEditData, setChoreEditData] = useState<{
    title?: string
    points?: number
    difficulty?: 'easy' | 'medium' | 'hard'
    category?: 'daily' | 'weekly' | 'monthly' | 'seasonal'
  }>({})

  // Check if user is admin
  const isAdmin = user?.role === 'admin'

  // Mutations
  const updateMemberRole = useMutation(api.households.updateMemberRole)
  const updateChore = useMutation(api.chores.updateChore)
  const deleteChore = useMutation(api.chores.deleteChore)

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
              onClick={() => setActiveSection(section.id as any)}
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
              <p className="text-xs text-muted-foreground">
                Active members
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Chores</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalChores}</div>
              <p className="text-xs text-muted-foreground">
                {completedChores} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Points</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPoints.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Earned by all users
              </p>
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
              <p className="text-xs text-muted-foreground">
                Chores completed
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Users Section */}
      {activeSection === 'users' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Household Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            {householdMembers && householdMembers.length > 0 ? (
              <div className="space-y-3">
                {householdMembers.map((member) => {
                  if (!member) return null
                  
                  const memberStats = householdStats?.find(s => s.userId === member._id)
                  const isEditing = editingUserId === member._id
                  const currentRole = (member.role || 'member') as 'admin' | 'parent' | 'teen' | 'kid' | 'member'
                  
                  const handleRoleChange = async (newRole: 'admin' | 'parent' | 'teen' | 'kid' | 'member') => {
                    if (!householdId || !member._id) return
                    
                    try {
                      await updateMemberRole({
                        householdId,
                        userId: member._id,
                        role: newRole,
                      })
                      toast.success(`Role updated to ${newRole}`)
                      setEditingUserId(null)
                    } catch (error: any) {
                      toast.error(error.message || 'Failed to update role')
                    }
                  }

                  return (
                    <div
                      key={member._id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg">
                          {member.avatarUrl || '👤'}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{member.name || member.email}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            {isEditing ? (
                              <select
                                value={currentRole}
                                onChange={(e) => handleRoleChange(e.target.value as any)}
                                className="text-xs border border-border rounded px-2 py-1 bg-background"
                                onBlur={() => setEditingUserId(null)}
                                autoFocus
                              >
                                <option value="admin">Admin</option>
                                <option value="parent">Parent</option>
                                <option value="teen">Teen</option>
                                <option value="kid">Kid</option>
                                <option value="member">Member</option>
                              </select>
                            ) : (
                              <>
                                <Badge variant="outline" className="text-xs">
                                  {currentRole}
                                </Badge>
                                {member.email && (
                                  <span className="text-xs">{member.email}</span>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-semibold">{memberStats?.earnedPoints || 0} pts</div>
                          <div className="text-sm text-muted-foreground">
                            Level {memberStats?.currentLevel || member.level || 1}
                          </div>
                        </div>
                        {!isEditing && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingUserId(member._id)}
                            className="flex items-center gap-1"
                          >
                            {currentRole === 'admin' ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronUp className="w-4 h-4" />
                            )}
                            Change Role
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No members found</p>
              </div>
            )}
          </CardContent>
        </Card>
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              Chore Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            {allChores && allChores.length > 0 ? (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-muted/50 rounded-lg">
                  <div>
                    <div className="text-sm text-muted-foreground">Total</div>
                    <div className="text-2xl font-bold">{allChores.length}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                    <div className="text-2xl font-bold text-green-600">
                      {allChores.filter(c => c.status === 'completed').length}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Pending</div>
                    <div className="text-2xl font-bold text-amber-600">
                      {allChores.filter(c => c.status === 'pending').length}
                    </div>
                  </div>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {allChores.map((chore) => {
                    const isEditing = editingChoreId === chore._id
                    
                    const handleSaveChore = async () => {
                      if (!chore._id) return
                      
                      try {
                        await updateChore({
                          choreId: chore._id,
                          ...choreEditData,
                        })
                        toast.success('Chore updated successfully')
                        setEditingChoreId(null)
                        setChoreEditData({})
                      } catch (error: any) {
                        toast.error(error.message || 'Failed to update chore')
                      }
                    }

                    const handleDeleteChore = async () => {
                      if (!chore._id) return
                      if (!window.confirm(`Are you sure you want to delete "${chore.title}"?`)) return
                      
                      try {
                        await deleteChore({ choreId: chore._id })
                        toast.success('Chore deleted successfully')
                      } catch (error: any) {
                        toast.error(error.message || 'Failed to delete chore')
                      }
                    }

                    const handleStartEdit = () => {
                      setEditingChoreId(chore._id)
                      setChoreEditData({
                        title: chore.title,
                        points: chore.points,
                        difficulty: chore.difficulty || 'medium',
                        category: chore.category || 'daily',
                      })
                    }

                    return (
                      <div
                        key={chore._id}
                        className="p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        {isEditing ? (
                          <div className="space-y-3">
                            <div>
                              <label className="text-xs text-muted-foreground mb-1 block">Title</label>
                              <Input
                                value={choreEditData.title || ''}
                                onChange={(e) => setChoreEditData({ ...choreEditData, title: e.target.value })}
                                className="w-full"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-xs text-muted-foreground mb-1 block">Points</label>
                                <Input
                                  type="number"
                                  value={choreEditData.points || ''}
                                  onChange={(e) => setChoreEditData({ ...choreEditData, points: parseInt(e.target.value) || 0 })}
                                  className="w-full"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-muted-foreground mb-1 block">Difficulty</label>
                                <select
                                  value={choreEditData.difficulty || 'medium'}
                                  onChange={(e) => setChoreEditData({ ...choreEditData, difficulty: e.target.value as any })}
                                  className="w-full border border-border rounded px-3 py-2 bg-background text-sm"
                                >
                                  <option value="easy">Easy</option>
                                  <option value="medium">Medium</option>
                                  <option value="hard">Hard</option>
                                </select>
                              </div>
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground mb-1 block">Category</label>
                              <select
                                value={choreEditData.category || 'daily'}
                                onChange={(e) => setChoreEditData({ ...choreEditData, category: e.target.value as any })}
                                className="w-full border border-border rounded px-3 py-2 bg-background text-sm"
                              >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="seasonal">Seasonal</option>
                              </select>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={handleSaveChore}
                                className="flex-1"
                              >
                                <Save className="w-4 h-4 mr-1" />
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingChoreId(null)
                                  setChoreEditData({})
                                }}
                                className="flex-1"
                              >
                                <X className="w-4 h-4 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium">{chore.title}</div>
                              <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {chore.status}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {chore.difficulty || 'medium'}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {chore.category || 'daily'}
                                </Badge>
                                <span>{chore.points} pts</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleStartEdit}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleDeleteChore}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ClipboardList className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No chores found</p>
              </div>
            )}
          </CardContent>
        </Card>
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
    </div>
  )
}

