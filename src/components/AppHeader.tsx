import React from 'react'
import { Button } from './ui/button'
import { ThemeToggle } from './ThemeToggle'
import { LogOut, Menu, X } from 'lucide-react'
import { getDisplayName } from '../utils/convexHelpers'
import { Logo } from './Logo'
import { Badge } from './ui/badge'
import { SubscriptionBadge } from './SubscriptionBadge'

interface AppHeaderProps {
  user: any
  isDemoMode: boolean
  onSignOut: () => void
  onExitDemo: () => void
  onGoHome: () => void
  onMenuToggle?: () => void
  isMenuOpen?: boolean
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  user,
  isDemoMode,
  onSignOut,
  onExitDemo,
  onGoHome,
  onMenuToggle,
  isMenuOpen = false
}) => {
  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex justify-between items-center">
          {/* Logo and Brand */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Menu Button */}
            {onMenuToggle && (
              <Button
                onClick={onMenuToggle}
                variant="ghost"
                size="sm"
                className="md:hidden flex items-center justify-center p-2 min-h-[44px] min-w-[44px]"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </Button>
            )}
            <div 
              className="flex items-center gap-2 sm:gap-3 cursor-pointer" 
              onClick={onGoHome} 
              aria-label="Go to home"
            >
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-secondary text-foreground shadow-inner">
                <Logo className="h-8 w-8 sm:h-10 sm:w-10" />
              </div>
              <div className="text-sm sm:text-lg font-brand font-bold tracking-tight">DAILY BAG</div>
              <Badge className="ml-1 sm:ml-2 bg-amber-400 text-slate-900 text-xs">Beta</Badge>
            </div>
          </div>
          
          {/* Desktop User Info */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {isDemoMode ? (
                <span className="text-amber-600 font-medium">Demo Mode</span>
              ) : (
                <>Welcome, <span className="font-medium text-foreground">{getDisplayName(user?.name, user?.email)}</span></>
              )}
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {!isDemoMode && <SubscriptionBadge size="sm" />}
              <ThemeToggle />
              {isDemoMode && (
                <>
                  <Button 
                    onClick={onExitDemo} 
                    variant="outline" 
                    size="sm"
                    className="flex items-center border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10"
                    title="Exit Demo"
                  >
                    Exit Demo
                  </Button>
                </>
              )}
              {!isDemoMode && (
                <Button 
                  onClick={onSignOut} 
                  variant="outline" 
                  size="sm"
                  className="flex items-center border-border hover:bg-accent/50"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Tablet User Info */}
          <div className="hidden md:flex lg:hidden items-center gap-2 sm:gap-3">
            <div className="text-sm text-muted-foreground max-w-24 truncate">
              {isDemoMode ? (
                <span className="text-amber-600 font-medium">Demo Mode</span>
              ) : (
                <span className="font-medium text-foreground">{getDisplayName(user?.name, user?.email)}</span>
              )}
            </div>
            {!isDemoMode && <SubscriptionBadge size="sm" showManageLink={false} />}
            <ThemeToggle />
            {isDemoMode ? (
              <>
                <Button 
                  onClick={onExitDemo} 
                  variant="outline" 
                  size="sm"
                  className="flex items-center border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10"
                  title="Exit Demo"
                >
                  Exit
                </Button>
              </>
            ) : (
              <Button 
                onClick={onSignOut} 
                variant="outline" 
                size="sm"
                className="flex items-center border-border hover:bg-accent/50"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Mobile User Info */}
          <div className="md:hidden flex items-center gap-2 sm:gap-3">
            {!isDemoMode && <SubscriptionBadge size="sm" showManageLink={false} />}
            <ThemeToggle />
            {isDemoMode ? (
              <>
                <Button 
                  onClick={onExitDemo} 
                  variant="outline" 
                  size="sm"
                  className="flex items-center border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10"
                  title="Exit Demo"
                >
                  Exit
                </Button>
              </>
            ) : (
              <Button 
                onClick={onSignOut} 
                variant="outline" 
                size="sm"
                className="flex items-center border-border hover:bg-accent/50"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

