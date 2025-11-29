import React, { useState, useCallback } from 'react'
import { Edit, Save, X, CheckCircle } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Avatar } from '../ui/Avatar'
import { LEVELS } from '../../types/chore'

interface ProfileHeaderProps {
  currentUser: any
  userStats: any
  onUpdateUser: (updates: any) => Promise<void>
  onRepairLevels: () => void
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  currentUser,
  userStats,
  onUpdateUser,
  onRepairLevels
}) => {
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState(currentUser?.name || '')
  const [isSaving, setIsSaving] = useState(false)
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)

  const currentLevel = userStats?.currentLevel || 1
  const currentPoints = userStats?.earnedPoints || 0
  const currentStreak = userStats?.currentStreak || 0

  // Name editing handlers
  const handleNameEdit = useCallback(() => {
    setIsEditingName(true)
    setEditedName(currentUser?.name || '')
  }, [currentUser?.name])

  const handleNameSave = useCallback(async () => {
    if (!currentUser || !editedName.trim()) return
    
    setIsSaving(true)
    try {
      await onUpdateUser({ name: editedName.trim() })
      setIsEditingName(false)
      setShowSaveSuccess(true)
      setTimeout(() => setShowSaveSuccess(false), 2000)
    } catch (error) {
      console.error('Failed to update name:', error)
    } finally {
      setIsSaving(false)
    }
  }, [currentUser, editedName, onUpdateUser])

  const handleNameCancel = useCallback(() => {
    setIsEditingName(false)
    setEditedName(currentUser?.name || '')
  }, [currentUser?.name])

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedName(e.target.value)
  }, [])

  const currentLevelData = LEVELS.find(level => level.level === currentLevel)
  const nextLevelData = LEVELS.find(level => level.level === currentLevel + 1)
  const pointsToNextLevel = nextLevelData ? nextLevelData.pointsRequired - currentPoints : 0

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Profile Overview</span>
          {showSaveSuccess && (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Saved!</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User Info Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar
              key={`header-avatar-${currentUser?.id}-${currentUser?.avatar}`}
              avatarUrl={currentUser?.avatar}
              userName={currentUser?.name}
              userId={currentUser?.id}
              size="lg"
              showBorder
              borderColor="border-white dark:border-gray-700"
            />
            <div>
              {isEditingName ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={editedName}
                    onChange={handleNameChange}
                    className="text-xl font-semibold border border-gray-300 rounded px-2 py-1"
                    autoFocus
                  />
                  <Button
                    onClick={handleNameSave}
                    disabled={isSaving}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSaving ? 'Saving...' : <Save className="w-4 h-4" />}
                  </Button>
                  <Button
                    onClick={handleNameCancel}
                    variant="outline"
                    size="sm"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-semibold">{currentUser?.name || 'User'}</h2>
                  <Button
                    onClick={handleNameEdit}
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <p className="text-gray-600">{currentUser?.email}</p>
            </div>
          </div>
          
          <div className="text-right">
            <Button
              onClick={onRepairLevels}
              variant="outline"
              size="sm"
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              Repair Levels
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{currentLevel}</div>
            <div className="text-sm text-blue-600">Current Level</div>
            {currentLevelData && (
              <div className="text-xs text-blue-500 mt-1">{currentLevelData.name}</div>
            )}
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{currentPoints}</div>
            <div className="text-sm text-green-600">Total Points</div>
            {pointsToNextLevel > 0 && (
              <div className="text-xs text-green-500 mt-1">{pointsToNextLevel} to next level</div>
            )}
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">{currentStreak}</div>
            <div className="text-sm text-purple-600">Current Streak</div>
            <div className="text-xs text-purple-500 mt-1">days</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}



