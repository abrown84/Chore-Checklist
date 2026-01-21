import React from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Button } from './ui/button'
import { SignOut, X } from '@phosphor-icons/react'
import { navigationItems } from '../config/navigation'
import { Logo } from './Logo'
import { useUsers } from '../contexts/UserContext'

interface AppSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  isDemoMode: boolean
  onSignOut: () => void
  onExitDemo: () => void
  onGoHome: () => void
  user: any
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  activeTab,
  onTabChange,
  isDemoMode,
  onSignOut,
  onExitDemo,
  onGoHome,
  user,
  isMobileOpen = false,
  onMobileClose
}) => {
  const { state: userState } = useUsers()
  const isSiteAdmin = useQuery(api.siteAdmin.isSiteAdmin)

  const currentUserRole = React.useMemo(() => {
    if (!user?.id) return null
    const currentUserMember = userState.members.find(m => m.id === user.id)
    return (currentUserMember?.role || user?.role || 'member') as 'admin' | 'parent' | 'teen' | 'kid' | 'member'
  }, [user, userState.members])

  const handleTabChange = (tab: string) => {
    onTabChange(tab)
    if (onMobileClose) {
      onMobileClose()
    }
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Sidebar Header - Logo & Brand */}
      <div className="h-[72px] xl:h-[80px] px-4 xl:px-5 flex items-center justify-between border-b border-border/50 shrink-0">
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={onGoHome}
          aria-label="Go to home"
        >
          <div className="flex h-10 w-10 xl:h-11 xl:w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 shadow-sm group-hover:shadow-md transition-shadow">
            <Logo className="h-6 w-6 xl:h-7 xl:w-7" />
          </div>
          <div>
            <h2 className="text-sm xl:text-base font-brand font-bold tracking-tight text-foreground leading-tight">
              DAILY BAG
            </h2>
            <p className="text-[10px] xl:text-xs text-muted-foreground leading-tight">
              {isDemoMode ? 'Demo Mode' : 'Productivity hub'}
            </p>
          </div>
        </div>
        {/* Mobile Close Button */}
        {onMobileClose && (
          <Button
            onClick={onMobileClose}
            variant="ghost"
            size="sm"
            className="lg:hidden p-2 -mr-2"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 xl:p-4 space-y-1 overflow-y-auto">
        {navigationItems.filter(item => item.id !== 'about').map((item) => (
          <button
            key={item.id}
            onClick={() => handleTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
              activeTab === item.id
                ? 'bg-primary/10 text-primary font-medium shadow-sm'
                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
            }`}
          >
            <span className={`text-lg ${activeTab === item.id ? 'text-primary' : item.color}`}>
              {item.icon}
            </span>
            <span className="text-sm">{item.label}</span>
          </button>
        ))}

        {/* Manage Household - household admins only */}
        {!isDemoMode && currentUserRole === 'admin' && (
          <button
            onClick={() => handleTabChange('admin')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
              activeTab === 'admin'
                ? 'bg-amber-500/10 text-amber-600 font-medium shadow-sm'
                : 'text-muted-foreground hover:bg-amber-500/10 hover:text-amber-600'
            }`}
          >
            <span className="text-lg">🏠</span>
            <span className="text-sm">Manage Household</span>
          </button>
        )}

        {/* Site Admin - site admins only */}
        {!isDemoMode && isSiteAdmin && (
          <button
            onClick={() => handleTabChange('siteAdmin')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
              activeTab === 'siteAdmin'
                ? 'bg-purple-500/10 text-purple-600 font-medium shadow-sm'
                : 'text-muted-foreground hover:bg-purple-500/10 hover:text-purple-600'
            }`}
          >
            <span className="text-lg">👑</span>
            <span className="text-sm">Site Admin</span>
          </button>
        )}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-3 xl:p-4 border-t border-border/50 space-y-1">
        {/* About button */}
        <button
          onClick={() => handleTabChange('about')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
            activeTab === 'about'
              ? 'bg-primary/10 text-primary font-medium shadow-sm'
              : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
          }`}
        >
          <span className="text-lg">ℹ️</span>
          <span className="text-sm">About</span>
        </button>

        {isDemoMode ? (
          <Button
            onClick={onExitDemo}
            variant="outline"
            size="sm"
            className="w-full border-amber-500/50 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10"
          >
            Exit Demo
          </Button>
        ) : (
          <Button
            onClick={onSignOut}
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent/50"
          >
            <SignOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-60 xl:w-64 bg-card/60 backdrop-blur-sm border-r border-border/50 shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Overlay */}
      {onMobileClose && (
        <div
          className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
            isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={onMobileClose}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        </div>
      )}

      {/* Mobile Drawer */}
      {onMobileClose && (
        <aside
          className={`lg:hidden fixed top-0 left-0 h-full w-72 max-w-[85vw] bg-card/98 backdrop-blur-md border-r border-border shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
            isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {sidebarContent}
        </aside>
      )}
    </>
  )
}
