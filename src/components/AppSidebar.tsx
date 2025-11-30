import React from 'react'
import { Button } from './ui/button'
import { LogOut, X } from 'lucide-react'
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
  
  // Get current user's household membership role (this is what determines admin permissions)
  const currentUserRole = React.useMemo(() => {
    if (!user?.id) return null
    const currentUserMember = userState.members.find(m => m.id === user.id)
    return (currentUserMember?.role || user?.role || 'member') as 'admin' | 'parent' | 'teen' | 'kid' | 'member'
  }, [user, userState.members])
  
  const handleTabChange = (tab: string) => {
    onTabChange(tab)
    // Close mobile menu when a tab is selected
    if (onMobileClose) {
      onMobileClose()
    }
  }

  const sidebarContent = (
      <div className="flex flex-col h-full">
        {/* Sidebar Header */}
        <div className="p-4 xl:p-6 border-b border-border bg-card/20">
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center space-x-2 cursor-pointer" 
              onClick={onGoHome} 
              aria-label="Go to home"
            >
              <div className="flex h-12 w-12 xl:h-14 xl:w-14 items-center justify-center rounded-xl bg-secondary text-foreground shadow-inner">
                <Logo className="h-8 w-8 xl:h-10 xl:w-10" />
              </div>
              <h2 className="text-sm sm:text-base xl:text-lg font-brand font-bold tracking-tight text-foreground">
                DAILY BAG
              </h2>
            </div>
            {/* Mobile Close Button */}
            {onMobileClose && (
              <Button
                onClick={onMobileClose}
                variant="ghost"
                size="sm"
                className="lg:hidden p-2"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
          <p className="text-xs xl:text-sm text-muted-foreground mt-1">
            {isDemoMode ? '🎮 Demo Mode' : 'Your daily productivity hub'}
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 xl:p-4 space-y-1 xl:space-y-2 overflow-y-auto">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`w-full flex items-center space-x-2 xl:space-x-3 px-3 xl:px-4 py-3 xl:py-3 rounded-lg text-left transition-all duration-200 min-h-[48px] ${
                activeTab === item.id
                  ? 'bg-primary/10 border border-primary/20 text-primary shadow-sm'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground hover:shadow-sm'
              }`}
            >
              <span className={`text-lg sm:text-xl ${activeTab === item.id ? 'text-primary' : item.color}`}>
                {item.icon}
              </span>
              <span className="font-body font-medium text-sm sm:text-base xl:text-base">{item.label}</span>
            </button>
          ))}
          {/* Admin Control Panel - Only visible to admins */}
          {!isDemoMode && currentUserRole === 'admin' && (
            <button
              onClick={() => handleTabChange('admin')}
              className={`w-full flex items-center space-x-2 xl:space-x-3 px-3 xl:px-4 py-3 xl:py-3 rounded-lg text-left transition-all duration-200 min-h-[48px] ${
                activeTab === 'admin'
                  ? 'bg-amber-500/10 border border-amber-500/20 text-amber-600 shadow-sm'
                  : 'text-muted-foreground hover:bg-amber-500/10 hover:text-amber-600 hover:shadow-sm'
              }`}
            >
              <span className={`text-lg sm:text-xl ${activeTab === 'admin' ? 'text-amber-600' : 'text-amber-500'}`}>
                ⚙️
              </span>
              <span className="font-body font-medium text-sm sm:text-base xl:text-base">Admin Panel</span>
            </button>
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 xl:p-4 border-t border-border bg-card/20">
          <div className="space-y-2">
            {isDemoMode ? (
              <Button 
                onClick={onExitDemo} 
                variant="outline" 
                size="sm"
                className="w-full flex items-center justify-center text-sm border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 min-h-[48px]"
                title="Exit Demo"
              >
                Exit Demo
              </Button>
            ) : (
              <Button 
                onClick={onSignOut} 
                variant="outline" 
                size="sm"
                className="w-full flex items-center justify-center text-sm border-border hover:bg-accent/50 min-h-[48px]"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span>Sign Out</span>
              </Button>
            )}
          </div>
        </div>
      </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 xl:w-72 bg-card/40 backdrop-blur-sm border-r border-border shadow-lg">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar Overlay */}
      {onMobileClose && (
        <div
          className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
            isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={onMobileClose}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}

      {/* Mobile Sidebar Drawer */}
      {onMobileClose && (
        <div
          className={`lg:hidden fixed top-0 left-0 h-full w-64 xl:w-72 bg-card/95 backdrop-blur-md border-r border-border shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
            isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {sidebarContent}
        </div>
      )}
    </>
  )
}
