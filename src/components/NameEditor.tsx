import React, { useState } from 'react'
import { User, Edit3, Check, X } from 'lucide-react'

interface NameEditorProps {
  currentName: string
  onNameChange: (newName: string) => void
}

export default function NameEditor({ currentName, onNameChange }: NameEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(currentName)
  const [error, setError] = useState('')

  const handleEdit = () => {
    setIsEditing(true)
    setName(currentName)
    setError('')
  }

  const handleSave = () => {
    if (!name.trim()) {
      setError('Name cannot be empty')
      return
    }
    
    if (name.trim() === currentName) {
      setIsEditing(false)
      return
    }

    onNameChange(name.trim())
    setIsEditing(false)
    setError('')
  }

  const handleCancel = () => {
    setIsEditing(false)
    setName(currentName)
    setError('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  if (isEditing) {
    return (
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyPress}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
              error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            placeholder="Enter your name"
            autoFocus
          />
        </div>
        <button
          onClick={handleSave}
          className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          title="Save name"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={handleCancel}
          className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          title="Cancel editing"
        >
          <X className="w-4 h-4" />
        </button>
        {error && (
          <p className="text-sm text-red-600 flex items-center animate-in slide-in-from-top-1 duration-200">
            <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
            {error}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-lg font-medium text-gray-900">{currentName}</span>
      <button
        onClick={handleEdit}
        className="p-1 text-gray-400 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded transition-colors"
        title="Edit name"
      >
        <Edit3 className="w-4 h-4" />
      </button>
    </div>
  )
}
