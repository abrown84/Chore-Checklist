import React, { createContext, useContext, useReducer, useCallback, useMemo, useRef, useEffect } from 'react'
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

// Memoized stats calculation function
const calculateUserStats = (chores: Chore[], members: User[]): UserStats[] => {
  return members.map(member => {
    const memberChores = chores.filter(chore => 
      chore.completed && chore.completedBy === member.id
    )
    
    const totalPoints = memberChores.reduce((sum, chore) => {
      const earnedPoints = chore.finalPoints !== undefined ? chore.finalPoints : chore.points
      return sum + earnedPoints
    }, 0)
    
    // Calculate level based on total points
    let currentLevel = 1
    let currentLevelPoints = totalPoints
    let pointsToNextLevel = 100
    
    for (let i = 0; i < LEVELS.length; i++) {
      if (totalPoints >= LEVELS[i].pointsRequired) {
        currentLevel = LEVELS[i].level
        currentLevelPoints = totalPoints - LEVELS[i].pointsRequired
        if (i < LEVELS.length - 1) {
          pointsToNextLevel = LEVELS[i + 1].pointsRequired - totalPoints
        } else {
          pointsToNextLevel = 0
        }
      } else {
        break
      }
    }
    
    // Calculate streak
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0
    
    const sortedCompleted = memberChores
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
    
    for (const chore of sortedCompleted) {
      if (chore.completedAt) {
        const completionDate = new Date(chore.completedAt)
        const today = new Date()
        const diffTime = Math.abs(today.getTime() - completionDate.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        
        if (diffDays <= 1) {
          tempStreak++
          currentStreak = Math.max(currentStreak, tempStreak)
        } else {
          longestStreak = Math.max(longestStreak, tempStreak)
          tempStreak = 0
        }
      }
    }
    
    longestStreak = Math.max(longestStreak, tempStreak)
    
    return {
      userId: member.id,
      totalChores: memberChores.length,
      completedChores: memberChores.length,
      totalPoints,
      earnedPoints: totalPoints,
      currentLevel,
      currentLevelPoints,
      pointsToNextLevel,
      currentStreak,
      longestStreak,
      lastActive: new Date()
    }
  })
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
  }, [dispatch])
})

const UserContext = createContext<ReturnType<typeof createContextValue> | null>(null)

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
  }, [])

  // Save users to storage when they change
  useEffect(() => {
    if (state.members.length > 0) {
      updateStorage('choreAppUsers', state.members)
    }
  }, [state.members, updateStorage])

  // Save current user to storage when it changes
  useEffect(() => {
    if (state.currentUser) {
      updateStorage('choreAppUser', state.currentUser)
    }
  }, [state.currentUser, updateStorage])

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

// Memoized hook for getting current user stats
export const getCurrentUserStats = () => {
  const { state } = useUsers()
  return state.memberStats.find(stats => stats.userId === state.currentUser?.id) || null
}

// Memoized hook for recalculating stats
export const recalculateStats = (chores: Chore[]) => {
  const { state, setMemberStats } = useUsers()
  
  return useCallback(() => {
    if (state.members.length === 0) return
    
    const newStats = calculateUserStats(chores, state.members)
    
    // Sort by total points for ranking
    newStats.sort((a, b) => b.totalPoints - a.totalPoints)
    
    setMemberStats(newStats)
  }, [chores, state.members, setMemberStats])
}
