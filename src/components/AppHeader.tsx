import React from 'react'
import { Button } from './ui/button'
import { ThemeToggle } from './ThemeToggle'
import { PWAStatus } from './PWAStatus'
import { LogOut, Trash2 } from 'lucide-react'
import newLogo from '../brand_assets/DGlogo.png'

interface AppHeaderProps {
  user: any
  isDemoMode: boolean
  onSignOut: () => void
  onClearCredentials: () => void
  onExitDemo: () => void
  onGoHome: () => void
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  user,
  isDemoMode,
  onSignOut,
  onClearCredentials,
  onExitDemo,
  onGoHome
}) => {
  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-card/40 border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div 
              className="flex items-center space-x-2 sm:space-x-3 cursor-pointer" 
              onClick={onGoHome} 
              aria-label="Go to home"
            >
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-secondary text-foreground shadow-inner">
                <img src={newLogo} alt="The Daily Grind" className="h-4 w-4 sm:h-6 sm:w-6" />
              </div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-brand font-bold text-foreground">
                The Daily Grind
              </h1>
            </div>
          </div>
          
          {/* Desktop User Info */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              {isDemoMode ? (
                <span className="text-amber-600 font-medium">Demo Mode</span>
              ) : (
                <>Welcome, <span className="font-medium text-foreground">{user?.name || user?.email}</span></>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <PWAStatus />
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
                  <Button 
                    onClick={() => {
                      if (confirm('Reset demo mode? This will clear all demo data and refresh the page.')) {
                        localStorage.removeItem('demoMode')
                        localStorage.removeItem('chores')
                        localStorage.removeItem('userStats')
                        localStorage.removeItem('levelPersistence')
                        window.location.reload()
                      }
                    }}
                    variant="outline" 
                    size="sm"
                    className="flex items-center border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/10"
                    title="Reset Demo"
                  >
                    Reset Demo
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
              {!isDemoMode && user?.role === 'admin' && (
                <Button 
                  onClick={onClearCredentials}
                  variant="destructive"
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden xl:inline">Clear Data</span>
                </Button>
              )}
            </div>
          </div>

          {/* Tablet User Info */}
          <div className="hidden md:flex lg:hidden items-center space-x-2">
            <div className="text-sm text-muted-foreground max-w-24 truncate">
              {isDemoMode ? (
                <span className="text-amber-600 font-medium">Demo Mode</span>
              ) : (
                <span className="font-medium text-foreground">{user?.name || user?.email}</span>
              )}
            </div>
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
                <Button 
                  onClick={() => {
                    if (confirm('Reset demo mode? This will clear all demo data and refresh the page.')) {
                      localStorage.removeItem('demoMode')
                      localStorage.removeItem('chores')
                      localStorage.removeItem('userStats')
                      localStorage.removeItem('levelPersistence')
                      window.location.reload()
                    }
                  }}
                  variant="outline" 
                  size="sm"
                  className="flex items-center border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/10"
                  title="Reset Demo"
                >
                  Reset
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
          <div className="md:hidden flex items-center space-x-1">
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
                <Button 
                  onClick={() => {
                    if (confirm('Reset demo mode? This will clear all demo data and refresh the page.')) {
                      localStorage.removeItem('demoMode')
                      localStorage.removeItem('chores')
                      localStorage.removeItem('userStats')
                      localStorage.removeItem('levelPersistence')
                      window.location.reload()
                    }
                  }}
                  variant="outline" 
                  size="sm"
                  className="flex items-center border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/10"
                  title="Reset Demo"
                >
                  Reset
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

