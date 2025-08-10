
import { Trophy, Star, Zap, TrendingUp, Target, Award, Users, Home, BarChart3, CheckCircle, Sparkles, Activity, Lock } from 'lucide-react'
import { useUsers } from '../contexts/UserContext'
import { useStats } from '../contexts/StatsContext'
import { useChores } from '../contexts/ChoreContext'
import { useState, useEffect } from 'react'
import { LEVELS } from '../types/chore'


export const Leaderboard: React.FC = () => {
  const { state: userState } = useUsers()
  const { getAllUserStats, refreshStats } = useStats()
  const { state: choreState } = useChores()
  const [activeTab, setActiveTab] = useState<'overview' | 'leaderboard' | 'progress' | 'rewards'>('overview')
  const [rankingMode, setRankingMode] = useState<'points' | 'efficiency' | 'lifetime'>('points')
  


  // Force refresh of stats when component mounts or when needed
  useEffect(() => {
    refreshStats()
  }, [])

  const memberStats = getAllUserStats()
  const sortedLeaderboard = memberStats
    .map(stats => {
      // Find the corresponding user information
      const user = userState.members.find(m => m.id === stats.userId)
      if (!user) return null
      
      const currentLevelData = LEVELS.find(level => level.level === stats.currentLevel)
      const nextLevelData = LEVELS.find(level => level.level === (stats.currentLevel || 1) + 1)
      const progressToNextLevel = nextLevelData 
        ? ((stats.earnedPoints - (currentLevelData?.pointsRequired || 0)) / (nextLevelData.pointsRequired - (currentLevelData?.pointsRequired || 0))) * 100
        : 100

      return {
        ...stats,
        ...user, // Include user properties (id, name, email, avatar, etc.)
        currentLevelData,
        nextLevelData,
        levelProgress: Math.min(Math.max(progressToNextLevel, 0), 100),
        efficiencyScore: stats.efficiencyScore || 0,
        completionRate: stats.totalChores > 0 ? (stats.completedChores / stats.totalChores) * 100 : 0,
        isCurrentUser: user.id === userState.currentUser?.id
      }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null) // Type-safe filter
    .sort((a, b) => {
      if (rankingMode === 'points') {
        return b.earnedPoints - a.earnedPoints
      } else if (rankingMode === 'efficiency') {
        return b.efficiencyScore - a.efficiencyScore
      } else {
        return b.completedChores - a.completedChores
      }
    })



  // Household overview stats
  const totalHouseholdPoints = memberStats.reduce((sum, stats) => sum + stats.earnedPoints, 0)
  const totalHouseholdChores = choreState.chores.length
  const completedHouseholdChores = choreState.chores.filter(c => c.completed).length
  const averageEfficiency = memberStats.length > 0 
    ? memberStats.reduce((sum, stats) => sum + (stats.efficiencyScore || 0), 0) / memberStats.length 
    : 0

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 0:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 1:
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 2:
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 0:
        return '🥇'
      case 1:
        return '🥈'
      case 2:
        return '🥉'
      default:
        return `${rank + 1}`
    }
  }

  const getEfficiencyBadge = (score: number) => {
    if (score >= 85) return { text: 'Efficiency Master', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
    if (score >= 70) return { text: 'Highly Efficient', color: 'bg-blue-100 text-blue-800 border-blue-200' }
    if (score >= 55) return { text: 'Efficient', color: 'bg-green-100 text-green-800 border-green-200' }
    if (score >= 40) return { text: 'Getting There', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' }
    return { text: 'Room to Improve', color: 'bg-red-100 text-red-800 border-red-200' }
  }



  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Household Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Points</p>
              <p className="text-3xl font-bold text-blue-900">{totalHouseholdPoints}</p>
            </div>
            <div className="p-3 bg-blue-500 rounded-full">
              <Star className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Chores Completed</p>
              <p className="text-3xl font-bold text-green-900">{completedHouseholdChores}/{totalHouseholdChores}</p>
            </div>
            <div className="p-3 bg-green-500 rounded-full">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-100 p-6 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Avg Efficiency</p>
              <p className="text-3xl font-bold text-purple-900">{averageEfficiency.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-purple-500 rounded-full">
              <Target className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-red-100 p-6 rounded-xl border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Members</p>
              <p className="text-3xl font-bold text-orange-900">{userState.members.length}</p>
            </div>
            <div className="p-3 bg-orange-500 rounded-full">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
            Top Performers
          </h3>
          <div className="space-y-3">
            {sortedLeaderboard.slice(0, 3).map((member, index) => (
              <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                 <div className="flex items-center space-x-3">
                   <span className="text-2xl">{getRankIcon(index)}</span>
                   <span className="text-2xl">{member.avatar}</span>
                   <div>
                     <p className="font-medium text-gray-900">{member.name}</p>
                     <p className="text-sm text-gray-600 flex items-center">
                       <span className="mr-1">{member.currentLevelData?.icon || '🌱'}</span>
                       Lv {member.currentLevel}
                     </p>
                   </div>
                 </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{member.earnedPoints} pts</p>
                  <p className="text-sm text-gray-600">{member.efficiencyScore}% eff</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-500" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            {choreState.chores.slice(0, 5).map((chore) => (
              <div key={chore.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${chore.completed ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <div>
                    <p className="font-medium text-gray-900">{chore.title}</p>
                    <p className="text-sm text-gray-600">{chore.assignedTo}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{chore.points} pts</p>
                  <p className="text-sm text-gray-600">{chore.difficulty}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Household Progress Overview */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-purple-500" />
          Household Progress
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {userState.members.map((member) => {
            const stats = memberStats.find(s => s.userId === member.id)
            const currentLevelData = LEVELS.find(level => level.level === stats?.currentLevel || 1)
            return (
              <div key={member.id} className="text-center">
                <div className="flex justify-center mb-3">
                  <span className="text-3xl">{member.avatar}</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">{member.name}</h4>
                <div className="flex items-center justify-center mb-2">
                  <span className="text-2xl mr-2">{currentLevelData?.icon || '🌱'}</span>
                  <span className="text-lg font-bold text-gray-900">Lv {stats?.currentLevel || 1}</span>
                </div>
                <p className={`text-sm font-medium mb-3 ${currentLevelData?.color || 'text-gray-600'}`}>{currentLevelData?.name || 'Unknown'}</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      currentLevelData?.color === 'text-red-600' ? 'bg-red-500' :
                      currentLevelData?.color === 'text-pink-600' ? 'bg-pink-500' :
                      currentLevelData?.color === 'text-emerald-600' ? 'bg-emerald-500' :
                      currentLevelData?.color === 'text-amber-600' ? 'bg-amber-500' :
                      currentLevelData?.color === 'text-indigo-600' ? 'bg-indigo-500' :
                      currentLevelData?.color === 'text-purple-600' ? 'bg-purple-500' :
                      currentLevelData?.color === 'text-yellow-600' ? 'bg-yellow-500' :
                      currentLevelData?.color === 'text-blue-600' ? 'bg-blue-500' :
                      currentLevelData?.color === 'text-green-600' ? 'bg-green-500' :
                      'bg-indigo-500'
                    }`}
                    style={{ width: `${Math.min(((stats?.earnedPoints || 0) / 1000) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">{stats?.earnedPoints || 0} / 1000 pts</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )

  const renderLeaderboardTab = () => (
    <div className="space-y-6">
      {/* Ranking Mode Toggle */}
      <div className="flex justify-center">
        <div className="bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setRankingMode('efficiency')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              rankingMode === 'efficiency'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Target className="w-4 h-4 inline mr-2" />
            Efficiency Ranking
          </button>
          <button
            onClick={() => setRankingMode('points')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              rankingMode === 'points'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Star className="w-4 h-4 inline mr-2" />
            Points Ranking
          </button>
          <button
            onClick={() => setRankingMode('lifetime')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              rankingMode === 'lifetime'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Lifetime Points
          </button>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="space-y-4">
        {sortedLeaderboard.map((member, index) => {
          const efficiencyBadge = getEfficiencyBadge(member.efficiencyScore)
          
          return (
            <div
              key={member.id}
              className={`p-6 rounded-lg border-2 transition-all duration-200 hover:shadow-lg ${
                member.isCurrentUser
                  ? 'ring-2 ring-indigo-500 bg-indigo-50 border-indigo-200'
                  : getRankColor(index)
              }`}
            >
              <div className="flex items-center justify-between">
                {/* Rank and Avatar */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white text-xl font-bold shadow-sm">
                    {getRankIcon(index)}
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{member.avatar}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {member.name}
                        {member.isCurrentUser && (
                          <span className="ml-2 text-sm bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                            You
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600">{member.email}</p>
                      
                      {/* Efficiency Badge */}
                      {rankingMode === 'efficiency' && (
                        <div className={`mt-1 inline-block px-2 py-1 rounded-full text-xs font-medium border ${efficiencyBadge.color}`}>
                          {efficiencyBadge.text}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center space-x-6">
                  {/* Primary Metric */}
                  <div className="text-center">
                    <div className="flex items-center space-x-2">
                      {rankingMode === 'efficiency' ? (
                        <>
                          <Target className="w-5 h-5 text-emerald-500" />
                          <span className="text-2xl font-bold text-gray-900">{member.efficiencyScore}</span>
                        </>
                      ) : rankingMode === 'lifetime' ? (
                        <>
                          <TrendingUp className="w-5 h-5 text-purple-500" />
                          <span className="text-2xl font-bold text-gray-900">{member.earnedPoints}</span>
                        </>
                      ) : (
                        <>
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-2xl font-bold text-gray-900">{member.earnedPoints}</span>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {rankingMode === 'efficiency' ? 'Efficiency' : rankingMode === 'lifetime' ? 'Lifetime Points' : 'Points'}
                    </p>
                  </div>

                  {/* Level */}
                  <div className="text-center">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{member.currentLevelData?.icon || '🌱'}</span>
                      <span className="text-xl font-bold text-gray-900">Lv {member.currentLevel}</span>
                    </div>
                    <p className={`text-sm ${member.currentLevelData?.color || 'text-gray-600'}`}>{member.currentLevelData?.name || 'Unknown'}</p>
                  </div>

                  {/* Chores Completed */}
                  <div className="text-center">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-5 h-5 text-green-500" />
                      <span className="text-xl font-bold text-gray-900">{member.completedChores}</span>
                    </div>
                    <p className="text-sm text-gray-600">Completed</p>
                  </div>

                  {/* Streak */}
                  <div className="text-center">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-red-500" />
                      <span className="text-xl font-bold text-gray-900">{member.currentStreak || 0}</span>
                    </div>
                    <p className="text-sm text-gray-600">Streak</p>
                  </div>
                </div>
              </div>

              {/* Progress Bar - Only show for points and efficiency ranking */}
              {rankingMode !== 'lifetime' && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    {rankingMode === 'points' ? (
                      <>
                        <span>Level Progress: {member.currentLevelData?.name} → {member.nextLevelData?.name}</span>
                        <span>{member.levelProgress.toFixed(1)}%</span>
                      </>
                    ) : (
                      <>
                        <span>Efficiency Score: {member.efficiencyScore.toFixed(1)} / 100</span>
                        <span>{member.efficiencyScore.toFixed(1)}%</span>
                      </>
                    )}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        rankingMode === 'points' 
                          ? 'bg-gradient-to-r from-purple-400 to-pink-500'
                          : 'bg-gradient-to-r from-emerald-400 to-blue-500'
                      }`}
                      style={{
                        width: rankingMode === 'points' ? `${member.levelProgress}%` : `${member.efficiencyScore}%`
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Lifetime Points Visual Elements */}
              {rankingMode === 'lifetime' && (
                <div className="mt-4 space-y-3">
                  {/* Achievement Badges */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    {member.earnedPoints >= 100 && (
                      <div className="flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                        <Star className="w-3 h-3 mr-1" />
                        100+ Points
                      </div>
                    )}
                    {member.earnedPoints >= 500 && (
                      <div className="flex items-center px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                        <Trophy className="w-3 h-3 mr-1" />
                        500+ Points
                      </div>
                    )}
                    {member.earnedPoints >= 1000 && (
                      <div className="flex items-center px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                        <Sparkles className="w-3 h-3 mr-1" />
                        1000+ Points
                      </div>
                    )}
                    {member.earnedPoints >= 2500 && (
                      <div className="flex items-center px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                        <Award className="w-3 h-3 mr-1" />
                        2500+ Points
                      </div>
                    )}
                    {member.earnedPoints >= 5000 && (
                      <div className="flex items-center px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                        <Zap className="w-3 h-3 mr-1" />
                        5000+ Points
                      </div>
                    )}
                  </div>

                  {/* Next Milestone Progress */}
                  {(() => {
                    const milestones = [100, 500, 1000, 2500, 5000, 10000]
                    const nextMilestone = milestones.find(m => m > member.earnedPoints)
                    if (nextMilestone) {
                      const progress = (member.earnedPoints / nextMilestone) * 100
                      return (
                        <div className="text-center">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Progress to {nextMilestone} points</span>
                            <span>{progress.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-gradient-to-r from-purple-400 to-pink-500 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {nextMilestone - member.earnedPoints} points to go
                          </p>
                        </div>
                      )
                    }
                    return (
                      <div className="text-center">
                        <div className="flex items-center justify-center text-green-600">
                          <Sparkles className="w-4 h-4 mr-1" />
                          <span className="text-sm font-medium">Max Level Achieved!</span>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Efficiency Explanation */}
              {rankingMode === 'efficiency' && (
        <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
            <Award className="w-5 h-5 mr-2" />
            How Lifetime Efficiency is Calculated
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <strong>Lifetime Completion Rate (30%):</strong> Total completed vs assigned chores over all time
            </div>
            <div>
              <strong>Lifetime Timeliness (25%):</strong> Average timeliness across all completed chores
            </div>
            <div>
              <strong>Lifetime Difficulty Mastery (20%):</strong> Long-term handling of different difficulty levels
            </div>
            <div>
              <strong>Lifetime Consistency (15%):</strong> Historical streaks and long-term effort patterns
            </div>
            <div className="md:col-span-2">
              <strong>Lifetime Points Efficiency (10%):</strong> Total points earned vs potential over all time
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderProgressTab = () => (
    <div className="space-y-6">
      {/* Current User Progress */}
      {userState.currentUser && (() => {
        const currentUserStats = memberStats.find(s => s.userId === userState.currentUser?.id)
        const currentLevelData = LEVELS.find(level => level.level === currentUserStats?.currentLevel || 1)
        const nextLevelData = LEVELS.find(level => level.level === (currentUserStats?.currentLevel || 1) + 1)
        const progressToNextLevel = nextLevelData 
          ? ((currentUserStats?.earnedPoints || 0) / (nextLevelData.pointsRequired - (currentLevelData?.pointsRequired || 0))) * 100
          : 100

        return (
          <div className="bg-gradient-to-br from-indigo-50 to-purple-100 p-8 rounded-xl border border-indigo-200">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <span className="text-6xl">{currentLevelData?.icon || '🌱'}</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">
                Level {currentUserStats?.currentLevel || 1}
              </h2>
              <p className={`text-2xl font-medium mb-2 ${currentLevelData?.color || 'text-gray-600'}`}>
                {currentLevelData?.icon} {currentLevelData?.name || 'Unknown'}
              </p>
              <p className="text-lg text-gray-600">
                {currentUserStats?.earnedPoints || 0} total points earned
              </p>
            </div>

            {/* Progress to Next Level */}
            {nextLevelData && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-lg font-medium text-gray-700">Progress to Level {nextLevelData.level}</span>
                  <span className="text-lg font-medium text-indigo-600">
                    {currentUserStats?.earnedPoints || 0} / {nextLevelData.pointsRequired - (currentLevelData?.pointsRequired || 0)} points
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(progressToNextLevel, 100)}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2 text-center">
                  {nextLevelData.pointsRequired - (currentUserStats?.earnedPoints || 0)} points to next level
                </p>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">{choreState.chores.length}</div>
                <div className="text-sm text-gray-600">Total Chores</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{currentUserStats?.completedChores || 0}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{currentUserStats?.earnedPoints || 0}</div>
                <div className="text-sm text-gray-600">Points Earned</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">{currentUserStats?.currentStreak || 0}</div>
                <div className="text-sm text-gray-600">Day Streak</div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Level Journey */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Level Journey</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {LEVELS.map((level) => {
            const currentUserStats = memberStats.find(s => s.userId === userState.currentUser?.id)
            const isUnlocked = (currentUserStats?.currentLevel || 1) >= level.level
            return (
              <div 
                key={level.level}
                className={`text-center p-4 rounded-lg border-2 transition-all duration-200 ${
                  isUnlocked 
                    ? `bg-green-50 text-green-800 border-green-200` 
                    : 'bg-gray-50 text-gray-500 border-gray-200'
                }`}
              >
                <div className="text-3xl mb-2">{level.icon}</div>
                <div className="font-bold text-lg">Lv {level.level}</div>
                <div className={`text-sm truncate ${isUnlocked ? level.color : 'text-gray-500'}`}>{level.name}</div>
                {isUnlocked && (
                  <div className="mt-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )

  const renderRewardsTab = () => {
    const currentUserStats = memberStats.find(s => s.userId === userState.currentUser?.id)
    
    return (
      <div className="space-y-6">
        {/* Available Rewards */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
            Available Rewards
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {LEVELS.map((level) => {
              const isUnlocked = (currentUserStats?.currentLevel || 1) >= level.level
              return (
                <div 
                  key={level.level}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    isUnlocked 
                      ? 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">{level.icon}</div>
                    <h4 className="font-semibold text-gray-900">Level {level.level}</h4>
                    <p className={`text-sm font-medium ${level.color}`}>{level.name}</p>
                  </div>
                  
                  <div className="space-y-2">
                    {level.rewards.map((reward, index) => (
                      <div key={index} className="flex items-center text-sm">
                        {isUnlocked ? (
                          <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        ) : (
                          <Lock className="w-4 h-4 mr-2 text-gray-400" />
                        )}
                        <span className={isUnlocked ? 'text-gray-700' : 'text-gray-500'}>
                          {reward}
                        </span>
                      </div>
                    ))}
                  </div>

                  {!isUnlocked && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 text-center">
                        Unlock at Level {level.level}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">🏠 Household Dashboard</h1>
        <p className="text-xl text-gray-600">Track progress, compete, and celebrate achievements together!</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center">
        <div className="bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'overview'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Home className="w-4 h-4 inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'leaderboard'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Trophy className="w-4 h-4 inline mr-2" />
            Leaderboard
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'progress'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Progress
          </button>
          <button
            onClick={() => setActiveTab('rewards')}
            className={`px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'rewards'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Award className="w-4 h-4 inline mr-2" />
            Rewards
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverviewTab()}
      {activeTab === 'leaderboard' && renderLeaderboardTab()}
      {activeTab === 'progress' && renderProgressTab()}
      {activeTab === 'rewards' && renderRewardsTab()}

      {/* Empty State */}
      {sortedLeaderboard.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏠</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Household Members Yet</h3>
          <p className="text-gray-600">Add some family members to start competing on the leaderboard!</p>
        </div>
      )}
    </div>
  )
}
