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
      <Card className="bg-blue-50 shadow rounded-lg">
        <CardContent className="p-6">
          <Button 
            onClick={() => setIsOpen(true)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            + Add New Chore
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-blue-50 shadow rounded-lg">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-gray-900">Add New Chore</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chore Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="e.g., Clean the kitchen"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Describe what needs to be done..."
              rows={3}
            />
          </div>

          {/* Difficulty and Points */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Difficulty Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as const).map((difficulty) => (
                <button
                  key={difficulty}
                  type="button"
                  onClick={() => handleChange('difficulty', difficulty)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.difficulty === difficulty
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`text-xs px-2 py-1 rounded-full mb-2 ${DIFFICULTY_COLORS[difficulty]}`}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {DIFFICULTY_POINTS[difficulty]} pts
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date (Optional)
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleChange('dueDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Due time will automatically be set to 6:00 PM
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Add Chore
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
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
