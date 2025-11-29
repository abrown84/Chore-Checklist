import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import { useCurrentHousehold } from '../hooks/useCurrentHousehold'
import { useUsers } from './UserContext'
import { getDisplayName } from '../utils/convexHelpers'

export interface RedemptionRequest {
  id: string
  userId: string
  userName: string
  userRole: string
  pointsRequested: number
  cashAmount: number
  status: 'pending' | 'approved' | 'rejected'
  requestedAt: Date
  processedAt?: Date
  processedBy?: string
  adminNotes?: string
}

interface RedemptionContextType {
  redemptionRequests: RedemptionRequest[]
  conversionRate: number
  setConversionRate: (rate: number) => void
  addRedemptionRequest: (request: RedemptionRequest) => void
  updateRedemptionRequest: (requestId: string, updates: Partial<RedemptionRequest>) => void
  getPendingRedemptionPoints: (userId: string) => number
  getTotalRedeemedValue: (userId: string) => number
  getUserRedemptionStatus: (userId: string) => {
    pendingPoints: number
    totalRedeemed: number
    hasPendingRequests: boolean
    pendingRequests: RedemptionRequest[]
  }
  getHouseholdRedemptionSummary: () => {
    totalPendingPoints: number
    totalApprovedValue: number
    pendingRequestsCount: number
    approvedRequestsCount: number
    rejectedRequestsCount: number
  }
}

const RedemptionContext = createContext<RedemptionContextType | undefined>(undefined)

export const useRedemption = () => {
  const context = useContext(RedemptionContext)
  if (context === undefined) {
    throw new Error('useRedemption must be used within a RedemptionProvider')
  }
  return context
}

interface RedemptionProviderProps {
  children: ReactNode
}

export const RedemptionProvider: React.FC<RedemptionProviderProps> = ({ children }) => {
  const householdId = useCurrentHousehold()
  const { state: userState } = useUsers()
  
  // Convex queries and mutations
  const convexRedemptionRequests = useQuery(
    api.redemptions.getHouseholdRedemptionRequests,
    householdId ? { householdId } : "skip"
  )
  
  const createRedemptionRequestMutation = useMutation(api.redemptions.createRedemptionRequest)
  const updateRedemptionRequestMutation = useMutation(api.redemptions.updateRedemptionRequestStatus)
  
  // Convert Convex redemption requests to app format
  const redemptionRequests = useMemo(() => {
    if (!convexRedemptionRequests) return []
    
    return convexRedemptionRequests.map(req => {
      const user = userState.members.find(m => m.id === req.userId)
      return {
        id: req._id,
        userId: req.userId,
        userName: getDisplayName(user?.name, user?.email),
        userRole: user?.role || 'member',
        pointsRequested: req.pointsRequested,
        cashAmount: req.cashAmount,
        status: req.status,
        requestedAt: new Date(req.requestedAt),
        processedAt: req.processedAt ? new Date(req.processedAt) : undefined,
        processedBy: req.processedBy,
        adminNotes: req.adminNotes,
      } as RedemptionRequest
    })
  }, [convexRedemptionRequests, userState.members])
  
  // Conversion rate - stored in localStorage as a UI preference (not core data)
  // This is intentionally kept in localStorage as it's a household setting preference
  const [conversionRate, setConversionRateState] = useState(() => {
    try {
      const savedRate = localStorage.getItem('pointRedemptionRate')
      return savedRate ? parseInt(savedRate, 10) : 100
    } catch {
      return 100
    }
  })

  useEffect(() => {
    // Load conversion rate from localStorage on mount (UI preference)
    try {
      const savedRate = localStorage.getItem('pointRedemptionRate')
      if (savedRate) {
        setConversionRateState(parseInt(savedRate, 10))
      }
    } catch {
      // localStorage not available, use default
    }
  }, [])

  const setConversionRate = useCallback((rate: number) => {
    setConversionRateState(rate)
    try {
      localStorage.setItem('pointRedemptionRate', rate.toString())
    } catch {
      // localStorage not available, state is still updated
    }
  }, [])

  const addRedemptionRequest = useCallback(async (request: RedemptionRequest) => {
    if (!householdId) {
      console.error('Cannot add redemption request: no household ID')
      return
    }
    
    try {
      await createRedemptionRequestMutation({
        userId: request.userId as Id<"users">,
        householdId,
        pointsRequested: request.pointsRequested,
        cashAmount: request.cashAmount,
      })
    } catch (error) {
      console.error('Error creating redemption request:', error)
      throw error
    }
  }, [householdId, createRedemptionRequestMutation])

  const updateRedemptionRequest = useCallback(async (requestId: string, updates: Partial<RedemptionRequest>) => {
    if (!updates.status || (updates.status !== 'approved' && updates.status !== 'rejected')) {
      console.error('Invalid status update')
      return
    }
    
    try {
      await updateRedemptionRequestMutation({
        requestId: requestId as Id<"redemptionRequests">,
        status: updates.status,
        adminNotes: updates.adminNotes,
      })
    } catch (error) {
      console.error('Error updating redemption request:', error)
      throw error
    }
  }, [updateRedemptionRequestMutation])

  // Get pending redemption points for a specific user
  const getPendingRedemptionPoints = (userId: string): number => {
    return redemptionRequests
      .filter(req => req.userId === userId && req.status === 'pending')
      .reduce((sum, req) => sum + req.pointsRequested, 0)
  }

  // Get total redeemed value for a specific user
  const getTotalRedeemedValue = (userId: string): number => {
    return redemptionRequests
      .filter(req => req.userId === userId && req.status === 'approved')
      .reduce((sum, req) => sum + req.cashAmount, 0)
  }

  // Get user's redemption status
  const getUserRedemptionStatus = (userId: string) => {
    const pendingPoints = getPendingRedemptionPoints(userId)
    const totalRedeemed = getTotalRedeemedValue(userId)
    const hasPendingRequests = pendingPoints > 0

    return {
      pendingPoints,
      totalRedeemed,
      hasPendingRequests,
      pendingRequests: redemptionRequests.filter(req => req.userId === userId && req.status === 'pending')
    }
  }

  // Get household redemption summary
  const getHouseholdRedemptionSummary = () => {
    const totalPendingPoints = redemptionRequests
      .filter(req => req.status === 'pending')
      .reduce((sum, req) => sum + req.pointsRequested, 0)
    
    const totalApprovedValue = redemptionRequests
      .filter(req => req.status === 'approved')
      .reduce((sum, req) => sum + req.cashAmount, 0)

    return {
      totalPendingPoints,
      totalApprovedValue,
      pendingRequestsCount: redemptionRequests.filter(req => req.status === 'pending').length,
      approvedRequestsCount: redemptionRequests.filter(req => req.status === 'approved').length,
      rejectedRequestsCount: redemptionRequests.filter(req => req.status === 'rejected').length
    }
  }

  const value: RedemptionContextType = {
    redemptionRequests,
    conversionRate,
    setConversionRate,
    addRedemptionRequest,
    updateRedemptionRequest,
    getPendingRedemptionPoints,
    getTotalRedeemedValue,
    getUserRedemptionStatus,
    getHouseholdRedemptionSummary
  }

  return (
    <RedemptionContext.Provider value={value}>
      {children}
    </RedemptionContext.Provider>
  )
}
