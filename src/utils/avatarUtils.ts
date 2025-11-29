// Centralized Avatar System
// This provides a clean, consistent way to handle all avatar types

export type AvatarType = 'default' | 'generated' | 'custom'

export interface AvatarConfig {
  type: AvatarType
  value: string // For 'generated': style:seed, for 'custom': base64 URL, for 'default': empty
}

// Emoji avatar mapping - progression from bad to angelic
export const EMOJI_AVATARS = {
  // Level 1 - Starting out rough
  emoji_1: { emoji: '🤢', name: 'Nauseated', description: 'Just getting started...' },
  emoji_1_alt: { emoji: '🤮', name: 'Vomiting', description: 'Rough start' },
  
  // Level 2 - Still struggling
  emoji_2: { emoji: '😴', name: 'Sleepy', description: 'Waking up' },
  emoji_2_alt: { emoji: '🥱', name: 'Yawning', description: 'Getting there' },
  
  // Level 3 - Neutral
  emoji_3: { emoji: '😑', name: 'Expressionless', description: 'Meh' },
  emoji_3_alt: { emoji: '😐', name: 'Neutral', description: 'Okay' },
  
  // Level 4 - Slight improvement
  emoji_4: { emoji: '🙂', name: 'Slight Smile', description: 'Not bad' },
  emoji_4_alt: { emoji: '😏', name: 'Smirking', description: 'Getting better' },
  
  // Level 5 - Actually smiling
  emoji_5: { emoji: '😊', name: 'Smiling', description: 'Nice!' },
  emoji_5_alt: { emoji: '🙃', name: 'Upside Down', description: 'Fun times' },
  
  // Level 6 - Happy
  emoji_6: { emoji: '😄', name: 'Grinning', description: 'Happy!' },
  emoji_6_alt: { emoji: '😁', name: 'Beaming', description: 'Joyful' },
  
  // Level 7 - Really good
  emoji_7: { emoji: '😎', name: 'Cool', description: 'Awesome!' },
  emoji_7_alt: { emoji: '🤗', name: 'Hugging', description: 'Loving it' },
  
  // Level 8 - Great
  emoji_8: { emoji: '🤩', name: 'Star-Struck', description: 'Amazing!' },
  emoji_8_alt: { emoji: '🥳', name: 'Partying', description: 'Celebrating' },
  
  // Level 9 - Angelic
  emoji_9: { emoji: '😇', name: 'Angel', description: 'Too good!' },
  emoji_9_alt: { emoji: '🙏', name: 'Praying', description: 'Blessed' },
  
  // Level 10 - Ultimate
  emoji_10: { emoji: '👼', name: 'Baby Angel', description: 'Divine!' },
  emoji_10_alt: { emoji: '🤴', name: 'Prince', description: 'Royalty' },
} as const

export type AvatarId = keyof typeof EMOJI_AVATARS

// Parse avatar URL from database into structured config
export function parseAvatarUrl(avatarUrl: string | undefined | null): AvatarConfig {
  if (!avatarUrl || avatarUrl === 'default') {
    return { type: 'default', value: '' }
  }
  
  // Check if it's a custom uploaded image (base64 data URL)
  if (avatarUrl.startsWith('data:image/')) {
    return { type: 'custom', value: avatarUrl }
  }
  
  // Check if it's an emoji avatar identifier (emoji_X)
  if (avatarUrl.startsWith('emoji_')) {
    return { type: 'generated', value: avatarUrl }
  }
  
  // Legacy: if it's an old avatar_ identifier, migrate it to emoji based on level
  if (avatarUrl.startsWith('avatar_')) {
    // Map old avatar IDs to new emoji IDs based on level
    const level = parseInt(avatarUrl.split('_')[1]) || 1
    const isAlt = avatarUrl.includes('_alt')
    return { type: 'generated', value: `emoji_${level}${isAlt ? '_alt' : ''}` }
  }
  
  // Legacy: if it's just an emoji character, check if it matches any of our emoji avatars
  if (avatarUrl.match(/^[\u{1F300}-\u{1F9FF}]$/u)) {
    // Find which emoji avatar this matches
    for (const [id, config] of Object.entries(EMOJI_AVATARS)) {
      if (config.emoji === avatarUrl) {
        return { type: 'generated', value: id }
      }
    }
    // If it's just a random emoji, treat as default
    return { type: 'default', value: '' }
  }
  
  // Default fallback
  return { type: 'default', value: '' }
}

// Generate avatar URL from config
export function getAvatarUrl(config: AvatarConfig): string {
  switch (config.type) {
    case 'custom':
      return config.value // base64 data URL
    
    case 'generated': {
      const emojiConfig = EMOJI_AVATARS[config.value as AvatarId]
      if (!emojiConfig) {
        // Fallback to default if invalid
        return getDefaultAvatarUrl()
      }
      
      // Return the emoji as-is (we'll render it directly, not as a URL)
      return emojiConfig.emoji
    }
    
    case 'default':
    default:
      return getDefaultAvatarUrl()
  }
}

// Get emoji avatar by ID
export function getEmojiAvatar(avatarId: string) {
  return EMOJI_AVATARS[avatarId as AvatarId]
}

// Generate default avatar (gradient with initials)
export function getDefaultAvatarUrl(): string {
  // Return empty string - component will render gradient with initials
  return ''
}

// Get gradient colors based on name/ID
export function getAvatarGradient(name?: string, userId?: string): string {
  const colors = [
    'from-blue-400 to-blue-600',
    'from-green-400 to-green-600',
    'from-purple-400 to-purple-600',
    'from-pink-400 to-pink-600',
    'from-yellow-400 to-yellow-600',
    'from-red-400 to-red-600',
    'from-indigo-400 to-indigo-600',
    'from-teal-400 to-teal-600',
  ]
  
  const seed = name || userId || 'default'
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

// Get initials from name
export function getInitials(name?: string, email?: string): string {
  if (name && name.trim()) {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U'
  }
  
  if (email) {
    return email[0].toUpperCase()
  }
  
  return 'U'
}

// Serialize avatar config to string for database storage
export function serializeAvatarConfig(config: AvatarConfig): string {
  switch (config.type) {
    case 'custom':
      return config.value // Store base64 data URL as-is
    case 'generated':
      return config.value // Store identifier like 'avatar_2'
    case 'default':
    default:
      return 'default'
  }
}

// Get avatar options available at a given level
export function getAvailableAvatarOptions(level: number) {
  const options: Array<{ value: string; label: string; level: number; icon: string }> = []
  
  // Default option (gradient with initials)
  options.push({
    value: 'default',
    label: 'Default',
    level: 1,
    icon: '👤'
  })
  
  // Level-based emoji options - progression from bad to angelic
  if (level >= 1) {
    options.push({ value: 'emoji_1', label: EMOJI_AVATARS.emoji_1.name, level: 1, icon: EMOJI_AVATARS.emoji_1.emoji })
    options.push({ value: 'emoji_1_alt', label: EMOJI_AVATARS.emoji_1_alt.name, level: 1, icon: EMOJI_AVATARS.emoji_1_alt.emoji })
  }
  if (level >= 2) {
    options.push({ value: 'emoji_2', label: EMOJI_AVATARS.emoji_2.name, level: 2, icon: EMOJI_AVATARS.emoji_2.emoji })
    options.push({ value: 'emoji_2_alt', label: EMOJI_AVATARS.emoji_2_alt.name, level: 2, icon: EMOJI_AVATARS.emoji_2_alt.emoji })
  }
  if (level >= 3) {
    options.push({ value: 'emoji_3', label: EMOJI_AVATARS.emoji_3.name, level: 3, icon: EMOJI_AVATARS.emoji_3.emoji })
    options.push({ value: 'emoji_3_alt', label: EMOJI_AVATARS.emoji_3_alt.name, level: 3, icon: EMOJI_AVATARS.emoji_3_alt.emoji })
  }
  if (level >= 4) {
    options.push({ value: 'emoji_4', label: EMOJI_AVATARS.emoji_4.name, level: 4, icon: EMOJI_AVATARS.emoji_4.emoji })
    options.push({ value: 'emoji_4_alt', label: EMOJI_AVATARS.emoji_4_alt.name, level: 4, icon: EMOJI_AVATARS.emoji_4_alt.emoji })
  }
  if (level >= 5) {
    options.push({ value: 'emoji_5', label: EMOJI_AVATARS.emoji_5.name, level: 5, icon: EMOJI_AVATARS.emoji_5.emoji })
    options.push({ value: 'emoji_5_alt', label: EMOJI_AVATARS.emoji_5_alt.name, level: 5, icon: EMOJI_AVATARS.emoji_5_alt.emoji })
  }
  if (level >= 6) {
    options.push({ value: 'emoji_6', label: EMOJI_AVATARS.emoji_6.name, level: 6, icon: EMOJI_AVATARS.emoji_6.emoji })
    options.push({ value: 'emoji_6_alt', label: EMOJI_AVATARS.emoji_6_alt.name, level: 6, icon: EMOJI_AVATARS.emoji_6_alt.emoji })
  }
  if (level >= 7) {
    options.push({ value: 'emoji_7', label: EMOJI_AVATARS.emoji_7.name, level: 7, icon: EMOJI_AVATARS.emoji_7.emoji })
    options.push({ value: 'emoji_7_alt', label: EMOJI_AVATARS.emoji_7_alt.name, level: 7, icon: EMOJI_AVATARS.emoji_7_alt.emoji })
  }
  if (level >= 8) {
    options.push({ value: 'emoji_8', label: EMOJI_AVATARS.emoji_8.name, level: 8, icon: EMOJI_AVATARS.emoji_8.emoji })
    options.push({ value: 'emoji_8_alt', label: EMOJI_AVATARS.emoji_8_alt.name, level: 8, icon: EMOJI_AVATARS.emoji_8_alt.emoji })
  }
  if (level >= 9) {
    options.push({ value: 'emoji_9', label: EMOJI_AVATARS.emoji_9.name, level: 9, icon: EMOJI_AVATARS.emoji_9.emoji })
    options.push({ value: 'emoji_9_alt', label: EMOJI_AVATARS.emoji_9_alt.name, level: 9, icon: EMOJI_AVATARS.emoji_9_alt.emoji })
  }
  if (level >= 10) {
    options.push({ value: 'emoji_10', label: EMOJI_AVATARS.emoji_10.name, level: 10, icon: EMOJI_AVATARS.emoji_10.emoji })
    options.push({ value: 'emoji_10_alt', label: EMOJI_AVATARS.emoji_10_alt.name, level: 10, icon: EMOJI_AVATARS.emoji_10_alt.emoji })
  }
  
  return options
}

