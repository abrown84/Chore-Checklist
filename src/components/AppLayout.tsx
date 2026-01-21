import React from 'react'
import { AppSidebar } from './AppSidebar'
import { NavigationProvider } from '../contexts/NavigationContext'
import { ThemeToggle } from './ThemeToggle'
import { SubscriptionBadge } from './SubscriptionBadge'
import { Button } from './ui/button'
import { SignOut } from '@phosphor-icons/react'
import { getDisplayName } from '../utils/convexHelpers'

interface AppLayoutProps {
  children: React.ReactNode
  activeTab: string
  onTabChange: (tab: string) => void
  isDemoMode: boolean
  onSignOut: () => void
  onExitDemo: () => void
  onGoHome: () => void
  user: any
  isMobileMenuOpen?: boolean
  onMobileMenuClose?: () => void
}

export function AppLayout({
  children,
  activeTab,
  onTabChange,
  isDemoMode,
  onSignOut,
  onExitDemo,
  onGoHome,
  user,
  isMobileMenuOpen = false,
  onMobileMenuClose
}: AppLayoutProps) {
  return (
    <NavigationProvider onTabChange={onTabChange}>
      <div className="flex-1 flex min-h-0">
        {/* Background gradient */}
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_0%,rgba(14,165,233,0.18),transparent_60%),radial-gradient(40%_30%_at_80%_20%,rgba(139,92,246,0.14),transparent_60%),radial-gradient(30%_30%_at_20%_60%,rgba(234,179,8,0.12),transparent_60%)] dark:bg-[radial-gradient(60%_40%_at_50%_0%,rgba(14,165,233,0.18),transparent_60%),radial-gradient(40%_30%_at_80%_20%,rgba(139,92,246,0.14),transparent_60%),radial-gradient(30%_30%_at_20%_60%,rgba(234,179,8,0.12),transparent_60%)]" />
        </div>

        {/* Sidebar */}
        <AppSidebar
          activeTab={activeTab}
          onTabChange={onTabChange}
          isDemoMode={isDemoMode}
          onSignOut={onSignOut}
          onExitDemo={onExitDemo}
          onGoHome={onGoHome}
          user={user}
          isMobileOpen={isMobileMenuOpen}
          onMobileClose={onMobileMenuClose}
        />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Desktop Top Bar - matches sidebar header height */}
          <div className="hidden lg:flex h-[72px] xl:h-[80px] items-center justify-end gap-3 px-6 border-b border-border/50 bg-background/50 backdrop-blur-sm shrink-0">
            <span className="text-sm text-muted-foreground mr-auto">
              {isDemoMode ? (
                <span className="text-amber-600 font-medium">Demo Mode</span>
              ) : (
                <>Welcome, <span className="font-medium text-foreground">{getDisplayName(user?.name, user?.email)}</span></>
              )}
            </span>
            {!isDemoMode && <SubscriptionBadge size="sm" />}
            <ThemeToggle />
            {isDemoMode ? (
              <Button
                onClick={onExitDemo}
                variant="outline"
                size="sm"
                className="border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10"
              >
                Exit Demo
              </Button>
            ) : (
              <Button
                onClick={onSignOut}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
                title="Sign Out"
              >
                <SignOut className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-auto">
            <div className="min-h-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </NavigationProvider>
  )
}
