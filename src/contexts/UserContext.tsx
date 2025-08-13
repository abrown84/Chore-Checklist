import React, { createContext, useContext, useReducer, useCallback } from 'react'
import { User, UserStats, Household, UserInvite } from '../types/user'
import { Chore, LEVELS, MAX_LEVEL } from '../types/chore'

interface UserState {
  currentUser: User | null
  household: Household | null
  members: User[]
  memberStats: UserStats[]
  invites: UserInvite[]
  isLoading: boolean
  error: string | null
}

type UserAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CURRENT_USER'; payload: User }
  | { type: 'UPDATE_CURRENT_USER'; payload: Partial<User> }
  | { type: 'SET_HOUSEHOLD'; payload: Household }
  | { type: 'UPDATE_HOUSEHOLD'; payload: Partial<Household> }
  | { type: 'SET_MEMBERS'; payload: User[] }
  | { type: 'ADD_MEMBER'; payload: User }
  | { type: 'REMOVE_MEMBER'; payload: string }
  | { type: 'UPDATE_MEMBER'; payload: User }
  | { type: 'SET_MEMBER_STATS'; payload: UserStats[] }
  | { type: 'UPDATE_MEMBER_STATS'; payload: UserStats }
  | { type: 'ADD_INVITE'; payload: UserInvite }
  | { type: 'UPDATE_INVITE'; payload: UserInvite }
  | { type: 'REMOVE_INVITE'; payload: string }
  | { type: 'UPDATE_HOUSEHOLD_SETTINGS'; payload: Partial<Household['settings']> }
  | { type: 'RESET_STATE' }
  | { type: 'CLEAR_LEADERBOARD'; payload?: never }

const initialState: UserState = {
  currentUser: null,
  household: null,
  members: [],
  memberStats: [],
  invites: [],
  isLoading: false,
  error: null
}

function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload }
    
    case 'UPDATE_CURRENT_USER':
      return { 
        ...state, 
        currentUser: state.currentUser ? { ...state.currentUser, ...action.payload } : null 
      }
    
    case 'SET_HOUSEHOLD':
      return { ...state, household: action.payload }
    
    case 'UPDATE_HOUSEHOLD':
      if (!state.household) return state
      return {
        ...state,
        household: { ...state.household, ...action.payload }
      }
    
    case 'SET_MEMBERS':
      return { ...state, members: action.payload }
    
    case 'ADD_MEMBER':
      // Prevent duplicate members
      if (state.members.find(m => m.id === action.payload.id)) {
        return state
      }
      return { ...state, members: [...state.members, action.payload] }
    
    case 'REMOVE_MEMBER':
      return { 
        ...state, 
        members: state.members.filter(m => m.id !== action.payload),
        memberStats: state.memberStats.filter(s => s.userId !== action.payload)
      }
    
    case 'UPDATE_MEMBER':
      return {
        ...state,
        members: state.members.map(m => m.id === action.payload.id ? action.payload : m)
      }
    
    case 'SET_MEMBER_STATS':
      return { ...state, memberStats: action.payload }
    
    case 'UPDATE_MEMBER_STATS':
      return {
        ...state,
        memberStats: state.memberStats.map(s => 
          s.userId === action.payload.userId ? action.payload : s
        )
      }
    
    case 'ADD_INVITE':
      return { ...state, invites: [...state.invites, action.payload] }
    
    case 'UPDATE_INVITE':
      return {
        ...state,
        invites: state.invites.map(i => i.id === action.payload.id ? action.payload : i)
      }
    
    case 'REMOVE_INVITE':
      return { ...state, invites: state.invites.filter(i => i.id !== action.payload) }
    
    case 'UPDATE_HOUSEHOLD_SETTINGS':
      if (!state.household) return state
      return {
        ...state,
        household: {
          ...state.household,
          settings: {
            ...state.household.settings,
            ...action.payload
          }
        }
      }
    
    case 'CLEAR_LEADERBOARD':
      return {
        ...state,
        memberStats: state.memberStats.map(stats => ({
          ...stats,
          totalChores: 0,
          completedChores: 0,
          totalPoints: 0,
          earnedPoints: 0,
          currentStreak: 0,
          longestStreak: 0,
          currentLevel: 1,
          currentLevelPoints: 0,
          pointsToNextLevel: 100,
          lastActive: new Date()
        }))
      }
    
    case 'RESET_STATE':
      return initialState
    
    default:
      return state
  }
}

// Convert from hook to regular function since it's called outside of React components
function calculateUserStats(members: User[], chores: Chore[]) {
  if (members.length === 0 || chores.length === 0) {
    return members.map(member => ({
      userId: member.id,
      totalChores: 0,
      completedChores: 0,
      totalPoints: 0,
      earnedPoints: 0,
      currentStreak: 0,
      longestStreak: 0,
      currentLevel: 1,
      currentLevelPoints: 0,
      pointsToNextLevel: 100,
      lastActive: new Date()
    }))
  }

  return members.map(member => {
    // Get chores explicitly assigned to this user
    let userChores = chores.filter(c => c.assignedTo === member.id)
    
    // If no chores are assigned, distribute chores evenly among household members
    if (userChores.length === 0) {
      const memberIds = members.map(m => m.id)
      const userIndex = memberIds.indexOf(member.id)
      
      if (userIndex !== -1) {
        // Distribute chores evenly: each user gets every Nth chore where N is the number of members
        userChores = chores.filter((_, index) => index % memberIds.length === userIndex)
      }
    }
    
    const completedChores = userChores.filter(c => c.completed)
    
    // Calculate total points from completed chores
    // Use finalPoints if available (includes bonuses/penalties), otherwise fall back to base points
    const baseEarnedPoints = completedChores.reduce((sum, c) => {
      const earnedPoints = c.finalPoints !== undefined ? c.finalPoints : c.points
      return sum + earnedPoints
    }, 0)
    
    // Also count points from chores that were completed but reset (preserved in finalPoints)
    const resetChoresPoints = userChores.reduce((sum, c) => {
      // If chore has finalPoints but is not currently completed, it was reset
      // These points should still count toward lifetime total
      if (!c.completed && c.finalPoints !== undefined) {
        return sum + c.finalPoints
      }
      return sum
    }, 0)
    
    // Total lifetime points = completed chore points + reset chore points
    const earnedPoints = baseEarnedPoints + resetChoresPoints
    
    // Calculate total potential points from all assigned chores
    const totalPoints = userChores.reduce((sum, c) => sum + (c.points || 0), 0)
    
    // Calculate streak efficiently
    const completedChoresWithDates = completedChores
      .filter(chore => chore.completedAt)
      .map(chore => new Date(chore.completedAt!).setHours(0, 0, 0, 0))
      .sort((a, b) => b - a)
    
    let currentStreak = 0
    let longestStreak = 0
    
    if (completedChoresWithDates.length > 0) {
      const today = new Date().setHours(0, 0, 0, 0)
      
      // Calculate current streak
      if (completedChoresWithDates[0] === today) {
        let streak = 1
        for (let i = 1; i < completedChoresWithDates.length; i++) {
          const expectedDate = today - (i * 24 * 60 * 60 * 1000)
          if (completedChoresWithDates[i] === expectedDate) {
            streak++
          } else {
            break
          }
        }
        currentStreak = streak
      }
      
      // Calculate longest streak
      let tempStreak = 1
      for (let i = 1; i < completedChoresWithDates.length; i++) {
        const daysDiff = (completedChoresWithDates[i-1] - completedChoresWithDates[i]) / (24 * 60 * 60 * 1000)
        if (daysDiff === 1) {
          tempStreak++
        } else {
          longestStreak = Math.max(longestStreak, tempStreak)
          tempStreak = 1
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak)
    }
    
    // Calculate level based on earned points using the LEVELS constant
    let currentLevel = 1
    
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (earnedPoints >= LEVELS[i].pointsRequired) {
        currentLevel = LEVELS[i].level
        break
      }
    }
    
    const currentLevelData = LEVELS.find(level => level.level === currentLevel)
    const nextLevelData = LEVELS.find(level => level.level === currentLevel + 1)
    
    const currentLevelPoints = earnedPoints - (currentLevelData?.pointsRequired || 0)
    const pointsToNextLevel = nextLevelData ? nextLevelData.pointsRequired - earnedPoints : 0
    
    return {
      userId: member.id,
      totalChores: userChores.length,
      completedChores: completedChores.length,
      totalPoints,
      earnedPoints,
      currentStreak,
      longestStreak,
      currentLevel: Math.min(currentLevel, MAX_LEVEL),
      currentLevelPoints,
      pointsToNextLevel,
      lastActive: new Date()
    }
  })
}

const UserContext = createContext<{
  state: UserState
  createHousehold: (name: string, description?: string) => void
  joinHousehold: (inviteCode: string) => void
  inviteMember: (email: string) => void
  acceptInvite: (inviteId: string) => void
  declineInvite: (inviteId: string) => void
  removeMember: (userId: string) => void
  updateMemberRole: (userId: string, role: 'admin' | 'member') => void
  updateMemberStats: (userId: string, chores: Chore[]) => void
  getMemberStats: (userId: string) => UserStats | undefined
  getCurrentUserStats: () => UserStats | undefined
  updateHouseholdSettings: (settings: Partial<Household['settings']>) => void
  clearLeaderboard: () => void
  recalculateStats: (chores: Chore[]) => void
  updateCurrentUser: (updates: Partial<User>) => void
  syncWithAuth: (authUser: { id: string; email: string; name: string }) => void
  resetUserState: () => void
} | null>(null)

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(userReducer, initialState)

  // Demo data initialization removed - users will start with a clean slate
  // Authentication is now required - no demo data will be created automatically

  // Initialize member stats as empty - they will be calculated when needed
  const memberStats: UserStats[] = []

  // Add method to sync with authentication state
  const syncWithAuth = useCallback((authUser: { id: string; email: string; name: string }) => {
    // Create or update current user
    const currentUser: User = {
      id: authUser.id,
      name: authUser.name,
      email: authUser.email,
      avatar: '👤',
      role: 'admin',
      joinedAt: new Date(),
      isActive: true
    }
    
    dispatch({ type: 'SET_CURRENT_USER', payload: currentUser })
    
    // Always try to add the member - the reducer can handle duplicates
    dispatch({ type: 'ADD_MEMBER', payload: currentUser })
  }, []) // Empty dependency array - function will be stable

  const createHousehold = useCallback((name: string, description?: string) => {
    // Get current user from state at time of call
    const currentUser = state.currentUser
    if (!currentUser) return

    const newHousehold: Household = {
      id: Date.now().toString(),
      name,
      description,
      createdAt: new Date(),
      members: [currentUser],
      settings: {
        allowInvites: true,
        requireApproval: false,
        maxMembers: 10
      }
    }

    dispatch({ type: 'SET_HOUSEHOLD', payload: newHousehold })
  }, [state.currentUser])

  const joinHousehold = useCallback((_inviteCode: string) => {
    // TODO: Implement household joining logic
  }, [])

  const inviteMember = useCallback((email: string) => {
    const currentUser = state.currentUser
    const household = state.household
    if (!currentUser || !household) return

    const newInvite: UserInvite = {
      id: Date.now().toString(),
      email,
      invitedBy: currentUser.id,
      invitedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'pending'
    }

    dispatch({ type: 'ADD_INVITE', payload: newInvite })
  }, [state.currentUser, state.household])

  const acceptInvite = useCallback((inviteId: string) => {
    const invite = state.invites.find(i => i.id === inviteId)
    if (!invite) return

    const newMember: User = {
      id: Date.now().toString(),
      name: invite.email.split('@')[0],
      email: invite.email,
      avatar: '👤',
      role: 'member',
      joinedAt: new Date(),
      isActive: true
    }

    dispatch({ type: 'ADD_MEMBER', payload: newMember })
    dispatch({ type: 'UPDATE_INVITE', payload: { ...invite, status: 'accepted' } })
  }, [state.invites])

  const declineInvite = useCallback((inviteId: string) => {
    const invite = state.invites.find(i => i.id === inviteId)
    if (invite) {
      dispatch({ type: 'UPDATE_INVITE', payload: { ...invite, status: 'declined' } })
    }
  }, [state.invites])

  const removeMember = useCallback((userId: string) => {
    if (state.currentUser?.id === userId) return
    dispatch({ type: 'REMOVE_MEMBER', payload: userId })
  }, [state.currentUser])

  const updateMemberRole = useCallback((userId: string, role: 'admin' | 'member') => {
    const member = state.members.find(m => m.id === userId)
    if (member) {
      dispatch({ type: 'UPDATE_MEMBER', payload: { ...member, role } })
    }
  }, [state.members])

  const updateMemberStats = useCallback((userId: string, _chores: Chore[]) => {
    const member = state.members.find(m => m.id === userId)
    if (!member) return
    
    const stats = calculateUserStats([member], _chores)[0]
    dispatch({ type: 'UPDATE_MEMBER_STATS', payload: stats })
  }, [state.members])

  const getMemberStats = useCallback((userId: string) => {
    return state.memberStats.find(s => s.userId === userId)
  }, [state.memberStats])

  const getCurrentUserStats = useCallback(() => {
    if (!state.currentUser) return undefined
    return getMemberStats(state.currentUser.id)
  }, [state.currentUser, getMemberStats])

  const updateHouseholdSettings = useCallback((settings: Partial<Household['settings']>) => {
    if (!state.household) return
    dispatch({ type: 'UPDATE_HOUSEHOLD_SETTINGS', payload: settings })
  }, [state.household])

  const clearLeaderboard = useCallback(() => {
    dispatch({ type: 'CLEAR_LEADERBOARD' })
  }, [])

  const recalculateStats = useCallback((chores: Chore[]) => {
    const newMemberStats = calculateUserStats(state.members, chores)
    
    // Update each member's stats
    newMemberStats.forEach(userStat => {
      dispatch({ 
        type: 'UPDATE_MEMBER_STATS', 
        payload: userStat
      })
    })
  }, [state.members])

  const updateCurrentUser = useCallback((updates: Partial<User>) => {
    dispatch({ type: 'UPDATE_CURRENT_USER', payload: updates })
    
    // If updating the name, also update household name if it contains the old name
    if (updates.name && state.currentUser && state.household) {
      const oldName = state.currentUser.name
      const newName = updates.name
      
      // Check if household name contains the old user name
      if (state.household.name.includes(oldName)) {
        const newHouseholdName = state.household.name.replace(oldName, newName)
        dispatch({ 
          type: 'UPDATE_HOUSEHOLD', 
          payload: { name: newHouseholdName } 
        })
      }
    }
  }, [state.currentUser, state.household])

  const resetUserState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' })
  }, [])

  return (
    <UserContext.Provider value={{
      state: { ...state, memberStats },
      createHousehold,
      joinHousehold,
      inviteMember,
      acceptInvite,
      declineInvite,
      removeMember,
      updateMemberRole,
      updateMemberStats,
      getMemberStats,
      getCurrentUserStats,
      updateHouseholdSettings,
      clearLeaderboard,
      recalculateStats,
      updateCurrentUser,
      syncWithAuth,
      resetUserState
    }}>
      {children}
    </UserContext.Provider>
  )
}

// Export the hook with a consistent name for Fast Refresh compatibility
export const useUsers = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUsers must be used within a UserProvider')
  }
  return context
}
