import React, { useState, FormEvent } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { useChores } from '../contexts/ChoreContext'
import { DIFFICULTY_POINTS, DIFFICULTY_COLORS } from '../types/chore'

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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    
    const newChore = {
      ...formData,
      points: DIFFICULTY_POINTS[formData.difficulty],
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      // Removed approval fields - no longer needed
    }
    
    addChore(newChore)
    setFormData({
      title: '',
      description: '',
      difficulty: 'medium',
      category: 'daily',
      priority: 'medium',
      dueDate: ''
    })
    setIsOpen(false)
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

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
              Chore Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
              placeholder="e.g., Clean the kitchen"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
              placeholder="Describe what needs to be done..."
              rows={3}
            />
          </div>

          {/* Difficulty and Points */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Difficulty Level
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {(['easy', 'medium', 'hard'] as const).map((difficulty) => (
                <button
                  key={difficulty}
                  type="button"
                  onClick={() => handleChange('difficulty', difficulty)}
                  className={`p-2 sm:p-3 rounded-lg border-2 transition-all ${
                    formData.difficulty === difficulty
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-foreground/20'
                  }`}
                >
                  <div className={`text-xs px-1 sm:px-2 py-1 rounded-full mb-1 sm:mb-2 ${DIFFICULTY_COLORS[difficulty]}`}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </div>
                  <div className="text-sm sm:text-lg font-bold text-foreground">
                    {DIFFICULTY_POINTS[difficulty]} pts
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
              Due Date (Optional)
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleChange('dueDate', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Due time will automatically be set to 6:00 PM
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-3 sm:pt-4">
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90 text-white text-sm sm:text-base"
            >
              Add Chore
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1 text-sm sm:text-base"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
