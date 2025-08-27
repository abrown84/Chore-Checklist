import React, { useRef, useCallback } from 'react'
import { Upload, X, User } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { AVATAR_SOURCES } from '../../utils/mediaSources'

interface AvatarCustomizationProps {
  selectedAvatar: string
  customAvatar: string | null
  avatarName: string
  currentLevel: number
  canUploadCustomAvatar: boolean
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
  onAvatarChange,
  onImageUpload,
  onRemoveCustomAvatar
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getAvatarGradient = useCallback((name: string) => {
    const colors = [
      'from-blue-400 to-blue-600',
      'from-green-400 to-green-600',
      'from-purple-400 to-purple-600',
      'from-pink-400 to-pink-600',
      'from-yellow-400 to-yellow-600',
      'from-red-400 to-red-600'
    ]
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }, [])

  const getAvailableAvatarOptions = () => {
    const options: { value: string; label: string; level: number; icon: string; locked?: boolean }[] = []
    
    // Add default option first
    options.push({
      value: 'default',
      label: 'Default',
      level: 1,
      icon: '🌱'
    })

    // Add custom avatar option if available and unlocked
    if (customAvatar && canUploadCustomAvatar) {
      options.push({
        value: 'custom',
        label: 'Custom Image',
        level: 3,
        icon: '📷'
      })
    }

    // Avatar options (unlock progressively)
    if (currentLevel >= 2) {
      options.push({ value: 'avatar_2', label: 'Professional Avatar', level: 2, icon: '👤' })
      options.push({ value: 'avatar_2_alt', label: 'Big Ears Style', level: 2, icon: '👤' })
    }
    if (currentLevel >= 3) {
      options.push({ value: 'avatar_3', label: 'Bot Style', level: 3, icon: '🤖' })
      options.push({ value: 'avatar_3_alt', label: 'Big Smile Style', level: 3, icon: '😊' })
    }
    if (currentLevel >= 4) {
      options.push({ value: 'avatar_4', label: 'Geometric Style', level: 4, icon: '🔷' })
      options.push({ value: 'avatar_4_alt', label: 'Croodles Style', level: 4, icon: '🎨' })
    }
    if (currentLevel >= 5) {
      options.push({ value: 'avatar_5', label: 'Persona Style', level: 5, icon: '🎭' })
      options.push({ value: 'avatar_5_alt', label: 'Fun Emoji Style', level: 5, icon: '😄' })
    }
    if (currentLevel >= 6) {
      options.push({ value: 'avatar_6', label: 'Lorelei Style', level: 6, icon: '👸' })
      options.push({ value: 'avatar_6_alt', label: 'Pixel Art Style', level: 6, icon: '🎮' })
    }
    if (currentLevel >= 7) {
      options.push({ value: 'avatar_7', label: 'Micah Style', level: 7, icon: '🌟' })
      options.push({ value: 'avatar_7_alt', label: 'Noto Emoji Style', level: 7, icon: '📱' })
    }
    if (currentLevel >= 8) {
      options.push({ value: 'avatar_8', label: 'Mini Avatar Style', level: 8, icon: '💎' })
      options.push({ value: 'avatar_8_alt', label: 'Avataaars Style', level: 8, icon: '👤' })
    }
    if (currentLevel >= 9) {
      options.push({ value: 'avatar_9', label: 'Shapes Style', level: 9, icon: '✨' })
      options.push({ value: 'avatar_9_alt', label: 'Botts Style', level: 9, icon: '🤖' })
    }
    if (currentLevel >= 10) {
      options.push({ value: 'avatar_10', label: 'Thumbs Style', level: 10, icon: '👑' })
      options.push({ value: 'avatar_10_alt', label: 'Identicon Style', level: 10, icon: '🔐' })
    }

    return options
  }

  const getAvatarDisplay = (avatarValue: string) => {
    if (avatarValue === 'custom' && customAvatar) {
      return (
        <div className="relative">
          <img 
            src={customAvatar} 
            alt="Custom Avatar" 
            className="w-12 h-12 rounded-full object-cover"
          />
          <Button
            onClick={onRemoveCustomAvatar}
            variant="ghost"
            size="sm"
            className="absolute -top-1 -right-1 w-6 h-6 p-0 bg-red-100 hover:bg-red-200 text-red-600"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )
    }
    
    if (avatarValue === 'default') {
      return (
        <div className={`w-12 h-12 bg-gradient-to-br ${getAvatarGradient('default')} rounded-full flex items-center justify-center text-white text-lg font-bold`}>
          👤
        </div>
      )
    }
    
    if (avatarValue.startsWith('avatar_')) {
      const avatarUrl = AVATAR_SOURCES.dicebear.getAvatarUrl(avatarValue, 'user')
      return (
        <img 
          src={avatarUrl} 
          alt={`Avatar ${avatarValue}`} 
          className="w-12 h-12 rounded-full object-cover"
        />
      )
    }
    
    return (
      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
        ?
      </div>
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
          {getAvatarDisplay(selectedAvatar)}
          {selectedAvatar === 'custom' && (
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
          {getAvailableAvatarOptions().map((option) => (
            <button
              key={option.value}
              onClick={() => onAvatarChange(option.value)}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                selectedAvatar === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              } ${option.locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              disabled={option.locked}
            >
              <div className="flex flex-col items-center space-y-2">
                {getAvatarDisplay(option.value)}
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



