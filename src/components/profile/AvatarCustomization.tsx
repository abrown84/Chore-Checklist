import React, { useRef } from 'react'
import { Upload, X, User } from '@phosphor-icons/react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Avatar } from '../ui/Avatar'
import { getAvailableAvatarOptions } from '../../utils/avatarUtils'

interface AvatarCustomizationProps {
  selectedAvatar: string
  customAvatar: string | null
  avatarName: string
  currentLevel: number
  canUploadCustomAvatar: boolean
  userName?: string
  userId?: string
  onAvatarChange: (avatar: string) => void
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveCustomAvatar: () => void
}

export const AvatarCustomization: React.FC<AvatarCustomizationProps> = ({
  selectedAvatar,
  customAvatar,
  avatarName,
  currentLevel,
  canUploadCustomAvatar,
  userName,
  userId,
  onAvatarChange,
  onImageUpload,
  onRemoveCustomAvatar
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const avatarOptions = getAvailableAvatarOptions(currentLevel)
  
  // Add custom avatar option if available and unlocked
  if (customAvatar && canUploadCustomAvatar) {
    avatarOptions.push({
      value: 'custom',
      label: 'Custom Image',
      level: 3,
      icon: '📷'
    })
  }

  const getAvatarDisplay = (avatarValue: string, userName?: string, userId?: string) => {
    if (avatarValue === 'custom' && customAvatar) {
      return (
        <div className="relative">
          <Avatar 
            avatarUrl={customAvatar}
            userName={userName}
            userId={userId}
            size="md"
            showBorder
            className="ring-2 ring-offset-2 ring-primary/20"
          />
          <Button
            onClick={onRemoveCustomAvatar}
            variant="ghost"
            size="sm"
            className="absolute -top-1 -right-1 w-6 h-6 p-0 bg-red-100 hover:bg-red-200 text-red-600 rounded-full"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )
    }
    
    // For previews, use the user's actual seed so they see what their avatar will look like
    // This ensures previews match the actual avatar they'll get
    return (
      <Avatar 
        avatarUrl={avatarValue}
        userName={userName}
        userId={userId}
        size="md"
        showBorder
        className="ring-2 ring-offset-2 ring-primary/20"
        key={`${avatarValue}-${userId}`} // Force re-render when avatar changes
      />
    )
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="w-5 h-5" />
          <span>Avatar Customization</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Avatar Preview */}
        <div className="flex items-center space-x-4">
          <div className="text-sm font-medium">Current Avatar:</div>
          {getAvatarDisplay(
            selectedAvatar === 'custom' ? customAvatar || selectedAvatar : selectedAvatar, 
            userName, 
            userId
          )}
          {selectedAvatar === 'custom' && avatarName && (
            <div className="text-sm text-gray-600">
              {avatarName}
            </div>
          )}
        </div>

        {/* Custom Avatar Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onImageUpload}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            disabled={!canUploadCustomAvatar}
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            {canUploadCustomAvatar ? 'Upload Custom Avatar' : 'Unlock at Level 3'}
          </Button>
          {!canUploadCustomAvatar && (
            <p className="text-sm text-gray-500 mt-2">
              Complete more chores to unlock custom avatar uploads!
            </p>
          )}
        </div>

        {/* Avatar Options Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {avatarOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onAvatarChange(option.value)}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                selectedAvatar === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              } cursor-pointer`}
              disabled={false}
            >
              <div className="flex flex-col items-center space-y-2">
                {getAvatarDisplay(option.value, userName, userId)}
                <div className="text-xs text-center">
                  <div className="font-medium">{option.label}</div>
                  <div className="text-gray-500">Level {option.level}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}



