// Input validation and sanitization utilities for family safety

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  sanitizedValue?: any
}

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => boolean
  sanitize?: boolean
  allowedTags?: string[]
}

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(html: string, allowedTags: string[] = []): string {
  if (typeof html !== 'string') return ''
  
  // Remove all HTML tags if no allowed tags specified
  if (allowedTags.length === 0) {
    return html.replace(/<[^>]*>/g, '')
  }
  
  // Only allow specified tags
  const allowedTagsRegex = new RegExp(`<(?!/?)(?:${allowedTags.join('|')})\b)[^>]+>`, 'gi')
  return html.replace(allowedTagsRegex, '')
}

/**
 * Sanitize text input to prevent injection attacks
 */
export function sanitizeText(text: string): string {
  if (typeof text !== 'string') return ''
  
  return text
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/eval\s*\(/gi, '') // Remove eval calls
    .replace(/document\./gi, '') // Remove document access
    .trim()
}

/**
 * Validate and sanitize email addresses
 */
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = []
  
  if (!email || typeof email !== 'string') {
    errors.push('Email is required')
    return { isValid: false, errors }
  }
  
  const sanitizedEmail = sanitizeText(email.toLowerCase().trim())
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(sanitizedEmail)) {
    errors.push('Please enter a valid email address')
  }
  
  // Check for suspicious patterns
  if (sanitizedEmail.includes('javascript:') || sanitizedEmail.includes('<script')) {
    errors.push('Email contains invalid characters')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: errors.length === 0 ? sanitizedEmail : undefined
  }
}

/**
 * Validate and sanitize passwords
 */
export function validatePassword(password: string, confirmPassword?: string): ValidationResult {
  const errors: string[] = []
  
  if (!password || typeof password !== 'string') {
    errors.push('Password is required')
    return { isValid: false, errors }
  }
  
  const sanitizedPassword = sanitizeText(password)
  
  // Password strength requirements
  if (sanitizedPassword.length < 6) {
    errors.push('Password must be at least 6 characters long')
  }
  
  if (sanitizedPassword.length > 128) {
    errors.push('Password is too long (maximum 128 characters)')
  }
  
  // Check for common weak passwords
  const weakPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein']
  if (weakPasswords.includes(sanitizedPassword.toLowerCase())) {
    errors.push('Please choose a stronger password')
  }
  
  // Check for confirmation match
  if (confirmPassword !== undefined && sanitizedPassword !== confirmPassword) {
    errors.push('Passwords do not match')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: errors.length === 0 ? sanitizedPassword : undefined
  }
}

/**
 * Validate and sanitize names
 */
export function validateName(name: string, fieldName: string = 'Name'): ValidationResult {
  const errors: string[] = []
  
  if (!name || typeof name !== 'string') {
    errors.push(`${fieldName} is required`)
    return { isValid: false, errors }
  }
  
  const sanitizedName = sanitizeText(name.trim())
  
  if (sanitizedName.length < 1) {
    errors.push(`${fieldName} cannot be empty`)
  }
  
  if (sanitizedName.length > 50) {
    errors.push(`${fieldName} is too long (maximum 50 characters)`)
  }
  
  // Check for suspicious patterns
  if (sanitizedName.includes('<') || sanitizedName.includes('>')) {
    errors.push(`${fieldName} contains invalid characters`)
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: errors.length === 0 ? sanitizedName : undefined
  }
}

/**
 * Validate and sanitize chore titles
 */
export function validateChoreTitle(title: string): ValidationResult {
  const errors: string[] = []
  
  if (!title || typeof title !== 'string') {
    errors.push('Chore title is required')
    return { isValid: false, errors }
  }
  
  const sanitizedTitle = sanitizeText(title.trim())
  
  if (sanitizedTitle.length < 3) {
    errors.push('Chore title must be at least 3 characters long')
  }
  
  if (sanitizedTitle.length > 100) {
    errors.push('Chore title is too long (maximum 100 characters)')
  }
  
  // Check for suspicious patterns
  if (sanitizedTitle.includes('<script') || sanitizedTitle.includes('javascript:')) {
    errors.push('Chore title contains invalid characters')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: errors.length === 0 ? sanitizedTitle : undefined
  }
}

/**
 * Validate and sanitize chore descriptions
 */
export function validateChoreDescription(description: string): ValidationResult {
  const errors: string[] = []
  
  if (!description || typeof description !== 'string') {
    return { isValid: true, errors, sanitizedValue: '' }
  }
  
  const sanitizedDescription = sanitizeText(description.trim())
  
  if (sanitizedDescription.length > 500) {
    errors.push('Chore description is too long (maximum 500 characters)')
  }
  
  // Check for suspicious patterns
  if (sanitizedDescription.includes('<script') || sanitizedDescription.includes('javascript:')) {
    errors.push('Chore description contains invalid characters')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: errors.length === 0 ? sanitizedDescription : undefined
  }
}

/**
 * Validate numeric inputs
 */
export function validateNumber(value: any, min?: number, max?: number): ValidationResult {
  const errors: string[] = []
  
  if (value === null || value === undefined || value === '') {
    errors.push('Value is required')
    return { isValid: false, errors }
  }
  
  const numValue = Number(value)
  
  if (isNaN(numValue)) {
    errors.push('Please enter a valid number')
    return { isValid: false, errors }
  }
  
  if (min !== undefined && numValue < min) {
    errors.push(`Value must be at least ${min}`)
  }
  
  if (max !== undefined && numValue > max) {
    errors.push(`Value must be no more than ${max}`)
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: errors.length === 0 ? numValue : undefined
  }
}

/**
 * Validate date inputs
 */
export function validateDate(date: any): ValidationResult {
  const errors: string[] = []
  
  if (!date) {
    return { isValid: true, errors, sanitizedValue: undefined }
  }
  
  let dateValue: Date
  
  if (date instanceof Date) {
    dateValue = date
  } else if (typeof date === 'string') {
    dateValue = new Date(date)
  } else {
    errors.push('Invalid date format')
    return { isValid: false, errors }
  }
  
  if (isNaN(dateValue.getTime())) {
    errors.push('Please enter a valid date')
  }
  
  // Check for reasonable date range (not too far in past or future)
  const now = new Date()
  const minDate = new Date(now.getFullYear() - 10, 0, 1) // 10 years ago
  const maxDate = new Date(now.getFullYear() + 10, 11, 31) // 10 years in future
  
  if (dateValue < minDate) {
    errors.push('Date is too far in the past')
  }
  
  if (dateValue > maxDate) {
    errors.push('Date is too far in the future')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: errors.length === 0 ? dateValue : undefined
  }
}

/**
 * Generic validation function
 */
export function validateField(value: any, rules: ValidationRule, fieldName: string = 'Field'): ValidationResult {
  const errors: string[] = []
  let sanitizedValue = value
  
  // Required check
  if (rules.required && (value === null || value === undefined || value === '')) {
    errors.push(`${fieldName} is required`)
    return { isValid: false, errors }
  }
  
  // Skip other validations if value is empty and not required
  if (!rules.required && (value === null || value === undefined || value === '')) {
    return { isValid: true, errors, sanitizedValue }
  }
  
  // Type check
  if (typeof value !== 'string' && typeof value !== 'number' && !(value instanceof Date)) {
    errors.push(`${fieldName} has an invalid type`)
    return { isValid: false, errors }
  }
  
  // String-specific validations
  if (typeof value === 'string') {
    if (rules.minLength && value.length < rules.minLength) {
      errors.push(`${fieldName} must be at least ${rules.minLength} characters long`)
    }
    
    if (rules.maxLength && value.length > rules.maxLength) {
      errors.push(`${fieldName} must be no more than ${rules.maxLength} characters long`)
    }
    
    if (rules.pattern && !rules.pattern.test(value)) {
      errors.push(`${fieldName} format is invalid`)
    }
    
    // Sanitize if requested
    if (rules.sanitize) {
      sanitizedValue = sanitizeText(value)
    }
  }
  
  // Custom validation
  if (rules.custom && !rules.custom(value)) {
    errors.push(`${fieldName} validation failed`)
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: errors.length === 0 ? sanitizedValue : undefined
  }
}

/**
 * Validate form data object
 */
export function validateForm(formData: Record<string, any>, validationSchema: Record<string, ValidationRule>): {
  isValid: boolean
  errors: Record<string, string[]>
  sanitizedData: Record<string, any>
} {
  const errors: Record<string, string[]> = {}
  const sanitizedData: Record<string, any> = {}
  let isValid = true
  
  for (const [fieldName, rules] of Object.entries(validationSchema)) {
    const result = validateField(formData[fieldName], rules, fieldName)
    
    if (!result.isValid) {
      isValid = false
      errors[fieldName] = result.errors
    } else if (result.sanitizedValue !== undefined) {
      sanitizedData[fieldName] = result.sanitizedValue
    } else {
      sanitizedData[fieldName] = formData[fieldName]
    }
  }
  
  return { isValid, errors, sanitizedData }
}
