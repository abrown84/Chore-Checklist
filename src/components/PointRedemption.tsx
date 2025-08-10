import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { useUsers } from '../contexts/UserContext'
import { useStats } from '../contexts/StatsContext'
import { DollarSign, Coins, Calculator, Settings, AlertCircle } from 'lucide-react'

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
}

export const PointRedemption: React.FC = () => {
  const { state: userState } = useUsers()
  const { getAllUserStats, updateUserPoints, refreshStats } = useStats()
  const [conversionRate, setConversionRate] = useState(100) // points per dollar
  const [isAdmin, setIsAdmin] = useState(false)
  const [redemptionRequests, setRedemptionRequests] = useState<RedemptionRequest[]>([])
  const [pointsToRedeem, setPointsToRedeem] = useState('')
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [newConversionRate, setNewConversionRate] = useState('')

  const memberStats = getAllUserStats()
  const currentUser = userState.currentUser
  const currentUserStats = memberStats.find(s => s.userId === currentUser?.id)

  useEffect(() => {
    // Check if current user is admin (first user or has admin role)
    setIsAdmin(currentUser?.id === userState.members[0]?.id)
    
    // Load conversion rate from localStorage
    const savedRate = localStorage.getItem('pointRedemptionRate')
    if (savedRate) {
      setConversionRate(parseInt(savedRate))
    }
    
    // Load redemption requests from localStorage
    const savedRequests = localStorage.getItem('redemptionRequests')
    if (savedRequests) {
      setRedemptionRequests(JSON.parse(savedRequests).map((req: any) => ({
        ...req,
        requestedAt: new Date(req.requestedAt),
        processedAt: req.processedAt ? new Date(req.processedAt) : undefined
      })))
    }
  }, [currentUser, userState.members])

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

    const updatedRequests = redemptionRequests.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          status,
          processedAt: new Date(),
          processedBy: currentUser?.name || currentUser?.email
        }
      }
      return req
    })
    
    setRedemptionRequests(updatedRequests)
    localStorage.setItem('redemptionRequests', JSON.stringify(updatedRequests))
    
    // If approved, deduct the points from the user's total
    if (status === 'approved') {
      updateUserPoints(request.userId, request.pointsRequested)
      // Refresh stats to ensure UI updates immediately
      setTimeout(() => refreshStats(), 100)
    }
  }

  const pendingRequests = redemptionRequests.filter(req => req.status === 'pending')
  const userRequests = redemptionRequests.filter(req => req.userId === currentUser?.id)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">💰 Point Redemption</h1>
        <p className="text-gray-600">Convert your hard-earned points into cash!</p>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-center space-x-2 text-blue-800">
            <Calculator className="w-5 h-5" />
            <span className="font-medium">
              Current Rate: {conversionRate} points = $1.00
            </span>
          </div>
        </div>
      </div>

      {/* Available Points Display */}
      {currentUserStats && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <Coins className="w-8 h-8 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-900">Your Available Points</h2>
              </div>
              <div className="text-4xl font-bold text-green-600 mb-2">
                {currentUserStats.earnedPoints.toLocaleString()}
              </div>
              <p className="text-gray-600">
                You can redeem these points for cash at the current rate of {conversionRate} points = $1.00
              </p>
              <div className="mt-3 p-3 bg-white rounded-lg border border-green-200">
                <span className="text-lg font-medium text-gray-700">
                  Maximum Cash Value: ${((currentUserStats.earnedPoints / conversionRate)).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin Panel */}
      {isAdmin && (
        <Card>
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
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setShowAdminPanel(!showAdminPanel)}
                variant="outline"
              >
                {showAdminPanel ? 'Hide' : 'Show'} Conversion Rate Settings
              </Button>
            </div>
            
            {showAdminPanel && (
              <div className="p-4 bg-gray-50 rounded-lg border">
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
            )}

            {/* Pending Requests for Admin */}
            {pendingRequests.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Pending Redemption Requests</h3>
                {pendingRequests.map((request) => (
                  <div key={request.id} className="p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{request.userName}</p>
                        <p className="text-sm text-gray-600">
                          {request.pointsRequested} points = ${request.cashAmount}
                        </p>
                        <p className="text-xs text-gray-500">
                          Requested: {request.requestedAt.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => processRedemptionRequest(request.id, 'approved')}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Approve
                        </Button>
                        <Button
                          onClick={() => processRedemptionRequest(request.id, 'rejected')}
                          size="sm"
                          variant="destructive"
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
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
                    </div>
                    {request.status === 'approved' && (
                      <div className="text-green-600">
                        <DollarSign className="w-8 h-8" />
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
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
