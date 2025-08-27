import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

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
  const [redemptionRequests, setRedemptionRequests] = useState<RedemptionRequest[]>([])
  const [conversionRate, setConversionRateState] = useState(100)

  useEffect(() => {
    // Load redemption requests from localStorage
    const savedRequests = localStorage.getItem('redemptionRequests')
    if (savedRequests) {
      try {
        const parsedRequests = JSON.parse(savedRequests).map((req: any) => ({
          ...req,
          requestedAt: new Date(req.requestedAt),
          processedAt: req.processedAt ? new Date(req.processedAt) : undefined
        }))
        setRedemptionRequests(parsedRequests)
      } catch (error) {
        console.error('RedemptionContext - Error parsing redemption requests:', error)
      }
    }

    // Load conversion rate from localStorage
    const savedRate = localStorage.getItem('pointRedemptionRate')
    if (savedRate) {
      setConversionRateState(parseInt(savedRate))
    }
  }, [])

  const setConversionRate = (rate: number) => {
    setConversionRateState(rate)
    localStorage.setItem('pointRedemptionRate', rate.toString())
  }

  const addRedemptionRequest = (request: RedemptionRequest) => {
    const updatedRequests = [...redemptionRequests, request]
    setRedemptionRequests(updatedRequests)
    localStorage.setItem('redemptionRequests', JSON.stringify(updatedRequests))
  }

  const updateRedemptionRequest = (requestId: string, updates: Partial<RedemptionRequest>) => {
    const updatedRequests = redemptionRequests.map(req => 
      req.id === requestId ? { ...req, ...updates } : req
    )
    setRedemptionRequests(updatedRequests)
    localStorage.setItem('redemptionRequests', JSON.stringify(updatedRequests))
  }

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
