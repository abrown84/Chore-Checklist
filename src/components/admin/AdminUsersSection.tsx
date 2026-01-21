import React, { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { getDisplayName } from '../../utils/convexHelpers'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Avatar } from '../ui/Avatar'
import { Id } from '../../../convex/_generated/dataModel'
import { toast } from 'sonner'
import { Users, Coins, FloppyDisk, X, CaretDown } from '@phosphor-icons/react'

interface HouseholdMember {
  _id: Id<'users'>
  name?: string
  email?: string
  role?: string
  level?: number
  avatarUrl?: string
}

interface MemberStats {
  userId: Id<'users'>
  earnedPoints?: number
  currentLevel?: number
}

interface AdminUsersSectionProps {
  householdId: Id<'households'>
  householdMembers: (HouseholdMember | null)[] | undefined
  householdStats: MemberStats[] | undefined
}

const ROLES = ['admin', 'parent', 'teen', 'kid', 'member'] as const
type Role = typeof ROLES[number]

export const AdminUsersSection: React.FC<AdminUsersSectionProps> = ({
  householdId,
  householdMembers,
  householdStats,
}) => {
  const [expandedUserId, setExpandedUserId] = useState<Id<'users'> | null>(null)
  const [pointsInput, setPointsInput] = useState('')
  const [reasonInput, setReasonInput] = useState('')

  const updateMemberRole = useMutation(api.households.updateMemberRole)
  const adjustUserPoints = useMutation(api.users.adminAdjustUserPoints)

  const handleRoleChange = async (userId: Id<'users'>, newRole: Role) => {
    try {
      await updateMemberRole({ householdId, userId, role: newRole })
      toast.success(`Role updated to ${newRole}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update role')
    }
  }

  const handleAdjustPoints = async (userId: Id<'users'>) => {
    const points = parseInt(pointsInput)
    if (isNaN(points) || points === 0) {
      toast.error('Enter a valid non-zero amount')
      return
    }

    try {
      const result = await adjustUserPoints({
        userId,
        householdId,
        pointsChange: points,
        reason: reasonInput || undefined,
      })
      toast.success(`${points > 0 ? 'Added' : 'Subtracted'} ${Math.abs(points)} pts. New: ${result.newPoints}`)
      setExpandedUserId(null)
      setPointsInput('')
      setReasonInput('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to adjust points')
    }
  }

  const members = householdMembers?.filter(Boolean) || []

  if (members.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p>No members found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Household Members</h3>
          <Badge variant="secondary" className="ml-auto">{members.length}</Badge>
        </div>

        <div className="space-y-2">
          {members.map((member) => {
            if (!member) return null
            const stats = householdStats?.find(s => s.userId === member._id)
            const isExpanded = expandedUserId === member._id
            const currentRole = (member.role || 'member') as Role

            return (
              <div
                key={member._id}
                className={`rounded-lg border transition-colors ${isExpanded ? 'border-primary/30 bg-primary/5' : 'border-border/50 hover:bg-muted/30'}`}
              >
                {/* Member Row */}
                <div className="flex items-center gap-3 p-3">
                  <Avatar
                    avatarUrl={member.avatarUrl}
                    userName={getDisplayName(member.name, member.email)}
                    userId={member._id}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{getDisplayName(member.name, member.email)}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Lvl {stats?.currentLevel || member.level || 1}</span>
                      <span>•</span>
                      <span className="text-amber-600 font-medium">{stats?.earnedPoints || 0} pts</span>
                    </div>
                  </div>

                  {/* Role Dropdown */}
                  <div className="relative">
                    <select
                      value={currentRole}
                      onChange={(e) => handleRoleChange(member._id, e.target.value as Role)}
                      className="appearance-none text-xs border border-border rounded-md px-2 py-1 pr-6 bg-background cursor-pointer hover:bg-muted/50"
                    >
                      {ROLES.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                    <CaretDown className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
                  </div>

                  {/* Points Button */}
                  <Button
                    variant={isExpanded ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setExpandedUserId(isExpanded ? null : member._id)}
                    className="h-7 px-2 text-xs"
                  >
                    <Coins className="w-3 h-3 mr-1" />
                    Pts
                  </Button>
                </div>

                {/* Expanded Points Form */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 border-t border-border/30">
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <label className="text-[10px] text-muted-foreground">Amount (- to subtract)</label>
                        <Input
                          type="number"
                          value={pointsInput}
                          onChange={(e) => setPointsInput(e.target.value)}
                          placeholder="e.g., 50 or -25"
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] text-muted-foreground">Reason (optional)</label>
                        <Input
                          value={reasonInput}
                          onChange={(e) => setReasonInput(e.target.value)}
                          placeholder="Bonus, penalty..."
                          className="h-8 text-sm"
                        />
                      </div>
                      <Button size="sm" className="h-8" onClick={() => handleAdjustPoints(member._id)}>
                        <FloppyDisk className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8"
                        onClick={() => {
                          setExpandedUserId(null)
                          setPointsInput('')
                          setReasonInput('')
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    {pointsInput && !isNaN(parseInt(pointsInput)) && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {stats?.earnedPoints || 0} → {Math.max(0, (stats?.earnedPoints || 0) + parseInt(pointsInput))} pts
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
