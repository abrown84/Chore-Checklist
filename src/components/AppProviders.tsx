import React from 'react'
import { ChoreProvider, useChores } from '../contexts/ChoreContext'
import { UserProvider, useUsers } from '../contexts/UserContext'
import { StatsProvider } from '../contexts/StatsContext'
import { ThemeProvider } from '../contexts/ThemeContext'
import { DemoProvider, useDemo } from '../contexts/DemoContext'
import { RedemptionProvider } from '../contexts/RedemptionContext'
import { useAuth } from '../hooks/useAuth'
import ProtectedRoute from './ProtectedRoute'

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

// Demo stats provider that works independently
function DemoStatsProvider({ children }: { children: React.ReactNode }) {
  const { isDemoMode } = useDemo()
  
  // In demo mode, we don't need the main StatsProvider
  // The demo components will use getDemoStats() directly
  if (isDemoMode) {
    return <>{children}</>
  }
  
  // In regular mode, use the main StatsProvider
  return <StatsWrapper>{children}</StatsWrapper>
}

// Demo mode wrapper that provides demo context
function DemoModeWrapperWithDemo({ children }: { children: React.ReactNode }) {
  const { isDemoMode, getDemoChores } = useDemo()
  const { user } = useAuth()
  
  return (
    <UserProvider isDemoMode={isDemoMode}>
      <ChoreProvider currentUserId={user?.id} isDemoMode={isDemoMode} getDemoChores={getDemoChores}>
        <DemoStatsProvider>
          <RedemptionProvider>
            {children}
          </RedemptionProvider>
        </DemoStatsProvider>
      </ChoreProvider>
    </UserProvider>
  )
}

interface AppProvidersProps {
  children: React.ReactNode
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ThemeProvider>
      <DemoProvider>
        <ProtectedRoute>
          <DemoModeWrapperWithDemo>
            {children}
          </DemoModeWrapperWithDemo>
        </ProtectedRoute>
      </DemoProvider>
    </ThemeProvider>
  )
}
