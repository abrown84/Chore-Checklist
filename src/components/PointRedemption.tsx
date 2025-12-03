import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { useUsers } from '../contexts/UserContext'
import { useStats } from '../hooks/useStats'
import { useRedemption, RedemptionRequest } from '../contexts/RedemptionContext'
import { DollarSign, Coins, Calculator, Settings, AlertCircle, CheckCircle, XCircle, Clock, UserCheck, Users, Baby, GraduationCap, TrendingUp, Shield } from 'lucide-react'
import { LEVELS } from '../types/chore'
import { getDisplayName } from '../utils/convexHelpers'

export const PointRedemption: React.FC = () => {
  const { state: userState } = useUsers()
  const { getAllUserStats, updateUserPoints, setLevelPersistence, forceRefresh } = useStats()
  const { 
    redemptionRequests, 
    conversionRate, 
    setConversionRate, 
    addRedemptionRequest, 
    updateRedemptionRequest 
  } = useRedemption()
  
  const [canApproveRedemptions, setCanApproveRedemptions] = useState(false)
  const [pointsToRedeem, setPointsToRedeem] = useState('')
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [newConversionRate, setNewConversionRate] = useState('')
  const [showConfirmDialog, setShowConfirmDialog] = useState<{ show: boolean; requestId: string; action: 'approve' | 'reject' }>({ show: false, requestId: '', action: 'approve' })
  const [adminNotes, setAdminNotes] = useState('')
  const [processingRequest, setProcessingRequest] = useState<string | null>(null)
  const [levelPersistenceDays, setLevelPersistenceDays] = useState(30)

  const memberStats = getAllUserStats()
  const currentUser = userState.currentUser
  const currentUserStats = memberStats.find(s => s.userId === currentUser?.id)
  
  console.log('🎯 Redemption: Stats lookup', {
    currentUserId: currentUser?.id,
    memberStatsCount: memberStats.length,
    currentUserStats: currentUserStats ? {
      userId: currentUserStats.userId,
      earnedPoints: currentUserStats.earnedPoints,
      lifetimePoints: currentUserStats.lifetimePoints,
      currentLevel: currentUserStats.currentLevel
    } : null
  })
  
  // Get current user's household membership role (this is what determines admin permissions)
  const currentUserHouseholdRole = useMemo(() => {
    if (!currentUser) return null
    const currentUserMember = userState.members.find(m => m.id === currentUser.id)
    return (currentUserMember?.role || currentUser?.role || 'member') as 'admin' | 'parent' | 'teen' | 'kid' | 'member'
  }, [currentUser, userState.members])

  // Helper function to calculate user level based on points
  const calculateUserLevel = (earnedPoints: number): number => {
    let currentLevel = 1
    
    // Iterate through levels in descending order to find the highest level user qualifies for
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (earnedPoints >= LEVELS[i].pointsRequired) {
        currentLevel = LEVELS[i].level
        break
      }
    }
    
    return currentLevel
  }

  // Helper function to get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'parent':
        return <Users className="w-4 h-4 text-blue-500" />
      case 'teen':
        return <GraduationCap className="w-4 h-4 text-green-500" />
      case 'kid':
        return <Baby className="w-4 h-4 text-purple-500" />
      case 'admin':
        return <UserCheck className="w-4 h-4 text-yellow-500" />
      default:
        return <Users className="w-4 h-4 text-gray-500" />
    }
  }

  // Helper function to get role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'parent':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700'
      case 'teen':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700'
      case 'kid':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-700'
      case 'admin':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700'
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700'
    }
  }

  useEffect(() => {
    // Check if current user can approve redemptions based on their household membership role
    // Only admins can approve redemptions (based on backend logic in convex/redemptions.ts)
    setCanApproveRedemptions(currentUserHouseholdRole === 'admin')
  }, [currentUserHouseholdRole])

  const saveConversionRate = () => {
    const rate = parseInt(newConversionRate)
    if (rate > 0) {
      setConversionRate(rate)
      setNewConversionRate('')
      setShowAdminPanel(false)
    }
  }

  const calculateCashAmount = (points: number) => {
    return (points / conversionRate).toFixed(2)
  }

  const submitRedemptionRequest = () => {
    const points = parseInt(pointsToRedeem)
    if (points <= 0 || !currentUser || !currentUserStats) {
      console.error('🎯 Redemption: Cannot submit - missing data', {
        points,
        hasCurrentUser: !!currentUser,
        hasCurrentUserStats: !!currentUserStats,
        currentUserStats: currentUserStats
      })
      if (!currentUserStats) {
        alert('Unable to load your points. Please refresh the page and try again.')
      }
      return
    }
    
    console.log('🎯 Redemption: Checking points', {
      pointsRequested: points,
      earnedPoints: currentUserStats.earnedPoints,
      lifetimePoints: currentUserStats.lifetimePoints,
      availablePoints: currentUserStats.earnedPoints
    })
    
    if (points > currentUserStats.earnedPoints) {
      alert(`You don't have enough points for this redemption! You have ${currentUserStats.earnedPoints} available points.`)
      return
    }

    const cashAmount = parseFloat(calculateCashAmount(points))
    const newRequest: RedemptionRequest = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: getDisplayName(currentUser.name, currentUser.email),
      userRole: currentUser.role,
      pointsRequested: points,
      cashAmount,
      status: 'pending',
      requestedAt: new Date()
    }

    addRedemptionRequest(newRequest)
    setPointsToRedeem('')
  }

  const processRedemptionRequest = (requestId: string, status: 'approved' | 'rejected') => {
    const request = redemptionRequests.find(req => req.id === requestId)
    if (!request) return

    setProcessingRequest(requestId)

    // Simulate processing delay for better UX
    setTimeout(() => {
      // Update the redemption request status
      updateRedemptionRequest(requestId, {
        status,
        processedAt: new Date(),
        processedBy: getDisplayName(currentUser?.name, currentUser?.email),
        adminNotes: status === 'rejected' ? adminNotes : undefined
      })
      
      // If approved, deduct the points from the user's total
      if (status === 'approved') {
        // Get the user's stats BEFORE deducting points to preserve their level
        const userStats = memberStats.find(s => s.userId === request.userId)
        if (userStats) {
          // Calculate what level the user was at BEFORE redemption
          const levelBeforeRedemption = calculateUserLevel(userStats.earnedPoints)
          
          console.log(`Setting level persistence for user ${request.userId}:`, {
            pointsBeforeRedemption: userStats.earnedPoints,
            levelBeforeRedemption,
            pointsToDeduct: request.pointsRequested,
            pointsAfterRedemption: userStats.earnedPoints - request.pointsRequested,
            levelAfterRedemption: calculateUserLevel(userStats.earnedPoints - request.pointsRequested),
            gracePeriodDays: levelPersistenceDays
          })
          
          // Set level persistence to the level BEFORE redemption so they keep it
          setLevelPersistence(request.userId, levelBeforeRedemption, userStats.earnedPoints, levelPersistenceDays)
        }
        
        // Now deduct the points
        updateUserPoints(request.userId, request.pointsRequested)
        
        // Force refresh the stats to ensure UI updates
        setTimeout(() => {
          forceRefresh()
        }, 100)
      }
      
      setProcessingRequest(null)
      setShowConfirmDialog({ show: false, requestId: '', action: 'approve' })
      setAdminNotes('')
    }, 1000)
  }

  const handleConfirmAction = (requestId: string, action: 'approve' | 'reject') => {
    setShowConfirmDialog({ show: true, requestId, action })
  }

  const executeAction = () => {
    const { requestId, action } = showConfirmDialog
    if (action === 'reject' && !adminNotes.trim()) {
      alert('Please provide a reason for rejection')
      return
    }
    const status = action === 'approve' ? 'approved' : 'rejected'
    processRedemptionRequest(requestId, status)
  }

  // Get pending requests that the current user can approve
  const getPendingRequestsForApproval = () => {
    if (!currentUser || !canApproveRedemptions) return []
    
    // Only admins can approve redemptions (based on backend logic in convex/redemptions.ts)
    if (currentUserHouseholdRole === 'admin') {
      return redemptionRequests.filter(req => req.status === 'pending')
    }
    
    return []
  }

  const pendingRequests = getPendingRequestsForApproval()
  const userRequests = useMemo(() => {
    return redemptionRequests
      .filter(req => req.userId === currentUser?.id)
      .sort((a, b) => {
        // Sort by requestedAt date, newest first
        return b.requestedAt.getTime() - a.requestedAt.getTime()
      })
  }, [redemptionRequests, currentUser?.id])

  return (
    <div className="space-y-4 sm:space-y-6" id="point-redemption">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          💰 Point Redemption
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">Convert your hard-earned points into cash!</p>
        <div className="mt-3 sm:mt-4 p-3 sm:p-4 rounded-lg border bg-card/80 backdrop-blur-sm">
          <div className="flex items-center justify-center space-x-2 text-foreground">
            <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <span className="text-sm sm:text-base font-medium">
              Current Rate: {conversionRate} points = $1.00
            </span>
          </div>
        </div>
      </div>

      {/* Available Points Display */}
      {currentUserStats && (
        <Card className="bg-gradient-to-br from-success/10 via-primary/10 to-accent/10 border-success/20 dark:from-success/20 dark:via-primary/20 dark:to-accent/20 dark:border-success/800">
          <CardContent className="pt-4 sm:pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-3">
                <div className="p-2 sm:p-3 bg-success/20 dark:bg-success/30 rounded-full">
                  <Coins className="w-6 h-6 sm:w-8 sm:h-8 text-success" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">Your Available Points</h2>
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-success mb-2">
                {currentUserStats.earnedPoints.toLocaleString()}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground px-2">
                You can redeem these points for cash at the current rate of {conversionRate} points = $1.00
              </p>
              
              {/* Level Persistence Indicator */}
              {currentUserStats.levelPersistenceInfo && currentUserStats.levelPersistenceInfo.expiresAt > Date.now() && (
                <div className="mt-3 p-3 bg-warning/10 dark:bg-warning/20 border border-warning/20 dark:border-warning/700 rounded-lg">
                  <div className="flex items-center justify-center space-x-2 text-warning">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Level {currentUserStats.levelPersistenceInfo.persistedLevel} Protected
                    </span>
                  </div>
                  <p className="text-xs text-warning mt-1">
                    Your level is protected until {new Date(currentUserStats.levelPersistenceInfo.expiresAt).toLocaleDateString()}
                  </p>
                </div>
              )}
              
              <div className="mt-3 p-2 sm:p-3 bg-primary/10 dark:bg-primary/20 rounded-lg border border-success/20 dark:border-success-800">
                <span className="text-base sm:text-lg font-medium text-foreground">
                  Maximum Cash Value: ${((currentUserStats.earnedPoints / conversionRate)).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Parent/Admin Approval Panel */}
      {canApproveRedemptions && (
        <Card className="bg-card/80 backdrop-blur-sm border-2 border-primary/20 dark:border-primary/800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 bg-primary/20 dark:bg-primary/30 rounded-full">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <span>Admin Controls</span>
            </CardTitle>
            <CardDescription>
              Manage conversion rates and approve redemption requests
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Admin Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Pending</span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-blue-900 dark:text-blue-100">{pendingRequests.length}</p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">Approved</span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-green-900 dark:text-green-100">{redemptionRequests.filter(req => req.status === 'approved').length}</p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center space-x-2">
                  <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-medium text-red-800 dark:text-red-200">Rejected</span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-red-900 dark:text-red-100">{redemptionRequests.filter(req => req.status === 'rejected').length}</p>
              </div>
            </div>
            
            {/* Conversion Rate Settings - Admin Only */}
            {canApproveRedemptions && (
              <>
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={() => setShowAdminPanel(!showAdminPanel)}
                    variant="outline"
                    className="border-primary/30 hover:bg-primary/10"
                  >
                    {showAdminPanel ? 'Hide' : 'Show'} Conversion Rate Settings
                  </Button>
                </div>
                
                {showAdminPanel && (
                  <div className="space-y-4">
                    {/* Conversion Rate Settings */}
                    <div className="p-4 bg-muted/50 dark:bg-muted/30 rounded-lg border border-border">
                      <label htmlFor="conversionRate" className="text-sm font-medium block mb-2">
                        New Conversion Rate (points per dollar)
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          id="conversionRate"
                          type="number"
                          value={newConversionRate}
                          onChange={(e) => setNewConversionRate(e.target.value)}
                          placeholder={conversionRate.toString()}
                          min="1"
                          className="w-32 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                        />
                        <span className="text-sm text-muted-foreground">points = $1.00</span>
                        <Button onClick={saveConversionRate} size="sm" className="bg-primary hover:bg-primary/90">
                          Update Rate
                        </Button>
                      </div>
                    </div>

                    {/* Level Persistence Settings */}
                    <div className="p-4 bg-warning/10 dark:bg-warning/20 rounded-lg border border-warning/20 dark:border-warning/700">
                      <label htmlFor="levelPersistenceDays" className="text-sm font-medium block mb-2 text-amber-800 dark:text-amber-200">
                        Level Persistence Grace Period (days)
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          id="levelPersistenceDays"
                          type="number"
                          value={levelPersistenceDays}
                          onChange={(e) => setLevelPersistenceDays(parseInt(e.target.value) || 30)}
                          min="1"
                          max="365"
                          className="w-24 px-3 py-2 border border-amber-300 dark:border-amber-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 bg-background text-foreground"
                        />
                        <span className="text-sm text-amber-700 dark:text-amber-300">days</span>
                        <div className="text-xs text-amber-600 dark:text-amber-400">
                          Users keep their level for this many days after redeeming points
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Pending Requests for Parent/Admin Approval */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-orange-500" />
                <h3 className="font-medium text-foreground">
                  Pending Redemption Requests ({pendingRequests.length})
                </h3>
              </div>
              
              {pendingRequests.length > 0 ? (
                pendingRequests.map((request) => (
                  <div key={request.id} className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2 mb-2">
                          {getRoleIcon(request.userRole)}
                          <p className="font-medium text-foreground truncate">{request.userName}</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${getRoleColor(request.userRole)}`}>
                            {request.userRole.charAt(0).toUpperCase() + request.userRole.slice(1)}
                          </span>
                          <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 text-xs font-medium rounded-full border border-orange-200 dark:border-orange-700 flex-shrink-0">
                            Pending
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">{request.pointsRequested} points</span> = <span className="font-bold text-green-600 dark:text-green-400">${request.cashAmount}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Requested: {request.requestedAt.toLocaleDateString()}<span className="hidden sm:inline"> at {request.requestedAt.toLocaleTimeString()}</span>
                        </p>
                      </div>
                      <div className="flex space-x-2 flex-shrink-0">
                        <Button
                          onClick={() => handleConfirmAction(request.id, 'approve')}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          disabled={processingRequest === request.id}
                        >
                          {processingRequest === request.id ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => handleConfirmAction(request.id, 'reject')}
                          size="sm"
                          variant="destructive"
                          disabled={processingRequest === request.id}
                        >
                          {processingRequest === request.id ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center bg-muted/30 dark:bg-muted/20 border border-border rounded-lg">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-foreground font-medium">No pending redemption requests</p>
                  <p className="text-sm text-muted-foreground">
                    All requests have been processed!
                  </p>
                </div>
              )}
            </div>

            {/* Confirmation Dialog */}
            {showConfirmDialog.show && (
              <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
                <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4 border border-border shadow-xl">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    {showConfirmDialog.action === 'approve' ? 'Approve Redemption' : 'Reject Redemption'}
                  </h3>
                  
                  {showConfirmDialog.action === 'approve' ? (
                    <p className="text-muted-foreground mb-4">
                      Are you sure you want to approve this redemption request? The points will be deducted from the user's account and the cash amount will be processed.
                    </p>
                  ) : (
                    <div className="space-y-3 mb-4">
                      <p className="text-muted-foreground">
                        Please provide a reason for rejecting this redemption request:
                      </p>
                      <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Enter rejection reason..."
                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-destructive bg-background text-foreground"
                        rows={3}
                        required
                      />
                    </div>
                  )}
                  
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => setShowConfirmDialog({ show: false, requestId: '', action: 'approve' })}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={executeAction}
                      className={`flex-1 ${
                        showConfirmDialog.action === 'approve' 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      {showConfirmDialog.action === 'approve' ? 'Approve' : 'Reject'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* User Redemption Form */}
      <Card className="border-2 border-primary/20 dark:border-primary/800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="p-2 bg-primary/20 dark:bg-primary/30 rounded-full">
              <Coins className="w-5 h-5 text-primary" />
            </div>
            <span>Redeem Points for Cash</span>
          </CardTitle>
          <CardDescription>
            You have {currentUserStats?.earnedPoints || 0} points available
          </CardDescription>
        </CardHeader>
          <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pointsToRedeem" className="block text-sm font-medium text-foreground mb-2">
                Points to Redeem
              </label>
              <input
                id="pointsToRedeem"
                type="number"
                value={pointsToRedeem}
                onChange={(e) => setPointsToRedeem(e.target.value)}
                placeholder="Enter points amount"
                min="1"
                max={currentUserStats?.earnedPoints || 0}
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Cash Amount</label>
              <div className="p-3 bg-muted/50 dark:bg-muted/30 rounded-md border border-border">
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ${pointsToRedeem ? calculateCashAmount(parseInt(pointsToRedeem)) : '0.00'}
                </span>
              </div>
            </div>
          </div>
          
          <Button
            onClick={submitRedemptionRequest}
            disabled={!pointsToRedeem || parseInt(pointsToRedeem) <= 0 || parseInt(pointsToRedeem) > (currentUserStats?.earnedPoints || 0)}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Submit Redemption Request
          </Button>
          
          {/* Role-based info */}
          {currentUser && (currentUser.role === 'teen' || currentUser.role === 'kid') && (
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Parent Approval Required</span>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                As a {currentUser.role}, your redemption requests need to be approved by a parent before processing.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User's Redemption History */}
      {userRequests.length > 0 && (
        <Card className="border-2 border-accent/20 dark:border-accent/800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 bg-accent/20 dark:bg-accent/30 rounded-full">
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
              <span>Your Redemption History</span>
            </CardTitle>
            <CardDescription>
              Track all your point redemption requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userRequests.map((request) => (
                <div
                  key={request.id}
                  className={`p-4 rounded-lg border ${
                    request.status === 'approved'
                      ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
                      : request.status === 'rejected'
                      ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
                      : 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {request.pointsRequested} points = ${request.cashAmount}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${
                            request.status === 'approved'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700'
                              : request.status === 'rejected'
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700'
                              : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700'
                          }`}
                        >
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Requested: {request.requestedAt.toLocaleDateString()}
                      </p>
                      {request.processedAt && (
                        <p className="text-sm text-muted-foreground">
                          Processed: {request.processedAt.toLocaleDateString()}
                          {request.processedBy && ` by ${request.processedBy}`}
                        </p>
                      )}
                      {request.status === 'rejected' && request.adminNotes && (
                        <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
                          <p className="text-xs text-red-700 dark:text-red-300 font-medium">Rejection Reason:</p>
                          <p className="text-xs text-red-600 dark:text-red-400">{request.adminNotes}</p>
                        </div>
                      )}
                    </div>
                    {request.status === 'approved' && (
                      <div className="text-green-600 dark:text-green-400">
                        <DollarSign className="w-8 h-8" />
                      </div>
                    )}
                    {request.status === 'rejected' && (
                      <div className="text-red-600 dark:text-red-400">
                        <XCircle className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-blue-800 dark:text-blue-200">
              <h3 className="font-medium mb-2">How Point Redemption Works</h3>
              <ul className="text-sm space-y-1">
                <li>• Submit a redemption request with your desired point amount</li>
                <li>• {currentUser?.role === 'teen' || currentUser?.role === 'kid' 
                  ? 'A parent will review and approve/reject your request'
                  : 'Admin will review and approve/reject your request'
                }</li>
                <li>• Approved redemptions will be processed for cash payout</li>
                <li>• Conversion rate is set by admin and may change over time</li>
                <li>• You can only redeem points you've actually earned</li>
                <li>• <strong>Level Protection:</strong> Your current level is protected for {levelPersistenceDays} days after redemption</li>
                {currentUser?.role === 'teen' || currentUser?.role === 'kid' ? (
                  <li>• <strong>Parent Approval:</strong> As a {currentUser.role}, your requests need parent approval</li>
                ) : null}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
