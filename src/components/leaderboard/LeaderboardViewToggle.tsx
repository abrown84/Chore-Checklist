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
    <div className="bg-muted/50 dark:bg-muted p-1.5 rounded-lg flex items-center border border-border shadow-sm">
      <button
        onClick={() => onViewChange('household')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:scale-105 flex items-center ${
          view === 'household'
            ? 'bg-primary text-primary-foreground shadow-md'
            : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent'
        }`}
      >
        <Home className="w-4 h-4 mr-1.5" />
        Household
      </button>
      <button
        onClick={() => onViewChange('global')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:scale-105 flex items-center ${
          view === 'global'
            ? 'bg-primary text-primary-foreground shadow-md'
            : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent'
        }`}
      >
        <Globe className="w-4 h-4 mr-1.5" />
        Global
      </button>
    </div>
  )
})

LeaderboardViewToggle.displayName = 'LeaderboardViewToggle'

