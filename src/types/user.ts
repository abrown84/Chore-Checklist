export interface User {
  id: string
  name: string
  email: string
  avatar: string
  role: 'admin' | 'member'
  joinedAt: Date
  isActive: boolean
}

export interface UserStats {
  userId: string
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
  email: string
  invitedBy: string
  invitedAt: Date
  expiresAt: Date
  status: 'pending' | 'accepted' | 'declined' | 'expired'
}
