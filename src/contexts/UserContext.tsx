import React, { createContext, useContext, useReducer, useCallback, useEffect, useMemo } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { User, UserStats, Household, UserInvite } from '../types/user'
import { useConvexAuth } from '../hooks/useConvexAuth'
import { useCurrentHousehold } from '../hooks/useCurrentHousehold'
import { convexMemberToUser } from '../utils/convexHelpers'

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
  | { type: 'BATCH_UPDATE'; payload: Partial<UserState> }

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
    
    case 'SET_MEMBERS': {
      // Prevent unnecessary updates if members haven't changed
      if (JSON.stringify(state.members) === JSON.stringify(action.payload)) {
        return state
      }
      return { ...state, members: action.payload }
    }
    
    case 'ADD_MEMBER': {
      // Prevent duplicate members
      if (state.members.find(m => m.id === action.payload.id)) {
        return state
      }
      return { ...state, members: [...state.members, action.payload] }
    }
    
    case 'REMOVE_MEMBER': {
      const newMembers = state.members.filter(m => m.id !== action.payload)
      const newMemberStats = state.memberStats.filter(s => s.userId !== action.payload)
      return { 
        ...state, 
        members: newMembers,
        memberStats: newMemberStats
      }
    }
    
    case 'UPDATE_MEMBER': {
      const memberIndex = state.members.findIndex(m => m.id === action.payload.id)
      if (memberIndex === -1) return state
      
      const newMembers = [...state.members]
      newMembers[memberIndex] = action.payload
      return { ...state, members: newMembers }
    }
    
    case 'SET_MEMBER_STATS': {
      // Prevent unnecessary updates if stats haven't changed
      if (JSON.stringify(state.memberStats) === JSON.stringify(action.payload)) {
        return state
      }
      return { ...state, memberStats: action.payload }
    }
    
    case 'UPDATE_MEMBER_STATS': {
      const statIndex = state.memberStats.findIndex(s => s.userId === action.payload.userId)
      if (statIndex === -1) return state
      
      const newMemberStats = [...state.memberStats]
      newMemberStats[statIndex] = action.payload
      return { ...state, memberStats: newMemberStats }
    }
    
    case 'ADD_INVITE': {
      if (state.invites.find(i => i.id === action.payload.id)) {
        return state
      }
      return { ...state, invites: [...state.invites, action.payload] }
    }
    
    case 'UPDATE_INVITE': {
      const inviteIndex = state.invites.findIndex(i => i.id === action.payload.id)
      if (inviteIndex === -1) return state
      
      const newInvites = [...state.invites]
      newInvites[inviteIndex] = action.payload
      return { ...state, invites: newInvites }
    }
    
    case 'REMOVE_INVITE': {
      return { ...state, invites: state.invites.filter(i => i.id !== action.payload) }
    }
    
    case 'UPDATE_HOUSEHOLD_SETTINGS': {
      if (!state.household) return state
      return {
        ...state,
        household: {
          ...state.household,
          settings: { ...state.household.settings, ...action.payload }
        }
      }
    }
    
    case 'RESET_STATE': {
      return initialState
    }
    
    case 'CLEAR_LEADERBOARD': {
      return { ...state, memberStats: [] }
    }
    
    case 'BATCH_UPDATE': {
      return { ...state, ...action.payload }
    }
    
    default:
      return state
  }
}

// Context type definition (without hooks)
type UserContextType = {
  state: UserState
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setCurrentUser: (user: User) => void
  updateCurrentUser: (updates: Partial<User>) => void
  setHousehold: (household: Household) => void
  updateHousehold: (updates: Partial<Household>) => void
  setMembers: (members: User[]) => void
  addMember: (member: User) => void
  removeMember: (memberId: string) => void
  updateMember: (member: User) => void
  setMemberStats: (stats: UserStats[]) => void
  updateMemberStats: (stats: UserStats) => void
  addInvite: (invite: UserInvite) => void
  updateInvite: (invite: UserInvite) => void
  removeInvite: (inviteId: string) => void
  updateHouseholdSettings: (settings: Partial<Household['settings']>) => void
  resetUserState: () => void
  clearLeaderboard: () => void
  syncWithAuth: (user: User) => void
  inviteMember: (email: string) => void
  acceptInvite: (inviteId: string) => void
  declineInvite: (inviteId: string) => void
  updateMemberRole: (memberId: string, role: 'admin' | 'parent' | 'teen' | 'kid' | 'member') => void
}

const UserContext = createContext<UserContextType | null>(null)

export const UserProvider: React.FC<{ children: React.ReactNode; isDemoMode: boolean }> = ({ children, isDemoMode }) => {
  const [state, dispatch] = useReducer(userReducer, initialState)
  
  // Convex Auth and queries
  const convexAuth = useConvexAuth()
  const householdId = useCurrentHousehold()
  
  // Query household members from Convex (only if not in demo mode and household exists)
  const convexMembers = useQuery(
    api.households.getHouseholdMembers,
    !isDemoMode && householdId ? { householdId } : "skip"
  )
  
  // Query household data
  const convexHousehold = useQuery(
    api.households.getHousehold,
    !isDemoMode && householdId ? { householdId } : "skip"
  )

  // Load demo users in demo mode
  useEffect(() => {
    if (isDemoMode) {
      const demoUsers: User[] = [
        {
          id: 'demo-alex',
          name: 'Alex',
          email: 'alex@demo.com',
          role: 'parent' as const,
          joinedAt: new Date('2024-01-01'),
          avatar: '👨‍💼',
          isActive: true,
          canApproveRedemptions: true
        },
        {
          id: 'demo-janice',
          name: 'Janice',
          email: 'janice@demo.com',
          role: 'parent' as const,
          joinedAt: new Date('2024-01-15'),
          avatar: '👩‍💼',
          isActive: true,
          canApproveRedemptions: true
        },
        {
          id: 'demo-jordan',
          name: 'Jordan',
          email: 'jordan@demo.com',
          role: 'teen' as const,
          joinedAt: new Date('2024-02-01'),
          avatar: '👨‍🎓',
          isActive: true,
          parentId: 'demo-alex',
          canApproveRedemptions: false
        },
        {
          id: 'demo-avery',
          name: 'Avery',
          email: 'avery@demo.com',
          role: 'kid' as const,
          joinedAt: new Date('2024-02-15'),
          avatar: '👩‍🎨',
          isActive: true,
          parentId: 'demo-janice',
          canApproveRedemptions: false
        }
      ]
      const demoCurrentUser = demoUsers.find(user => user.id === 'demo-alex') || demoUsers[0]
      
      dispatch({ type: 'SET_MEMBERS', payload: demoUsers })
      dispatch({ type: 'SET_CURRENT_USER', payload: demoCurrentUser })
    }
  }, [isDemoMode])

  // Load users from Convex when not in demo mode
  useEffect(() => {
    if (!isDemoMode && convexMembers && convexMembers.length > 0) {
      const members = convexMembers.map(convexMemberToUser)
      dispatch({ type: 'SET_MEMBERS', payload: members })
    } else if (!isDemoMode && convexMembers === null) {
      // No members found - clear members
      dispatch({ type: 'SET_MEMBERS', payload: [] })
    }
  }, [convexMembers, isDemoMode])

  // Load current user from Convex Auth
  useEffect(() => {
    if (!isDemoMode && convexAuth.user) {
      dispatch({ type: 'SET_CURRENT_USER', payload: convexAuth.user })
    } else if (!isDemoMode && !convexAuth.isLoading && !convexAuth.user) {
      // Not authenticated - clear current user
      dispatch({ type: 'SET_CURRENT_USER', payload: null as any })
    }
  }, [convexAuth.user, convexAuth.isLoading, convexAuth.isAuthenticated, isDemoMode])

  // Load household data from Convex
  useEffect(() => {
    if (!isDemoMode && convexHousehold) {
      dispatch({ 
        type: 'SET_HOUSEHOLD', 
        payload: {
          id: convexHousehold._id,
          name: convexHousehold.name,
          description: convexHousehold.description,
          createdAt: new Date(convexHousehold.createdAt),
          members: state.members,
          settings: convexHousehold.settings || {
            allowInvites: true,
            requireApproval: false,
            maxMembers: 10,
          }
        }
      })
    }
  }, [convexHousehold, isDemoMode, state.members])

  // All hooks must be called unconditionally in the component
  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading })
  }, [dispatch])
  
  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error })
  }, [dispatch])
  
  const setCurrentUser = useCallback((user: User) => {
    dispatch({ type: 'SET_CURRENT_USER', payload: user })
  }, [dispatch])
  
  const updateCurrentUser = useCallback((updates: Partial<User>) => {
    dispatch({ type: 'UPDATE_CURRENT_USER', payload: updates })
  }, [dispatch])
  
  const setHousehold = useCallback((household: Household) => {
    dispatch({ type: 'SET_HOUSEHOLD', payload: household })
  }, [dispatch])
  
  const updateHousehold = useCallback((updates: Partial<Household>) => {
    dispatch({ type: 'UPDATE_HOUSEHOLD', payload: updates })
  }, [dispatch])
  
  const setMembers = useCallback((members: User[]) => {
    dispatch({ type: 'SET_MEMBERS', payload: members })
  }, [dispatch])
  
  const addMember = useCallback((member: User) => {
    dispatch({ type: 'ADD_MEMBER', payload: member })
  }, [dispatch])
  
  const removeMember = useCallback((memberId: string) => {
    dispatch({ type: 'REMOVE_MEMBER', payload: memberId })
  }, [dispatch])
  
  const updateMember = useCallback((member: User) => {
    dispatch({ type: 'UPDATE_MEMBER', payload: member })
  }, [dispatch])
  
  const setMemberStats = useCallback((stats: UserStats[]) => {
    dispatch({ type: 'SET_MEMBER_STATS', payload: stats })
  }, [dispatch])
  
  const updateMemberStats = useCallback((stats: UserStats) => {
    dispatch({ type: 'UPDATE_MEMBER_STATS', payload: stats })
  }, [dispatch])
  
  const addInvite = useCallback((invite: UserInvite) => {
    dispatch({ type: 'ADD_INVITE', payload: invite })
  }, [dispatch])
  
  const updateInvite = useCallback((invite: UserInvite) => {
    dispatch({ type: 'UPDATE_INVITE', payload: invite })
  }, [dispatch])
  
  const removeInvite = useCallback((inviteId: string) => {
    dispatch({ type: 'REMOVE_INVITE', payload: inviteId })
  }, [dispatch])
  
  const updateHouseholdSettings = useCallback((settings: Partial<Household['settings']>) => {
    dispatch({ type: 'UPDATE_HOUSEHOLD_SETTINGS', payload: settings })
  }, [dispatch])
  
  const resetUserState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' })
  }, [dispatch])
  
  const clearLeaderboard = useCallback(() => {
    dispatch({ type: 'CLEAR_LEADERBOARD' })
  }, [dispatch])
  
  const syncWithAuth = useCallback((user: User) => {
    dispatch({ type: 'SET_CURRENT_USER', payload: user })
  }, [dispatch])

  const inviteMember = useCallback((email: string) => {
    // TODO: Implement actual invite functionality
    const newInvite: UserInvite = {
      id: `invite-${Date.now()}`,
      householdId: state.household?.id || '',
      email,
      invitedBy: state.currentUser?.id || '',
      invitedAt: new Date(),
      status: 'pending'
    }
    dispatch({ type: 'ADD_INVITE', payload: newInvite })
  }, [dispatch, state.household?.id, state.currentUser?.id])

  const acceptInvite = useCallback((inviteId: string) => {
    // TODO: Implement actual accept functionality
    const invite = state.invites.find(i => i.id === inviteId)
    if (invite) {
      const updatedInvite = { ...invite, status: 'accepted' as const }
      dispatch({ type: 'UPDATE_INVITE', payload: updatedInvite })
    }
  }, [dispatch, state.invites])

  const declineInvite = useCallback((inviteId: string) => {
    // TODO: Implement actual decline functionality
    const invite = state.invites.find(i => i.id === inviteId)
    if (invite) {
      const updatedInvite = { ...invite, status: 'declined' as const }
      dispatch({ type: 'UPDATE_INVITE', payload: updatedInvite })
    }
  }, [dispatch, state.invites])

  const updateMemberRole = useCallback((memberId: string, role: 'admin' | 'parent' | 'teen' | 'kid' | 'member') => {
    // TODO: Implement actual role update functionality
    const member = state.members.find(m => m.id === memberId)
    if (member) {
      const updatedMember = { ...member, role }
      dispatch({ type: 'UPDATE_MEMBER', payload: updatedMember })
    }
  }, [dispatch, state.members])

  // Create context value with all callbacks
  const contextValue = useMemo<UserContextType>(() => ({
    state,
    setLoading,
    setError,
    setCurrentUser,
    updateCurrentUser,
    setHousehold,
    updateHousehold,
    setMembers,
    addMember,
    removeMember,
    updateMember,
    setMemberStats,
    updateMemberStats,
    addInvite,
    updateInvite,
    removeInvite,
    updateHouseholdSettings,
    resetUserState,
    clearLeaderboard,
    syncWithAuth,
    inviteMember,
    acceptInvite,
    declineInvite,
    updateMemberRole,
  }), [
    state,
    setLoading,
    setError,
    setCurrentUser,
    updateCurrentUser,
    setHousehold,
    updateHousehold,
    setMembers,
    addMember,
    removeMember,
    updateMember,
    setMemberStats,
    updateMemberStats,
    addInvite,
    updateInvite,
    removeInvite,
    updateHouseholdSettings,
    resetUserState,
    clearLeaderboard,
    syncWithAuth,
    inviteMember,
    acceptInvite,
    declineInvite,
    updateMemberRole,
  ])

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  )
}

export const useUsers = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUsers must be used within a UserProvider')
  }
  return context
}

// Memoized hook for getting current user stats
export const useCurrentUserStats = () => {
  const { state } = useUsers()
  return useMemo(() => {
    if (!state.currentUser) return null
    return state.memberStats.find(stats => stats.userId === state.currentUser?.id) || null
  }, [state.currentUser?.id, state.memberStats])
}

// Memoized hook for getting household members
export const useHouseholdMembers = () => {
  const { state } = useUsers()
  return useMemo(() => state.members, [state.members])
}

// Memoized hook for getting current user
export const useCurrentUser = () => {
  const { state } = useUsers()
  return useMemo(() => state.currentUser, [state.currentUser])
}

// Memoized hook for getting household
export const useHousehold = () => {
  const { state } = useUsers()
  return useMemo(() => state.household, [state.household])
}

// Memoized hook for getting member stats
export const useMemberStats = () => {
  const { state } = useUsers()
  return useMemo(() => state.memberStats, [state.memberStats])
}

// Memoized hook for getting invites
export const useInvites = () => {
  const { state } = useUsers()
  return useMemo(() => state.invites, [state.invites])
}

// Memoized hook for getting loading state
export const useUserLoading = () => {
  const { state } = useUsers()
  return useMemo(() => state.isLoading, [state.isLoading])
}

// Memoized hook for getting error state
export const useUserError = () => {
  const { state } = useUsers()
  return useMemo(() => state.error, [state.error])
}
