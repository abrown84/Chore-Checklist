import { useState } from 'react'
import { Toaster } from 'sonner'
import { ChoreList } from './components/ChoreList'
import { AddChoreForm } from './components/AddChoreForm'
import { ChoreProgress } from './components/ChoreProgress'
import { ChoreCelebration } from './components/ChoreCelebration'
import { PointsCounter } from './components/PointsCounter'
import { RewardSystem } from './components/RewardSystem'
import { HouseholdManager } from './components/HouseholdManager'
import { AuthForm } from './components/AuthForm'
import { useAuth } from './hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Button } from './components/ui/button'
import { ChoreProvider, useChores } from './contexts/ChoreContext'
import { UserProvider, useUsers } from './contexts/UserContext'
import { StatsProvider } from './contexts/StatsContext'
import { LevelUpCelebration } from './components/LevelUpCelebration'
import { Leaderboard } from './components/Leaderboard'
import { DebugPoints } from './components/DebugPoints'
import { PointRedemption } from './components/PointRedemption'
import { Trophy, Users, Gift, DollarSign, ClipboardList } from 'lucide-react'

function AppContent() {
  const { user, signIn, signUp, signOut } = useAuth()
     const { resetChores } = useChores()
     const [activeTab, setActiveTab] = useState('chores')

  const navigationItems = [
    { id: 'chores', label: 'Chores', icon: ClipboardList, color: 'text-blue-600' },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, color: 'text-yellow-600' },
    { id: 'household', label: 'Household', icon: Users, color: 'text-green-600' },
    { id: 'rewards', label: 'Rewards', icon: Gift, color: 'text-purple-600' },
    { id: 'redemption', label: 'Redemption', icon: DollarSign, color: 'text-emerald-600' }
  ]

  const handleResetChores = () => {
    resetChores()
  }

  const handleInspectStorage = () => {
    const chores = localStorage.getItem('chores')
    const users = localStorage.getItem('users')
    console.log('Local Storage - Chores:', chores ? JSON.parse(chores) : 'No chores')
    console.log('Local Storage - Users:', users ? JSON.parse(users) : 'No users')
  }

  

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">🏠 Chore Checklist</h1>
            <p className="text-gray-600">Manage household chores with points and rewards!</p>
          </div>
          <AuthForm onSignIn={signIn} onSignUp={signUp} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">🏠 Chore Checklist</h1>
            </div>
            
            {/* Desktop User Info */}
            <div className="hidden md:flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user.name || user.email}
              </span>
              <Button onClick={signOut} variant="outline" size="sm">
                Sign Out
              </Button>
            </div>

                         {/* Mobile User Info */}
             <div className="md:hidden flex items-center space-x-2">
               <span className="text-sm text-gray-600">
                 {user.name || user.email}
               </span>
             </div>
          </div>
        </div>
      </header>

             {/* Layout Container */}
       <div className="flex">
         {/* Sidebar Navigation - Desktop Only */}
         <div className="hidden md:block w-64 bg-white shadow-lg">
           <div className="flex flex-col h-full">
             {/* Sidebar Header */}
             <div className="p-6 border-b border-gray-200">
               <h2 className="text-lg font-semibold text-gray-900">🏠 Chore Hub</h2>
               <p className="text-sm text-gray-600">Manage your household</p>
             </div>

             {/* Navigation Items */}
             <nav className="flex-1 p-4 space-y-2">
               {navigationItems.map((item) => {
                 const Icon = item.icon
                 return (
                   <button
                     key={item.id}
                     onClick={() => setActiveTab(item.id)}
                     className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                       activeTab === item.id
                         ? 'bg-blue-50 border border-blue-200 text-blue-900'
                         : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                     }`}
                   >
                     <Icon className={`w-5 h-5 ${activeTab === item.id ? 'text-blue-600' : item.color}`} />
                     <span className="font-medium">{item.label}</span>
                   </button>
                 )
               })}
             </nav>

             {/* Sidebar Footer */}
             <div className="p-4 border-t border-gray-200">
               <Button 
                 onClick={signOut} 
                 variant="outline" 
                 className="w-full"
               >
                 Sign Out
               </Button>
             </div>
           </div>
         </div>

                 {/* Main Content */}
         <main className="flex-1 transition-all duration-300">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Tab Content */}
        {activeTab === 'chores' && (
          <div className="space-y-8">
            {/* Points Counter */}
            <PointsCounter />
            
            {/* Add Chore Form */}
            <AddChoreForm />
            
            {/* Chore Progress */}
            <ChoreProgress />
            
            {/* Chore List */}
            <ChoreList />
            
            {/* Debug Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Debug Controls</CardTitle>
                <CardDescription>Development and testing tools</CardDescription>
              </CardHeader>
              <CardContent className="flex space-x-4">
                <Button onClick={handleResetChores} variant="outline">
                  Reset Chores
                </Button>
                <Button onClick={handleInspectStorage} variant="outline">
                  Inspect Storage
                </Button>
              </CardContent>
            </Card>

            {/* Debug Points Component */}
            <DebugPoints />
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            <Leaderboard />
          </div>
        )}

        {activeTab === 'household' && (
          <div className="space-y-6">
            <HouseholdManager />
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="space-y-6">
            <RewardSystem />
          </div>
        )}

        {activeTab === 'redemption' && (
          <div className="space-y-6">
            <PointRedemption />
          </div>
        )}
                 </div>
               </main>
             </div>

                   {/* Bottom Floating Menu - Mobile Only */}
             <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
               <div className="flex justify-around items-center py-2">
                 {navigationItems.map((item) => {
                   const Icon = item.icon
                   return (
                     <button
                       key={item.id}
                       onClick={() => setActiveTab(item.id)}
                       className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                         activeTab === item.id
                           ? 'text-blue-600 bg-blue-50'
                           : 'text-gray-600 hover:text-gray-900'
                       }`}
                     >
                       <Icon className={`w-6 h-6 ${activeTab === item.id ? 'text-blue-600' : item.color}`} />
                       <span className="text-xs font-medium">{item.label}</span>
                     </button>
                   )
                 })}
               </div>
             </div>

             {/* Celebrations */}
             <ChoreCelebration />
             <LevelUpCelebration />
           </div>
         )
}

// Wrapper component to provide stats context with data from other contexts
function StatsWrapper({ children }: { children: React.ReactNode }) {
  const { state: choreState } = useChores()
  const { state: userState } = useUsers()
  
  return (
    <StatsProvider chores={choreState.chores} members={userState.members}>
      {children}
    </StatsProvider>
  )
}

export default function App() {
  return (
    <UserProvider>
      <ChoreProviderWrapper>
        <StatsWrapper>
          <AppContent />
        </StatsWrapper>
      </ChoreProviderWrapper>
    </UserProvider>
  )
}

// Wrapper component to provide chore context with current user ID
function ChoreProviderWrapper({ children }: { children: React.ReactNode }) {
  const { state: userState } = useUsers()
  const currentUserId = userState.currentUser?.id
  
  return (
    <ChoreProvider currentUserId={currentUserId}>
      {children}
    </ChoreProvider>
  )
}
