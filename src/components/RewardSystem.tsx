import React, { useContext, useState, useRef } from 'react'
import { ChoreContext } from '../contexts/ChoreContext'
import { LEVELS } from '../types/chore'
import { CheckCircle, Lock, Star, Crown, Palette, User, Zap, Target, Award, Upload, X, Eye, Sparkle } from 'lucide-react'
import { Button } from './ui/button'


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

// DEPRECATED: This component has been merged into ProfileAndRewards.tsx
// Keeping for reference only - can be deleted after testing
export const RewardSystem_DEPRECATED: React.FC = () => {
  const context = useContext(ChoreContext)
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
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['avatar', 'theme']))

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
    // New badge options
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

  if (!context) {
    return <div>Loading...</div>
  }
  
  const { state } = context
  const currentLevel = state.stats.currentLevel || 1

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
    return currentLevel >= 3 // Custom avatar upload requires level 3
  }

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

    // Generate all available options based on current level
    // This ensures all rewards are unlocked as stated in the level descriptions
    
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

    // Border options
    if (category === 'border') {
      if (currentLevel >= 2) {
        options.push({ value: 'border_2', label: 'Green Border', level: 2, icon: '🟢' })
        options.push({ value: 'border_2_alt', label: 'Emerald Dashed', level: 2, icon: '💚' })
      }
      if (currentLevel >= 3) {
        options.push({ value: 'border_3', label: 'Blue Border', level: 3, icon: '🔵' })
        options.push({ value: 'border_3_alt', label: 'Cyan Dotted', level: 3, icon: '🔷' })
      }
      if (currentLevel >= 4) {
        options.push({ value: 'border_4', label: 'Purple Border', level: 4, icon: '🟣' })
        options.push({ value: 'border_4_alt', label: 'Violet Double', level: 4, icon: '💜' })
      }
      if (currentLevel >= 5) {
        options.push({ value: 'border_5', label: 'Yellow Border', level: 5, icon: '🟡' })
        options.push({ value: 'border_5_alt', label: 'Amber Thick', level: 5, icon: '🟠' })
      }
      if (currentLevel >= 6) {
        options.push({ value: 'border_6', label: 'Red Border', level: 6, icon: '🔴' })
        options.push({ value: 'border_6_alt', label: 'Rose Dashed', level: 6, icon: '🌹' })
      }
      if (currentLevel >= 7) {
        options.push({ value: 'border_7', label: 'Indigo Border', level: 7, icon: '🟦' })
        options.push({ value: 'border_7_alt', label: 'Sky Dotted', level: 7, icon: '☁️' })
      }
      if (currentLevel >= 8) {
        options.push({ value: 'border_8', label: 'Pink Border', level: 8, icon: '💗' })
        options.push({ value: 'border_8_alt', label: 'Fuchsia Double', level: 8, icon: '🟪' })
      }
      if (currentLevel >= 9) {
        options.push({ value: 'border_9', label: 'Emerald Border', level: 9, icon: '🟢' })
        options.push({ value: 'border_9_alt', label: 'Lime Thick', level: 9, icon: '🍋' })
      }
      if (currentLevel >= 10) {
        options.push({ value: 'border_10', label: 'Amber Border', level: 10, icon: '🟡' })
        options.push({ value: 'border_10_alt', label: 'Orange Dashed', level: 10, icon: '🟠' })
      }
    }

    // Background options
    if (category === 'background') {
      if (currentLevel >= 2) {
        options.push({ value: 'background_2', label: 'Nature Landscape', level: 2, icon: '🌲' })
      }
      if (currentLevel >= 3) {
        options.push({ value: 'background_3', label: 'Abstract Geometric', level: 3, icon: '🔷' })
      }
      if (currentLevel >= 4) {
        options.push({ value: 'background_4', label: 'Space Galaxy', level: 4, icon: '🌌' })
        options.push({ value: 'background_4_alt', label: 'Urban City', level: 4, icon: '🏙️' })
      }
      if (currentLevel >= 5) {
        options.push({ value: 'background_5', label: 'Wood Texture', level: 5, icon: '🪵' })
        options.push({ value: 'background_5_alt', label: 'Stone Texture', level: 5, icon: '🪨' })
      }
      if (currentLevel >= 6) {
        options.push({ value: 'background_6', label: 'Forest Scene', level: 6, icon: '🌳' })
        options.push({ value: 'background_6_alt', label: 'Ocean Scene', level: 6, icon: '🌊' })
      }
      if (currentLevel >= 7) {
        options.push({ value: 'background_7', label: 'Starry Night', level: 7, icon: '⭐' })
        options.push({ value: 'background_7_alt', label: 'Mountain Range', level: 7, icon: '⛰️' })
      }
      if (currentLevel >= 8) {
        options.push({ value: 'background_8', label: 'Spring Blossoms', level: 8, icon: '🌸' })
        options.push({ value: 'background_8_alt', label: 'Autumn Colors', level: 8, icon: '🍂' })
      }
      if (currentLevel >= 9) {
        options.push({ value: 'background_9', label: 'Minimal Abstract', level: 9, icon: '🎨' })
        options.push({ value: 'background_9_alt', label: 'Modern Design', level: 9, icon: '🏗️' })
      }
      if (currentLevel >= 10) {
        options.push({ value: 'background_10', label: 'Cosmic Universe', level: 10, icon: '🌌' })
        options.push({ value: 'background_10_alt', label: 'Sunset Horizon', level: 10, icon: '🌅' })
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

    // Animation options
    if (category === 'animation') {
      if (currentLevel >= 2) {
        options.push({ value: 'animation_2', label: 'Pulse', level: 2, icon: '💓' })
        options.push({ value: 'animation_2_alt', label: 'Float', level: 2, icon: '🦋' })
      }
      if (currentLevel >= 3) {
        options.push({ value: 'animation_3', label: 'Bounce', level: 3, icon: '⚽' })
        options.push({ value: 'animation_3_alt', label: 'Sparkle', level: 3, icon: '✨' })
      }
      if (currentLevel >= 4) {
        options.push({ value: 'animation_4', label: 'Spin', level: 4, icon: '🌀' })
        options.push({ value: 'animation_4_alt', label: 'Glow', level: 4, icon: '💡' })
      }
      if (currentLevel >= 5) {
        options.push({ value: 'animation_5', label: 'Ping', level: 5, icon: '📡' })
        options.push({ value: 'animation_5_alt', label: 'Rainbow', level: 5, icon: '🌈' })
      }
      if (currentLevel >= 6) {
        options.push({ value: 'animation_6', label: 'Pulse + Bounce', level: 6, icon: '💫' })
        options.push({ value: 'animation_6_alt', label: 'Shake', level: 6, icon: '📳' })
      }
      if (currentLevel >= 7) {
        options.push({ value: 'animation_7', label: 'Spin + Pulse', level: 7, icon: '🌟' })
        options.push({ value: 'animation_7_alt', label: 'Fade In', level: 7, icon: '👻' })
      }
      if (currentLevel >= 8) {
        options.push({ value: 'animation_8', label: 'Bounce + Ping', level: 8, icon: '💎' })
        options.push({ value: 'animation_8_alt', label: 'Slide In', level: 8, icon: '➡️' })
      }
      if (currentLevel >= 9) {
        options.push({ value: 'animation_9', label: 'Pulse + Spin', level: 9, icon: '✨' })
        options.push({ value: 'animation_9_alt', label: 'Scale In', level: 9, icon: '📏' })
      }
      if (currentLevel >= 10) {
        options.push({ value: 'animation_10', label: 'Bounce + Spin', level: 10, icon: '👑' })
        options.push({ value: 'animation_10_alt', label: 'Rotate In', level: 10, icon: '🔄' })
      }
    }

    // Font options
    if (category === 'font') {
      if (currentLevel >= 2) {
        options.push({ value: 'font_2', label: 'Serif', level: 2, icon: '📝' })
        options.push({ value: 'font_2_alt', label: 'Sans + Wide', level: 2, icon: '📏' })
      }
      if (currentLevel >= 3) {
        options.push({ value: 'font_3', label: 'Monospace', level: 3, icon: '💻' })
        options.push({ value: 'font_3_alt', label: 'Serif + Wide', level: 3, icon: '📐' })
      }
      if (currentLevel >= 4) {
        options.push({ value: 'font_4', label: 'Display', level: 4, icon: '🎭' })
        options.push({ value: 'font_4_alt', label: 'Monospace + Wide', level: 4, icon: '⌨️' })
      }
      if (currentLevel >= 5) {
        options.push({ value: 'font_5', label: 'Cursive', level: 5, icon: '✒️' })
        options.push({ value: 'font_5_alt', label: 'Cursive + Wide', level: 5, icon: '🖋️' })
      }
      if (currentLevel >= 6) {
        options.push({ value: 'font_6', label: 'Fantasy', level: 6, icon: '🐉' })
        options.push({ value: 'font_6_alt', label: 'Fantasy + Wide', level: 6, icon: '🧙' })
      }
      if (currentLevel >= 7) {
        options.push({ value: 'font_7', label: 'Sans Bold', level: 7, icon: '📰' })
        options.push({ value: 'font_7_alt', label: 'Sans Bold + Wide', level: 7, icon: '📊' })
      }
      if (currentLevel >= 8) {
        options.push({ value: 'font_8', label: 'Serif Bold', level: 8, icon: '📚' })
        options.push({ value: 'font_8_alt', label: 'Serif Bold + Wide', level: 8, icon: '📖' })
      }
      if (currentLevel >= 9) {
        options.push({ value: 'font_9', label: 'Monospace Bold', level: 9, icon: '💾' })
        options.push({ value: 'font_9_alt', label: 'Monospace Bold + Wide', level: 9, icon: '💿' })
      }
      if (currentLevel >= 10) {
        options.push({ value: 'font_10', label: 'Display Bold', level: 10, icon: '👑' })
        options.push({ value: 'font_10_alt', label: 'Display Bold + Wide', level: 10, icon: '🎪' })
      }
    }

    // Effect options
    if (category === 'effect') {
      if (currentLevel >= 2) {
        options.push({ value: 'effect_2', label: 'Green Shadow', level: 2, icon: '🟢' })
        options.push({ value: 'effect_2_alt', label: 'Emerald Ring', level: 2, icon: '💚' })
      }
      if (currentLevel >= 3) {
        options.push({ value: 'effect_3', label: 'Blue Shadow', level: 3, icon: '🔵' })
        options.push({ value: 'effect_3_alt', label: 'Cyan Ring', level: 3, icon: '🔷' })
      }
      if (currentLevel >= 4) {
        options.push({ value: 'effect_4', label: 'Purple Shadow', level: 4, icon: '🟣' })
        options.push({ value: 'effect_4_alt', label: 'Violet Ring', level: 4, icon: '💜' })
      }
      if (currentLevel >= 5) {
        options.push({ value: 'effect_5', label: 'Blue Large Shadow', level: 5, icon: '🔵' })
        options.push({ value: 'effect_5_alt', label: 'Amber Ring', level: 5, icon: '🟠' })
      }
      if (currentLevel >= 6) {
        options.push({ value: 'effect_6', label: 'Red Large Shadow', level: 6, icon: '🔴' })
        options.push({ value: 'effect_6_alt', label: 'Rose Ring', level: 6, icon: '🌹' })
      }
      if (currentLevel >= 7) {
        options.push({ value: 'effect_7', label: 'Indigo Large Shadow', level: 7, icon: '🟦' })
        options.push({ value: 'effect_7_alt', label: 'Sky Ring', level: 7, icon: '☁️' })
      }
      if (currentLevel >= 8) {
        options.push({ value: 'effect_8', label: 'Pink Large Shadow', level: 8, icon: '💗' })
        options.push({ value: 'effect_8_alt', label: 'Fuchsia Ring', level: 8, icon: '🟪' })
      }
      if (currentLevel >= 9) {
        options.push({ value: 'effect_9', label: 'Emerald Large Shadow', level: 9, icon: '🟢' })
        options.push({ value: 'effect_9_alt', label: 'Lime Ring', level: 9, icon: '🍋' })
      }
      if (currentLevel >= 10) {
        options.push({ value: 'effect_10', label: 'Amber Large Shadow', level: 10, icon: '🟡' })
        options.push({ value: 'effect_10_alt', label: 'Orange Ring', level: 10, icon: '🟠' })
      }
    }


    
    return options
  }

  const handleCustomizationChange = (category: keyof ProfileCustomization, value: string) => {
    setSelectedCustomizations(prev => ({
      ...prev,
      [category]: value
    }))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!canUploadCustomAvatar()) {
      alert('You need to reach level 3 to upload custom avatars! Complete more chores to unlock this feature.')
      return
    }

    const file = event.target.files?.[0]
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image file is too large. Please choose an image under 5MB.')
        return
      }

      // Check file type
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
      // New avatar options with different styles
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
      // New theme options
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

    const specialThemeOptions = {
      none: '',
      rainbow_9: 'bg-gradient-to-r from-red-200 via-yellow-200 via-green-200 via-blue-200 via-purple-200 to-pink-200 text-gray-900',
      holographic_7: 'holographic text-indigo-900 shadow-lg shadow-indigo-500/25',
      neon_8: 'bg-gradient-to-br from-pink-200 to-rose-200 text-pink-900 shadow-lg shadow-pink-500/50 neon-glow',
      cosmic_9: 'bg-gradient-to-br from-emerald-200 via-teal-200 to-cyan-200 text-emerald-900 shadow-lg shadow-emerald-500/25',
      legendary_10: 'bg-gradient-to-br from-amber-200 via-yellow-200 to-orange-200 text-amber-900 shadow-lg shadow-amber-500/50',
      // New special theme options
      aurora_7: 'bg-gradient-to-br from-green-200 via-blue-200 to-purple-200 text-green-900 shadow-lg shadow-green-500/25',
      sunset_8: 'bg-gradient-to-br from-orange-200 via-red-200 to-pink-200 text-orange-900 shadow-lg shadow-orange-500/50',
      ocean_9: 'bg-gradient-to-br from-blue-200 via-cyan-200 to-teal-200 text-blue-900 shadow-lg shadow-blue-500/25',
      forest_10: 'bg-gradient-to-br from-green-200 via-emerald-200 to-lime-200 text-green-900 shadow-lg shadow-green-500/50',
      galaxy_9: 'bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200 text-indigo-900 shadow-lg shadow-indigo-500/25',
      fire_10: 'bg-gradient-to-br from-red-200 via-orange-200 to-yellow-200 text-red-900 shadow-lg shadow-red-500/50'
    }

    const borderOptions = {
      none: 'border-0',
      border_2: 'border-2 border-green-500',
      border_3: 'border-2 border-blue-500',
      border_4: 'border-2 border-purple-500',
      border_5: 'border-2 border-yellow-500',
      border_6: 'border-2 border-red-500',
      border_7: 'border-2 border-indigo-500',
      border_8: 'border-2 border-pink-500',
      border_9: 'border-2 border-emerald-500',
      border_10: 'border-2 border-amber-500',
      // New border options
      border_2_alt: 'border-2 border-emerald-500 border-dashed',
      border_3_alt: 'border-2 border-cyan-500 border-dotted',
      border_4_alt: 'border-2 border-violet-500 border-double',
      border_5_alt: 'border-4 border-amber-500',
      border_6_alt: 'border-4 border-rose-500 border-dashed',
      border_7_alt: 'border-4 border-sky-500 border-dotted',
      border_8_alt: 'border-4 border-fuchsia-500 border-double',
      border_9_alt: 'border-4 border-lime-500',
      border_10_alt: 'border-4 border-orange-500 border-dashed'
    }

    const backgroundOptions = {
      default: '',
      background_2: `bg-[url("${BACKGROUND_SOURCES.unsplash.getBackgroundUrl('nature', 'landscape')}")] bg-cover bg-center`,
      background_3: `bg-[url("${BACKGROUND_SOURCES.unsplash.getBackgroundUrl('abstract', 'geometric')}")] bg-cover bg-center`,
      background_4: `bg-[url("${BACKGROUND_SOURCES.unsplash.getBackgroundUrl('space', 'galaxy')}")] bg-cover bg-center`,
      background_4_alt: `bg-[url("${BACKGROUND_SOURCES.unsplash.getBackgroundUrl('urban', 'city')}")] bg-cover bg-center`,
      background_5: `bg-[url("${BACKGROUND_SOURCES.unsplash.getBackgroundUrl('textures', 'wood')}")] bg-cover bg-center`,
      background_5_alt: `bg-[url("${BACKGROUND_SOURCES.unsplash.getBackgroundUrl('textures', 'stone')}")] bg-cover bg-center`,
      background_6: `bg-[url("${BACKGROUND_SOURCES.unsplash.getBackgroundUrl('nature', 'forest')}")] bg-cover bg-center`,
      background_6_alt: `bg-[url("${BACKGROUND_SOURCES.unsplash.getBackgroundUrl('nature', 'ocean')}")] bg-cover bg-center`,
      background_7: `bg-[url("${BACKGROUND_SOURCES.unsplash.getBackgroundUrl('space', 'stars')}")] bg-cover bg-center`,
      background_7_alt: `bg-[url("${BACKGROUND_SOURCES.unsplash.getBackgroundUrl('nature', 'mountains')}")] bg-cover bg-center`,
      background_8: `bg-[url("${BACKGROUND_SOURCES.unsplash.getBackgroundUrl('seasonal', 'spring')}")] bg-cover bg-center`,
      background_8_alt: `bg-[url("${BACKGROUND_SOURCES.unsplash.getBackgroundUrl('seasonal', 'autumn')}")] bg-cover bg-center`,
      background_9: `bg-[url("${BACKGROUND_SOURCES.unsplash.getBackgroundUrl('abstract', 'minimal')}")] bg-cover bg-center`,
      background_9_alt: `bg-[url("${BACKGROUND_SOURCES.unsplash.getBackgroundUrl('abstract', 'modern')}")] bg-cover bg-center`,
      background_10: `bg-[url("${BACKGROUND_SOURCES.unsplash.getBackgroundUrl('space', 'cosmos')}")] bg-cover bg-center`,
      background_10_alt: `bg-[url("${BACKGROUND_SOURCES.unsplash.getBackgroundUrl('nature', 'sunset')}")] bg-cover bg-center`
    }

    const fontOptions = {
      default: 'font-sans',
      font_2: 'font-serif',
      font_3: 'font-mono',
      font_4: 'font-display',
      font_5: 'font-cursive',
      font_6: 'font-fantasy',
      font_7: 'font-sans font-bold',
      font_8: 'font-serif font-bold',
      font_9: 'font-mono font-bold',
      font_10: 'font-display font-bold',
      // New font options
      font_2_alt: 'font-sans tracking-wide',
      font_3_alt: 'font-serif tracking-wide',
      font_4_alt: 'font-mono tracking-wide',
      font_5_alt: 'font-cursive tracking-wide',
      font_6_alt: 'font-fantasy tracking-wide',
      font_7_alt: 'font-sans font-bold tracking-wide',
      font_8_alt: 'font-serif font-bold tracking-wide',
      font_9_alt: 'font-mono font-bold tracking-wide',
      font_10_alt: 'font-display font-bold tracking-wide'
    }

    const effectOptions = {
      none: '',
      effect_2: 'shadow-md shadow-green-500/30',
      effect_3: 'shadow-md shadow-blue-500/30',
      effect_4: 'shadow-md shadow-purple-500/30',
      effect_5: 'shadow-lg shadow-blue-500/50',
      effect_6: 'shadow-lg shadow-red-500/50',
      effect_7: 'shadow-lg shadow-indigo-500/50',
      effect_8: 'shadow-lg shadow-pink-500/50',
      effect_9: 'shadow-lg shadow-emerald-500/50',
      effect_10: 'shadow-lg shadow-amber-500/50',
      // New effect options
      effect_2_alt: 'shadow-md shadow-emerald-500/30 ring-2 ring-emerald-200',
      effect_3_alt: 'shadow-md shadow-cyan-500/30 ring-2 ring-cyan-200',
      effect_4_alt: 'shadow-md shadow-violet-500/30 ring-2 ring-violet-200',
      effect_5_alt: 'shadow-lg shadow-amber-500/50 ring-2 ring-amber-200',
      effect_6_alt: 'shadow-lg shadow-rose-500/50 ring-2 ring-rose-200',
      effect_7_alt: 'shadow-lg shadow-sky-500/50 ring-2 ring-sky-200',
      effect_8_alt: 'shadow-lg shadow-fuchsia-500/50 ring-2 ring-fuchsia-200',
      effect_9_alt: 'shadow-lg shadow-lime-500/50 ring-2 ring-lime-200',
      effect_10_alt: 'shadow-lg shadow-orange-500/50 ring-2 ring-orange-200'
    }

    const animationOptions = {
      none: '',
      animation_2: 'animate-pulse',
      animation_3: 'animate-bounce',
      animation_4: 'animate-spin',
      animation_5: 'animate-ping',
      animation_6: 'animate-pulse animate-bounce',
      animation_7: 'animate-spin animate-pulse',
      animation_8: 'animate-bounce animate-ping',
      animation_9: 'animate-pulse animate-spin',
      animation_10: 'animate-bounce animate-spin',
      // New animation options
      animation_2_alt: 'animate-float',
      animation_3_alt: 'animate-sparkle',
      animation_4_alt: 'animate-glow',
      animation_5_alt: 'animate-rainbow',
      animation_6_alt: 'animate-shake',
      animation_7_alt: 'animate-fade-in',
      animation_8_alt: 'animate-slide-in',
      animation_9_alt: 'animate-scale-in',
      animation_10_alt: 'animate-rotate-in'
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
        
        // Check if it's a URL (professional avatar) or emoji
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
    const specialThemeClass = specialThemeOptions[selectedCustomizations.theme as keyof typeof specialThemeOptions] || specialThemeOptions.none
    const borderClass = borderOptions[selectedCustomizations.border as keyof typeof borderOptions] || borderOptions.none
    const backgroundClass = backgroundOptions[selectedCustomizations.background as keyof typeof backgroundOptions] || backgroundOptions.default
    const fontClass = fontOptions[selectedCustomizations.font as keyof typeof fontOptions] || fontOptions.default
    const effectClass = effectOptions[selectedCustomizations.effect as keyof typeof effectOptions] || effectOptions.none
    const animationClass = animationOptions[selectedCustomizations.animation as keyof typeof animationOptions] || animationOptions.none

    // Use special theme if available, otherwise fall back to regular theme
    const finalThemeClass = specialThemeClass || themeClass

    return (
      <div className={`p-6 rounded-lg ${finalThemeClass} ${borderClass} ${backgroundClass} ${fontClass} ${effectClass} ${animationClass}`}>
        <div className="text-center">
          {renderAvatar()}
          <h3 className="text-xl font-bold mb-2">Your Profile</h3>
          <p className="text-sm opacity-80">Level {currentLevel} • {state.stats.earnedPoints} points</p>
          
          {selectedCustomizations.badge !== 'none' && (
            <div className={`mt-3 inline-block px-3 py-1 rounded-full text-sm font-medium ${badgeStyles[selectedCustomizations.badge as keyof typeof badgeStyles] || ''}`}>
              {badgeOptions[selectedCustomizations.badge as keyof typeof badgeOptions] || selectedCustomizations.badge}
            </div>
          )}
          
          {selectedCustomizations.animation !== 'none' && (
            <div className={`mt-2 text-2xl ${animationOptions[selectedCustomizations.animation as keyof typeof animationOptions] || ''}`}>
              ✨
            </div>
          )}
        </div>
      </div>
    )
  }

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const isCategoryExpanded = (category: string) => expandedCategories.has(category)

  return (
    <div className="space-y-6">
      {/* Level Up Rewards Section */}
      <div className="bg-blue-50 shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">🎯 Level Up Rewards</h2>
        </div>
        
        {/* Current Progress Info */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-3 flex items-center">
            <Crown className="w-5 h-5 mr-2 text-yellow-500" />
            Your Progress
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="text-2xl font-bold text-blue-600">{currentLevel}</div>
              <div className="text-sm text-blue-700">Current Level</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-purple-100">
              <div className="text-2xl font-bold text-purple-600">{state.stats.earnedPoints}</div>
              <div className="text-sm text-purple-700">Earned Points</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-green-100">
              <div className="text-2xl font-bold text-green-600">{getAvailableOptions('avatar').length}</div>
              <div className="text-sm text-green-700">Avatar Options</div>
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
                    Need {level.pointsRequired - state.stats.earnedPoints} more points to unlock
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">💡 How to unlock rewards:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Complete daily, weekly, and monthly chores</li>
            <li>• Higher difficulty chores give more points</li>
            <li>• Maintain streaks for bonus points</li>
            <li>• Each level unlocks new profile customization options</li>
            <li>• Default chores are automatically loaded when you start</li>
          </ul>
        </div>
      </div>

      {/* Profile Customization Section */}
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
                <span className="text-sm text-gray-500">({getAvailableOptions('avatar').length} options) - Level {currentLevel}</span>
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

          {/* Border Selection */}
          <div className="border rounded-lg">
            <button
              onClick={() => toggleCategory('border')}
              className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Target className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-900">Border Style</span>
                <span className="text-sm text-gray-500">({getAvailableOptions('border').length} options)</span>
              </div>
              <div className={`transform transition-transform ${isCategoryExpanded('border') ? 'rotate-180' : ''}`}>
                ▼
              </div>
            </button>
            
            {isCategoryExpanded('border') && (
              <div className="p-4 border-t bg-gray-50">
                <div className="grid grid-cols-2 gap-2">
                  {getAvailableOptions('border').map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleCustomizationChange('border', option.value)}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        selectedCustomizations.border === option.value
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

          {/* Background Selection */}
          <div className="border rounded-lg">
            <button
              onClick={() => toggleCategory('background')}
              className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Star className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-gray-900">Background Style</span>
                <span className="text-sm text-gray-500">({getAvailableOptions('background').length} options)</span>
              </div>
              <div className={`transform transition-transform ${isCategoryExpanded('background') ? 'rotate-180' : ''}`}>
                ▼
              </div>
            </button>
            
            {isCategoryExpanded('background') && (
              <div className="p-4 border-t bg-gray-50">
                <div className="grid grid-cols-2 gap-2">
                  {getAvailableOptions('background').map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleCustomizationChange('background', option.value)}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        selectedCustomizations.background === option.value
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

          {/* Animation Selection */}
          <div className="border rounded-lg">
            <button
              onClick={() => toggleCategory('animation')}
              className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Zap className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-gray-900">Animation Style</span>
                <span className="text-sm text-gray-500">({getAvailableOptions('animation').length} options)</span>
              </div>
              <div className={`transform transition-transform ${isCategoryExpanded('animation') ? 'rotate-180' : ''}`}>
                ▼
              </div>
            </button>
            
            {isCategoryExpanded('animation') && (
              <div className="p-4 border-t bg-gray-50">
                <div className="grid grid-cols-2 gap-2">
                  {getAvailableOptions('animation').map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleCustomizationChange('animation', option.value)}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        selectedCustomizations.animation === option.value
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

          {/* Font Selection */}
          <div className="border rounded-lg">
            <button
              onClick={() => toggleCategory('font')}
              className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Eye className="w-5 h-5 text-indigo-600" />
                <span className="font-medium text-gray-900">Font Selection</span>
                <span className="text-sm text-gray-500">({getAvailableOptions('font').length} options)</span>
              </div>
              <div className={`transform transition-transform ${isCategoryExpanded('font') ? 'rotate-180' : ''}`}>
                ▼
              </div>
            </button>
            
            {isCategoryExpanded('font') && (
              <div className="p-4 border-t bg-gray-50">
                <div className="grid grid-cols-2 gap-2">
                  {getAvailableOptions('font').map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleCustomizationChange('font', option.value)}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        selectedCustomizations.font === option.value
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

          {/* Effect Selection */}
          <div className="border rounded-lg">
            <button
              onClick={() => toggleCategory('effect')}
              className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Sparkle className="w-5 h-5 text-pink-600" />
                <span className="font-medium text-gray-900">Visual Effects</span>
                <span className="text-sm text-gray-500">({getAvailableOptions('effect').length} options)</span>
              </div>
              <div className={`transform transition-transform ${isCategoryExpanded('effect') ? 'rotate-180' : ''}`}>
                ▼
              </div>
            </button>
            
            {isCategoryExpanded('effect') && (
              <div className="p-4 border-t bg-gray-50">
                <div className="grid grid-cols-2 gap-2">
                  {getAvailableOptions('effect').map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleCustomizationChange('effect', option.value)}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        selectedCustomizations.effect === option.value
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
        </div>
      </div>
    </div>
  );
};
