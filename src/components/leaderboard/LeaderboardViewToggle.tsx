import React from 'react'
import { Home, Globe } from 'lucide-react'

export type LeaderboardView = 'household' | 'global'

interface LeaderboardViewToggleProps {
  view: LeaderboardView
  onViewChange: (view: LeaderboardView) => void
}

export const LeaderboardViewToggle: React.FC<LeaderboardViewToggleProps> = React.memo(({
  view,
  onViewChange,
}) => {
  return (
    <div className="bg-muted/80 dark:bg-muted/80 p-1 rounded-lg flex items-center border-2 border-primary/30 shadow-lg">
      <button
        onClick={() => onViewChange('household')}
        className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-all duration-200 hover:scale-105 flex items-center ${
          view === 'household'
            ? 'bg-primary text-primary-foreground shadow-md'
            : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50'
        }`}
      >
        <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
        <span className="hidden sm:inline">Household</span>
        <span className="sm:hidden">Home</span>
      </button>
      <button
        onClick={() => onViewChange('global')}
        className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-all duration-200 hover:scale-105 flex items-center ${
          view === 'global'
            ? 'bg-primary text-primary-foreground shadow-md'
            : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50'
        }`}
      >
        <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
        Global
      </button>
    </div>
  )
})

LeaderboardViewToggle.displayName = 'LeaderboardViewToggle'

