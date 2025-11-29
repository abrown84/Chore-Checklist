import React, { useState, useMemo } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Avatar } from './ui/Avatar'
import { useCurrentHousehold } from '../hooks/useCurrentHousehold'
import { useAuth } from '../hooks/useAuth'
import { useChores } from '../contexts/ChoreContext'
import { ROLE_PERMISSIONS } from '../types/user'
import { getDisplayName } from '../utils/convexHelpers'
import {
  Users,
  UserPlus,
  Settings,
  Crown,
  UserMinus,
  Mail,
  Check,
  X,
  Edit3,
  ToggleLeft,
  ToggleRight,
  Baby,
  GraduationCap,
  Home,
  Loader2,
  Trash2,
} from 'lucide-react'

export const HouseholdManager: React.FC = () => {
  const { user: currentUser } = useAuth()
  const householdId = useCurrentHousehold()
  const { resetChores } = useChores()
  
  // Queries
  const household = useQuery(
    api.households.getHousehold,
    householdId ? { householdId } : 'skip'
  )
  const members = useQuery(
    api.households.getHouseholdMembers,
    householdId ? { householdId } : 'skip'
  )
  const invites = useQuery(
    api.invites.getHouseholdInvites,
    householdId ? { householdId } : 'skip'
  )
  
  // Mutations
  const createHousehold = useMutation(api.households.createHousehold)
  const updateHousehold = useMutation(api.households.updateHousehold)
  const updateMemberRole = useMutation(api.households.updateMemberRole)
  const removeMember = useMutation(api.households.removeHouseholdMember)
  const createInvite = useMutation(api.invites.createInvite)
  const acceptInviteMutation = useMutation(api.invites.acceptInvite)
  const declineInviteMutation = useMutation(api.invites.declineInvite)
  const joinHouseholdByCode = useMutation(api.households.joinHouseholdByCode)
  const regenerateJoinCode = useMutation(api.households.regenerateJoinCode)
  const leaveHousehold = useMutation(api.households.leaveHousehold)
  const deleteHousehold = useMutation(api.households.deleteHousehold)
  const cancelInvite = useMutation(api.invites.cancelInvite)
  
  // Get invites sent to current user
  const myInvites = useQuery(api.invites.getMyInvites, {})
  
  // Local state
  const [inviteEmail, setInviteEmail] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editingMemberId, setEditingMemberId] = useState<Id<'users'> | null>(null)
  const [editingRole, setEditingRole] = useState<string>('')
  const [showSettingsFeedback, setShowSettingsFeedback] = useState(false)
  const [householdName, setHouseholdName] = useState('')
  const [isCreatingHousehold, setIsCreatingHousehold] = useState(false)

  // Transform members data to match UI expectations
  const transformedMembers = useMemo(() => {
    if (!members) return []
    return members
      .filter((member): member is NonNullable<typeof member> => member !== null && member.user !== null)
      .map((member) => ({
        id: member.userId,
        name: member.user.name || 'Unknown',
        email: member.user.email || '',
        avatar: member.user.avatarUrl || '👤',
        role: member.role,
        joinedAt: new Date(member.joinedAt),
        isActive: true,
      }))
  }, [members])

  // Get current user's role in household
  const currentUserMember = useMemo(() => {
    if (!members || !currentUser) return null
    return members.find((m) => m && m.userId === currentUser.id)
  }, [members, currentUser])

  const currentUserRole = currentUserMember?.role || 'member'
  const canManageHousehold = ROLE_PERMISSIONS[currentUserRole]?.canManageHousehold || false

  // Household settings with defaults
  const householdSettings = useMemo(() => {
    if (!household) {
      return {
        allowInvites: true,
        requireApproval: false,
        maxMembers: 10,
      }
    }
    return household.settings || {
      allowInvites: true,
      requireApproval: false,
      maxMembers: 10,
    }
  }, [household])

  const pendingInvites = useMemo(() => {
    return invites?.filter((invite) => invite.status === 'pending') || []
  }, [invites])

  const handleCreateHousehold = async () => {
    if (!householdName.trim()) return
    setIsCreatingHousehold(true)
    try {
      await createHousehold({ name: householdName.trim() })
      setHouseholdName('')
    } catch (error) {
      console.error('Error creating household:', error)
      alert('Failed to create household. Please try again.')
    } finally {
      setIsCreatingHousehold(false)
    }
  }

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !householdId) return
    try {
      await createInvite({
        householdId,
        email: inviteEmail.trim(),
      })
      setInviteEmail('')
    } catch (error: any) {
      console.error('Error creating invite:', error)
      alert(error.message || 'Failed to create invite. Please try again.')
    }
  }

  // Removed handleAcceptInvite and handleDeclineInvite - not used for pending invites (those are for canceling)

  const handleLeaveHousehold = async () => {
    if (!householdId) return
    try {
      await leaveHousehold({ householdId })
      setShowLeaveConfirm(false)
      alert('You have left the household.')
    } catch (error: any) {
      console.error('Error leaving household:', error)
      alert(error.message || 'Failed to leave household. Please try again.')
    }
  }

  const handleDeleteHousehold = async () => {
    if (!householdId) return
    try {
      await deleteHousehold({ householdId })
      setShowDeleteConfirm(false)
      alert('Household has been deleted.')
    } catch (error: any) {
      console.error('Error deleting household:', error)
      alert(error.message || 'Failed to delete household. Please try again.')
    }
  }

  const handleAcceptMyInvite = async (inviteId: Id<'userInvites'>) => {
    try {
      const result = await acceptInviteMutation({ inviteId })
      if (result.success) {
        alert('Successfully joined the household!')
      }
    } catch (error: any) {
      console.error('Error accepting invite:', error)
      alert(error.message || 'Failed to accept invite. Please try again.')
    }
  }

  const handleDeclineMyInvite = async (inviteId: Id<'userInvites'>) => {
    try {
      await declineInviteMutation({ inviteId })
    } catch (error: any) {
      console.error('Error declining invite:', error)
      alert(error.message || 'Failed to decline invite. Please try again.')
    }
  }

  const handleEditMember = (memberId: Id<'users'>, currentRole: string) => {
    setEditingMemberId(memberId)
    setEditingRole(currentRole)
  }

  const handleSaveEdit = async () => {
    if (!editingMemberId || !editingRole || !householdId) return
    try {
      await updateMemberRole({
        householdId,
        userId: editingMemberId,
        role: editingRole as any,
      })
      setEditingMemberId(null)
      setEditingRole('')
    } catch (error: any) {
      console.error('Error updating member role:', error)
      alert(error.message || 'Failed to update member role. Please try again.')
    }
  }

  const handleCancelEdit = () => {
    setEditingMemberId(null)
    setEditingRole('')
  }

  const handleRemoveMember = async (userId: Id<'users'>) => {
    if (!householdId) return
    if (!window.confirm('Are you sure you want to remove this member?')) return
    try {
      await removeMember({
        householdId,
        userId,
      })
    } catch (error: any) {
      console.error('Error removing member:', error)
      alert(error.message || 'Failed to remove member. Please try again.')
    }
  }

  const handleToggleInvites = async () => {
    if (!householdId || !household) return
    try {
      await updateHousehold({
        householdId,
        name: household.name,
        description: household.description,
        settings: {
          ...householdSettings,
          allowInvites: !householdSettings.allowInvites,
        },
      })
      setShowSettingsFeedback(true)
      setTimeout(() => setShowSettingsFeedback(false), 2000)
    } catch (error: any) {
      console.error('Error updating household settings:', error)
      alert(error.message || 'Failed to update settings. Please try again.')
    }
  }

  const handleToggleApproval = async () => {
    if (!householdId || !household) return
    try {
      await updateHousehold({
        householdId,
        name: household.name,
        description: household.description,
        settings: {
          ...householdSettings,
          requireApproval: !householdSettings.requireApproval,
        },
      })
      setShowSettingsFeedback(true)
      setTimeout(() => setShowSettingsFeedback(false), 2000)
    } catch (error: any) {
      console.error('Error updating household settings:', error)
      alert(error.message || 'Failed to update settings. Please try again.')
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-yellow-500" />
      case 'parent':
        return <Users className="w-4 h-4 text-blue-500" />
      case 'teen':
        return <GraduationCap className="w-4 h-4 text-green-500" />
      case 'kid':
        return <Baby className="w-4 h-4 text-purple-500" />
      default:
        return <Users className="w-4 h-4 text-gray-500" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-yellow-100 text-yellow-800'
      case 'parent':
        return 'bg-blue-100 text-blue-800'
      case 'teen':
        return 'bg-green-100 text-green-800'
      case 'kid':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Full system access and control'
      case 'parent':
        return 'Can approve redemptions and manage household'
      case 'teen':
        return 'Can manage chores, requires approval for redemptions'
      case 'kid':
        return 'Can manage chores, requires approval for redemptions'
      case 'member':
        return 'Standard member with basic access'
      default:
        return 'Standard member'
    }
  }

  const canManageMember = (currentUserRole: string, targetMemberRole: string) => {
    if (currentUserRole === 'admin') return true
    if (currentUserRole === 'parent' && (targetMemberRole === 'teen' || targetMemberRole === 'kid'))
      return true
    return false
  }

  // Check if queries are still loading (reserved for future loading states)
  // const isLoadingHousehold = householdId === null && household === undefined
  // const isLoadingMembers = householdId !== null && members === undefined
  // const isLoadingInvites = householdId !== null && invites === undefined
  
  // Show loading only if we have a householdId but data is still loading
  if (householdId && (household === undefined || members === undefined || invites === undefined)) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-500" />
            <p className="text-gray-600">Loading household...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleJoinHousehold = async () => {
    if (!joinCode.trim()) return
    setIsJoining(true)
    try {
      const result = await joinHouseholdByCode({ joinCode: joinCode.trim().toUpperCase() })
      if (result.requiresApproval) {
        alert('Your request to join has been submitted and is pending approval.')
      } else {
        alert('Successfully joined the household!')
        setJoinCode('')
      }
    } catch (error: any) {
      console.error('Error joining household:', error)
      alert(error.message || 'Failed to join household. Please check the code and try again.')
    } finally {
      setIsJoining(false)
    }
  }

  // No household - show create/join form
  // This handles both: no householdId (null) OR householdId exists but household query returned null/undefined
  if (!householdId || !household) {
    return (
      <div className="space-y-6">
        {/* Join Household Section */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <UserPlus className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Join a Household</h2>
              <p className="text-gray-600">
                Have a join code? Enter it below to join an existing household.
              </p>
            </div>
            <div className="max-w-md mx-auto space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Enter 6-character join code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-center text-2xl font-mono tracking-widest"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleJoinHousehold()
                    }
                  }}
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Ask a household admin for the join code
                </p>
              </div>
              <Button
                onClick={handleJoinHousehold}
                disabled={!joinCode.trim() || joinCode.length !== 6 || isJoining}
                className="bg-green-600 hover:bg-green-700 w-full"
              >
                {isJoining ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Join Household
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">OR</span>
          </div>
        </div>

        {/* Create Household Section */}
        <Card>
          <CardContent className="p-6 text-center">
            <Home className="w-12 h-12 mx-auto mb-4 text-indigo-500" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🏠 Create Your Household</h2>
            <p className="text-gray-600 mb-6">
              Start managing chores together with your family, roommates, or friends!
            </p>
            <div className="max-w-md mx-auto space-y-4">
              <input
                type="text"
                placeholder="Household name"
                value={householdName}
                onChange={(e) => setHouseholdName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateHousehold()
                  }
                }}
              />
              <Button
                onClick={handleCreateHousehold}
                disabled={!householdName.trim() || isCreatingHousehold}
                className="bg-indigo-600 hover:bg-indigo-700 w-full"
              >
                {isCreatingHousehold ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Household'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Household Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-6 h-6 text-indigo-500" />
            <span>Household Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-foreground mb-2">{household.name}</h3>
              {household.description && (
                <p className="text-muted-foreground text-sm">{household.description}</p>
              )}
              <p className="text-muted-foreground text-xs mt-2">
                Created {new Date(household.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {transformedMembers.length}
              </div>
              <div className="text-sm text-muted-foreground">Members</div>
            </div>
          </div>
          
          {/* Join Code Section */}
          {household.joinCode && (
            <div className="mt-6 p-4 bg-card/40 backdrop-blur-sm border border-border rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Join Code
                  </label>
                  <div className="flex items-center gap-3 flex-wrap">
                    <code className="text-2xl font-mono font-bold text-primary tracking-widest bg-primary/10 px-4 py-2.5 rounded-md border border-primary/20 shadow-sm">
                      {household.joinCode}
                    </code>
                    {canManageHousehold && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          if (!householdId) return
                          try {
                            const result = await regenerateJoinCode({ householdId })
                            alert(`New join code: ${result.joinCode}`)
                          } catch (error: any) {
                            alert(error.message || 'Failed to regenerate code')
                          }
                        }}
                        className="text-xs"
                      >
                        <Edit3 className="w-3 h-3 mr-1" />
                        Regenerate
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Share this code with others so they can join your household
                  </p>
                </div>
              </div>
            </div>
          )}
          {!canManageHousehold && (
            <div className="mt-4 p-3 bg-card/40 backdrop-blur-sm border border-border rounded-lg">
              <p className="text-sm text-muted-foreground">
                ℹ️ You can view household information here. Contact a parent or admin to make
                changes to household settings.
              </p>
            </div>
          )}
          
          {/* Leave Household Button */}
          <div className="mt-6 pt-6 border-t border-border space-y-3">
            <Button
              variant="outline"
              onClick={() => setShowLeaveConfirm(true)}
              className="w-full border-red-300 text-red-600 hover:bg-red-50"
            >
              <UserMinus className="w-4 h-4 mr-2" />
              Leave Household
            </Button>
            {showLeaveConfirm && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 mb-3">
                  Are you sure you want to leave this household? You will lose access to all chores and data.
                </p>
                <div className="flex space-x-2">
                  <Button
                    onClick={handleLeaveHousehold}
                    className="bg-red-600 hover:bg-red-700 flex-1"
                  >
                    Yes, Leave
                  </Button>
                  <Button
                    onClick={() => setShowLeaveConfirm(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

          </div>
        </CardContent>
      </Card>

      {/* Invite New Member - Admin/Parent Only */}
      {canManageHousehold && householdSettings.allowInvites ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserPlus className="w-6 h-6 text-green-500" />
              <span>Invite New Member</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex space-x-2">
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleInvite()
                    }
                  }}
                />
                <Button onClick={handleInvite} className="bg-green-600 hover:bg-green-700">
                  <Mail className="w-4 h-4 mr-2" />
                  Invite
                </Button>
              </div>
              {householdSettings.requireApproval && (
                <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                  ⚠️ New members will require approval before joining
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : canManageHousehold && !householdSettings.allowInvites ? (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-gray-500">
              <p className="text-sm">Invites are currently disabled</p>
              <p className="text-xs mt-1">
                Enable invites in Advanced Settings to invite new members
              </p>
            </div>
          </CardContent>
        </Card>
      ) : !canManageHousehold ? (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-gray-500">
              <p className="text-sm">Invite Settings</p>
              <p className="text-xs mt-1">
                {householdSettings.allowInvites
                  ? 'Invites are currently enabled'
                  : 'Invites are currently disabled'}
                {householdSettings.requireApproval && ' (approval required)'}
              </p>
              <p className="text-xs mt-2">
                Contact a parent or admin to change these settings
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* My Invites - Invites sent to current user */}
      {myInvites && myInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="w-6 h-6 text-purple-500" />
              <span>Invitations Received</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myInvites.map((invite) => (
                <div
                  key={invite._id}
                  className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Home className="w-4 h-4 text-purple-600" />
                      <p className="font-medium text-gray-900">
                        {invite.household?.name || 'Unknown Household'}
                      </p>
                    </div>
                    {invite.inviter && (
                      <p className="text-sm text-gray-600">
                        Invited by {getDisplayName(invite.inviter.name, invite.inviter.email)}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {invite.expiresAt
                        ? `Expires ${new Date(invite.expiresAt).toLocaleDateString()}`
                        : 'No expiration'}
                    </p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button
                      onClick={() => handleAcceptMyInvite(invite._id)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Accept
                    </Button>
                    <Button
                      onClick={() => handleDeclineMyInvite(invite._id)}
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Invites - Admin/Parent Only */}
      {canManageHousehold && pendingInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="w-6 h-6 text-orange-500" />
              <span>Pending Invites</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingInvites.map((invite) => (
                <div
                  key={invite._id}
                  className="flex items-center justify-between p-3 bg-orange-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{invite.email}</p>
                    <p className="text-sm text-gray-500">
                      Invited {new Date(invite.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={async () => {
                        try {
                          await cancelInvite({ inviteId: invite._id })
                        } catch (error: any) {
                          alert(error.message || 'Failed to cancel invite')
                        }
                      }}
                      size="sm"
                      variant="outline"
                      className="border-gray-300 text-gray-600 hover:bg-gray-50"
                      title="Cancel invite"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Invites Info for Non-Admin/Parent Users */}
      {!canManageHousehold && pendingInvites.length > 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-gray-500">
              <p className="text-sm">Pending Invites</p>
              <p className="text-xs mt-1">
                There are {pendingInvites.length} pending invite(s)
              </p>
              <p className="text-xs mt-2">Parents and admins will handle these invites</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-6 h-6 text-blue-500" />
            <span>Household Members</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!canManageHousehold && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                ℹ️ You can view household members here. Contact a parent or admin to make changes
                to member roles or remove members.
              </p>
            </div>
          )}
          <div className="space-y-4">
            {transformedMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Avatar 
                    avatarUrl={member.avatar}
                    userName={member.name}
                    userId={member.id}
                    size="md"
                  />
                  <div>
                    {editingMemberId === member.id ? (
                      <div className="space-y-2">
                        <select
                          value={editingRole}
                          onChange={(e) => setEditingRole(e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="admin">Admin</option>
                          <option value="parent">Parent</option>
                          <option value="teen">Teen</option>
                          <option value="kid">Kid</option>
                          <option value="member">Member</option>
                        </select>
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={handleSaveEdit}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button onClick={handleCancelEdit} size="sm" variant="outline">
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900">{member.name}</h3>
                          {canManageMember(currentUserRole, member.role) && (
                            <Button
                              onClick={() => handleEditMember(member.id, member.role)}
                              size="sm"
                              variant="ghost"
                              className="p-1 h-auto"
                            >
                              <Edit3 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{member.email}</p>
                        <p className="text-xs text-gray-400">
                          Joined {member.joinedAt.toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-400">
                          {getRoleDescription(member.role)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
                      member.role
                    )}`}
                  >
                    <div className="flex items-center space-x-1">
                      {getRoleIcon(member.role)}
                      <span>{member.role}</span>
                    </div>
                  </span>

                  {canManageMember(currentUserRole, member.role) &&
                    currentUser?.id !== member.id && (
                      <Button
                        onClick={() => handleRemoveMember(member.id)}
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <UserMinus className="w-4 h-4" />
                      </Button>
                    )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Settings Feedback */}
      {showSettingsFeedback && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <p className="text-sm text-green-700">✅ Settings updated successfully!</p>
        </div>
      )}

      {/* Admin/Parent-only: Advanced Settings */}
      {canManageHousehold && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-6 h-6 text-purple-500" />
              <span>Advanced Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Invite Settings</h4>
                    <p className="text-sm text-gray-600">
                      {householdSettings.allowInvites ? 'Invites enabled' : 'Invites disabled'}
                    </p>
                  </div>
                  <Button
                    onClick={handleToggleInvites}
                    variant="ghost"
                    size="sm"
                    className="p-2 h-auto"
                  >
                    {householdSettings.allowInvites ? (
                      <ToggleRight className="w-5 h-5 text-green-600" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Approval Required</h4>
                    <p className="text-sm text-gray-600">
                      {householdSettings.requireApproval ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <Button
                    onClick={handleToggleApproval}
                    variant="ghost"
                    size="sm"
                    className="p-2 h-auto"
                  >
                    {householdSettings.requireApproval ? (
                      <ToggleRight className="w-5 h-5 text-green-600" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Max Members</h4>
                <p className="text-sm text-gray-600">{householdSettings.maxMembers}</p>
              </div>
            </div>

            {/* Admin Data Management */}
            <div className="mt-6 p-4 border border-red-200 rounded-lg bg-red-50">
              <h4 className="font-medium text-red-900 mb-3 flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Data Management (Admin/Parent Only)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-red-800 mb-2">Clear All Chores</h5>
                  <p className="text-sm text-red-700 mb-3">
                    This will remove all chores and reset the chore system. This action cannot be
                    undone.
                  </p>
                  <Button
                    onClick={() => {
                      if (
                        window.confirm(
                          'Are you sure you want to clear all chores? This action cannot be undone.'
                        )
                      ) {
                        resetChores()
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    Clear All Chores
                  </Button>
                </div>
                {currentUserRole === 'admin' && (
                  <div>
                    <h5 className="font-medium text-red-800 mb-2">Delete Household</h5>
                    <p className="text-sm text-red-700 mb-3">
                      This will permanently delete the entire household and all associated data. This action cannot be undone.
                    </p>
                    <Button
                      onClick={() => setShowDeleteConfirm(true)}
                      variant="outline"
                      size="sm"
                      className="border-red-500 text-red-700 hover:bg-red-100 font-semibold"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Household
                    </Button>
                    {showDeleteConfirm && (
                      <div className="mt-3 p-3 bg-red-100 border-2 border-red-400 rounded-lg">
                        <p className="text-xs font-semibold text-red-900 mb-2">
                          ⚠️ WARNING: This action cannot be undone!
                        </p>
                        <p className="text-xs text-red-800 mb-3">
                          Deleting this household will permanently remove:
                          <ul className="list-disc list-inside mt-1 space-y-0.5 text-xs">
                            <li>All household members and their data</li>
                            <li>All chores and completion history</li>
                            <li>All user stats and points</li>
                            <li>All invites and redemption requests</li>
                          </ul>
                        </p>
                        <div className="flex space-x-2">
                          <Button
                            onClick={handleDeleteHousehold}
                            size="sm"
                            className="bg-red-700 hover:bg-red-800 flex-1 text-xs"
                          >
                            Yes, Delete Forever
                          </Button>
                          <Button
                            onClick={() => setShowDeleteConfirm(false)}
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
