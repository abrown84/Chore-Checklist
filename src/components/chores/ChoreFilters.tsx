import React from 'react'
import { Button } from '../ui/button'

interface ChoreFiltersProps {
  filter: 'all' | 'pending' | 'completed'
  categoryFilter: string
  sortBy: 'priority' | 'difficulty' | 'dueDate'
  categories: string[]
  onFilterChange: (filter: 'all' | 'pending' | 'completed') => void
  onCategoryFilterChange: (category: string) => void
  onSortByChange: (sortBy: 'priority' | 'difficulty' | 'dueDate') => void
}

export const ChoreFilters: React.FC<ChoreFiltersProps> = ({
  filter,
  categoryFilter,
  sortBy,
  categories,
  onFilterChange,
  onCategoryFilterChange,
  onSortByChange
}) => {
  return (
    <div className="bg-card/80 backdrop-blur-sm rounded-lg shadow-sm border p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        {/* Status Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:space-x-2">
          <span className="text-sm font-medium text-gray-700">Status:</span>
          <div className="flex space-x-1 sm:space-x-2">
            {(['all', 'pending', 'completed'] as const).map((status) => (
              <Button
                key={status}
                onClick={() => onFilterChange(status)}
                variant={filter === status ? 'default' : 'outline'}
                size="sm"
                className="capitalize min-h-[44px] flex-1 sm:flex-none"
              >
                {status}
              </Button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:space-x-2">
          <span className="text-sm font-medium text-gray-700">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryFilterChange(e.target.value)}
            className="px-3 py-2 sm:py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] bg-background"
          >
            {categories.map((category) => (
              <option key={category} value={category} className="capitalize">
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:space-x-2">
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as 'priority' | 'difficulty' | 'dueDate')}
            className="px-3 py-2 sm:py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] bg-background"
          >
            <option value="priority">Priority</option>
            <option value="difficulty">Difficulty</option>
            <option value="dueDate">Due Date</option>
          </select>
        </div>
      </div>
    </div>
  )
}



