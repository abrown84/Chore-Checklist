import React, { useEffect, memo } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { Chore, DIFFICULTY_COLORS, PRIORITY_COLORS, CATEGORY_COLORS } from '../../types/chore'
import { CheckCircle, Trash2, Calendar, Clock } from 'lucide-react'
import { isOverdue as checkIsOverdue, getCurrentDueStatus, normalizeDueDate } from '../../utils/dateHelpers'

interface ChoreItemProps {
  chore: Chore
  onComplete: (id: string, event?: React.MouseEvent) => void
  onDelete: (id: string) => void
  isAnimating: boolean
  isCompleting: boolean
  onAnimationComplete: (id: string) => void
  index: number
}

export const ChoreItem = memo<ChoreItemProps>(({ 
  chore, 
  onComplete, 
  onDelete, 
  isAnimating, 
  isCompleting, 
  onAnimationComplete, 
  index 
}) => {
  const isOverdue = chore.dueDate ? checkIsOverdue(chore.dueDate) : false
  const dueStatus = chore.dueDate ? getCurrentDueStatus(chore.dueDate) : null
  
  // Handle animation completion
  useEffect(() => {
    if (isCompleting) {
      const timer = setTimeout(() => {
        onAnimationComplete(chore.id)
      }, 500) // Fade out duration
      return () => clearTimeout(timer)
    }
  }, [isCompleting, chore.id, onAnimationComplete])
  
  return (
    <div
      className={`transition-all duration-500 ease-in-out ${
        isCompleting 
          ? 'opacity-0 scale-95 -translate-y-2 max-h-0 overflow-hidden' 
          : 'opacity-100 scale-100 translate-y-0 max-h-[500px]'
      }`}
      style={{
        transitionDelay: isCompleting ? '0ms' : `${index * 50}ms`
      }}
    >
      <Card 
        className={`transition-all duration-300 bg-card/80 backdrop-blur-sm border ${
          isAnimating ? 'scale-105 shadow-lg' : 'hover:shadow-md'
        } ${
          chore.completed 
            ? 'bg-success/10 border-success/30 dark:bg-success/10 dark:border-success/30' 
            : isOverdue 
              ? 'bg-destructive/10 border-destructive/30 dark:bg-destructive/10 dark:border-destructive/30' 
              : `${CATEGORY_COLORS[chore.category]} hover:shadow-lg`
        } ${
          !chore.completed ? 'cursor-pointer' : 'cursor-default'
        }`}
        onClick={(e) => !chore.completed && onComplete(chore.id, e)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className={`font-semibold text-lg ${
                  chore.completed ? 'line-through text-gray-500' : 'text-gray-900'
                }`}>
                  {chore.title}
                </h3>
                {chore.completed && chore.bonusMessage && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {chore.bonusMessage}
                  </span>
                )}
              </div>
              
              <p className={`text-sm mb-3 ${
                chore.completed ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {chore.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  DIFFICULTY_COLORS[chore.difficulty]
                }`}>
                  {chore.difficulty}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  PRIORITY_COLORS[chore.priority]
                }`}>
                  {chore.priority}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  chore.category === 'daily' ? 'bg-emerald-100 text-emerald-800' :
                  chore.category === 'weekly' ? 'bg-blue-100 text-blue-800' :
                  chore.category === 'monthly' ? 'bg-purple-100 text-purple-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {chore.category}
                </span>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                  {chore.points} pts
                </span>
              </div>
              
              {chore.dueDate && (
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                  <Calendar className="w-4 h-4" />
                  <span>Due: {normalizeDueDate(chore.dueDate).toLocaleDateString()}</span>
                  {dueStatus && (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      dueStatus.type === 'overdue' ? 'bg-red-100 text-red-800' :
                      dueStatus.type === 'due-soon' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {dueStatus.type === 'overdue' ? 'Overdue' :
                       dueStatus.type === 'due-soon' ? 'Due Soon' : 'On Time'}
                    </span>
                  )}
                </div>
              )}
              
              {chore.completed && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>Completed: {chore.completedAt?.toLocaleDateString()}</span>
                  {chore.completedBy && (
                    <span>by {chore.completedBy}</span>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex flex-col items-end space-y-2 ml-4">
              {!chore.completed ? (
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    onComplete(chore.id, e)
                  }}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  title="Mark as complete"
                >
                  <CheckCircle className="w-4 h-4" />
                </Button>
              ) : (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">Completed!</span>
                </div>
              )}
              
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(chore.id)
                }}
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Delete chore"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})

ChoreItem.displayName = 'ChoreItem'



