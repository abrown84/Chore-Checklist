import React, { useEffect, memo, useState, useRef, useCallback } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { Chore, DIFFICULTY_COLORS, PRIORITY_COLORS, CATEGORY_COLORS } from '../../types/chore'
import { Calendar, Edit, Image as ImageIcon, X, Check, Sun, CalendarDays, CalendarRange, Leaf } from 'lucide-react'
import { isOverdue as checkIsOverdue, normalizeDueDate } from '../../utils/dateHelpers'
import { EditChoreForm } from '../EditChoreForm'
import { DeadlineCountdown } from './DeadlineCountdown'
import { animateElement } from '../../hooks/useAnime'

// Category icons with their respective colors
const CATEGORY_ICONS = {
  daily: { icon: Sun, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/40' },
  weekly: { icon: CalendarDays, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/40' },
  monthly: { icon: CalendarRange, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/40' },
  seasonal: { icon: Leaf, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/40' }
} as const

// Priority border colors for left accent
const PRIORITY_BORDER_COLORS = {
  low: 'border-l-success',
  medium: 'border-l-warning',
  high: 'border-l-destructive'
} as const

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

  // Refs for anime.js animations
  const containerRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  
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
  
  // Handle completion animation with anime.js
  // SECURITY FIX: Add cancellation flag to prevent callback after unmount
  useEffect(() => {
    if (isCompleting && containerRef.current) {
      let cancelled = false

      const animation = animateElement(containerRef.current, {
        opacity: [1, 0],
        scale: [1, 0.95],
        translateY: [0, -8],
        duration: 500,
        ease: 'outQuart',
        complete: () => {
          if (!cancelled) {
            onAnimationComplete(chore.id)
          }
        }
      })

      return () => {
        cancelled = true
        animation?.pause()
      }
    }
  }, [isCompleting, chore.id, onAnimationComplete])

  // Hover animation handlers for card
  const handleMouseEnter = useCallback(() => {
    if (cardRef.current && !chore.completed && !isCompleting) {
      animateElement(cardRef.current, {
        scale: 1.02,
        duration: 200,
        ease: 'outQuart'
      })
    }
  }, [chore.completed, isCompleting])

  const handleMouseLeave = useCallback(() => {
    if (cardRef.current && !chore.completed && !isCompleting) {
      animateElement(cardRef.current, {
        scale: 1,
        duration: 200,
        ease: 'outQuart'
      })
    }
  }, [chore.completed, isCompleting])

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
      ref={containerRef}
      className={`${isCompleting ? 'overflow-hidden' : ''}`}
      style={{
        animationDelay: `${index * 50}ms`
      }}
    >
      <Card
        ref={cardRef}
        onClick={!chore.completed ? handleCardClick : undefined}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`relative transition-shadow duration-200 bg-card/80 backdrop-blur-sm border-l-4 hover:scale-100 ${PRIORITY_BORDER_COLORS[chore.priority]} ${
          isAnimating
            ? 'scale-105 shadow-lg shadow-green-500/30 ring-2 ring-green-500/50'
            : 'hover:shadow-lg hover:shadow-primary/10'
        } ${
          chore.completed
            ? 'bg-success/10 border-success/30 dark:bg-success/10 dark:border-success/30 shadow-green-500/20'
            : isOverdue
              ? 'bg-destructive/10 border-destructive/30 dark:bg-destructive/10 dark:border-destructive/30 cursor-pointer'
              : `${CATEGORY_COLORS[chore.category]} cursor-pointer`
        } ${
          chore.priority === 'high' && !chore.completed && !isOverdue
            ? 'animate-pulse-subtle'
            : ''
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
          
          <div className="flex gap-3 sm:gap-4 pr-8">
            {/* Category Icon */}
            {(() => {
              const categoryConfig = CATEGORY_ICONS[chore.category]
              const CategoryIcon = categoryConfig.icon
              return (
                <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full ${categoryConfig.bg} flex items-center justify-center transition-transform duration-200 group-hover:scale-110 ${
                  chore.completed ? 'opacity-60' : ''
                }`}>
                  {chore.completed ? (
                    <div className="relative">
                      <Check className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400 animate-check-bounce" />
                    </div>
                  ) : (
                    <CategoryIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${categoryConfig.color}`} />
                  )}
                </div>
              )
            })()}

            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-2">
                <h3 className={`font-semibold text-base sm:text-lg transition-colors duration-200 ${
                  chore.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                }`}>
                  {chore.title}
                </h3>
                {chore.completed && chore.bonusMessage && (
                  <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 px-2 py-1 rounded-full animate-fade-in">
                    {chore.bonusMessage}
                  </span>
                )}
                {/* High priority badge */}
                {chore.priority === 'high' && !chore.completed && (
                  <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full font-medium animate-pulse-subtle">
                    Urgent
                  </span>
                )}
              </div>
              
              {chore.description && (
                <p className={`text-sm mb-3 transition-colors duration-200 ${
                  chore.completed ? 'text-muted-foreground' : 'text-muted-foreground/80'
                }`}>
                  {chore.description}
                </p>
              )}

              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                  DIFFICULTY_COLORS[chore.difficulty]
                } ${chore.completed ? 'opacity-60' : ''}`}>
                  {chore.difficulty}
                </span>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                  PRIORITY_COLORS[chore.priority]
                } ${chore.completed ? 'opacity-60' : ''}`}>
                  {chore.priority}
                </span>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                  chore.category === 'daily' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300' :
                  chore.category === 'weekly' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300' :
                  chore.category === 'monthly' ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300' :
                  'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300'
                } ${chore.completed ? 'opacity-60' : ''}`}>
                  {chore.category}
                </span>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary dark:bg-primary/20 transition-all duration-200 ${
                  chore.completed ? 'opacity-60' : ''
                }`}>
                  {chore.points} pts
                </span>
              </div>
              
              {chore.dueDate && !chore.completed && (
                <div className="mb-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Due: {normalizeDueDate(chore.dueDate).toLocaleDateString()}</span>
                      <span className="text-muted-foreground/60">
                        {normalizeDueDate(chore.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <DeadlineCountdown dueDate={chore.dueDate} completed={chore.completed} />
                  </div>
                </div>
              )}

              {chore.dueDate && chore.completed && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-3">
                  <Calendar className="w-4 h-4" />
                  <span>Was due: {normalizeDueDate(chore.dueDate).toLocaleDateString()}</span>
                </div>
              )}

              {chore.completed && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span>Completed: {chore.completedAt?.toLocaleDateString()}</span>
                    {chore.completedBy && (
                      <span className="text-muted-foreground/80">by {chore.completedBy}</span>
                    )}
                  </div>

                  {/* Proof Photo */}
                  {chore.proofPhotoUrl && (
                    <div className="mt-3">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                        <ImageIcon className="w-4 h-4" />
                        <span>Photo Proof:</span>
                      </div>
                      <div className="relative inline-block group/photo">
                        <button
                          onClick={() => setShowPhotoPreview(true)}
                          className="relative rounded-lg overflow-hidden border-2 border-border hover:border-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 hover:shadow-md"
                        >
                          <img
                            src={chore.proofPhotoUrl}
                            alt={`Proof of completion for ${chore.title}`}
                            className="w-24 h-24 sm:w-32 sm:h-32 object-cover cursor-pointer transition-transform duration-200 group-hover/photo:scale-105"
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



