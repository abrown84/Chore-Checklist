import React from 'react'
import { Button } from '../ui/button'
import { Crown, Trophy, Star, Target, Filter } from 'lucide-react'

interface ChoreHeaderProps {
  currentLevel: number
  currentLevelPoints: number
  nextLevelPoints: number
  viewMode: 'grid' | 'list'
  groupByCategory: boolean
  onViewModeChange: (mode: 'grid' | 'list') => void
  onGroupByCategoryChange: (group: boolean) => void
}

export const ChoreHeader: React.FC<ChoreHeaderProps> = ({
  currentLevel,
  currentLevelPoints,
  nextLevelPoints,
  viewMode,
  groupByCategory,
  onViewModeChange,
  onGroupByCategoryChange
}) => {
  // Get level icon based on level
  const getLevelIcon = (level: number) => {
    if (level >= 10) return <Crown className="w-6 h-6 text-amber-600" />
    if (level >= 8) return <Crown className="w-6 h-6 text-pink-600" />
    if (level >= 6) return <Trophy className="w-6 h-6 text-red-600" />
    if (level >= 4) return <Star className="w-6 h-6 text-purple-600" />
    return <Target className="w-6 h-6 text-blue-600" />
  }

  return (
    <div className="bg-gradient-to-br from-primary/10 via-chart-4/10 to-accent/10 rounded-lg shadow-sm border border-primary/20 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {getLevelIcon(currentLevel)}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Level {currentLevel}
              </h2>
              <p className="text-sm text-gray-600">
                {currentLevelPoints} / {nextLevelPoints} points to next level
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => onViewModeChange(viewMode === 'grid' ? 'list' : 'grid')}
            variant="outline"
            size="sm"
            title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
          >
            {viewMode === 'grid' ? '📋' : '🔲'}
          </Button>
          <Button
            onClick={() => onGroupByCategoryChange(!groupByCategory)}
            variant="outline"
            size="sm"
            title={groupByCategory ? 'Ungroup chores' : 'Group by category'}
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}



