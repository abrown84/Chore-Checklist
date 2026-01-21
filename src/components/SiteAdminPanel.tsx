import React, { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import {
  Crown,
  Users,
  House,
  ChartBar,
  Trash,
  ShieldCheck,
  ShieldSlash,
  MagnifyingGlass,
  Warning,
  CheckCircle,
  TrendUp,
  ListChecks,
  Coins,
} from '@phosphor-icons/react'
import { Id } from '../../convex/_generated/dataModel'

type TabId = 'overview' | 'users' | 'households'

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: ChartBar },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'households', label: 'Households', icon: House },
]

export const SiteAdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const isSiteAdmin = useQuery(api.siteAdmin.isSiteAdmin)
  const globalStats = useQuery(api.siteAdmin.getGlobalStats)
  const allUsers = useQuery(api.siteAdmin.getAllUsers)
  const allHouseholds = useQuery(api.siteAdmin.getAllHouseholds)

  const toggleSiteAdmin = useMutation(api.siteAdmin.toggleSiteAdmin)
  const deleteUser = useMutation(api.siteAdmin.deleteUser)
  const deleteHousehold = useMutation(api.siteAdmin.deleteHouseholdAdmin)

  // Filter users based on search
  const filteredUsers = allUsers?.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Filter households based on search
  const filteredHouseholds = allHouseholds?.filter(
    (h) =>
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.createdBy?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isSiteAdmin === false) {
    return (
      <Card className="border-red-500/30 bg-red-500/5">
        <CardContent className="p-8 text-center">
          <Crown className="w-12 h-12 mx-auto mb-4 text-red-600" />
          <h3 className="text-lg font-semibold mb-2">Site Admin Access Required</h3>
          <p className="text-muted-foreground text-sm">
            This panel is restricted to site administrators only.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (isSiteAdmin === undefined) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-pulse">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  const handleToggleAdmin = async (userId: Id<"users">, makeAdmin: boolean) => {
    try {
      await toggleSiteAdmin({ targetUserId: userId, makeAdmin })
    } catch (error) {
      console.error('Failed to toggle admin:', error)
    }
  }

  const handleDeleteUser = async (userId: Id<"users">) => {
    try {
      await deleteUser({ targetUserId: userId })
      setConfirmDelete(null)
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }

  const handleDeleteHousehold = async (householdId: Id<"households">) => {
    try {
      await deleteHousehold({ householdId })
      setConfirmDelete(null)
    } catch (error) {
      console.error('Failed to delete household:', error)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <Crown className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Site Admin</h1>
            <p className="text-xs text-muted-foreground">Global app management</p>
          </div>
        </div>
        <Badge className="bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-500/30">
          Site Admin
        </Badge>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-lg w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all ${
              activeTab === id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-muted-foreground">Total Users</span>
                </div>
                <p className="text-2xl font-bold">{globalStats?.totalUsers || 0}</p>
                <p className="text-xs text-blue-500 mt-1">
                  +{globalStats?.recentUsers || 0} this week
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <House className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-muted-foreground">Households</span>
                </div>
                <p className="text-2xl font-bold">{globalStats?.totalHouseholds || 0}</p>
                <p className="text-xs text-green-500 mt-1">
                  +{globalStats?.recentHouseholds || 0} this week
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ListChecks className="w-4 h-4 text-amber-500" />
                  <span className="text-xs text-muted-foreground">Chores</span>
                </div>
                <p className="text-2xl font-bold">{globalStats?.totalChores || 0}</p>
                <p className="text-xs text-amber-500 mt-1">
                  {globalStats?.completionRate || 0}% completed
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="w-4 h-4 text-purple-500" />
                  <span className="text-xs text-muted-foreground">Total Points</span>
                </div>
                <p className="text-2xl font-bold">
                  {(globalStats?.totalPoints || 0).toLocaleString()}
                </p>
                <p className="text-xs text-purple-500 mt-1">
                  {globalStats?.totalCompletions || 0} completions
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendUp className="w-4 h-4" />
                Platform Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg chores per household</span>
                  <span className="font-medium">
                    {globalStats?.totalHouseholds
                      ? Math.round(globalStats.totalChores / globalStats.totalHouseholds)
                      : 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg users per household</span>
                  <span className="font-medium">
                    {globalStats?.totalHouseholds
                      ? (globalStats.totalUsers / globalStats.totalHouseholds).toFixed(1)
                      : 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Global completion rate</span>
                  <span className="font-medium">{globalStats?.completionRate || 0}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Users List */}
          <div className="space-y-2">
            {filteredUsers?.map((user) => (
              <Card key={user.id} className="hover:border-border/80 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{user.name || 'Unnamed User'}</p>
                          {user.isSiteAdmin && (
                            <Badge className="bg-purple-500/20 text-purple-600 text-xs">
                              Site Admin
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Level {user.level} · {user.points} pts · {user.households?.length || 0}{' '}
                          household(s)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {user.isSiteAdmin ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleAdmin(user.id, false)}
                          className="text-red-600 border-red-500/30 hover:bg-red-500/10"
                        >
                          <ShieldSlash className="w-4 h-4 mr-1" />
                          Remove Admin
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleAdmin(user.id, true)}
                          className="text-purple-600 border-purple-500/30 hover:bg-purple-500/10"
                        >
                          <ShieldCheck className="w-4 h-4 mr-1" />
                          Make Admin
                        </Button>
                      )}

                      {confirmDelete === user.id ? (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            Confirm
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setConfirmDelete(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setConfirmDelete(user.id)}
                          className="text-red-600 hover:bg-red-500/10"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredUsers?.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No users found matching "{searchQuery}"
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {activeTab === 'households' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search households by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Households List */}
          <div className="space-y-2">
            {filteredHouseholds?.map((household) => (
              <Card key={household.id} className="hover:border-border/80 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <House className="w-4 h-4 text-primary" />
                        <p className="font-medium">{household.name}</p>
                        <Badge variant="outline" className="text-xs">
                          {household.joinCode}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Created by {household.createdBy?.name || household.createdBy?.email || 'Unknown'}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {household.memberCount} members
                        </span>
                        <span className="flex items-center gap-1">
                          <ListChecks className="w-3 h-3" />
                          {household.choreCount} chores
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          {household.completedChores} completed
                        </span>
                      </div>
                    </div>

                    <div>
                      {confirmDelete === household.id ? (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteHousehold(household.id)}
                          >
                            <Warning className="w-4 h-4 mr-1" />
                            Confirm Delete
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setConfirmDelete(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setConfirmDelete(household.id)}
                          className="text-red-600 hover:bg-red-500/10"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredHouseholds?.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No households found matching "{searchQuery}"
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

SiteAdminPanel.displayName = 'SiteAdminPanel'
