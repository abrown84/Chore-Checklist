import React from 'react'
import { cn } from '../../utils/cn'
import { Button } from './button'

interface ConsistentButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  asChild?: boolean
}

export const ConsistentButton: React.FC<ConsistentButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  asChild = false
}) => {
  const baseClasses = 'font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variantClasses = {
    primary: 'bg-amber-400 text-slate-900 hover:bg-amber-300 focus:ring-amber-400 shadow-sm hover:shadow-md',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-secondary',
    outline: 'border border-border bg-card/40 text-foreground hover:bg-accent/50 focus:ring-primary',
    ghost: 'text-foreground hover:bg-accent/50 focus:ring-primary',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2 text-sm rounded-lg',
    lg: 'px-6 py-3 text-base rounded-lg'
  }
  
  const stateClasses = disabled 
    ? 'opacity-50 cursor-not-allowed' 
    : loading 
      ? 'opacity-75 cursor-wait' 
      : 'cursor-pointer'
  
  const loadingSpinner = loading && (
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
  )
  
  return (
    <Button
      variant={variant === 'primary' ? 'default' : variant}
      size={size === 'md' ? 'default' : size}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        stateClasses,
        className
      )}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
      asChild={asChild}
    >
      {loadingSpinner}
      {children}
    </Button>
  )
}

// Specialized button variants for common use cases
export const PrimaryButton: React.FC<Omit<ConsistentButtonProps, 'variant'>> = (props) => (
  <ConsistentButton variant="primary" {...props} />
)

export const SecondaryButton: React.FC<Omit<ConsistentButtonProps, 'variant'>> = (props) => (
  <ConsistentButton variant="secondary" {...props} />
)

export const OutlineButton: React.FC<Omit<ConsistentButtonProps, 'variant'>> = (props) => (
  <ConsistentButton variant="outline" {...props} />
)

export const GhostButton: React.FC<Omit<ConsistentButtonProps, 'variant'>> = (props) => (
  <ConsistentButton variant="ghost" {...props} />
)

export const DestructiveButton: React.FC<Omit<ConsistentButtonProps, 'variant'>> = (props) => (
  <ConsistentButton variant="destructive" {...props} />
)
