import React from 'react'
import { cn } from '../../utils/cn'
import { Input } from './input'

interface ConsistentInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  label?: string
  error?: string
  required?: boolean
  disabled?: boolean
  className?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  maxLength?: number
  minLength?: number
  autoComplete?: string
  autoCapitalize?: string
  autoCorrect?: string
  spellCheck?: boolean
}

export const ConsistentInput: React.FC<ConsistentInputProps> = ({
  value,
  onChange,
  placeholder = '',
  type = 'text',
  label,
  error,
  required = false,
  disabled = false,
  className = '',
  icon,
  iconPosition = 'left',
  maxLength,
  minLength,
  autoComplete,
  autoCapitalize,
  autoCorrect,
  spellCheck
}) => {
  const baseClasses = 'w-full transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-offset-2'
  
  const stateClasses = disabled 
    ? 'opacity-50 cursor-not-allowed bg-muted' 
    : error 
      ? 'border-destructive bg-destructive/10 focus:border-destructive' 
      : 'border-border bg-background/60 hover:bg-background/80 focus:border-primary'
  
  const iconClasses = icon 
    ? iconPosition === 'left' 
      ? 'pl-10' 
      : 'pr-10'
    : ''
  
  const inputElement = (
    <Input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      maxLength={maxLength}
      minLength={minLength}
      autoComplete={autoComplete}
      autoCapitalize={autoCapitalize}
      autoCorrect={autoCorrect}
      spellCheck={spellCheck}
      className={cn(
        baseClasses,
        stateClasses,
        iconClasses,
        className
      )}
    />
  )

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            {icon}
          </div>
        )}
        
        {inputElement}
        
        {icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-muted-foreground">
            {icon}
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-destructive flex items-center">
          <span className="w-4 h-4 mr-1">⚠️</span>
          {error}
        </p>
      )}
    </div>
  )
}

// Specialized input variants for common use cases
export const TextInput: React.FC<Omit<ConsistentInputProps, 'type'>> = (props) => (
  <ConsistentInput type="text" {...props} />
)

export const EmailInput: React.FC<Omit<ConsistentInputProps, 'type'>> = (props) => (
  <ConsistentInput type="email" {...props} />
)

export const PasswordInput: React.FC<Omit<ConsistentInputProps, 'type'>> = (props) => (
  <ConsistentInput type="password" {...props} />
)

export const NumberInput: React.FC<Omit<ConsistentInputProps, 'type'>> = (props) => (
  <ConsistentInput type="number" {...props} />
)

export const SearchInput: React.FC<Omit<ConsistentInputProps, 'type'>> = (props) => (
  <ConsistentInput type="search" {...props} />
)
