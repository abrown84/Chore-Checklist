import React from 'react'
import { Button } from '../ui/button'
import { Chore } from '../../types/chore'
import { ChoreItem } from './ChoreItem'
import { Sun, Calendar, CalendarBlank, Leaf } from '@phosphor-icons/react'

// Category configuration for headers
const CATEGORY_CONFIG = {
  daily: { icon: Sun, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/40', border: 'border-emerald-200 dark:border-emerald-800' },
  weekly: { icon: Calendar, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/40', border: 'border-blue-200 dark:border-blue-800' },
  monthly: { icon: CalendarBlank, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/40', border: 'border-purple-200 dark:border-purple-800' },
  seasonal: { icon: Leaf, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/40', border: 'border-amber-200 dark:border-amber-800' }
} as const

interface ChoreDisplayProps {
  groupedChores: { [key: string]: Chore[] }
  groupByCategory: boolean
  viewMode: 'grid' | 'list'
  animatingChores: Set<string>
  completingChores: Set<string>
  onComplete: (id: string, event?: React.MouseEvent) => void
  onDelete: (id: string) => void
  onEdit?: (chore: Chore) => void
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
  onEdit,
  onAnimationComplete,
  getCategoryStats,
  filter,
  onFilterReset
}) => {
  const totalChores = Object.values(groupedChores).flat().length

  if (totalChores === 0) {
    // Different empty states based on filter
    const emptyStateConfig = {
      completed: {
        emoji: '🎉',
        title: 'No Completed Chores Yet',
        description: "You haven't completed any chores yet. Start checking off tasks to see them here!",
      },
      pending: {
        emoji: '✨',
        title: 'All Done!',
        description: "Amazing! You've completed all your chores. Time to relax or add new ones!",
      },
      all: {
        emoji: '📋',
        title: 'No Chores Found',
        description: "No chores match your current filters. Try adjusting your search criteria.",
      },
    }

    const config = emptyStateConfig[filter]

    return (
      <div className="flex flex-col items-center justify-center py-12 text-center bg-card rounded-xl border border-dashed border-border">
        <span className="text-6xl mb-4">{config.emoji}</span>
        <h3 className="text-lg font-semibold text-foreground mb-2">{config.title}</h3>
        <p className="text-muted-foreground text-sm max-w-xs mb-4">
          {config.description}
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
    <div className="space-y-8">
      {Object.entries(groupedChores).map(([category, chores]) => {
        const categoryKey = category as keyof typeof CATEGORY_CONFIG
        const config = CATEGORY_CONFIG[categoryKey]
        const CategoryIcon = config?.icon
        const stats = getCategoryStats(category)
        const completionPercent = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

        return (
        <div key={category} className="space-y-4">
          {groupByCategory && config && (
            <div className={`flex items-center justify-between p-3 rounded-lg ${config.bg} border ${config.border} transition-all duration-200`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full bg-white/50 dark:bg-black/20`}>
                  <CategoryIcon className={`w-5 h-5 ${config.color}`} />
                </div>
                <h3 className={`text-lg font-semibold capitalize ${config.color}`}>
                  {category} Chores
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm text-muted-foreground">
                  <span className={`font-medium ${config.color}`}>{stats.completed}</span>
                  <span className="text-muted-foreground/60"> / {stats.total}</span>
                </div>
                {/* Progress indicator */}
                <div className="w-16 h-2 rounded-full bg-white/50 dark:bg-black/20 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      completionPercent === 100 ? 'bg-green-500' : 'bg-current opacity-60'
                    }`}
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
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
                onEdit={onEdit}
                isAnimating={animatingChores.has(chore.id)}
                isCompleting={completingChores.has(chore.id)}
                onAnimationComplete={onAnimationComplete}
                index={index}
              />
            ))}
          </div>
        </div>
        )
      })}
    </div>
  )
}



