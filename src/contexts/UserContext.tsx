import React, { createContext, useContext, useReducer, useCallback, useEffect, useMemo, useRef } from 'react'
import { User, UserStats, Household, UserInvite } from '../types/user'

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

// Memoized context value to prevent unnecessary re-renders
const createContextValue = (state: UserState, dispatch: React.Dispatch<UserAction>) => ({
  state,
  setLoading: useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading })
  }, [dispatch]),
  
  setError: useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error })
  }, [dispatch]),
  
  setCurrentUser: useCallback((user: User) => {
    dispatch({ type: 'SET_CURRENT_USER', payload: user })
  }, [dispatch]),
  
  updateCurrentUser: useCallback((updates: Partial<User>) => {
    dispatch({ type: 'UPDATE_CURRENT_USER', payload: updates })
  }, [dispatch]),
  
  setHousehold: useCallback((household: Household) => {
    dispatch({ type: 'SET_HOUSEHOLD', payload: household })
  }, [dispatch]),
  
  updateHousehold: useCallback((updates: Partial<Household>) => {
    dispatch({ type: 'UPDATE_HOUSEHOLD', payload: updates })
  }, [dispatch]),
  
  setMembers: useCallback((members: User[]) => {
    dispatch({ type: 'SET_MEMBERS', payload: members })
  }, [dispatch]),
  
  addMember: useCallback((member: User) => {
    dispatch({ type: 'ADD_MEMBER', payload: member })
  }, [dispatch]),
  
  removeMember: useCallback((memberId: string) => {
    dispatch({ type: 'REMOVE_MEMBER', payload: memberId })
  }, [dispatch]),
  
  updateMember: useCallback((member: User) => {
    dispatch({ type: 'UPDATE_MEMBER', payload: member })
  }, [dispatch]),
  
  setMemberStats: useCallback((stats: UserStats[]) => {
    dispatch({ type: 'SET_MEMBER_STATS', payload: stats })
  }, [dispatch]),
  
  updateMemberStats: useCallback((stats: UserStats) => {
    dispatch({ type: 'UPDATE_MEMBER_STATS', payload: stats })
  }, [dispatch]),
  
  addInvite: useCallback((invite: UserInvite) => {
    dispatch({ type: 'ADD_INVITE', payload: invite })
  }, [dispatch]),
  
  updateInvite: useCallback((invite: UserInvite) => {
    dispatch({ type: 'UPDATE_INVITE', payload: invite })
  }, [dispatch]),
  
  removeInvite: useCallback((inviteId: string) => {
    dispatch({ type: 'REMOVE_INVITE', payload: inviteId })
  }, [dispatch]),
  
  updateHouseholdSettings: useCallback((settings: Partial<Household['settings']>) => {
    dispatch({ type: 'UPDATE_HOUSEHOLD_SETTINGS', payload: settings })
  }, [dispatch]),
  
  resetUserState: useCallback(() => {
    dispatch({ type: 'RESET_STATE' })
  }, [dispatch]),
  
  clearLeaderboard: useCallback(() => {
    dispatch({ type: 'CLEAR_LEADERBOARD' })
  }, [dispatch]),
  
  syncWithAuth: useCallback((user: User) => {
    dispatch({ type: 'SET_CURRENT_USER', payload: user })
  }, [dispatch]),

  inviteMember: useCallback((email: string) => {
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
  }, [dispatch, state.household?.id, state.currentUser?.id]),

  acceptInvite: useCallback((inviteId: string) => {
    // TODO: Implement actual accept functionality
    const invite = state.invites.find(i => i.id === inviteId)
    if (invite) {
      const updatedInvite = { ...invite, status: 'accepted' as const }
      dispatch({ type: 'UPDATE_INVITE', payload: updatedInvite })
    }
  }, [dispatch, state.invites]),

  declineInvite: useCallback((inviteId: string) => {
    // TODO: Implement actual decline functionality
    const invite = state.invites.find(i => i.id === inviteId)
    if (invite) {
      const updatedInvite = { ...invite, status: 'declined' as const }
      dispatch({ type: 'UPDATE_INVITE', payload: updatedInvite })
    }
  }, [dispatch, state.invites]),

  updateMemberRole: useCallback((memberId: string, role: 'admin' | 'parent' | 'teen' | 'kid' | 'member') => {
    // TODO: Implement actual role update functionality
    const member = state.members.find(m => m.id === memberId)
    if (member) {
      const updatedMember = { ...member, role }
      dispatch({ type: 'UPDATE_MEMBER', payload: updatedMember })
    }
  }, [dispatch, state.members])
})

const UserContext = createContext<ReturnType<typeof createContextValue> | null>(null)

export const UserProvider: React.FC<{ children: React.ReactNode; isDemoMode: boolean }> = ({ children, isDemoMode }) => {
  const [state, dispatch] = useReducer(userReducer, initialState)
  const storageTimeoutRef = useRef<NodeJS.Timeout>()
  const lastStorageUpdate = useRef<number>(0)
  
  // Debounced storage update to prevent excessive localStorage writes
  const updateStorage = useCallback((key: string, data: any) => {
    const now = Date.now()
    if (now - lastStorageUpdate.current < 1000) { // Debounce to 1 second
      if (storageTimeoutRef.current) {
        clearTimeout(storageTimeoutRef.current)
      }
      storageTimeoutRef.current = setTimeout(() => {
        try {
          localStorage.setItem(key, JSON.stringify(data))
          lastStorageUpdate.current = Date.now()
        } catch (error) {
          console.error(`Error saving ${key} to storage:`, error)
        }
      }, 1000)
    } else {
      try {
        localStorage.setItem(key, JSON.stringify(data))
        lastStorageUpdate.current = now
      } catch (error) {
        console.error(`Error saving ${key} to storage:`, error)
      }
    }
  }, [])

  // Load users from storage on mount
  useEffect(() => {
    // Always call hooks in the same order, regardless of isDemoMode
    const loadUsers = () => {
      try {
        console.log('UserProvider: Loading users, isDemoMode:', isDemoMode)
        
        if (isDemoMode) {
          // In demo mode, create demo users
          console.log('UserProvider: Creating demo users...')
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
          
          console.log('UserProvider: Dispatching demo users:', demoUsers.length)
          dispatch({ type: 'SET_MEMBERS', payload: demoUsers })
          dispatch({ type: 'SET_CURRENT_USER', payload: demoCurrentUser })
          console.log('UserProvider: Demo users created successfully')
        } else {
          try {
            const storedUsers = localStorage.getItem('choreAppUsers')
            const storedCurrentUser = localStorage.getItem('choreAppUser')
            
            if (storedUsers) {
              const parsedUsers = JSON.parse(storedUsers)
              const usersWithDates = parsedUsers.map((user: any) => ({
                ...user,
                joinedAt: new Date(user.joinedAt)
              }))
              dispatch({ type: 'SET_MEMBERS', payload: usersWithDates })
            }
            
            if (storedCurrentUser) {
              const parsedUser = JSON.parse(storedCurrentUser)
              const userWithDates = {
                ...parsedUser,
                joinedAt: new Date(parsedUser.joinedAt)
              }
              dispatch({ type: 'SET_CURRENT_USER', payload: userWithDates })
            }
          } catch (error) {
            console.error('Error loading users from storage:', error)
          }
        }
      } catch (error) {
        console.error('UserProvider: Error in loadUsers:', error)
        console.error('Error details:', error instanceof Error ? error.message : error)
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
      }
    }

    loadUsers()
  }, [isDemoMode, dispatch])

  // Save users to storage when they change (but not in demo mode)
  useEffect(() => {
    if (state.members.length > 0 && !isDemoMode) {
      updateStorage('choreAppUsers', state.members)
    }
  }, [state.members, updateStorage, isDemoMode])

  // Save current user to storage when it changes (but not in demo mode)
  useEffect(() => {
    if (state.currentUser && !isDemoMode) {
      updateStorage('choreAppUser', state.currentUser)
    }
  }, [state.currentUser, updateStorage, isDemoMode])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (storageTimeoutRef.current) {
        clearTimeout(storageTimeoutRef.current)
      }
    }
  }, [])

  const contextValue = useMemo(() => createContextValue(state, dispatch), [state, dispatch])

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
