import React from 'react'
import { cn } from '../../utils/cn'
import { Badge } from './badge'

interface ConsistentBadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const ConsistentBadge: React.FC<ConsistentBadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  const baseClasses = 'font-medium transition-all duration-200'
  
  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    outline: 'border border-border bg-transparent text-foreground hover:bg-accent/50',
    success: 'bg-green-500 text-white hover:bg-green-600',
    warning: 'bg-yellow-500 text-white hover:bg-yellow-600',
    info: 'bg-blue-500 text-white hover:bg-blue-600'
  }
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs rounded',
    md: 'px-2.5 py-1 text-xs rounded-md',
    lg: 'px-3 py-1.5 text-sm rounded-lg'
  }
  
  return (
    <Badge
      variant={variant === 'default' ? 'default' : 'secondary'}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </Badge>
  )
}

// Specialized badge variants for common use cases
export const SuccessBadge: React.FC<Omit<ConsistentBadgeProps, 'variant'>> = (props) => (
  <ConsistentBadge variant="success" {...props} />
)

export const WarningBadge: React.FC<Omit<ConsistentBadgeProps, 'variant'>> = (props) => (
  <ConsistentBadge variant="warning" {...props} />
)

export const InfoBadge: React.FC<Omit<ConsistentBadgeProps, 'variant'>> = (props) => (
  <ConsistentBadge variant="info" {...props} />
)

export const ErrorBadge: React.FC<Omit<ConsistentBadgeProps, 'variant'>> = (props) => (
  <ConsistentBadge variant="destructive" {...props} />
)

export const OutlineBadge: React.FC<Omit<ConsistentBadgeProps, 'variant'>> = (props) => (
  <ConsistentBadge variant="outline" {...props} />
)
