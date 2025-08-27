import React from 'react'
import { Button } from '../ui/button'
import { Chore } from '../../types/chore'
import { ChoreItem } from './ChoreItem'

interface ChoreDisplayProps {
  groupedChores: { [key: string]: Chore[] }
  groupByCategory: boolean
  viewMode: 'grid' | 'list'
  animatingChores: Set<string>
  completingChores: Set<string>
  onComplete: (id: string, event?: React.MouseEvent) => void
  onDelete: (id: string) => void
  onAnimationComplete: (id: string) => void
  getCategoryStats: (category: string) => { total: number; completed: number; pending: number }
  filter: 'all' | 'pending' | 'completed'
  onFilterReset: () => void
}

export const ChoreDisplay: React.FC<ChoreDisplayProps> = ({
  groupedChores,
  groupByCategory,
  viewMode,
  animatingChores,
  completingChores,
  onComplete,
  onDelete,
  onAnimationComplete,
  getCategoryStats,
  filter,
  onFilterReset
}) => {
  const totalChores = Object.values(groupedChores).flat().length

  if (totalChores === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📝</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No chores found</h3>
        <p className="text-gray-600 mb-4">
          {filter === 'completed' 
            ? "You haven't completed any chores yet. Keep up the good work!"
            : filter === 'pending'
            ? "All chores are completed! Great job!"
            : "No chores match your current filters. Try adjusting your search criteria."
          }
        </p>
        {filter !== 'all' && (
          <Button
            onClick={onFilterReset}
            variant="outline"
            size="sm"
          >
            Show all chores
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedChores).map(([category, chores]) => (
        <div key={category} className="space-y-4">
          {groupByCategory && (
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 capitalize">
                {category} Chores
              </h3>
              <div className="text-sm text-gray-600">
                {getCategoryStats(category).completed} / {getCategoryStats(category).total} completed
              </div>
            </div>
          )}
          
          <div className={`grid gap-4 transition-all duration-500 ease-in-out ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {chores.map((chore, index) => (
              <ChoreItem
                key={chore.id}
                chore={chore}
                onComplete={onComplete}
                onDelete={onDelete}
                isAnimating={animatingChores.has(chore.id)}
                isCompleting={completingChores.has(chore.id)}
                onAnimationComplete={onAnimationComplete}
                index={index}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}



