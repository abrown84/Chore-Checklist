import React, { useState, useEffect, FormEvent } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Chore, DIFFICULTY_POINTS } from '../types/chore'
import { validateChoreTitle, validateChoreDescription, validateDate } from '../utils/validation'
import { X } from 'lucide-react'

interface EditChoreFormProps {
  chore: Chore
  onSave: (updatedChore: Chore) => void
  onCancel: () => void
}

export const EditChoreForm: React.FC<EditChoreFormProps> = ({
  chore,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    title: chore.title,
    description: chore.description || '',
    difficulty: chore.difficulty,
    category: chore.category,
    priority: chore.priority,
    points: chore.points,
    dueDate: chore.dueDate ? new Date(chore.dueDate).toISOString().split('T')[0] : ''
  })
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Update form data when chore changes
  useEffect(() => {
    setFormData({
      title: chore.title,
      description: chore.description || '',
      difficulty: chore.difficulty,
      category: chore.category,
      priority: chore.priority,
      points: chore.points,
      dueDate: chore.dueDate ? new Date(chore.dueDate).toISOString().split('T')[0] : ''
    })
    setErrors({})
  }, [chore])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string[]> = {}
    
    // Validate title
    const titleValidation = validateChoreTitle(formData.title)
    if (!titleValidation.isValid) {
      newErrors.title = titleValidation.errors
    }
    
    // Validate description (optional)
    if (formData.description) {
      const descValidation = validateChoreDescription(formData.description)
      if (!descValidation.isValid) {
        newErrors.description = descValidation.errors
      }
    }
    
    // Validate due date (optional)
    if (formData.dueDate) {
      const dateValidation = validateDate(formData.dueDate)
      if (!dateValidation.isValid) {
        newErrors.dueDate = dateValidation.errors
      }
    }
    
    // Validate points
    if (formData.points < 1 || formData.points > 1000) {
      newErrors.points = ['Points must be between 1 and 1000']
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const updatedChore: Chore = {
        ...chore,
        title: formData.title,
        description: formData.description || '',
        difficulty: formData.difficulty,
        category: formData.category,
        priority: formData.priority,
        points: formData.points,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      }
      
      onSave(updatedChore)
    } catch (error) {
      console.error('Error updating chore:', error)
      setErrors({ submit: ['Failed to update chore. Please try again.'] })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: [] }))
    }
  }

  const getFieldError = (field: string): string | undefined => {
    return errors[field]?.[0]
  }

  const hasErrors = Object.values(errors).some(errorArray => errorArray.length > 0)

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onCancel}
    >
      <Card 
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-md shadow-xl border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg sm:text-xl font-medium text-foreground">
              Edit Chore
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Chore Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background transition-colors text-sm min-h-[44px] ${
                  getFieldError('title') ? 'border-red-300 bg-red-50' : 'border-border hover:border-border/80'
                }`}
                placeholder="e.g., Clean the kitchen"
                required
                maxLength={100}
              />
              {getFieldError('title') && (
                <p className="text-sm text-red-600 mt-1">{getFieldError('title')}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Description (optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background transition-colors text-sm min-h-[100px] ${
                  getFieldError('description') ? 'border-red-300 bg-red-50' : 'border-border hover:border-border/80'
                }`}
                placeholder="Describe what needs to be done..."
                rows={3}
                maxLength={500}
              />
              {getFieldError('description') && (
                <p className="text-sm text-red-600 mt-1">{getFieldError('description')}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {formData.description.length}/500 characters
              </p>
            </div>

            {/* Difficulty and Points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Difficulty
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['easy', 'medium', 'hard'] as const).map((difficulty) => (
                    <button
                      key={difficulty}
                      type="button"
                      onClick={() => {
                        handleChange('difficulty', difficulty)
                        handleChange('points', DIFFICULTY_POINTS[difficulty])
                      }}
                      className={`p-2 rounded-md border-2 transition-all ${
                        formData.difficulty === difficulty
                          ? `border-primary bg-primary/10`
                          : 'border-border hover:border-border/60'
                      }`}
                    >
                      <div className="text-sm font-medium capitalize">{difficulty}</div>
                      <div className="text-xs text-muted-foreground">
                        {DIFFICULTY_POINTS[difficulty]} pts
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Points *
                </label>
                <input
                  type="number"
                  value={formData.points}
                  onChange={(e) => handleChange('points', parseInt(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background transition-colors text-sm min-h-[44px] ${
                    getFieldError('points') ? 'border-red-300 bg-red-50' : 'border-border hover:border-border/80'
                  }`}
                  min={1}
                  max={1000}
                  required
                />
                {getFieldError('points') && (
                  <p className="text-sm text-red-600 mt-1">{getFieldError('points')}</p>
                )}
              </div>
            </div>

            {/* Category and Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-sm min-h-[44px]"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="seasonal">Seasonal</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-sm min-h-[44px]"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Due Date (optional)
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background transition-colors text-sm min-h-[44px] ${
                  getFieldError('dueDate') ? 'border-red-300 bg-red-50' : 'border-border hover:border-border/80'
                }`}
                min={new Date().toISOString().split('T')[0]}
              />
              {getFieldError('dueDate') && (
                <p className="text-sm text-red-600 mt-1">{getFieldError('dueDate')}</p>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{errors.submit[0]}</p>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                type="submit"
                disabled={isSubmitting || hasErrors}
                className="flex-1 bg-primary hover:bg-primary/90 text-white disabled:opacity-50 min-h-[48px] sm:min-h-[44px]"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                onClick={onCancel}
                variant="outline"
                className="flex-1 min-h-[48px] sm:min-h-[44px]"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

