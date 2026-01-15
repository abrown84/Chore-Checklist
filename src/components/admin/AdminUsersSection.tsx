import React, { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { getDisplayName } from '../../utils/convexHelpers'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Avatar } from '../ui/Avatar'
import { Id } from '../../../convex/_generated/dataModel'
import { toast } from 'sonner'
import {
  Users,
  ChevronUp,
  ChevronDown,
  Coins,
  Save,
  X,
} from 'lucide-react'

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

export const AdminUsersSection: React.FC<AdminUsersSectionProps> = ({
  householdId,
  householdMembers,
  householdStats,
}) => {
  const [editingUserId, setEditingUserId] = useState<Id<'users'> | null>(null)
  const [adjustingPointsUserId, setAdjustingPointsUserId] = useState<Id<'users'> | null>(null)
  const [pointsAdjustment, setPointsAdjustment] = useState('')
  const [adjustmentReason, setAdjustmentReason] = useState('')

  const updateMemberRole = useMutation(api.households.updateMemberRole)
  const adjustUserPoints = useMutation(api.users.adminAdjustUserPoints)

  return (
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
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : 'Failed to update role')
                }
              }

              const handleAdjustPoints = async () => {
                if (!householdId || !member._id || !pointsAdjustment) return

                const pointsChange = parseInt(pointsAdjustment)
                if (isNaN(pointsChange) || pointsChange === 0) {
                  toast.error('Please enter a valid non-zero point amount')
                  return
                }

                try {
                  const result = await adjustUserPoints({
                    userId: member._id,
                    householdId,
                    pointsChange,
                    reason: adjustmentReason || undefined,
                  })
                  toast.success(
                    `Points ${pointsChange > 0 ? 'added' : 'subtracted'}: ${Math.abs(pointsChange)} points. New total: ${result.newPoints}`
                  )
                  setAdjustingPointsUserId(null)
                  setPointsAdjustment('')
                  setAdjustmentReason('')
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : 'Failed to adjust points')
                }
              }

              const isAdjustingPoints = adjustingPointsUserId === member._id

              return (
                <div
                  key={member._id}
                  className="p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors space-y-3"
                >
                  <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar
                      avatarUrl={member.avatarUrl}
                      userName={getDisplayName(member.name, member.email)}
                      userId={member._id}
                      size="md"
                    />
                      <div className="flex-1">
                        <div className="font-medium">{getDisplayName(member.name, member.email)}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          {isEditing ? (
                            <select
                              value={currentRole}
                              onChange={(e) => handleRoleChange(e.target.value as 'admin' | 'parent' | 'teen' | 'kid' | 'member')}
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
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-semibold flex items-center gap-1">
                          <Coins className="w-4 h-4 text-amber-500" />
                          {memberStats?.earnedPoints || 0} pts
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Level {memberStats?.currentLevel || member.level || 1}
                        </div>
                      </div>
                      {!isEditing && !isAdjustingPoints && (
                        <div className="flex items-center gap-2">
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAdjustingPointsUserId(member._id)}
                            className="flex items-center gap-1"
                          >
                            <Coins className="w-4 h-4" />
                            Adjust Points
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Point Adjustment Form */}
                  {isAdjustingPoints && (
                    <div className="mt-3 p-3 bg-muted/50 rounded-lg border border-border space-y-3">
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-amber-500" />
                        <span className="font-medium text-sm">Adjust Points for {getDisplayName(member.name, member.email)}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">
                            Points Change (use - for subtraction)
                          </label>
                          <Input
                            type="number"
                            value={pointsAdjustment}
                            onChange={(e) => setPointsAdjustment(e.target.value)}
                            placeholder="e.g., 50 or -25"
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">
                            Reason (optional)
                          </label>
                          <Input
                            type="text"
                            value={adjustmentReason}
                            onChange={(e) => setAdjustmentReason(e.target.value)}
                            placeholder="e.g., Bonus for good behavior"
                            className="w-full"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={handleAdjustPoints}
                          className="flex items-center gap-1"
                        >
                          <Save className="w-4 h-4" />
                          Apply Adjustment
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setAdjustingPointsUserId(null)
                            setPointsAdjustment('')
                            setAdjustmentReason('')
                          }}
                          className="flex items-center gap-1"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </Button>
                      </div>
                      {pointsAdjustment && !isNaN(parseInt(pointsAdjustment)) && (
                        <div className="text-xs text-muted-foreground">
                          Current: {memberStats?.earnedPoints || 0} pts → New: {Math.max(0, (memberStats?.earnedPoints || 0) + parseInt(pointsAdjustment))} pts
                        </div>
                      )}
                    </div>
                  )}
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
  )
}
