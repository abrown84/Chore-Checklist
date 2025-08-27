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
    <div className="bg-card/80 backdrop-blur-sm rounded-lg shadow-sm border p-4">
      <div className="flex flex-wrap gap-4">
        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Status:</span>
          <div className="flex space-x-1">
            {(['all', 'pending', 'completed'] as const).map((status) => (
              <Button
                key={status}
                onClick={() => onFilterChange(status)}
                variant={filter === status ? 'default' : 'outline'}
                size="sm"
                className="capitalize"
              >
                {status}
              </Button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryFilterChange(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map((category) => (
              <option key={category} value={category} className="capitalize">
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as 'priority' | 'difficulty' | 'dueDate')}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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



