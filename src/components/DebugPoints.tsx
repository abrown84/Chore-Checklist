import React, { useEffect } from 'react'
import { useChores } from '../contexts/ChoreContext'
import { useUsers } from '../contexts/UserContext'
import { useStats } from '../contexts/StatsContext'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { testLifetimePointsCalculation, simulateChoreLifecycle } from '../utils/lifetimePointsTest'

export const DebugPoints: React.FC = () => {
  const { state: choreState } = useChores()
  const { state: userState } = useUsers()
  const { getAllUserStats } = useStats()
  
  // Get all user stats to debug level calculations
  const allUserStats = getAllUserStats()
  
  // Debug logging for current user stats
  useEffect(() => {
    if (userState.currentUser && allUserStats.length > 0) {
      const currentUserStats = allUserStats.find(s => s.userId === userState.currentUser?.id)
      if (currentUserStats) {
        // Stats are available for debugging if needed
      }
    }
  }, [userState.currentUser, allUserStats])
  
  // Get chore distribution from StatsContext
  const { getChoreDistribution, updateUserPoints } = useStats()





  
  const choreDistribution = getChoreDistribution()
  
  // Get member stats from StatsContext
  const memberStats = getAllUserStats()
  
  const handleTestLifetimePoints = () => {
    testLifetimePointsCalculation()
  }
  
  const handleSimulateChoreLifecycle = () => {
    simulateChoreLifecycle()
  }
  


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🔍 Points Debug Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overall Chore Information */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Overall Chore Stats</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>Total Chores: {choreState.chores.length}</div>
              <div>Completed Chores: {choreState.chores.filter(c => c.completed).length}</div>
              <div>Total Potential Points: {choreState.chores.reduce((sum, c) => sum + c.points, 0)}</div>
              <div>Total Earned Points: {choreState.chores
                .filter(c => c.completed)
                .reduce((sum, c) => {
                  const earnedPoints = c.finalPoints !== undefined ? c.finalPoints : c.points
                  return sum + earnedPoints
                }, 0) + choreState.chores
                .filter(c => !c.completed && c.finalPoints !== undefined)
                .reduce((sum, c) => sum + (c.finalPoints || 0), 0)
              }</div>
            </div>
            
            {/* Action Buttons */}
            <div className="mt-3 flex gap-2">
              {/* Button removed - no longer needed with new chore distribution logic */}
            </div>
            
            {/* Test Buttons */}
            <div className="mt-3 flex gap-2">
              <Button onClick={handleTestLifetimePoints} variant="outline" size="sm">
                Test Lifetime Points
              </Button>
              <Button onClick={handleSimulateChoreLifecycle} variant="outline" size="sm">
                Simulate Chore Lifecycle
              </Button>
            </div>
          </div>

          {/* Member Information */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Member Information</h3>
            <div className="space-y-2">
              {userState.members.map(member => {
                const userChores = choreDistribution[member.id] || []
                const completedChores = userChores.filter(c => c.completed)
                
                // Calculate lifetime points including reset chores
                const baseEarnedPoints = completedChores.reduce((sum, c) => {
                  const earnedPoints = c.finalPoints !== undefined ? c.finalPoints : c.points
                  return sum + earnedPoints
                }, 0)
                
                const resetChoresPoints = userChores
                  .filter(c => !c.completed && c.finalPoints !== undefined)
                  .reduce((sum, c) => sum + (c.finalPoints || 0), 0)
                
                const earnedPoints = baseEarnedPoints + resetChoresPoints
                const totalPotentialPoints = userChores.reduce((sum, c) => sum + c.points, 0)

                return (
                  <div key={member.id} className="border p-3 rounded-lg">
                    <div className="font-medium">{member.name} ({member.email})</div>
                    <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                      <div>Assigned Chores: {userChores.length}</div>
                      <div>Completed: {completedChores.length}</div>
                      <div>Earned Points: {earnedPoints}</div>
                      <div>Potential Points: {totalPotentialPoints}</div>
                    </div>
                    
                    {/* Detailed Chore Breakdown */}
                    {userChores.length > 0 && (
                      <div className="mt-3">
                        <div className="font-medium text-sm mb-2">Chore Details:</div>
                        <div className="space-y-1 text-xs">
                          {userChores.map(chore => (
                            <div key={chore.id} className="flex justify-between">
                              <span>{chore.title} ({chore.difficulty})</span>
                              <span className="flex items-center gap-2">
                                <span>Base: {chore.points}</span>
                                {chore.completed && (
                                  <>
                                    <span>→</span>
                                    <span className={chore.finalPoints && chore.finalPoints !== chore.points ? 'font-bold text-green-600' : ''}>
                                      {chore.finalPoints || chore.points}
                                    </span>
                                    {chore.bonusMessage && (
                                      <span className="text-xs text-gray-500">({chore.bonusMessage})</span>
                                    )}
                                  </>
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Raw Data */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Raw Chore Data</h3>
            <div className="max-h-60 overflow-y-auto">
              <pre className="text-xs bg-gray-100 p-2 rounded">
                {JSON.stringify(choreState.chores, null, 2)}
              </pre>
            </div>
          </div>

          {/* Points Discrepancy Analysis */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Points Discrepancy Analysis</h3>
            <div className="space-y-2 text-sm">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <strong>ChoreContext Total Points:</strong> {choreState.stats.earnedPoints}
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <strong>StatsContext Total Points:</strong> {memberStats.reduce((sum, stats) => sum + stats.earnedPoints, 0)}
              </div>
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <strong>Discrepancy:</strong> {choreState.stats.earnedPoints - memberStats.reduce((sum, stats) => sum + stats.earnedPoints, 0)}
              </div>
            </div>
          </div>

          {/* Raw Member Stats */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Raw Member Stats</h3>
            <div className="max-h-60 overflow-y-auto">
              <pre className="text-xs bg-gray-100 p-2 rounded">
                {JSON.stringify(memberStats, null, 2)}
              </pre>
            </div>
          </div>

          {/* Point Deductions Debug */}
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h3 className="font-medium text-yellow-800 mb-2">Point Deductions Debug</h3>
            <div className="space-y-2 text-sm">
              <div><strong>LocalStorage pointDeductions:</strong></div>
              <pre className="bg-blue-50 p-2 rounded border text-xs overflow-auto">
                {JSON.stringify(JSON.parse(localStorage.getItem('pointDeductions') || '{}'), null, 2)}
              </pre>
              <div><strong>Current User Deductions:</strong> {JSON.parse(localStorage.getItem('pointDeductions') || '{}')[userState.currentUser?.id || ''] || 0}</div>
              <div><strong>All User Deductions:</strong> {Object.values(JSON.parse(localStorage.getItem('pointDeductions') || '{}')).reduce((sum: number, val: any) => sum + val, 0)}</div>
              
                          {/* Test Button */}
            <div className="mt-4">
              <Button 
                onClick={() => {
                  updateUserPoints(userState.currentUser?.id || '1', 50)
                  console.log('Test: Deducted 50 points from user', userState.currentUser?.id)
                }}
                variant="outline"
                size="sm"
              >
                Test: Deduct 50 Points
              </Button>
            </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
