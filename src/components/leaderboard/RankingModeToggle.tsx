import React from 'react'
import { Star, Target, TrendUp } from '@phosphor-icons/react'
import { RANKING_MODES, RankingMode } from '../../config/constants'

interface RankingModeToggleProps {
  rankingMode: RankingMode
  onRankingModeChange: (mode: RankingMode) => void
}

export const RankingModeToggle: React.FC<RankingModeToggleProps> = React.memo(({
  rankingMode,
  onRankingModeChange,
}) => {
  const modes = [
    {
      key: RANKING_MODES.POINTS,
      label: 'Points',
      icon: Star,
      color: 'text-warning',
    },
    {
      key: RANKING_MODES.EFFICIENCY,
      label: 'Efficiency',
      icon: Target,
      color: 'text-success',
    },
    {
      key: RANKING_MODES.LIFETIME,
      label: 'Lifetime',
      icon: TrendUp,
      color: 'text-info',
    },
  ]

  return (
    <div className="bg-muted p-1 rounded-lg">
      {modes.map((mode) => (
        <button
          key={mode.key}
          onClick={() => onRankingModeChange(mode.key)}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:scale-105 ${
            rankingMode === mode.key
              ? 'bg-card text-foreground shadow-sm animate-scale-in'
              : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent'
          }`}
        >
          <mode.icon className={`w-4 h-4 inline mr-1 ${mode.color}`} />
          {mode.label}
        </button>
      ))}
    </div>
  )
})

RankingModeToggle.displayName = 'RankingModeToggle'
