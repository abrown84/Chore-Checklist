import React, { useState, useEffect } from 'react'
import { Toaster } from 'sonner'
import { ChoreList } from './components/ChoreList'
import { AddChoreForm } from './components/AddChoreForm'
import { ChoreProgress } from './components/ChoreProgress'
import { PointsCounter } from './components/PointsCounter'
import { ProfileAndRewards } from './components/ProfileAndRewards'
import { HouseholdManager } from './components/HouseholdManager'
import { useAuth } from './hooks/useAuth'
import { Button } from './components/ui/button'
import { ChoreProvider, useChores } from './contexts/ChoreContext'
import { UserProvider, useUsers } from './contexts/UserContext'
import { StatsProvider } from './contexts/StatsContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { LevelUpCelebration } from './components/LevelUpCelebration'
import { Leaderboard } from './components/Leaderboard'

import { PointRedemption } from './components/PointRedemption'
import ProtectedRoute from './components/ProtectedRoute'
import { ErrorBoundary } from './components/ErrorBoundary'

import { ThemeToggle } from './components/ThemeToggle'
import { Trophy, Users, DollarSign, ClipboardList, LogOut, Trash2, Palette } from 'lucide-react'
import newLogo from './brand_assets/DGlogo.png'

function AppContent() {
  const { user, signOut } = useAuth()
  const { clearChoreState } = useChores()
  const { syncWithAuth, resetUserState } = useUsers()
  const [activeTab, setActiveTab] = useState('chores')
  


  // Sync authentication state with UserContext when user changes
  useEffect(() => {
    if (user) {
      syncWithAuth(user)
    }
  }, [user, syncWithAuth])

  const handleSignOut = () => {
    try {
      // CRITICAL: Don't reset user state - this preserves user levels and chore history
      // resetUserState() - REMOVED: This was causing level reset on logout/login
      
      // Don't clear chore state - this preserves chore completion history and points
      // clearChoreState() - REMOVED: This was causing chore data loss
      
      // Call signOut to clear auth state only (chores and levels persist in localStorage)
      signOut()
    } catch (error) {
      console.error('Error during sign out:', error)
      // Force sign out even if there's an error
      signOut()
    }
  }

  const handleClearCredentials = () => {
    // Clear stored credentials by removing from localStorage
    localStorage.removeItem('choreAppUser')
    localStorage.removeItem('choreAppUsers')
    localStorage.removeItem('chores')
    
    // Clear all application state - this is intentional data clearing
    clearChoreState()
    resetUserState()
    signOut()
  }



  const navigationItems = [
    { id: 'chores', label: 'Chores', icon: ClipboardList, color: 'text-primary' },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, color: 'text-warning' },
    { id: 'household', label: 'Household', icon: Users, color: 'text-success' },
    { id: 'profile', label: 'Profile & Rewards', icon: Palette, color: 'text-chart-4' },
    { id: 'redemption', label: 'Redemption', icon: DollarSign, color: 'text-success' }
  ]

  



  return (
    <div className="min-h-screen bg-background">
        <Toaster position="top-right" />
        
        {/* Header */}
        <header className="bg-card shadow-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer" onClick={() => setActiveTab('chores')} aria-label="Go to home">
                  <img src={newLogo} alt="The Daily Grind" className="h-6 w-6 sm:h-8 sm:w-8" />
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-brand font-bold text-foreground">The Daily Grind</h1>
                </div>
              </div>
              
              {/* Desktop User Info */}
              <div className="hidden lg:flex items-center space-x-4">
                <div className="text-sm text-muted-foreground">
                  Welcome, <span className="font-medium text-foreground">{user?.name || user?.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ThemeToggle />
                  <Button 
                    onClick={handleSignOut} 
                    variant="outline" 
                    size="sm"
                    className="flex items-center"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                  {user?.role === 'admin' && (
                    <Button 
                      onClick={handleClearCredentials}
                      variant="destructive"
                      size="sm"
                      className="flex items-center space-x-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden xl:inline">Clear Saved Data</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Tablet User Info */}
              <div className="hidden md:flex lg:hidden items-center space-x-2">
                <div className="text-sm text-muted-foreground max-w-24 truncate">
                  <span className="font-medium text-foreground">{user?.name || user?.email}</span>
                </div>
                <ThemeToggle />
                <Button 
                  onClick={handleSignOut} 
                  variant="outline" 
                  size="sm"
                  className="flex items-center"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>

              {/* Mobile User Info */}
              <div className="md:hidden flex items-center space-x-1">
                <ThemeToggle />
                <Button 
                  onClick={handleSignOut} 
                  variant="outline" 
                  size="sm"
                  className="flex items-center"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

                          {/* Layout Container */}
       <div className="flex min-h-[calc(100vh-4rem)]">
         {/* Sidebar Navigation - Desktop Only */}
         <div className="hidden lg:block w-64 xl:w-72 bg-card shadow-lg">
           <div className="flex flex-col h-full">
             {/* Sidebar Header */}
             <div className="p-4 xl:p-6 border-b border-border">
               <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTab('chores')} aria-label="Go to home">
                <img src={newLogo} alt="The Daily Grind" className="h-6 w-6" />
                <h2 className="text-base xl:text-lg font-brand font-semibold text-foreground">Daily Grind</h2>
              </div>
              <p className="text-xs xl:text-sm text-muted-foreground mt-1">Your daily productivity hub</p>
             </div>

             {/* Navigation Items */}
             <nav className="flex-1 p-3 xl:p-4 space-y-1 xl:space-y-2">
               {navigationItems.map((item) => {
                 const Icon = item.icon
                 return (
                   <button
                     key={item.id}
                     onClick={() => setActiveTab(item.id)}
                                         className={`w-full flex items-center space-x-2 xl:space-x-3 px-3 xl:px-4 py-2 xl:py-3 rounded-lg text-left transition-all duration-200 ${
                      activeTab === item.id
                        ? 'bg-primary/10 border border-primary/20 text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                   >
                     <Icon className={`w-4 h-4 xl:w-5 xl:h-5 ${activeTab === item.id ? 'text-primary' : item.color}`} />
                     <span className="font-body font-medium text-sm xl:text-base">{item.label}</span>
                   </button>
                 )
               })}
             </nav>

             {/* Sidebar Footer */}
             <div className="p-3 xl:p-4 border-t border-border">
               <div className="space-y-2">
                  <Button 
                    onClick={handleSignOut} 
                    variant="outline" 
                    size="sm"
                    className="w-full flex items-center justify-center text-sm"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>Sign Out</span>
                  </Button>
                  {user?.role === 'admin' && (
                    <Button 
                      onClick={handleClearCredentials}
                      variant="destructive"
                      size="sm"
                      className="w-full flex items-center justify-center space-x-2 text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden xl:inline">Clear Saved Data</span>
                    </Button>
                  )}
                </div>
              </div>
           </div>
         </div>

         {/* Main Content */}
         <main className="flex-1 transition-all duration-300 min-w-0">
           <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8 pb-20 lg:pb-8">

        {/* Tab Content */}
        {activeTab === 'chores' && (
          <div className="space-y-8">
            {/* Points Counter */}
            <PointsCounter />
            
            {/* Chore Progress */}
            <ChoreProgress />
            
            {/* Removed Approval Queue - chores no longer need approval */}
            
            {/* Chore List */}
            <ChoreList />
            
            
            
            {/* Add Chore Form - Moved to bottom */}
            <AddChoreForm />
            
            {/* Celebration Components */}
            {/* <ChoreCelebration /> */}
            {/* LevelUpCelebration is mounted once globally at the bottom to prevent duplicate triggers */}
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

        {activeTab === 'profile' && (
          <div className="space-y-6">
            <ProfileAndRewards />
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

  {/* Bottom Floating Menu - Mobile and Tablet */}
  <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50">
    <div className="flex justify-around items-center py-1 sm:py-2">
      {navigationItems.map((item) => {
        const Icon = item.icon
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center space-y-0.5 sm:space-y-1 px-1 sm:px-2 py-1.5 sm:py-2 rounded-lg transition-all duration-200 ${
              activeTab === item.id
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${activeTab === item.id ? 'text-primary' : item.color}`} />
            <span className="text-xs font-body font-medium hidden sm:inline">{item.label}</span>
            <span className="text-xs font-body font-medium sm:hidden">{item.label.split(' ')[0]}</span>
          </button>
        )
      })}
    </div>
  </div>

  {/* Celebrations */}
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
    <ErrorBoundary>
      <ThemeProvider>
        <UserProvider>
          <ProtectedRoute>
            <ChoreProviderWrapper>
              <AppContent />
            </ChoreProviderWrapper>
          </ProtectedRoute>
        </UserProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

// Wrapper component to provide chore context with current user ID
function ChoreProviderWrapper({ children }: { children: React.ReactNode }) {
  // Get currentUserId from authentication state instead of UserContext to avoid circular dependency
  const { user } = useAuth()
  const currentUserId = user?.id
  
  return (
    <ChoreProvider currentUserId={currentUserId}>
      <StatsWrapper>
        {children}
      </StatsWrapper>
    </ChoreProvider>
  )
}
