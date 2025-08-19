export interface User {
  id: string
  name: string
  email: string
  avatar: string
  role: 'admin' | 'parent' | 'teen' | 'kid' | 'member'
  joinedAt: Date
  isActive: boolean
  parentId?: string // For kids/teens to link to their parent
  canApproveRedemptions?: boolean // Whether this user can approve redemptions
}

export interface UserStats {
  userId: string
  userName?: string
  totalChores: number
  completedChores: number
  totalPoints: number
  earnedPoints: number
  currentStreak: number
  longestStreak: number
  currentLevel: number
  currentLevelPoints: number
  pointsToNextLevel: number
  lastActive: Date
  efficiencyScore?: number
  levelPersistenceInfo?: {
    originalLevel: number
    persistedLevel: number
    expiresAt: number
    pointsAtRedemption: number
  }
}

export interface Household {
  id: string
  name: string
  description?: string
  createdAt: Date
  members: User[]
  settings: {
    allowInvites: boolean
    requireApproval: boolean
    maxMembers: number
  }
}

export interface UserInvite {
  id: string
  householdId?: string
  email: string
  invitedBy: string
  invitedAt: Date
  expiresAt?: Date
  status: 'pending' | 'accepted' | 'declined' | 'expired'
}

export interface RolePermissions {
  canApproveRedemptions: boolean
  canManageHousehold: boolean
  canInviteMembers: boolean
  canManageChores: boolean
  canViewAllStats: boolean
  requiresApproval: boolean
}

export const ROLE_PERMISSIONS: Record<string, RolePermissions> = {
  admin: {
    canApproveRedemptions: true,
    canManageHousehold: true,
    canInviteMembers: true,
    canManageChores: true,
    canViewAllStats: true,
    requiresApproval: false
  },
  parent: {
    canApproveRedemptions: true,
    canManageHousehold: true,
    canInviteMembers: true,
    canManageChores: true,
    canViewAllStats: true,
    requiresApproval: false
  },
  teen: {
    canApproveRedemptions: false,
    canManageHousehold: false,
    canInviteMembers: false,
    canManageChores: true,
    canViewAllStats: false,
    requiresApproval: true
  },
  kid: {
    canApproveRedemptions: false,
    canManageHousehold: false,
    canInviteMembers: false,
    canManageChores: true,
    canViewAllStats: false,
    requiresApproval: true
  },
  member: {
    canApproveRedemptions: false,
    canManageHousehold: false,
    canInviteMembers: false,
    canManageChores: true,
    canViewAllStats: false,
    requiresApproval: false
  }
}
