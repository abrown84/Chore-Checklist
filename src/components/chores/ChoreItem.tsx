import React, { useEffect, memo, useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { Chore, DIFFICULTY_COLORS, PRIORITY_COLORS, CATEGORY_COLORS } from '../../types/chore'
import { Calendar, Clock, Edit, Image as ImageIcon, X } from 'lucide-react'
import { isOverdue as checkIsOverdue, normalizeDueDate } from '../../utils/dateHelpers'
import { EditChoreForm } from '../EditChoreForm'
import { DeadlineCountdown } from './DeadlineCountdown'

interface ChoreItemProps {
  chore: Chore
  onComplete: (id: string, event?: React.MouseEvent) => void
  onDelete: (id: string) => void
  onEdit?: (chore: Chore) => void
  isAnimating: boolean
  isCompleting: boolean
  onAnimationComplete: (id: string) => void
  index: number
}

export const ChoreItem = memo<ChoreItemProps>(({ 
  chore, 
  onComplete, 
  onDelete: _onDelete, 
  onEdit,
  isAnimating, 
  isCompleting, 
  onAnimationComplete, 
  index 
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [showPhotoPreview, setShowPhotoPreview] = useState(false)
  const isOverdue = chore.dueDate ? checkIsOverdue(chore.dueDate) : false
  
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't complete if chore is already completed, editing, or clicking on buttons/interactive elements
    if (chore.completed || isEditing) return
    
    // Don't trigger if clicking on interactive elements
    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('a') || target.closest('[role="button"]')) {
      return
    }
    
    onComplete(chore.id, e)
  }
  
  // Handle animation completion
  useEffect(() => {
    if (isCompleting) {
      const timer = setTimeout(() => {
        onAnimationComplete(chore.id)
      }, 500) // Fade out duration
      return () => clearTimeout(timer)
    }
  }, [isCompleting, chore.id, onAnimationComplete])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = (updatedChore: Chore) => {
    if (onEdit) {
      onEdit(updatedChore)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }
  
  return (
    <>
      {isEditing && (
        <EditChoreForm
          chore={chore}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
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
        onClick={!chore.completed ? handleCardClick : undefined}
        className={`relative transition-all duration-300 bg-card/80 backdrop-blur-sm border ${
          isAnimating ? 'scale-105 shadow-lg' : 'hover:shadow-md'
        } ${
          chore.completed 
            ? 'bg-success/10 border-success/30 dark:bg-success/10 dark:border-success/30' 
            : isOverdue 
              ? 'bg-destructive/10 border-destructive/30 dark:bg-destructive/10 dark:border-destructive/30 cursor-pointer' 
              : `${CATEGORY_COLORS[chore.category]} hover:shadow-lg cursor-pointer`
        }`}
      >
        <CardContent className="p-4 sm:p-5">
          {/* Edit button - top right corner */}
          {onEdit && (
            <Button
              onClick={(e) => {
                e.stopPropagation()
                handleEdit()
              }}
              size="sm"
              variant="ghost"
              className="absolute top-2 right-2 h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent/50"
              title="Edit chore"
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
          
          <div className="flex flex-col gap-3 sm:gap-4 pr-8">
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-2">
                <h3 className={`font-semibold text-base sm:text-lg ${
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
              
              {chore.description && (
                <p className={`text-sm mb-3 ${
                  chore.completed ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {chore.description}
                </p>
              )}
              
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
              
              {chore.dueDate && !chore.completed && (
                <div className="mb-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Due: {normalizeDueDate(chore.dueDate).toLocaleDateString()}</span>
                      <span className="text-gray-400">
                        {normalizeDueDate(chore.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <DeadlineCountdown dueDate={chore.dueDate} completed={chore.completed} />
                  </div>
                </div>
              )}
              
              {chore.dueDate && chore.completed && (
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                  <Calendar className="w-4 h-4" />
                  <span>Was due: {normalizeDueDate(chore.dueDate).toLocaleDateString()}</span>
                </div>
              )}
              
              {chore.completed && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>Completed: {chore.completedAt?.toLocaleDateString()}</span>
                    {chore.completedBy && (
                      <span>by {chore.completedBy}</span>
                    )}
                  </div>
                  
                  {/* Proof Photo */}
                  {chore.proofPhotoUrl && (
                    <div className="mt-3">
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                        <ImageIcon className="w-4 h-4" />
                        <span>Photo Proof:</span>
                      </div>
                      <div className="relative inline-block">
                        <button
                          onClick={() => setShowPhotoPreview(true)}
                          className="relative rounded-lg overflow-hidden border-2 border-gray-200 hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        >
                          <img
                            src={chore.proofPhotoUrl}
                            alt={`Proof of completion for ${chore.title}`}
                            className="w-32 h-32 object-cover cursor-pointer"
                          />
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Photo Preview Modal */}
      {showPhotoPreview && chore.proofPhotoUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowPhotoPreview(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowPhotoPreview(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors z-10"
              aria-label="Close preview"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={chore.proofPhotoUrl}
              alt={`Proof of completion for ${chore.title}`}
              className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
    </>
  )
})

ChoreItem.displayName = 'ChoreItem'



