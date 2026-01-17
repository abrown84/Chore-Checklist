import React from 'react'
import { ConvexReactClient } from 'convex/react'
import { ConvexAuthProvider } from '@convex-dev/auth/react'
import { ChoreProvider, useChores } from '../contexts/ChoreContext'
import { UserProvider, useUsers } from '../contexts/UserContext'
import { StatsProvider } from '../contexts/StatsContext'
import { ThemeProvider } from '../contexts/ThemeContext'
import { DemoProvider, useDemo } from '../contexts/DemoContext'
import { RedemptionProvider } from '../contexts/RedemptionContext'
import { PWAInstallProvider } from '../contexts/PWAInstallContext'
import { useAuth } from '../hooks/useAuth'
import { useCurrentHousehold } from '../hooks/useCurrentHousehold'
import ProtectedRoute from './ProtectedRoute'
import {
  StyleProvider as A2UIStyleProvider,
  ThemeProvider as A2UIThemeProvider
} from '@zhama/a2ui'

// Initialize Convex client
const convexUrl = import.meta.env.VITE_CONVEX_URL

if (!convexUrl) {
  console.error('VITE_CONVEX_URL is not set. Please set this environment variable in Vercel.')
  throw new Error('Missing required environment variable: VITE_CONVEX_URL')
}

const convex = new ConvexReactClient(convexUrl)

// Demo stats provider that works independently
function DemoStatsProvider({ children }: { children: React.ReactNode }) {
  const { isDemoMode } = useDemo()
  
  // IMPORTANT: Always call hooks unconditionally, even if we conditionally render
  // This ensures consistent hook order across renders
  const choreState = useChores()
  const userState = useUsers()
  
  // In demo mode, we don't need the main StatsProvider
  // The demo components will use getDemoStats() directly
  if (isDemoMode) {
    return <>{children}</>
  }
  
  // In regular mode, use the main StatsProvider
  // Pass the already-fetched state to avoid re-fetching
  // Note: StatsProvider needs RedemptionProvider, so it's wrapped in RedemptionProvider
  return (
    <StatsProvider chores={choreState.state.chores} members={userState.state.members}>
      {children}
    </StatsProvider>
  )
}

// Demo mode wrapper that provides demo context
function DemoModeWrapperWithDemo({ children }: { children: React.ReactNode }) {
  const { isDemoMode, getDemoChores } = useDemo()
  const { user } = useAuth()
  const householdId = useCurrentHousehold()
  
  return (
    <UserProvider isDemoMode={isDemoMode}>
      <ChoreProvider 
        currentUserId={user?.id} 
        isDemoMode={isDemoMode} 
        getDemoChores={getDemoChores}
        householdId={householdId || undefined}
      >
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
    <A2UIStyleProvider>
      <A2UIThemeProvider>
        <ConvexAuthProvider client={convex}>
          <ThemeProvider>
            <PWAInstallProvider>
              <DemoProvider>
                <ProtectedRoute>
                  <DemoModeWrapperWithDemo>
                    {children}
                  </DemoModeWrapperWithDemo>
                </ProtectedRoute>
              </DemoProvider>
            </PWAInstallProvider>
          </ThemeProvider>
        </ConvexAuthProvider>
      </A2UIThemeProvider>
    </A2UIStyleProvider>
  )
}
