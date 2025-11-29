import React, { useState, useRef, useCallback } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useChores } from '../contexts/ChoreContext'
import { useUsers } from '../contexts/UserContext'
import { useStats } from '../hooks/useStats'
import { ProfileHeader } from './profile/ProfileHeader'
import { AvatarCustomization } from './profile/AvatarCustomization'
import { BadgeSystem } from './profile/BadgeSystem'
import { ThemeCustomization } from './profile/ThemeCustomization'
import { ProfilePreview } from './profile/ProfilePreview'
import { RewardsProgress } from './profile/RewardsProgress'
import { PWAInstallGuide } from './PWAInstallGuide'
import { SecurityStatus } from './SecurityStatus'

interface ProfileCustomization {
  avatar: string
  theme: string
  border: string
  background: string
  badge: string
  animation: string
  font: string
  effect: string
}

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
    // If avatar is a dicebear identifier (e.g., 'avatar_2'), return it
    if (currentUser.avatar.startsWith('avatar_')) {
      return currentUser.avatar
    }
    // Otherwise return the saved value or default
    return currentUser.avatar || 'default'
  }, [currentUser?.avatar])
  
  const [selectedCustomizations, setSelectedCustomizations] = useState<ProfileCustomization>({
    avatar: getInitialAvatar(),
    theme: 'default',
    border: 'none',
    background: 'default',
    badge: 'none',
    animation: 'none',
    font: 'default',
    effect: 'none'
  })
  
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
    setSelectedCustomizations(prev => {
      if (prev.avatar !== newAvatar) {
        return { ...prev, avatar: newAvatar }
      }
      return prev
    })
    if (newCustomAvatar !== customAvatar) {
      setCustomAvatar(newCustomAvatar)
    }
  }, [currentUser?.avatar])

  // Derived state
  const userStats = currentUser ? getUserStats(currentUser.id) : undefined
  const currentLevel = userStats?.currentLevel || choreContext?.state.stats.currentLevel || 1
  const currentPoints = userStats?.earnedPoints || choreContext?.state.stats.earnedPoints || 0

  // Badge options and styles
  const badgeOptions = {
    none: '',
    badge_4: '🏆 Achievement Unlocked',
    badge_5: '⭐ Star Performer',
    badge_6: '👑 Chore Master',
    badge_7: '🌟 Legendary Worker',
    badge_8: '💎 Diamond Status',
    badge_9: '✨ God Mode',
    badge_10: '👑 Ultimate Flex',
    badge_2: '🌱 Beginner',
    badge_3: '🛠️ Helper',
    badge_4_alt: '🎯 Goal Setter',
    badge_5_alt: '🔥 Streak Master',
    badge_6_alt: '⚡ Speed Demon',
    badge_7_alt: '🎨 Creative',
    badge_8_alt: '🚀 Overachiever',
    badge_9_alt: '💫 Legend',
    badge_10_alt: '🏅 Champion'
  }

  const badgeStyles = {
    none: '',
    badge_2: 'bg-green-100 text-green-800 border border-green-300',
    badge_3: 'bg-blue-100 text-blue-800 border border-blue-300',
    badge_4: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
    badge_4_alt: 'bg-orange-100 text-orange-800 border border-orange-300',
    badge_5: 'bg-orange-100 text-orange-800 border border-orange-300',
    badge_5_alt: 'bg-red-100 text-red-800 border border-red-300',
    badge_6: 'bg-red-100 text-red-800 border border-red-300',
    badge_6_alt: 'bg-purple-100 text-purple-800 border border-purple-300',
    badge_7: 'bg-indigo-100 text-indigo-800 border border-indigo-300',
    badge_7_alt: 'bg-pink-100 text-pink-800 border border-pink-300',
    badge_8: 'bg-pink-100 text-pink-800 border border-pink-300',
    badge_8_alt: 'bg-indigo-100 text-indigo-800 border border-indigo-300',
    badge_9: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
    badge_9_alt: 'bg-teal-100 text-teal-800 border border-teal-300',
    badge_10: 'bg-amber-100 text-amber-800 border border-amber-300',
    badge_10_alt: 'bg-yellow-100 text-yellow-800 border border-yellow-300'
  }

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

  const handleCustomizationChange = async (category: keyof ProfileCustomization, value: string) => {
    setSelectedCustomizations(prev => ({
      ...prev,
      [category]: value
    }))
    
    // Persist avatar changes to Convex database
    if (category === 'avatar') {
      try {
        // Convert avatar selection to avatarUrl format
        // For dicebear avatars, store the identifier (e.g., 'avatar_2')
        // For custom avatars, store the base64 data URL
        // For default, store 'default' or empty string
        let avatarUrl: string | undefined
        if (value === 'custom' && customAvatar) {
          // Store the base64 custom avatar
          avatarUrl = customAvatar
        } else if (value === 'default') {
          // Store 'default' or empty to use default avatar
          avatarUrl = 'default'
        } else if (value.startsWith('avatar_')) {
          // Store the dicebear avatar identifier
          avatarUrl = value
        }
        
        if (avatarUrl !== undefined) {
          await updateUserProfile({ avatarUrl })
          // Also update local state for immediate UI feedback
          updateCurrentUser({ avatar: avatarUrl })
        }
      } catch (error) {
        console.error('Failed to update avatar:', error)
        // Revert the local state change on error
        setSelectedCustomizations(prev => ({
          ...prev,
          [category]: currentUser?.avatar || 'default'
        }))
      }
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
        setSelectedCustomizations(prev => ({ ...prev, avatar: 'custom' }))
        
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
    setSelectedCustomizations(prev => ({ ...prev, avatar: 'default' }))
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

              {/* Profile Preview */}
      <ProfilePreview
        selectedCustomizations={selectedCustomizations}
        customAvatar={customAvatar}
        avatarName={avatarName}
        currentUser={currentUser}
        badgeOptions={badgeOptions}
        badgeStyles={badgeStyles}
      />

      {/* Avatar Customization */}
      <AvatarCustomization
        selectedAvatar={selectedCustomizations.avatar}
        customAvatar={customAvatar}
        avatarName={avatarName}
        currentLevel={currentLevel}
        canUploadCustomAvatar={canUploadCustomAvatar()}
        onAvatarChange={(avatar) => handleCustomizationChange('avatar', avatar)}
        onImageUpload={handleImageUpload}
        onRemoveCustomAvatar={removeCustomAvatar}
      />

      {/* Badge System */}
      <BadgeSystem
        selectedBadge={selectedCustomizations.badge}
        currentLevel={currentLevel}
        onBadgeChange={(badge) => handleCustomizationChange('badge', badge)}
      />

      {/* Theme Customization */}
      <ThemeCustomization
        selectedCustomizations={selectedCustomizations}
        currentLevel={currentLevel}
        onCustomizationChange={(category: string, value: string) => {
          handleCustomizationChange(category as keyof ProfileCustomization, value)
        }}
      />

      {/* Rewards Progress */}
      <RewardsProgress
        currentLevel={currentLevel}
        currentPoints={currentPoints}
        getUserStats={getUserStats}
        currentUser={currentUser}
      />

      {/* Additional Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PWAInstallGuide />
        <SecurityStatus />
              </div>
    </div>
  )
}
