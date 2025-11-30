import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Eye } from 'lucide-react'
import { Avatar } from '../ui/Avatar'

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
  const getAvatarDisplay = () => {
    const avatarUrl = selectedCustomizations.avatar === 'custom' 
      ? customAvatar || selectedCustomizations.avatar
      : selectedCustomizations.avatar
    
    return (
      <Avatar
        avatarUrl={avatarUrl}
        userName={currentUser?.name}
        userId={currentUser?.id}
        size="xl"
        showBorder
        borderColor="border-white"
      />
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



