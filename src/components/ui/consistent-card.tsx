import React from 'react'
import { cn } from '../../utils/cn'

interface ConsistentCardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'subtle'
  padding?: 'sm' | 'md' | 'lg'
  hover?: boolean
}

export const ConsistentCard: React.FC<ConsistentCardProps> = ({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  hover = false
}) => {
  const baseClasses = 'border-border bg-card/40 backdrop-blur-sm rounded-lg'
  
  const variantClasses = {
    default: 'border shadow-sm',
    elevated: 'border shadow-md',
    subtle: 'border/50 shadow-sm'
  }
  
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8'
  }
  
  const hoverClasses = hover ? 'transition-all duration-200 hover:shadow-md hover:bg-card/50' : ''
  
  return (
    <div className={cn(
      baseClasses,
      variantClasses[variant],
      paddingClasses[padding],
      hoverClasses,
      className
    )}>
      {children}
    </div>
  )
}

// Card sub-components for consistent structure
export const ConsistentCardHeader: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className = '' }) => (
  <div className={cn('pb-4', className)}>
    {children}
  </div>
)

export const ConsistentCardContent: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className = '' }) => (
  <div className={cn('space-y-4', className)}>
    {children}
  </div>
)

export const ConsistentCardFooter: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className = '' }) => (
  <div className={cn('pt-4 border-t border-border/50', className)}>
    {children}
  </div>
)
