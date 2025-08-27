import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Eye } from 'lucide-react'
import { AVATAR_SOURCES } from '../../utils/mediaSources'

interface ProfilePreviewProps {
  selectedCustomizations: {
    avatar: string
    theme: string
    border: string
    background: string
    badge: string
    animation: string
    font: string
    effect: string
  }
  customAvatar: string | null
  avatarName: string
  currentUser: any
  badgeOptions: Record<string, string>
  badgeStyles: Record<string, string>
}

export const ProfilePreview: React.FC<ProfilePreviewProps> = ({
  selectedCustomizations,
  customAvatar,
  avatarName,
  currentUser,
  badgeOptions,
  badgeStyles
}) => {
  const getAvatarGradient = (name: string) => {
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
  }

  const getAvatarDisplay = () => {
    if (selectedCustomizations.avatar === 'custom' && customAvatar) {
      return (
        <img 
          src={customAvatar} 
          alt="Custom Avatar" 
          className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
        />
      )
    }
    
    if (selectedCustomizations.avatar === 'default') {
      return (
        <div className={`w-20 h-20 bg-gradient-to-br ${getAvatarGradient(currentUser?.name || 'default')} rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg`}>
          {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      )
    }
    
    if (selectedCustomizations.avatar.startsWith('avatar_')) {
      const avatarUrl = AVATAR_SOURCES.dicebear.getAvatarUrl(selectedCustomizations.avatar, 'user')
      return (
        <img 
          src={avatarUrl} 
          alt={`Avatar ${selectedCustomizations.avatar}`} 
          className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
        />
      )
    }
    
    return (
      <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 border-4 border-white shadow-lg">
        ?
      </div>
    )
  }

  const getBadgeDisplay = () => {
    if (selectedCustomizations.badge === 'none') {
      return null
    }

    const style = badgeStyles[selectedCustomizations.badge]
    const label = badgeOptions[selectedCustomizations.badge]
    
    if (style && label) {
      return (
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${style}`}>
          {label.split(' ')[0]}
        </div>
      )
    }

    return null
  }

  const getThemeStyles = () => {
    const theme = selectedCustomizations.theme
    if (theme === 'default') return {}
    
    // This would be expanded with actual theme implementations
    const themeStyles: Record<string, any> = {}
    
    if (theme.includes('green')) {
      themeStyles.backgroundColor = 'bg-green-50'
      themeStyles.borderColor = 'border-green-200'
    } else if (theme.includes('blue')) {
      themeStyles.backgroundColor = 'bg-blue-50'
      themeStyles.borderColor = 'border-blue-200'
    } else if (theme.includes('purple')) {
      themeStyles.backgroundColor = 'bg-purple-50'
      themeStyles.borderColor = 'border-purple-200'
    } else if (theme.includes('pink')) {
      themeStyles.backgroundColor = 'bg-pink-50'
      themeStyles.borderColor = 'border-pink-200'
    }
    
    return themeStyles
  }

  const themeStyles = getThemeStyles()

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Eye className="w-5 h-5" />
          <span>Profile Preview</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`p-6 rounded-lg border-2 ${themeStyles.backgroundColor || 'bg-gray-50'} ${themeStyles.borderColor || 'border-gray-200'} transition-all duration-300`}>
          <div className="flex flex-col items-center space-y-4">
            {/* Avatar */}
            <div className="relative">
              {getAvatarDisplay()}
              {getBadgeDisplay() && (
                <div className="absolute -top-2 -right-2">
                  {getBadgeDisplay()}
                </div>
              )}
            </div>
            
            {/* User Info */}
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900">
                {currentUser?.name || 'User Name'}
              </h3>
              <p className="text-gray-600">
                {currentUser?.email || 'user@example.com'}
              </p>
              {selectedCustomizations.avatar === 'custom' && (
                <p className="text-sm text-gray-500 mt-1">
                  Custom: {avatarName}
                </p>
              )}
            </div>
            
            {/* Customization Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className="text-center">
                <div className="font-medium">Theme</div>
                <div className="text-gray-600">{selectedCustomizations.theme}</div>
              </div>
              <div className="text-center">
                <div className="font-medium">Border</div>
                <div className="text-gray-600">{selectedCustomizations.border}</div>
              </div>
              <div className="text-center">
                <div className="font-medium">Background</div>
                <div className="text-gray-600">{selectedCustomizations.background}</div>
              </div>
              <div className="text-center">
                <div className="font-medium">Animation</div>
                <div className="text-gray-600">{selectedCustomizations.animation}</div>
              </div>
            </div>
            
            {/* Live Preview Note */}
            <div className="text-center text-sm text-gray-500 bg-white/50 px-4 py-2 rounded-lg">
              💡 This is a preview of your profile customization
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}



