import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { useUsers } from '../contexts/UserContext'
import { useChores } from '../contexts/ChoreContext'
import { User } from '../types/user'
import { Users, UserPlus, Settings, Crown, UserMinus, Mail, Check, X, Edit3, ToggleLeft, ToggleRight } from 'lucide-react'

export const HouseholdManager: React.FC = () => {
  const { state, inviteMember, acceptInvite, declineInvite, removeMember, updateMemberRole, updateHouseholdSettings, clearLeaderboard } = useUsers()
  const { resetChores } = useChores()
  const [inviteEmail, setInviteEmail] = useState('')
  const [editingMember, setEditingMember] = useState<User | null>(null)
  const [editingName, setEditingName] = useState('')
  const [showSettingsFeedback, setShowSettingsFeedback] = useState(false)

  const handleInvite = () => {
    if (inviteEmail.trim()) {
      inviteMember(inviteEmail.trim())
      setInviteEmail('')
    }
  }

  const handleEditMember = (member: User) => {
    setEditingMember(member)
    setEditingName(member.name)
  }

  const handleSaveEdit = () => {
    if (editingMember && editingName.trim()) {
      // Update member name (you can extend this to update other fields)
      updateMemberRole(editingMember.id, editingMember.role)
      setEditingMember(null)
      setEditingName('')
    }
  }

  const handleCancelEdit = () => {
    setEditingMember(null)
    setEditingName('')
  }

  const getRoleIcon = (role: string) => {
    return role === 'admin' ? <Crown className="w-4 h-4 text-yellow-500" /> : <Users className="w-4 h-4 text-gray-500" />
  }

  const getRoleColor = (role: string) => {
    return role === 'admin' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
  }

  const handleToggleInvites = () => {
    updateHouseholdSettings({ allowInvites: !state.household!.settings.allowInvites })
    setShowSettingsFeedback(true)
    setTimeout(() => setShowSettingsFeedback(false), 2000)
  }

  const handleToggleApproval = () => {
    updateHouseholdSettings({ requireApproval: !state.household!.settings.requireApproval })
    setShowSettingsFeedback(true)
    setTimeout(() => setShowSettingsFeedback(false), 2000)
  }

  if (!state.household) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="text-xl">🚧</div>
              <div>
                <h3 className="font-semibold text-gray-900">Households coming soon</h3>
                <p className="text-sm text-gray-600">We're actively building household invites, roles, and shared stats. Stay tuned!</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🏠 Create Your Household</h2>
            <p className="text-gray-600 mb-6">
              Start managing chores together with your family, roommates, or friends!
            </p>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              Create Household
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="text-xl">🚧</div>
            <div>
              <h3 className="font-semibold text-gray-900">Households coming soon</h3>
              <p className="text-sm text-gray-600">We're actively building household invites, roles, and shared stats. Some features may change.</p>
            </div>
          </div>
        </CardContent>
      </Card>
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
              <h3 className="font-semibold text-gray-900 mb-2">{state.household.name}</h3>
              <p className="text-gray-600 text-sm">{state.household.description}</p>
              <p className="text-gray-500 text-xs mt-2">
                Created {state.household.createdAt.toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-indigo-600">{state.members.length}</div>
              <div className="text-sm text-gray-500">Members</div>
            </div>
          </div>
          {state.currentUser?.role !== 'admin' && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                ℹ️ You can view household information here. Contact an admin to make changes to household settings.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite New Member - Admin Only */}
      {state.currentUser?.role === 'admin' && state.household.settings.allowInvites ? (
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
                />
                <Button onClick={handleInvite} className="bg-green-600 hover:bg-green-700">
                  <Mail className="w-4 h-4 mr-2" />
                  Invite
                </Button>
              </div>
              {state.household.settings.requireApproval && (
                <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                  ⚠️ New members will require approval before joining
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : state.currentUser?.role === 'admin' && !state.household.settings.allowInvites ? (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-gray-500">
              <p className="text-sm">Invites are currently disabled</p>
              <p className="text-xs mt-1">Enable invites in Advanced Settings to invite new members</p>
            </div>
          </CardContent>
        </Card>
      ) : state.currentUser?.role !== 'admin' ? (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-gray-500">
              <p className="text-sm">Invite Settings</p>
              <p className="text-xs mt-1">
                {state.household.settings.allowInvites ? 'Invites are currently enabled' : 'Invites are currently disabled'}
                {state.household.settings.requireApproval && ' (approval required)'}
              </p>
              <p className="text-xs mt-2">Contact an admin to change these settings</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Pending Invites - Admin Only */}
      {state.currentUser?.role === 'admin' && state.invites.filter(invite => invite.status === 'pending').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="w-6 h-6 text-orange-500" />
              <span>Pending Invites</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {state.invites
                .filter(invite => invite.status === 'pending')
                .map(invite => (
                  <div key={invite.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{invite.email}</p>
                      <p className="text-sm text-gray-500">
                        Invited {invite.invitedAt.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => acceptInvite(invite.id)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => declineInvite(invite.id)}
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
      
      {/* Pending Invites Info for Non-Admin Users */}
      {state.currentUser?.role !== 'admin' && state.invites.filter(invite => invite.status === 'pending').length > 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-gray-500">
              <p className="text-sm">Pending Invites</p>
              <p className="text-xs mt-1">
                There are {state.invites.filter(invite => invite.status === 'pending').length} pending invite(s)
              </p>
              <p className="text-xs mt-2">Admins will handle these invites</p>
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
          {state.currentUser?.role !== 'admin' && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                ℹ️ You can view household members here. Contact an admin to make changes to member roles or remove members.
              </p>
            </div>
          )}
          <div className="space-y-4">
            {state.members.map(member => (
              <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{member.avatar}</div>
                  <div>
                    {editingMember?.id === member.id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <Button
                          onClick={handleSaveEdit}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          size="sm"
                          variant="outline"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">{member.name}</h3>
                        {state.currentUser?.role === 'admin' && (
                          <Button
                            onClick={() => handleEditMember(member)}
                            size="sm"
                            variant="ghost"
                            className="p-1 h-auto"
                          >
                            <Edit3 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    )}
                    <p className="text-sm text-gray-500">{member.email}</p>
                    <p className="text-xs text-gray-400">
                      Joined {member.joinedAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                    <div className="flex items-center space-x-1">
                      {getRoleIcon(member.role)}
                      <span>{member.role}</span>
                    </div>
                  </span>
                  
                  {state.currentUser?.role === 'admin' && state.currentUser?.id !== member.id && (
                    <Button
                      onClick={() => removeMember(member.id)}
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

      {/* Admin-only: Advanced Settings */}
      {state.currentUser?.role === 'admin' && (
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
                      {state.household.settings.allowInvites ? 'Invites enabled' : 'Invites disabled'}
                    </p>
                  </div>
                  <Button
                    onClick={handleToggleInvites}
                    variant="ghost"
                    size="sm"
                    className="p-2 h-auto"
                  >
                    {state.household.settings.allowInvites ? (
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
                      {state.household.settings.requireApproval ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <Button
                    onClick={handleToggleApproval}
                    variant="ghost"
                    size="sm"
                    className="p-2 h-auto"
                  >
                    {state.household.settings.requireApproval ? (
                      <ToggleRight className="w-5 h-5 text-green-600" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Max Members</h4>
                <p className="text-sm text-gray-600">{state.household.settings.maxMembers}</p>
              </div>
            </div>
            
            {/* Admin Data Management */}
            <div className="mt-6 p-4 border border-red-200 rounded-lg bg-red-50">
              <h4 className="font-medium text-red-900 mb-3 flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Data Management (Admin Only)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-red-800 mb-2">Clear All Chores</h5>
                  <p className="text-sm text-red-700 mb-3">
                    This will remove all chores and reset the chore system. This action cannot be undone.
                  </p>
                  <Button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to clear all chores? This action cannot be undone.')) {
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
                <div>
                  <h5 className="font-medium text-red-800 mb-2">Clear Leaderboard</h5>
                  <p className="text-sm text-red-700 mb-3">
                    This will reset all member stats, points, and levels. This action cannot be undone.
                  </p>
                  <Button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to clear the leaderboard? This action cannot be undone.')) {
                        clearLeaderboard()
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    Clear Leaderboard
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
