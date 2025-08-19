import React, { useState, FormEvent } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { useChores } from '../contexts/ChoreContext'
import { DIFFICULTY_POINTS, DIFFICULTY_COLORS } from '../types/chore'
import { validateChoreTitle, validateChoreDescription, validateDate } from '../utils/validation'

export const AddChoreForm: React.FC = () => {
  const { addChore } = useChores()
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'medium' as const,
    category: 'daily' as const,
    priority: 'medium' as const,
    dueDate: ''
  })
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      const newChore = {
        ...formData,
        points: DIFFICULTY_POINTS[formData.difficulty],
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
        // Removed approval fields - no longer needed
      }
      
      addChore(newChore)
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        difficulty: 'medium',
        category: 'daily',
        priority: 'medium',
        dueDate: ''
      })
      setErrors({})
      setIsOpen(false)
    } catch (error) {
      console.error('Error adding chore:', error)
      setErrors({ submit: ['Failed to add chore. Please try again.'] })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string) => {
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

  if (!isOpen) {
    return (
      <Card className="bg-gradient-to-br from-primary/10 via-chart-4/10 to-accent/10 rounded-2xl border border-primary/20 shadow-lg">
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <Button 
            onClick={() => setIsOpen(true)}
            className="w-full bg-primary hover:bg-primary/90 text-white text-sm sm:text-base"
          >
            + Add New Chore
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border shadow-lg">
      <CardHeader className="p-3 sm:p-4 lg:p-6 pb-2 sm:pb-3">
        <CardTitle className="text-base sm:text-lg font-medium text-foreground">Add New Chore</CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Chore Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background transition-colors ${
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
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background transition-colors ${
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
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Difficulty & Points
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as const).map((difficulty) => (
                <button
                  key={difficulty}
                  type="button"
                  onClick={() => handleChange('difficulty', difficulty)}
                  className={`p-2 rounded-md border-2 transition-all ${
                    formData.difficulty === difficulty
                      ? `border-${DIFFICULTY_COLORS[difficulty]} bg-${DIFFICULTY_COLORS[difficulty]}/10`
                      : 'border-border hover:border-border/60'
                  }`}
                >
                  <div className="text-sm font-medium capitalize">{difficulty}</div>
                  <div className={`text-xs text-${DIFFICULTY_COLORS[difficulty]}`}>
                    {DIFFICULTY_POINTS[difficulty]} pts
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="seasonal">Seasonal</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
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
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background transition-colors ${
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
          <div className="flex space-x-3 pt-2">
            <Button
              type="submit"
              disabled={isSubmitting || hasErrors}
              className="flex-1 bg-primary hover:bg-primary/90 text-white disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Chore'}
            </Button>
            <Button
              type="button"
              onClick={() => {
                setIsOpen(false)
                setErrors({})
                setFormData({
                  title: '',
                  description: '',
                  difficulty: 'medium',
                  category: 'daily',
                  priority: 'medium',
                  dueDate: ''
                })
              }}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
