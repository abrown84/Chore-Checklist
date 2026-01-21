import React, { useState, useRef, useCallback } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useChores } from '../contexts/ChoreContext'
import { useUsers } from '../contexts/UserContext'
import { useStats } from '../hooks/useStats'
import { ProfileHeader } from './profile/ProfileHeader'
import { AvatarCustomization } from './profile/AvatarCustomization'
import { RewardsProgress } from './profile/RewardsProgress'
import { NotificationSettings } from './NotificationSettings'
import { SoundSettings } from './SoundSettings'
import { SubscriptionManagement } from './profile/SubscriptionManagement'
import { PasswordSettings } from './profile/PasswordSettings'

export const ProfileAndRewards: React.FC = () => {
  // Context hooks
  const choreContext = useChores()
  const { state: { currentUser }, updateCurrentUser } = useUsers()
  const { getUserStats } = useStats()
  
  // Convex mutation for updating user profile
  const updateUserProfile = useMutation(api.users.updateUserProfile)
  
  // Access chore repair function
  const repairDefaultUserChores = choreContext?.repairDefaultUserChores

  // State management
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Initialize avatar from current user's saved avatar
  const getInitialAvatar = useCallback(() => {
    if (!currentUser?.avatar) return 'default'
    // If avatar is a data URL (custom avatar), return 'custom'
    if (currentUser.avatar.startsWith('data:image/')) {
      return 'custom'
    }
    // If avatar is an emoji identifier (e.g., 'emoji_2'), return it
    if (currentUser.avatar.startsWith('emoji_')) {
      return currentUser.avatar
    }
    // Legacy: if avatar is an old identifier (e.g., 'avatar_2'), migrate to emoji
    if (currentUser.avatar.startsWith('avatar_')) {
      const level = currentUser.avatar.split('_')[1] || '1'
      const isAlt = currentUser.avatar.includes('_alt')
      return `emoji_${level}${isAlt ? '_alt' : ''}`
    }
    // Otherwise return the saved value or default
    return currentUser.avatar || 'default'
  }, [currentUser?.avatar])
  
  const [selectedAvatar, setSelectedAvatar] = useState<string>(getInitialAvatar())
  
  // Initialize custom avatar if user has one saved
  const getInitialCustomAvatar = useCallback(() => {
    if (!currentUser?.avatar) return null
    // If avatar is a data URL, return it
    if (currentUser.avatar.startsWith('data:image/')) {
      return currentUser.avatar
    }
    return null
  }, [currentUser?.avatar])
  
  const [customAvatar, setCustomAvatar] = useState<string | null>(getInitialCustomAvatar())
  const [avatarName, setAvatarName] = useState<string>('')
  
  // Update avatar state when currentUser changes
  React.useEffect(() => {
    const newAvatar = getInitialAvatar()
    const newCustomAvatar = getInitialCustomAvatar()
    setSelectedAvatar(newAvatar)
    setCustomAvatar(newCustomAvatar)
  }, [currentUser?.avatar, getInitialAvatar, getInitialCustomAvatar])

  // Derived state
  const userStats = currentUser ? getUserStats(currentUser.id) : undefined
  const currentLevel = userStats?.currentLevel || choreContext?.state.stats.currentLevel || 1
  const currentPoints = userStats?.earnedPoints || choreContext?.state.stats.earnedPoints || 0

  // Utility functions
  const canUploadCustomAvatar = () => {
    return currentLevel >= 3
  }

  // Handlers
  const handleRepairLevels = useCallback(() => {
    if (repairDefaultUserChores) {
      repairDefaultUserChores()
      alert('Level repair completed! Any chores that were incorrectly assigned have been transferred to your account. Your level should now be correctly calculated.')
    }
  }, [repairDefaultUserChores])

  const handleAvatarChange = async (avatar: string) => {
    setSelectedAvatar(avatar)
    
    try {
      // Convert avatar selection to avatarUrl format
      let avatarUrl: string | undefined
      if (avatar === 'custom' && customAvatar) {
        // Store the base64 custom avatar
        avatarUrl = customAvatar
      } else if (avatar === 'default') {
        // Store 'default' to use default avatar
        avatarUrl = 'default'
      } else if (avatar.startsWith('emoji_')) {
        // Store the emoji avatar identifier
        avatarUrl = avatar
      }
      
      if (avatarUrl !== undefined) {
        await updateUserProfile({ avatarUrl })
        // Also update local state for immediate UI feedback
        updateCurrentUser({ avatar: avatarUrl })
      }
    } catch (error) {
      console.error('Failed to update avatar:', error)
      // Revert the change on error
      setSelectedAvatar(getInitialAvatar())
    }
  }

  // Avatar upload handlers
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!canUploadCustomAvatar()) {
      alert('You need to reach level 3 to upload custom avatars! Complete more chores to unlock this feature.')
      return
    }

    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image file is too large. Please choose an image under 5MB.')
        return
      }

      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.')
        return
      }

      const reader = new FileReader()
      reader.onload = async (e) => {
        const result = e.target?.result as string
        setCustomAvatar(result)
        setAvatarName(file.name)
        setSelectedAvatar('custom')
        
        // Persist custom avatar to Convex database
        try {
          await updateUserProfile({ avatarUrl: result })
          // Also update local state for immediate UI feedback
          updateCurrentUser({ avatar: result })
        } catch (error) {
          console.error('Failed to save custom avatar:', error)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const removeCustomAvatar = async () => {
    setCustomAvatar(null)
    setAvatarName('')
    setSelectedAvatar('default')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    
    // Persist default avatar to Convex database
    try {
      await updateUserProfile({ avatarUrl: 'default' })
      // Also update local state for immediate UI feedback
      updateCurrentUser({ avatar: 'default' })
    } catch (error) {
      console.error('Failed to remove custom avatar:', error)
    }
  }

  if (!currentUser) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading user profile...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <ProfileHeader
        currentUser={currentUser}
        userStats={userStats}
        onUpdateUser={async (updates: any) => {
          try {
            // Update in Convex database (this will trigger reactive updates in leaderboard)
            await updateUserProfile(updates)
            // Also update local state for immediate UI feedback
            updateCurrentUser(updates)
          } catch (error) {
            console.error('Failed to update user profile:', error)
            throw error
          }
        }}
        onRepairLevels={handleRepairLevels}
      />

      {/* Notification Settings */}
      <NotificationSettings />

      {/* Sound Settings */}
      <SoundSettings />

      {/* Avatar Customization */}
      <AvatarCustomization
        selectedAvatar={selectedAvatar}
        customAvatar={customAvatar}
        avatarName={avatarName}
        currentLevel={currentLevel}
        canUploadCustomAvatar={canUploadCustomAvatar()}
        onAvatarChange={handleAvatarChange}
        onImageUpload={handleImageUpload}
        onRemoveCustomAvatar={removeCustomAvatar}
        userName={currentUser.name}
        userId={currentUser.id}
      />

      {/* Rewards Progress */}
      <RewardsProgress
        currentLevel={currentLevel}
        currentPoints={currentPoints}
        getUserStats={getUserStats}
        currentUser={currentUser}
      />

      {/* Subscription Management */}
      <SubscriptionManagement />

      {/* Password & Account Settings */}
      <PasswordSettings />
    </div>
  )
}
