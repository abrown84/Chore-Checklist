import React, { useState, useRef, useCallback, useMemo } from 'react'
import { useChores } from '../contexts/ChoreContext'
import { useUsers } from '../contexts/UserContext'
import { useStats } from '../contexts/StatsContext'
import { LEVELS } from '../types/chore'
import { 
  CheckCircle, 
  Lock, 
  Star, 
  Crown, 
  Palette, 
  User, 
  Zap, 
  Target, 
  Award, 
  Upload, 
  X, 
  Eye, 
  Sparkle,
  Save,
  Edit
} from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { AVATAR_SOURCES, BACKGROUND_SOURCES } from '../utils/mediaSources'

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
  const { state: { currentUser, household }, updateCurrentUser } = useUsers()
  const { getUserStats } = useStats()
  
  // Access chore repair function
  const repairDefaultUserChores = choreContext?.repairDefaultUserChores

  // State management
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedCustomizations, setSelectedCustomizations] = useState<ProfileCustomization>({
    avatar: 'default',
    theme: 'default',
    border: 'none',
    background: 'default',
    badge: 'none',
    animation: 'none',
    font: 'default',
    effect: 'none'
  })
  const [customAvatar, setCustomAvatar] = useState<string | null>(null)
  const [avatarName, setAvatarName] = useState<string>('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['profile', 'rewards']))
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState(currentUser?.name || '')
  const [isSaving, setIsSaving] = useState(false)
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)

  // Derived state
  const userStats = currentUser ? getUserStats(currentUser.id) : undefined
  const currentLevel = userStats?.currentLevel || choreContext?.state.stats.currentLevel || 1
  const currentPoints = userStats?.earnedPoints || choreContext?.state.stats.earnedPoints || 0
  const currentStreak = userStats?.currentStreak || 0

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
  const getRewardIcon = (reward: string) => {
    if (reward.includes('avatar')) return <User className="w-4 h-4" />
    if (reward.includes('theme')) return <Palette className="w-4 h-4" />
    if (reward.includes('border')) return <Target className="w-4 h-4" />
    if (reward.includes('badge')) return <Award className="w-4 h-4" />
    if (reward.includes('animation')) return <Zap className="w-4 h-4" />
    if (reward.includes('background')) return <Star className="w-4 h-4" />
    if (reward.includes('font')) return <Eye className="w-4 h-4" />
    if (reward.includes('effect')) return <Sparkle className="w-4 h-4" />
    return <Star className="w-4 h-4" />
  }

  const isRewardUnlocked = (levelRequired: number) => {
    return currentLevel >= levelRequired
  }

  const canUploadCustomAvatar = () => {
    return currentLevel >= 3
  }

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

  // Name editing handlers
  const handleNameEdit = useCallback(() => {
    setIsEditingName(true)
    setEditedName(currentUser?.name || '')
  }, [currentUser?.name])

  const handleNameSave = useCallback(async () => {
    if (!currentUser || !editedName.trim()) return
    
    setIsSaving(true)
    try {
      await updateCurrentUser({ name: editedName.trim() })
      setIsEditingName(false)
      setShowSaveSuccess(true)
      setTimeout(() => setShowSaveSuccess(false), 2000)
    } catch (error) {
      console.error('Failed to update name:', error)
    } finally {
      setIsSaving(false)
    }
  }, [currentUser, editedName, updateCurrentUser])

  const handleNameCancel = useCallback(() => {
    setIsEditingName(false)
    setEditedName(currentUser?.name || '')
  }, [currentUser?.name])

  const handleRepairLevels = useCallback(() => {
    if (repairDefaultUserChores) {
      repairDefaultUserChores()
      alert('Level repair completed! Any chores that were incorrectly assigned have been transferred to your account. Your level should now be correctly calculated.')
    }
  }, [repairDefaultUserChores])

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedName(e.target.value)
  }, [])

  // Category expansion handlers
  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(category)) {
        newSet.delete(category)
      } else {
        newSet.add(category)
      }
      return newSet
    })
  }, [])

  const isCategoryExpanded = useCallback((category: string) => {
    return expandedCategories.has(category)
  }, [expandedCategories])

  // Get available customization options based on level
  const getAvailableOptions = (category: keyof ProfileCustomization) => {
    const options: { value: string; label: string; level: number; icon: string; locked?: boolean }[] = []
    
    // Add default option first
    options.push({
      value: 'default',
      label: 'Default',
      level: 1,
      icon: '🌱'
    })

    // Add custom avatar option if available and unlocked
    if (customAvatar && canUploadCustomAvatar()) {
      options.push({
        value: 'custom',
        label: 'Custom Image',
        level: 3,
        icon: '📷'
      })
    }

    // Avatar options (unlock progressively)
    if (category === 'avatar') {
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
    }

    // Theme options
    if (category === 'theme') {
      if (currentLevel >= 2) {
        options.push({ value: 'theme_2', label: 'Green Theme', level: 2, icon: '🟢' })
        options.push({ value: 'theme_2_alt', label: 'Emerald Theme', level: 2, icon: '💚' })
      }
      if (currentLevel >= 3) {
        options.push({ value: 'theme_3', label: 'Blue Theme', level: 3, icon: '🔵' })
        options.push({ value: 'theme_3_alt', label: 'Cyan Theme', level: 3, icon: '🔷' })
      }
      if (currentLevel >= 4) {
        options.push({ value: 'theme_4', label: 'Purple-Pink Gradient', level: 4, icon: '🟣' })
        options.push({ value: 'theme_4_alt', label: 'Violet Theme', level: 4, icon: '💜' })
      }
      if (currentLevel >= 5) {
        options.push({ value: 'theme_5', label: 'Yellow-Orange Gradient', level: 5, icon: '🟡' })
        options.push({ value: 'theme_5_alt', label: 'Amber Theme', level: 5, icon: '🟠' })
      }
      if (currentLevel >= 6) {
        options.push({ value: 'theme_6', label: 'Red-Pink Gradient', level: 6, icon: '🔴' })
        options.push({ value: 'theme_6_alt', label: 'Rose Theme', level: 6, icon: '🌹' })
      }
      if (currentLevel >= 7) {
        options.push({ value: 'theme_7', label: 'Indigo-Purple Gradient', level: 7, icon: '🟦' })
        options.push({ value: 'theme_7_alt', label: 'Sky Theme', level: 7, icon: '☁️' })
      }
      if (currentLevel >= 8) {
        options.push({ value: 'theme_8', label: 'Pink-Rose Gradient', level: 8, icon: '💗' })
        options.push({ value: 'theme_8_alt', label: 'Fuchsia Theme', level: 8, icon: '🟪' })
      }
      if (currentLevel >= 9) {
        options.push({ value: 'theme_9', label: 'Emerald-Teal Gradient', level: 9, icon: '🟢' })
        options.push({ value: 'theme_9_alt', label: 'Lime Theme', level: 9, icon: '🍋' })
      }
      if (currentLevel >= 10) {
        options.push({ value: 'theme_10', label: 'Amber-Yellow Gradient', level: 10, icon: '🟡' })
        options.push({ value: 'theme_10_alt', label: 'Orange Theme', level: 10, icon: '🟠' })
      }
    }

    // Badge options
    if (category === 'badge') {
      if (currentLevel >= 2) {
        options.push({ value: 'badge_2', label: '🌱 Beginner', level: 2, icon: '🌱' })
      }
      if (currentLevel >= 3) {
        options.push({ value: 'badge_3', label: '🛠️ Helper', level: 3, icon: '🛠️' })
      }
      if (currentLevel >= 4) {
        options.push({ value: 'badge_4', label: '🏆 Achievement Unlocked', level: 4, icon: '🏆' })
        options.push({ value: 'badge_4_alt', label: '🎯 Goal Setter', level: 4, icon: '🎯' })
      }
      if (currentLevel >= 5) {
        options.push({ value: 'badge_5', label: '⭐ Star Performer', level: 5, icon: '⭐' })
        options.push({ value: 'badge_5_alt', label: '🔥 Streak Master', level: 5, icon: '🔥' })
      }
      if (currentLevel >= 6) {
        options.push({ value: 'badge_6', label: '👑 Chore Master', level: 6, icon: '👑' })
        options.push({ value: 'badge_6_alt', label: '⚡ Speed Demon', level: 6, icon: '⚡' })
      }
      if (currentLevel >= 7) {
        options.push({ value: 'badge_7', label: '🌟 Legendary Worker', level: 7, icon: '🌟' })
        options.push({ value: 'badge_7_alt', label: '🎨 Creative', level: 7, icon: '🎨' })
      }
      if (currentLevel >= 8) {
        options.push({ value: 'badge_8', label: '💎 Diamond Status', level: 8, icon: '💎' })
        options.push({ value: 'badge_8_alt', label: '🚀 Overachiever', level: 8, icon: '🚀' })
      }
      if (currentLevel >= 9) {
        options.push({ value: 'badge_9', label: '✨ God Mode', level: 9, icon: '✨' })
        options.push({ value: 'badge_9_alt', label: '💫 Legend', level: 9, icon: '💫' })
      }
      if (currentLevel >= 10) {
        options.push({ value: 'badge_10', label: '👑 Ultimate Flex', level: 10, icon: '👑' })
        options.push({ value: 'badge_10_alt', label: '🏅 Champion', level: 10, icon: '🏅' })
      }
    }

    return options
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
      reader.onload = (e) => {
        const result = e.target?.result as string
        setCustomAvatar(result)
        setAvatarName(file.name)
        setSelectedCustomizations(prev => ({ ...prev, avatar: 'custom' }))
      }
      reader.readAsDataURL(file)
    }
  }

  const removeCustomAvatar = () => {
    setCustomAvatar(null)
    setAvatarName('')
    setSelectedCustomizations(prev => ({ ...prev, avatar: 'default' }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleCustomizationChange = (category: keyof ProfileCustomization, value: string) => {
    setSelectedCustomizations(prev => ({
      ...prev,
      [category]: value
    }))
  }

  // Profile preview component
  const getProfilePreview = () => {
    const avatarOptions = {
      default: '👤',
      avatar_2: AVATAR_SOURCES.dicebear.getAvatarUrl('avataaars', 'user2'),
      avatar_3: AVATAR_SOURCES.dicebear.getAvatarUrl('bottts', 'user3'),
      avatar_4: AVATAR_SOURCES.dicebear.getAvatarUrl('identicon', 'user4'),
      avatar_5: AVATAR_SOURCES.dicebear.getAvatarUrl('personas', 'user5'),
      avatar_6: AVATAR_SOURCES.dicebear.getAvatarUrl('lorelei', 'user6'),
      avatar_7: AVATAR_SOURCES.dicebear.getAvatarUrl('micah', 'user7'),
      avatar_8: AVATAR_SOURCES.dicebear.getAvatarUrl('miniavs', 'user8'),
      avatar_9: AVATAR_SOURCES.dicebear.getAvatarUrl('shapes', 'user9'),
      avatar_10: AVATAR_SOURCES.dicebear.getAvatarUrl('thumbs', 'user10'),
      avatar_2_alt: AVATAR_SOURCES.dicebear.getAvatarUrl('big-ears', 'user2alt'),
      avatar_3_alt: AVATAR_SOURCES.dicebear.getAvatarUrl('big-smile', 'user3alt'),
      avatar_4_alt: AVATAR_SOURCES.dicebear.getAvatarUrl('croodles', 'user4alt'),
      avatar_5_alt: AVATAR_SOURCES.dicebear.getAvatarUrl('fun-emoji', 'user5alt'),
      avatar_6_alt: AVATAR_SOURCES.dicebear.getAvatarUrl('pixel-art', 'user6alt'),
      avatar_7_alt: AVATAR_SOURCES.dicebear.getAvatarUrl('notoEmoji', 'user7alt'),
      avatar_8_alt: AVATAR_SOURCES.dicebear.getAvatarUrl('avataaars', 'user8alt'),
      avatar_9_alt: AVATAR_SOURCES.dicebear.getAvatarUrl('bottts', 'user9alt'),
      avatar_10_alt: AVATAR_SOURCES.dicebear.getAvatarUrl('identicon', 'user10alt')
    }

    const themeOptions = {
      default: 'bg-gray-100 text-gray-900',
      theme_2: 'bg-green-100 text-green-900',
      theme_3: 'bg-blue-100 text-blue-900',
      theme_4: 'bg-gradient-to-br from-purple-100 to-pink-100 text-purple-900',
      theme_5: 'bg-gradient-to-br from-yellow-100 to-orange-100 text-yellow-900',
      theme_6: 'bg-gradient-to-br from-red-100 to-pink-100 text-red-900',
      theme_7: 'bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-900',
      theme_8: 'bg-gradient-to-br from-pink-100 to-rose-100 text-pink-900',
      theme_9: 'bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-900',
      theme_10: 'bg-gradient-to-br from-amber-100 to-yellow-100 text-amber-900',
      theme_2_alt: 'bg-emerald-100 text-emerald-900',
      theme_3_alt: 'bg-cyan-100 text-cyan-900',
      theme_4_alt: 'bg-violet-100 text-violet-900',
      theme_5_alt: 'bg-amber-100 text-amber-900',
      theme_6_alt: 'bg-rose-100 text-rose-900',
      theme_7_alt: 'bg-sky-100 text-sky-900',
      theme_8_alt: 'bg-fuchsia-100 text-fuchsia-900',
      theme_9_alt: 'bg-lime-100 text-lime-900',
      theme_10_alt: 'bg-orange-100 text-orange-900'
    }

    const renderAvatar = () => {
      if (selectedCustomizations.avatar === 'custom' && customAvatar) {
        return (
          <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-white shadow-lg">
            <img 
              src={customAvatar} 
              alt="Custom Avatar" 
              className="w-full h-full object-cover"
            />
          </div>
        )
      } else {
        const avatar = avatarOptions[selectedCustomizations.avatar as keyof typeof avatarOptions] || avatarOptions.default
        
        if (typeof avatar === 'string' && avatar.startsWith('http')) {
          return (
            <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-white shadow-lg">
              <img 
                src={avatar} 
                alt="Professional Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
          )
        } else {
          return <div className="text-6xl mb-4">{avatar}</div>
        }
      }
    }

    const themeClass = themeOptions[selectedCustomizations.theme as keyof typeof themeOptions] || themeOptions.default

    return (
      <div className={`p-6 rounded-lg ${themeClass}`}>
        <div className="text-center">
          {renderAvatar()}
          <h3 className="text-xl font-bold mb-2">{currentUser?.name || 'Your Profile'}</h3>
          <p className="text-sm opacity-80">Level {currentLevel} • {currentPoints} points</p>
          
          {selectedCustomizations.badge !== 'none' && (
            <div className={`mt-3 inline-block px-3 py-1 rounded-full text-sm font-medium ${badgeStyles[selectedCustomizations.badge as keyof typeof badgeStyles] || ''}`}>
              {badgeOptions[selectedCustomizations.badge as keyof typeof badgeOptions] || selectedCustomizations.badge}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (!choreContext && !currentUser) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <p className="text-center text-gray-500">Loading profile...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Overview Section */}
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <button
            onClick={() => toggleCategory('profile')}
            className="w-full text-left flex items-center justify-between hover:bg-gray-50 transition-colors rounded p-2"
          >
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              👤 Profile Overview
            </CardTitle>
            <div className={`transform transition-transform ${isCategoryExpanded('profile') ? 'rotate-180' : ''}`}>
              ▼
            </div>
          </button>
        </CardHeader>
        
        {isCategoryExpanded('profile') && (
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Avatar and Name */}
              <div className="flex flex-col items-center space-y-4">
                <div className={`w-32 h-32 rounded-full flex items-center justify-center text-white text-5xl font-bold bg-gradient-to-br ${getAvatarGradient(currentUser?.name || 'User')} shadow-2xl border-4 border-white`}>
                  {(currentUser?.name || 'U').charAt(0).toUpperCase()}
                </div>
                
                <div className="text-center">
                  {isEditingName ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={editedName}
                        onChange={handleNameChange}
                        className="text-xl font-semibold text-center bg-blue-50 border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter name"
                        maxLength={20}
                      />
                      <Button
                        size="sm"
                        onClick={handleNameSave}
                        disabled={isSaving || !editedName.trim()}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleNameCancel}
                        className="border-gray-300 text-gray-600 hover:bg-gray-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-gray-800">
                        {currentUser?.name || 'User'}
                      </span>
                      {currentUser && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleNameEdit}
                          className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {showSaveSuccess && (
                  <div className="text-center">
                    <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-md">
                      <span className="text-sm font-medium">Name updated successfully! 🎉</span>
                    </div>
                  </div>
                )}

                {currentUser?.email && (
                  <p className="text-gray-500 text-sm">{currentUser.email}</p>
                )}
              </div>

              {/* Level and Progress */}
              <div className="flex flex-col items-center space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">Level {currentLevel}</div>
                  <div className="text-lg text-gray-600 mb-4">🎯 {currentPoints} Points</div>
                  
                  {/* Progress Bar */}
                  <div className="w-48 bg-muted rounded-full h-3 mb-2">
                    <div 
                      className="bg-gradient-to-r from-primary to-chart-4 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((currentPoints % 100) / 100 * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {currentPoints % 100} / 100 to next level
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-col items-center space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600 mb-2">🔥 {currentStreak}</div>
                  <div className="text-sm text-gray-600">Day Streak</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-2">🏆</div>
                  <div className="text-sm text-gray-600">Achievements</div>
                </div>
              </div>
            </div>

            {/* Level Repair Section */}
            <div className="border-t border-gray-200 pt-6 mb-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  🔧 Troubleshooting
                </h3>
                <div className="max-w-md mx-auto">
                  <p className="text-sm text-gray-600 mb-4">
                    If your level seems incorrect or you've lost progress, use this tool to repair your level calculation.
                  </p>
                  <Button
                    onClick={handleRepairLevels}
                    variant="outline"
                    className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
                  >
                    🔧 Repair My Level
                  </Button>
                </div>
              </div>
            </div>

            {/* Household Information */}
            {household && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                  🏠 Household Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Household:</span>
                    <span className="font-medium text-gray-800">
                      {household.name || 'No household'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Member since:</span>
                    <span className="font-medium text-gray-800">
                      {household.createdAt 
                        ? new Date(household.createdAt).toLocaleDateString()
                        : 'Unknown'
                      }
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Level Up Rewards Section */}
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <button
            onClick={() => toggleCategory('rewards')}
            className="w-full text-left flex items-center justify-between hover:bg-gray-50 transition-colors rounded p-2"
          >
            <CardTitle className="text-2xl font-bold text-gray-800">
              🎯 Level Up Rewards
            </CardTitle>
            <div className={`transform transition-transform ${isCategoryExpanded('rewards') ? 'rotate-180' : ''}`}>
              ▼
            </div>
          </button>
        </CardHeader>
        
        {isCategoryExpanded('rewards') && (
          <CardContent className="p-6">
            {/* Current Progress Info */}
            <div className="mb-6 p-4 bg-gradient-to-br from-primary/10 via-chart-4/10 to-accent/10 border border-primary/20 rounded-lg">
              <h4 className="font-medium text-foreground mb-3 flex items-center">
                <Crown className="w-5 h-5 mr-2 text-yellow-500" />
                Your Progress
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-card/80 backdrop-blur-sm rounded-lg border border-primary/20">
                  <div className="text-2xl font-bold text-primary">{currentLevel}</div>
                  <div className="text-sm text-muted-foreground">Current Level</div>
                </div>
                <div className="text-center p-3 bg-card/80 backdrop-blur-sm rounded-lg border border-chart-4/20">
                  <div className="text-2xl font-bold text-chart-4">{currentPoints}</div>
                  <div className="text-sm text-muted-foreground">Earned Points</div>
                </div>
                <div className="text-center p-3 bg-card/80 backdrop-blur-sm rounded-lg border border-success/20">
                  <div className="text-2xl font-bold text-success">{getAvailableOptions('avatar').length}</div>
                  <div className="text-sm text-muted-foreground">Avatar Options</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              {LEVELS.map((level) => (
                <div key={level.level} className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`text-2xl ${level.color}`}>{level.icon}</span>
                    <div>
                      <h3 className={`font-medium ${level.color}`}>{level.name}</h3>
                      <p className="text-sm text-gray-500">{level.pointsRequired} points required</p>
                    </div>
                    {isRewardUnlocked(level.level) ? (
                      <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                    ) : (
                      <Lock className="w-5 h-5 text-gray-400 ml-auto" />
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {level.rewards.map((reward, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-2 p-2 rounded ${
                          isRewardUnlocked(level.level)
                            ? 'bg-green-50 text-green-700'
                            : 'bg-gray-50 text-gray-500'
                        }`}
                      >
                        {getRewardIcon(reward)}
                        <span className="text-sm font-medium">{reward}</span>
                        {isRewardUnlocked(level.level) ? (
                          <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                        ) : (
                          <Lock className="w-4 h-4 text-gray-400 ml-auto" />
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {!isRewardUnlocked(level.level) && (
                    <div className="mt-3 text-sm text-gray-500">
                      <span>
                        Need {level.pointsRequired - currentPoints} more points to unlock
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-card/80 backdrop-blur-sm rounded-lg border border-border">
              <h4 className="font-medium text-foreground mb-2">💡 How to unlock rewards:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Complete daily, weekly, and monthly chores</li>
                <li>• Higher difficulty chores give more points</li>
                <li>• Maintain streaks for bonus points</li>
                <li>• Each level unlocks new profile customization options</li>
                <li>• Default chores are automatically loaded when you start</li>
              </ul>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Customization Section */}
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <button
            onClick={() => toggleCategory('customization')}
            className="w-full text-left flex items-center justify-between hover:bg-gray-50 transition-colors rounded p-2"
          >
            <CardTitle className="text-2xl font-bold text-gray-800">
              🎨 Profile Customization
            </CardTitle>
            <div className={`transform transition-transform ${isCategoryExpanded('customization') ? 'rotate-180' : ''}`}>
              ▼
            </div>
          </button>
        </CardHeader>
        
        {isCategoryExpanded('customization') && (
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Preview */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">👀 Profile Preview</h3>
                {getProfilePreview()}
              </div>

              {/* Customization Options */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">🎨 Customization Options</h3>
                
                {/* Custom Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📷 Upload Custom Image {!canUploadCustomAvatar() && <span className="text-red-500">(Level 3 Required)</span>}
                  </label>
                  <div className="space-y-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={!canUploadCustomAvatar()}
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={!canUploadCustomAvatar()}
                      className={`w-full border-dashed border-2 transition-all ${
                        canUploadCustomAvatar()
                          ? 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                          : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {canUploadCustomAvatar() ? 'Choose Image (Max 5MB)' : 'Locked - Reach Level 3'}
                    </Button>
                    
                    {!canUploadCustomAvatar() && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Lock className="w-4 h-4 text-yellow-600" />
                          <p className="text-sm text-yellow-800">
                            Complete more chores to reach level 3 and unlock custom avatar uploads!
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {customAvatar && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <img 
                              src={customAvatar} 
                              alt="Custom Avatar" 
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <div>
                              <p className="text-sm font-medium text-green-800">{avatarName}</p>
                              <p className="text-xs text-green-600">Custom avatar uploaded</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={removeCustomAvatar}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Avatar Selection */}
                <div className="border rounded-lg">
                  <button
                    onClick={() => toggleCategory('avatar')}
                    className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-gray-900">Avatar Selection</span>
                      <span className="text-sm text-gray-500">({getAvailableOptions('avatar').length} options)</span>
                    </div>
                    <div className={`transform transition-transform ${isCategoryExpanded('avatar') ? 'rotate-180' : ''}`}>
                      ▼
                    </div>
                  </button>
                  
                  {isCategoryExpanded('avatar') && (
                    <div className="p-4 border-t bg-gray-50">
                      <div className="grid grid-cols-3 gap-2">
                        {getAvailableOptions('avatar').map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleCustomizationChange('avatar', option.value)}
                            className={`p-3 rounded-lg border-2 text-center transition-all ${
                              selectedCustomizations.avatar === option.value
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="text-2xl mb-1">{option.icon}</div>
                            <div className="text-xs">{option.label}</div>
                            <div className="text-xs text-gray-500">Level {option.level}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Theme Selection */}
                <div className="border rounded-lg">
                  <button
                    onClick={() => toggleCategory('theme')}
                    className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Palette className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-gray-900">Theme Selection</span>
                      <span className="text-sm text-gray-500">({getAvailableOptions('theme').length} options)</span>
                    </div>
                    <div className={`transform transition-transform ${isCategoryExpanded('theme') ? 'rotate-180' : ''}`}>
                      ▼
                    </div>
                  </button>
                  
                  {isCategoryExpanded('theme') && (
                    <div className="p-4 border-t bg-gray-50">
                      <div className="grid grid-cols-2 gap-2">
                        {getAvailableOptions('theme').map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleCustomizationChange('theme', option.value)}
                            className={`p-3 rounded-lg border-2 text-center transition-all ${
                              selectedCustomizations.theme === option.value
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="text-sm font-medium">{option.label}</div>
                            <div className="text-xs text-gray-500">Level {option.level}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Badge Selection */}
                <div className="border rounded-lg">
                  <button
                    onClick={() => toggleCategory('badge')}
                    className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Award className="w-5 h-5 text-amber-600" />
                      <span className="font-medium text-gray-900">Badge Selection</span>
                      <span className="text-sm text-gray-500">({getAvailableOptions('badge').length} options)</span>
                    </div>
                    <div className={`transform transition-transform ${isCategoryExpanded('badge') ? 'rotate-180' : ''}`}>
                      ▼
                    </div>
                  </button>
                  
                  {isCategoryExpanded('badge') && (
                    <div className="p-4 border-t bg-gray-50">
                      <div className="grid grid-cols-2 gap-2">
                        {getAvailableOptions('badge').map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleCustomizationChange('badge', option.value)}
                            className={`p-3 rounded-lg border-2 text-center transition-all ${
                              selectedCustomizations.badge === option.value
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="text-sm font-medium">{option.label}</div>
                            <div className="text-xs text-gray-500">Level {option.level}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Level Up Motivation */}
                <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">
                      🚀 Keep Leveling Up!
                    </h3>
                    <p className="text-blue-700 text-sm">
                      Complete more chores to unlock new customization options and rewards.
                    </p>
                    <div className="mt-4 flex justify-center space-x-4 text-sm text-blue-600">
                      <span>Next unlock at Level {Math.min(currentLevel + 1, 10)}</span>
                      <span>•</span>
                      <span>{100 - (currentPoints % 100)} points to go</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
