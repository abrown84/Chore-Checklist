import React from 'react'
import { Button } from './ui/button'
import { ThemeToggle } from './ThemeToggle'
import { List } from '@phosphor-icons/react'
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
  isDemoMode,
  onExitDemo,
  onGoHome,
  onMenuToggle,
}) => {
  return (
    <header className="shrink-0 border-b border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Menu + Logo */}
        <div className="flex items-center gap-2">
          {onMenuToggle && (
            <Button
              onClick={onMenuToggle}
              variant="ghost"
              size="sm"
              className="p-2 -ml-2"
              aria-label="Open menu"
            >
              <List className="w-5 h-5" />
            </Button>
          )}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={onGoHome}
            aria-label="Go to home"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
              <Logo className="h-5 w-5" />
            </div>
            <span className="text-sm font-brand font-bold tracking-tight">DAILY BAG</span>
            <Badge className="bg-amber-400/90 text-slate-900 text-[10px] px-1.5 py-0">Beta</Badge>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {!isDemoMode && <SubscriptionBadge size="sm" showManageLink={false} />}
          <ThemeToggle />
          {isDemoMode && (
            <Button
              onClick={onExitDemo}
              variant="outline"
              size="sm"
              className="text-xs border-amber-500/50 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10"
            >
              Exit
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
