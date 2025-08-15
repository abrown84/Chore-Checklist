import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { useUsers } from '../contexts/UserContext'
import { useStats } from '../contexts/StatsContext'
import { DollarSign, Coins, Calculator, Settings, AlertCircle, CheckCircle, XCircle, Clock, UserCheck } from 'lucide-react'

interface RedemptionRequest {
  id: string
  userId: string
  userName: string
  pointsRequested: number
  cashAmount: number
  status: 'pending' | 'approved' | 'rejected'
  requestedAt: Date
  processedAt?: Date
  processedBy?: string
  adminNotes?: string
}

export const PointRedemption: React.FC = () => {
  const { state: userState } = useUsers()
  const { getAllUserStats, updateUserPoints, setLevelPersistence, forceRefresh } = useStats()
  const [conversionRate, setConversionRate] = useState(100) // points per dollar
  const [isAdmin, setIsAdmin] = useState(false)
  const [redemptionRequests, setRedemptionRequests] = useState<RedemptionRequest[]>([])
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

  useEffect(() => {
    // Check if current user is admin based on their role
    const adminStatus = currentUser?.role === 'admin'
    setIsAdmin(adminStatus)
    
    // Load conversion rate from localStorage
    const savedRate = localStorage.getItem('pointRedemptionRate')
    if (savedRate) {
      setConversionRate(parseInt(savedRate))
    }
  }, [currentUser])

  // Separate useEffect for loading redemption requests
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
        console.error('PointRedemption - Error parsing redemption requests:', error)
      }
    }
  }, [])

  const saveConversionRate = () => {
    const rate = parseInt(newConversionRate)
    if (rate > 0) {
      setConversionRate(rate)
      localStorage.setItem('pointRedemptionRate', rate.toString())
      setNewConversionRate('')
      setShowAdminPanel(false)
    }
  }

  const calculateCashAmount = (points: number) => {
    return (points / conversionRate).toFixed(2)
  }

  const submitRedemptionRequest = () => {
    const points = parseInt(pointsToRedeem)
    if (points <= 0 || !currentUser || !currentUserStats) return
    
    if (points > currentUserStats.earnedPoints) {
      alert('You don\'t have enough points for this redemption!')
      return
    }

    const cashAmount = parseFloat(calculateCashAmount(points))
    const newRequest: RedemptionRequest = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name || currentUser.email,
      pointsRequested: points,
      cashAmount,
      status: 'pending',
      requestedAt: new Date()
    }

    const updatedRequests = [...redemptionRequests, newRequest]
    setRedemptionRequests(updatedRequests)
    localStorage.setItem('redemptionRequests', JSON.stringify(updatedRequests))
    setPointsToRedeem('')
  }

  const processRedemptionRequest = (requestId: string, status: 'approved' | 'rejected') => {
    const request = redemptionRequests.find(req => req.id === requestId)
    if (!request) return

    setProcessingRequest(requestId)

    // Simulate processing delay for better UX
    setTimeout(() => {
      const updatedRequests = redemptionRequests.map(req => {
        if (req.id === requestId) {
          return {
            ...req,
            status,
            processedAt: new Date(),
            processedBy: currentUser?.name || currentUser?.email,
            adminNotes: status === 'rejected' ? adminNotes : undefined
          }
        }
        return req
      })
      
      setRedemptionRequests(updatedRequests)
      localStorage.setItem('redemptionRequests', JSON.stringify(updatedRequests))
      
      // If approved, deduct the points from the user's total
      if (status === 'approved') {
        updateUserPoints(request.userId, request.pointsRequested)
        
        // Set level persistence for the user so they keep their current level
        const userStats = memberStats.find(s => s.userId === request.userId)
        if (userStats) {
          // Set level persistence for configurable days
          setLevelPersistence(request.userId, userStats.currentLevel, userStats.earnedPoints, levelPersistenceDays)
        }
        
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

  const pendingRequests = redemptionRequests.filter(req => req.status === 'pending')
  const userRequests = redemptionRequests.filter(req => req.userId === currentUser?.id)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">💰 Point Redemption</h1>
        <p className="text-muted-foreground">Convert your hard-earned points into cash!</p>
        <div className="mt-4 p-4 rounded-lg border bg-card/80 backdrop-blur-sm">
          <div className="flex items-center justify-center space-x-2 text-foreground">
            <Calculator className="w-5 h-5" />
            <span className="font-medium">
              Current Rate: {conversionRate} points = $1.00
            </span>
          </div>
        </div>
      </div>

      {/* Available Points Display */}
      {currentUserStats && (
        <Card className="bg-gradient-to-br from-success/10 via-primary/10 to-accent/10 border-success/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <Coins className="w-8 h-8 text-success" />
                <h2 className="text-2xl font-bold text-foreground">Your Available Points</h2>
              </div>
              <div className="text-4xl font-bold text-success mb-2">
                {currentUserStats.earnedPoints.toLocaleString()}
              </div>
              <p className="text-muted-foreground">
                You can redeem these points for cash at the current rate of {conversionRate} points = $1.00
              </p>
              
              {/* Level Persistence Indicator */}
              {currentUserStats.levelPersistenceInfo && currentUserStats.levelPersistenceInfo.expiresAt > Date.now() && (
                <div className="mt-3 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                  <div className="flex items-center justify-center space-x-2 text-warning">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Level {currentUserStats.levelPersistenceInfo.persistedLevel} Protected
                    </span>
                  </div>
                  <p className="text-xs text-warning mt-1">
                    Your level is protected until {new Date(currentUserStats.levelPersistenceInfo.expiresAt).toLocaleDateString()}
                  </p>
                </div>
              )}
              
              <div className="mt-3 p-3 bg-primary/10 rounded-lg border border-success/20">
                <span className="text-lg font-medium text-foreground">
                  Maximum Cash Value: ${((currentUserStats.earnedPoints / conversionRate)).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debug Info */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-sm text-gray-600">Debug Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs space-y-1">
            <p>Current User: {currentUser?.name || currentUser?.email || 'None'}</p>
            <p>User Role: {currentUser?.role || 'None'}</p>
            <p>Is Admin: {isAdmin ? 'Yes' : 'No'}</p>
            <p>Total Requests: {redemptionRequests.length}</p>
            <p>Pending Requests: {redemptionRequests.filter(req => req.status === 'pending').length}</p>
          </div>
          <div className="mt-3 space-y-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => {
                const testRequest: RedemptionRequest = {
                  id: Date.now().toString(),
                  userId: 'test-user',
                  userName: 'Test User',
                  pointsRequested: 500,
                  cashAmount: 5.00,
                  status: 'pending',
                  requestedAt: new Date()
                }
                const updatedRequests = [...redemptionRequests, testRequest]
                setRedemptionRequests(updatedRequests)
                localStorage.setItem('redemptionRequests', JSON.stringify(updatedRequests))
              }}
            >
              Create Test Request
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => {}}
            >
              Log Requests
            </Button>
            {!isAdmin && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  // Manually promote to admin by updating localStorage
                  if (currentUser) {
                    const storedUser = localStorage.getItem('choreAppUser')
                    if (storedUser) {
                      const parsedUser = JSON.parse(storedUser)
                      parsedUser.role = 'admin'
                      localStorage.setItem('choreAppUser', JSON.stringify(parsedUser))
                      
                      // Also update in users array
                      const storedUsers = localStorage.getItem('choreAppUsers')
                      if (storedUsers) {
                        const users = JSON.parse(storedUsers)
                        const userIndex = users.findIndex((u: any) => u.id === currentUser.id)
                        if (userIndex !== -1) {
                          users[userIndex].role = 'admin'
                          localStorage.setItem('choreAppUsers', JSON.stringify(users))
                        }
                      }
                      
                      // Force reload to apply changes
                      window.location.reload()
                    }
                  }
                }}
              >
                Promote to Admin
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Admin Panel */}
      {isAdmin && (
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Admin Controls</span>
            </CardTitle>
            <CardDescription>
              Manage conversion rates and approve redemption requests
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Admin Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Pending</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">{pendingRequests.length}</p>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Approved</span>
                </div>
                <p className="text-2xl font-bold text-green-900">{redemptionRequests.filter(req => req.status === 'approved').length}</p>
              </div>
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">Rejected</span>
                </div>
                <p className="text-2xl font-bold text-red-900">{redemptionRequests.filter(req => req.status === 'rejected').length}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setShowAdminPanel(!showAdminPanel)}
                variant="outline"
              >
                {showAdminPanel ? 'Hide' : 'Show'} Conversion Rate Settings
              </Button>
            </div>
            
            {showAdminPanel && (
              <div className="space-y-4">
                {/* Conversion Rate Settings */}
                <div className="p-4 bg-muted rounded-lg border">
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
                      className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">points = $1.00</span>
                    <Button onClick={saveConversionRate} size="sm">
                      Update Rate
                    </Button>
                  </div>
                </div>

                {/* Level Persistence Settings */}
                <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
                  <label htmlFor="levelPersistenceDays" className="text-sm font-medium block mb-2 text-amber-800">
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
                      className="w-24 px-3 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <span className="text-sm text-amber-700">days</span>
                    <div className="text-xs text-amber-600">
                      Users keep their level for this many days after redeeming points
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pending Requests for Admin */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-orange-500" />
                <h3 className="font-medium text-gray-900">Pending Redemption Requests ({pendingRequests.length})</h3>
              </div>
              
              {pendingRequests.length > 0 ? (
                pendingRequests.map((request) => (
                  <div key={request.id} className="p-4 bg-blue-50 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <UserCheck className="w-4 h-4 text-blue-500" />
                          <p className="font-medium text-gray-900">{request.userName}</p>
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                            Pending
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">{request.pointsRequested} points</span> = <span className="font-bold text-green-600">${request.cashAmount}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Requested: {request.requestedAt.toLocaleDateString()} at {request.requestedAt.toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
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
                <div className="p-6 text-center bg-gray-50 border border-gray-200 rounded-lg">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">No pending redemption requests</p>
                  <p className="text-sm text-gray-500">All requests have been processed!</p>
                </div>
              )}
            </div>

            {/* Confirmation Dialog */}
            {showConfirmDialog.show && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-blue-50 rounded-lg p-6 max-w-md w-full mx-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {showConfirmDialog.action === 'approve' ? 'Approve Redemption' : 'Reject Redemption'}
                  </h3>
                  
                  {showConfirmDialog.action === 'approve' ? (
                    <p className="text-gray-600 mb-4">
                      Are you sure you want to approve this redemption request? The points will be deducted from the user's account and the cash amount will be processed.
                    </p>
                  ) : (
                    <div className="space-y-3 mb-4">
                      <p className="text-gray-600">
                        Please provide a reason for rejecting this redemption request:
                      </p>
                      <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Enter rejection reason..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Coins className="w-5 h-5" />
            <span>Redeem Points for Cash</span>
          </CardTitle>
          <CardDescription>
            You have {currentUserStats?.earnedPoints || 0} points available
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pointsToRedeem" className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cash Amount</label>
              <div className="p-3 bg-gray-50 rounded-md border">
                <span className="text-2xl font-bold text-green-600">
                  ${pointsToRedeem ? calculateCashAmount(parseInt(pointsToRedeem)) : '0.00'}
                </span>
              </div>
            </div>
          </div>
          
          <Button
            onClick={submitRedemptionRequest}
            disabled={!pointsToRedeem || parseInt(pointsToRedeem) <= 0 || parseInt(pointsToRedeem) > (currentUserStats?.earnedPoints || 0)}
            className="w-full"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Submit Redemption Request
          </Button>
        </CardContent>
      </Card>

      {/* User's Redemption History */}
      {userRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Redemption History</CardTitle>
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
                      ? 'bg-green-50 border-green-200'
                      : request.status === 'rejected'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {request.pointsRequested} points = ${request.cashAmount}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            request.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : request.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Requested: {request.requestedAt.toLocaleDateString()}
                      </p>
                      {request.processedAt && (
                        <p className="text-sm text-gray-600">
                          Processed: {request.processedAt.toLocaleDateString()}
                          {request.processedBy && ` by ${request.processedBy}`}
                        </p>
                      )}
                      {request.status === 'rejected' && request.adminNotes && (
                        <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded-md">
                          <p className="text-xs text-red-700 font-medium">Rejection Reason:</p>
                          <p className="text-xs text-red-600">{request.adminNotes}</p>
                        </div>
                      )}
                    </div>
                    {request.status === 'approved' && (
                      <div className="text-green-600">
                        <DollarSign className="w-8 h-8" />
                      </div>
                    )}
                    {request.status === 'rejected' && (
                      <div className="text-red-600">
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
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-blue-800">
              <h3 className="font-medium mb-2">How Point Redemption Works</h3>
              <ul className="text-sm space-y-1">
                <li>• Submit a redemption request with your desired point amount</li>
                <li>• Admin will review and approve/reject your request</li>
                <li>• Approved redemptions will be processed for cash payout</li>
                <li>• Conversion rate is set by admin and may change over time</li>
                <li>• You can only redeem points you've actually earned</li>
                <li>• <strong>Level Protection:</strong> Your current level is protected for {levelPersistenceDays} days after redemption</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
