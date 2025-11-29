import React from 'react'
import { cn } from '../../utils/cn'
import { 
  parseAvatarUrl, 
  getAvatarUrl, 
  getAvatarGradient, 
  getInitials
} from '../../utils/avatarUtils'

export interface AvatarProps {
  avatarUrl?: string | null
  userName?: string
  userId?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number
  className?: string
  showBorder?: boolean
  borderColor?: string
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-16 h-16 text-2xl',
  xl: 'w-20 h-20 text-3xl',
}

const borderClasses = {
  xs: 'border',
  sm: 'border-2',
  md: 'border-2',
  lg: 'border-4',
  xl: 'border-4',
}

export const Avatar: React.FC<AvatarProps> = ({
  avatarUrl,
  userName,
  userId,
  size = 'md',
  className,
  showBorder = false,
  borderColor = 'border-white',
}) => {
  const config = parseAvatarUrl(avatarUrl)
  const avatarUrlResolved = getAvatarUrl(config)
  const gradient = getAvatarGradient(userName, userId)
  const initials = getInitials(userName)
  
  // For numeric sizes, use inline styles
  const sizeStyle = typeof size === 'number' 
    ? { width: `${size}px`, height: `${size}px` }
    : undefined
  
  const sizeClass = typeof size === 'number' 
    ? '' 
    : sizeClasses[size]
  
  const borderClass = showBorder 
    ? typeof size === 'number'
      ? 'border-2'
      : borderClasses[size]
    : ''
  
  const commonClasses = cn(
    'rounded-full',
    sizeClass,
    borderClass,
    borderColor,
    showBorder && 'shadow-lg',
    className
  )
  
  // Custom uploaded avatar
  if (config.type === 'custom' && avatarUrlResolved) {
    return (
      <img
        src={avatarUrlResolved}
        alt={userName || 'Avatar'}
        className={cn('object-cover', commonClasses)}
        style={sizeStyle}
      />
    )
  }
  
  // Generated avatar (Emoji)
  if (config.type === 'generated' && avatarUrlResolved) {
    // Check if it's an emoji character (not a URL)
    // Emojis are returned directly from getAvatarUrl, URLs start with http
    if (!avatarUrlResolved.startsWith('http')) {
      // It's an emoji - render it directly in a clean circle
      const emojiSize = typeof size === 'number' 
        ? `${Math.max(size * 0.7, 24)}px`
        : size === 'xs' ? '16px'
        : size === 'sm' ? '20px'
        : size === 'md' ? '28px'
        : size === 'lg' ? '40px'
        : '48px'
      
      return (
        <div
          key={`emoji-${avatarUrl}-${userId}`}
          className={cn('flex items-center justify-center', commonClasses)}
          style={{
            ...sizeStyle,
            backgroundColor: 'transparent',
            background: 'linear-gradient(135deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.02) 100%)'
          }}
          title={userName || 'Avatar'}
        >
          <span 
            className="select-none"
            style={{ 
              fontSize: emojiSize, 
              lineHeight: 1,
              display: 'block'
            }}
          >
            {avatarUrlResolved}
          </span>
        </div>
      )
    }
    
    // Legacy: If it's a URL (old DiceBear system), try to load as image
    return (
      <img
        key={`generated-${avatarUrl}-${userId}`}
        src={avatarUrlResolved}
        alt={userName || 'Avatar'}
        className={cn('object-cover', commonClasses)}
        style={sizeStyle}
        onError={(e) => {
          // Fallback to default if image fails to load
          const target = e.target as HTMLImageElement
          target.style.display = 'none'
          const parent = target.parentElement
          if (parent) {
            const fallback = document.createElement('div')
            fallback.className = cn('rounded-full flex items-center justify-center text-white font-bold', `bg-gradient-to-br ${gradient}`, sizeClass)
            if (sizeStyle?.width) fallback.style.width = sizeStyle.width
            if (sizeStyle?.height) fallback.style.height = sizeStyle.height
            fallback.textContent = initials
            parent.appendChild(fallback)
          }
        }}
      />
    )
  }
  
  // Default avatar (gradient with initials)
  return (
    <div
      className={cn(
        'flex items-center justify-center text-white font-bold',
        `bg-gradient-to-br ${gradient}`,
        commonClasses
      )}
      style={sizeStyle}
      title={userName || 'User'}
    >
      {initials}
    </div>
  )
}

// Convenience component for displaying avatar as emoji-like (backwards compatibility)
export const AvatarEmoji: React.FC<Omit<AvatarProps, 'size'> & { size?: number }> = ({
  avatarUrl,
  userName,
  userId,
  size = 24,
  className,
}) => {
  // This is for backwards compatibility - shows avatar in a compact emoji-like format
  return (
    <Avatar
      avatarUrl={avatarUrl}
      userName={userName}
      userId={userId}
      size={size}
      className={className}
    />
  )
}

