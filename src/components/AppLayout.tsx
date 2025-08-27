import React from 'react'
import { AppSidebar } from './AppSidebar'

interface AppLayoutProps {
  children: React.ReactNode
  activeTab: string
  onTabChange: (tab: string) => void
  isDemoMode: boolean
  onSignOut: () => void
  onClearCredentials: () => void
  onExitDemo: () => void
  onGoHome: () => void
  user: any
}

export function AppLayout({
  children,
  activeTab,
  onTabChange,
  isDemoMode,
  onSignOut,
  onClearCredentials,
  onExitDemo,
  onGoHome,
  user
}: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Background gradient matching LandingPage and AuthForm */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_0%,rgba(14,165,233,0.18),transparent_60%),radial-gradient(40%_30%_at_80%_20%,rgba(139,92,246,0.14),transparent_60%),radial-gradient(30%_30%_at_20%_60%,rgba(234,179,8,0.12),transparent_60%)] dark:bg-[radial-gradient(60%_40%_at_50%_0%,rgba(14,165,233,0.18),transparent_60%),radial-gradient(40%_30%_at_80%_20%,rgba(139,92,246,0.14),transparent_60%),radial-gradient(30%_30%_at_20%_60%,rgba(234,179,8,0.12),transparent_60%)]" />
      </div>

      <div className="flex h-screen">
        {/* Sidebar */}
        <AppSidebar
          activeTab={activeTab}
          onTabChange={onTabChange}
          isDemoMode={isDemoMode}
          onSignOut={onSignOut}
          onClearCredentials={onClearCredentials}
          onExitDemo={onExitDemo}
          onGoHome={onGoHome}
          user={user}
        />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="min-h-full p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
