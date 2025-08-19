// Security configuration for the Chore Checklist app

export const SECURITY_CONFIG = {
  // Session management
  SESSION: {
    TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
    INACTIVITY_TIMEOUT: 30 * 60 * 1000, // 30 minutes
    CHECK_INTERVAL: 60 * 1000, // Check every minute
  },
  
  // Authentication
  AUTH: {
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
    PASSWORD_MIN_LENGTH: 6,
    PASSWORD_MAX_LENGTH: 128,
    WEAK_PASSWORDS: [
      'password', '123456', 'qwerty', 'admin', 'letmein',
      'password123', '123456789', 'abc123', 'password1'
    ],
  },
  
  // Input validation
  VALIDATION: {
    MAX_TITLE_LENGTH: 100,
    MAX_DESCRIPTION_LENGTH: 500,
    MAX_NAME_LENGTH: 50,
    MAX_EMAIL_LENGTH: 100,
    MIN_TITLE_LENGTH: 3,
    MIN_NAME_LENGTH: 1,
  },
  
  // Storage
  STORAGE: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    PREFIX: 'choreApp_',
    ENCRYPTION_ENABLED: true,
    COMPRESSION_ENABLED: true,
    TTL_ENABLED: true,
  },
  
  // Rate limiting
  RATE_LIMITS: {
    STORAGE_SET: { limit: 20, window: 60000 }, // 20 operations per minute
    STORAGE_GET: { limit: 50, window: 60000 }, // 50 operations per minute
    AUTH_ATTEMPTS: { limit: 5, window: 900000 }, // 5 attempts per 15 minutes
    ADMIN_ACTIONS: { limit: 10, window: 60000 }, // 10 actions per minute
  },
  
  // Content security
  CONTENT_SECURITY: {
    ALLOWED_HTML_TAGS: [], // No HTML allowed by default
    SUSPICIOUS_PATTERNS: [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /eval\s*\(/i,
      /document\./i,
      /window\./i,
      /alert\s*\(/i,
      /confirm\s*\(/i,
      /prompt\s*\(/i,
    ],
    MAX_FILE_SIZE: 1024 * 1024, // 1MB max file size
  },
  
  // Privacy
  PRIVACY: {
    DATA_RETENTION_DAYS: 365, // Keep data for 1 year
    AUTO_CLEANUP_ENABLED: true,
    LOGGING_ENABLED: false, // Don't log sensitive data
    ANALYTICS_ENABLED: false, // No external analytics
  },
  
  // Family safety
  FAMILY_SAFETY: {
    MAX_HOUSEHOLD_MEMBERS: 10,
    MIN_AGE_REQUIRED: false, // No age verification required
    CONTENT_FILTERING: true,
    ADMIN_OVERRIDE_ENABLED: true,
    EMERGENCY_CONTACT_REQUIRED: false,
  },
  
  // Backup and recovery
  BACKUP: {
    AUTO_BACKUP_ENABLED: true,
    BACKUP_INTERVAL: 24 * 60 * 60 * 1000, // Daily backup
    MAX_BACKUP_VERSIONS: 7, // Keep 7 days of backups
    BACKUP_ENCRYPTION: true,
  },
} as const

// Security utility functions
export const SecurityUtils = {
  /**
   * Check if a value contains suspicious content
   */
  containsSuspiciousContent(value: string): boolean {
    return SECURITY_CONFIG.CONTENT_SECURITY.SUSPICIOUS_PATTERNS.some(
      pattern => pattern.test(value)
    )
  },
  
  /**
   * Check if a password is weak
   */
  isWeakPassword(password: string): boolean {
    return SECURITY_CONFIG.AUTH.WEAK_PASSWORDS.includes(password.toLowerCase())
  },
  
  /**
   * Validate password strength
   */
  validatePasswordStrength(password: string): {
    isValid: boolean
    score: number
    feedback: string[]
  } {
    const feedback: string[] = []
    let score = 0
    
    // Length check
    if (password.length >= SECURITY_CONFIG.AUTH.PASSWORD_MIN_LENGTH) {
      score += 1
    } else {
      feedback.push(`Password must be at least ${SECURITY_CONFIG.AUTH.PASSWORD_MIN_LENGTH} characters long`)
    }
    
    // Weak password check
    if (!this.isWeakPassword(password)) {
      score += 1
    } else {
      feedback.push('This password is too common, please choose a stronger one')
    }
    
    // Complexity checks
    if (/[a-z]/.test(password)) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^a-zA-Z0-9]/.test(password)) score += 1
    
    const isValid = score >= 3 && password.length >= SECURITY_CONFIG.AUTH.PASSWORD_MIN_LENGTH
    
    return { isValid, score, feedback }
  },
  
  /**
   * Generate a secure random string
   */
  generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    const randomArray = new Uint8Array(length)
    crypto.getRandomValues(randomArray)
    
    for (let i = 0; i < length; i++) {
      result += chars[randomArray[i] % chars.length]
    }
    
    return result
  },
  
  /**
   * Check if the current environment is secure
   */
  isSecureEnvironment(): boolean {
    // Check if running over HTTPS
    if (typeof window !== 'undefined') {
      return window.location.protocol === 'https:' || window.location.hostname === 'localhost'
    }
    return true
  },
  
  /**
   * Get security recommendations
   */
  getSecurityRecommendations(): string[] {
    const recommendations: string[] = []
    
    if (!this.isSecureEnvironment()) {
      recommendations.push('Consider using HTTPS for better security')
    }
    
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      recommendations.push('Enable PWA mode for offline security')
    }
    
    recommendations.push('Regularly backup your data')
    recommendations.push('Use strong, unique passwords')
    recommendations.push('Keep your browser updated')
    
    return recommendations
  }
}

// Export types
export type SecurityConfig = typeof SECURITY_CONFIG
export type RateLimit = typeof SECURITY_CONFIG.RATE_LIMITS.STORAGE_SET
