import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { useUsers } from '../contexts/UserContext'
import { Users, Baby, GraduationCap, Crown, UserCheck, ArrowRight } from 'lucide-react'
import { ROLE_PERMISSIONS } from '../types/user'

export const RoleSystemDemo: React.FC = () => {
  const { state, updateMemberRole } = useUsers()

  const currentUser = state.currentUser
  const members = state.members

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-5 h-5 text-yellow-500" />
      case 'parent':
        return <Users className="w-5 h-5 text-blue-500" />
      case 'teen':
        return <GraduationCap className="w-5 h-5 text-green-500" />
      case 'kid':
        return <Baby className="w-5 h-5 text-purple-500" />
      default:
        return <UserCheck className="w-5 h-5 text-gray-500" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'parent':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'teen':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'kid':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleRoleChange = (memberId: string, newRole: string) => {
    updateMemberRole(memberId, newRole as any)
  }

  const getRoleDescription = (role: string) => {
    const permissions = ROLE_PERMISSIONS[role]
    if (!permissions) return 'Unknown role'
    
    return {
      canApproveRedemptions: permissions.canApproveRedemptions,
      canManageHousehold: permissions.canManageHousehold,
      canInviteMembers: permissions.canInviteMembers,
      canManageChores: permissions.canManageChores,
      canViewAllStats: permissions.canViewAllStats,
      requiresApproval: permissions.requiresApproval
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-6 h-6 text-blue-500" />
            <span>Role System Demo</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            This demo shows how the new role system works. Parents can approve their kids' redemptions, 
            while teens and kids require approval for their redemption requests.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Current User</h3>
              <div className="flex items-center space-x-2 mb-2">
                {currentUser && getRoleIcon(currentUser.role)}
                <span className="font-medium">{currentUser?.name || 'None'}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(currentUser?.role || 'member')}`}>
                  {currentUser?.role || 'member'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {currentUser?.email || 'No email'}
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Role Permissions</h3>
              {currentUser && (
                <div className="space-y-1">
                  {Object.entries(getRoleDescription(currentUser.role)).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2 text-sm">
                      <span className={`w-2 h-2 rounded-full ${value ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-muted-foreground">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                      <span className={value ? 'text-green-600' : 'text-red-600'}>
                        {value ? 'Yes' : 'No'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Household Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{member.avatar}</div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{member.name}</h3>
                      {getRoleIcon(member.role)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                        {member.role}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                    {member.parentId && (
                      <p className="text-xs text-blue-600">
                        Parent: {members.find(m => m.id === member.parentId)?.name || 'Unknown'}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <select
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.id, e.target.value)}
                    className="px-2 py-1 border rounded text-sm"
                    disabled={member.id === currentUser?.id}
                  >
                    <option value="admin">Admin</option>
                    <option value="parent">Parent</option>
                    <option value="teen">Teen</option>
                    <option value="kid">Kid</option>
                    <option value="member">Member</option>
                  </select>
                  {member.id === currentUser?.id && (
                    <span className="text-xs text-muted-foreground">(Current user)</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">👨‍💼 Parents</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Can approve redemption requests from teens and kids</li>
                <li>• Can manage household settings and invite members</li>
                <li>• Can view all household stats and manage chores</li>
                <li>• No approval required for their own redemptions</li>
              </ul>
            </div>
            
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">👨‍🎓 Teens</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Can manage chores and earn points</li>
                <li>• Must get parent approval for redemption requests</li>
                <li>• Cannot manage household settings</li>
                <li>• Limited access to household stats</li>
              </ul>
            </div>
            
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-2">👩‍🎨 Kids</h4>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Can manage chores and earn points</li>
                <li>• Must get parent approval for redemption requests</li>
                <li>• Cannot manage household settings</li>
                <li>• Limited access to household stats</li>
              </ul>
            </div>
            
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">👑 Admins</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Full system access and control</li>
                <li>• Can approve all redemption requests</li>
                <li>• Can manage conversion rates and system settings</li>
                <li>• Can manage all household members and settings</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h4 className="font-semibold text-amber-800 mb-2">🔄 Redemption Flow</h4>
            <div className="flex items-center space-x-2 text-sm text-amber-700">
              <span>Kid/Teen submits redemption</span>
              <ArrowRight className="w-4 h-4" />
              <span>Parent receives notification</span>
              <ArrowRight className="w-4 h-4" />
              <span>Parent approves/rejects</span>
              <ArrowRight className="w-4 h-4" />
              <span>Points processed if approved</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
