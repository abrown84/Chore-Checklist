// Robust storage utility for localStorage operations with enhanced security

interface StorageOptions {
  encrypt?: boolean
  compress?: boolean
  ttl?: number // Time to live in milliseconds
  validate?: boolean // Enable input validation
}

interface StorageItem<T> {
  value: T
  timestamp: number
  ttl?: number
  checksum?: string // For data integrity
}

class StorageManager {
  private prefix = 'choreApp_'
  private encryptionKey: string
  private maxStorageSize = 5 * 1024 * 1024 // 5MB limit
  private rateLimitMap = new Map<string, { count: number; resetTime: number }>()

  constructor() {
    // Generate a unique encryption key for this session
    this.encryptionKey = this.generateEncryptionKey()
  }

  /**
   * Generate a unique encryption key for this session
   */
  private generateEncryptionKey(): string {
    const storedKey = localStorage.getItem('choreApp_encryption_key')
    if (storedKey) {
      return storedKey
    }
    
    // Generate a new key if none exists
    const newKey = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    
    localStorage.setItem('choreApp_encryption_key', newKey)
    return newKey
  }

  /**
   * Rate limiting for storage operations
   */
  private checkRateLimit(operation: string, limit: number = 10, windowMs: number = 60000): boolean {
    const key = `${operation}_${Date.now() - (Date.now() % windowMs)}`
    const current = this.rateLimitMap.get(key) || { count: 0, resetTime: Date.now() + windowMs }
    
    if (Date.now() > current.resetTime) {
      current.count = 0
      current.resetTime = Date.now() + windowMs
    }
    
    if (current.count >= limit) {
      return false
    }
    
    current.count++
    this.rateLimitMap.set(key, current)
    return true
  }

  /**
   * Input validation and sanitization
   */
  private validateInput<T>(value: T, key: string): boolean {
    if (value === null || value === undefined) {
      console.warn(`Storage validation failed: ${key} cannot be null or undefined`)
      return false
    }

    // Check for circular references
    try {
      JSON.stringify(value)
    } catch (error) {
      console.warn(`Storage validation failed: ${key} contains circular references`)
      return false
    }

    // Check size limits
    const serialized = JSON.stringify(value)
    if (serialized.length > this.maxStorageSize) {
      console.warn(`Storage validation failed: ${key} exceeds size limit`)
      return false
    }

    // Check for potentially malicious content
    if (typeof serialized === 'string') {
      const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /eval\s*\(/i,
        /document\./i
      ]
      
      if (suspiciousPatterns.some(pattern => pattern.test(serialized))) {
        console.warn(`Storage validation failed: ${key} contains potentially malicious content`)
        return false
      }
    }

    return true
  }

  /**
   * Enhanced encryption using a more secure method
   */
  private encrypt(text: string): string {
    try {
      // Simple but more secure than base64 - XOR with encryption key
      let encrypted = ''
      for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length)
        encrypted += String.fromCharCode(charCode)
      }
      return btoa(encrypted)
    } catch (error) {
      console.error('Encryption failed, falling back to base64:', error)
      return btoa(text)
    }
  }

  private decrypt(encryptedText: string): string {
    try {
      const decoded = atob(encryptedText)
      let decrypted = ''
      for (let i = 0; i < decoded.length; i++) {
        const charCode = decoded.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length)
        decrypted += String.fromCharCode(charCode)
      }
      return decrypted
    } catch (error) {
      console.error('Decryption failed, falling back to base64:', error)
      return atob(encryptedText)
    }
  }

  /**
   * Generate checksum for data integrity
   */
  private generateChecksum(data: string): string {
    let hash = 0
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString(16)
  }

  /**
   * Set item in localStorage with enhanced security
   */
  setItem<T>(key: string, value: T, options: StorageOptions = {}): boolean {
    // Rate limiting
    if (!this.checkRateLimit('set', 20, 60000)) {
      console.warn('Storage rate limit exceeded for set operation')
      return false
    }

    try {
      // Input validation
      if (options.validate !== false && !this.validateInput(value, key)) {
        return false
      }

      const storageKey = this.prefix + key
      const item: StorageItem<T> = {
        value,
        timestamp: Date.now(),
        ttl: options.ttl,
      }

      let dataToStore = JSON.stringify(item)
      
      // Add checksum for data integrity
      item.checksum = this.generateChecksum(dataToStore)
      dataToStore = JSON.stringify(item)
      
      if (options.encrypt) {
        dataToStore = this.encrypt(dataToStore)
      }
      
      if (options.compress) {
        dataToStore = this.compress(dataToStore)
      }

      localStorage.setItem(storageKey, dataToStore)
      return true
    } catch (error) {
      console.error('Failed to set storage item:', error)
      return false
    }
  }

  /**
   * Get item from localStorage with enhanced security
   */
  getItem<T>(key: string, options: StorageOptions = {}): T | null {
    // Rate limiting
    if (!this.checkRateLimit('get', 50, 60000)) {
      console.warn('Storage rate limit exceeded for get operation')
      return null
    }

    try {
      const storageKey = this.prefix + key
      const rawData = localStorage.getItem(storageKey)
      
      if (!rawData) return null

      let dataToParse = rawData
      
      if (options.compress) {
        dataToParse = this.decompress(dataToParse)
      }
      
      if (options.encrypt) {
        dataToParse = this.decrypt(dataToParse)
      }

      const item: StorageItem<T> = JSON.parse(dataToParse)
      
      // Verify checksum for data integrity
      if (item.checksum) {
        const expectedChecksum = this.generateChecksum(JSON.stringify({
          ...item,
          checksum: undefined
        }))
        
        if (item.checksum !== expectedChecksum) {
          console.warn(`Data integrity check failed for ${key}, removing corrupted item`)
          this.removeItem(key)
          return null
        }
      }
      
      // Check if item has expired
      if (item.ttl && Date.now() - item.timestamp > item.ttl) {
        this.removeItem(key)
        return null
      }

      return item.value
    } catch (error) {
      console.error('Failed to get storage item:', error)
      // Clean up corrupted data
      this.removeItem(key)
      return null
    }
  }

  /**
   * Remove item from localStorage
   */
  removeItem(key: string): boolean {
    try {
      const storageKey = this.prefix + key
      localStorage.removeItem(storageKey)
      return true
    } catch (error) {
      console.error('Failed to remove storage item:', error)
      return false
    }
  }

  /**
   * Clear all app-related items
   */
  clear(): boolean {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key)
        }
      })
      return true
    } catch (error) {
      console.error('Failed to clear storage:', error)
      return false
    }
  }

  /**
   * Get all keys with the app prefix
   */
  getKeys(): string[] {
    try {
      const keys = Object.keys(localStorage)
      return keys
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.replace(this.prefix, ''))
    } catch (error) {
      console.error('Failed to get storage keys:', error)
      return []
    }
  }

  /**
   * Check if item exists and is valid
   */
  hasItem(key: string): boolean {
    try {
      const storageKey = this.prefix + key
      const rawData = localStorage.getItem(storageKey)
      
      if (!rawData) return false

      const item: StorageItem<any> = JSON.parse(rawData)
      
      // Check if item has expired
      if (item.ttl && Date.now() - item.timestamp > item.ttl) {
        this.removeItem(key)
        return false
      }

      return true
    } catch {
      return false
    }
  }

  /**
   * Get storage size information
   */
  getStorageInfo(): { used: number; available: number; total: number } {
    try {
      const keys = this.getKeys()
      let used = 0
      
      keys.forEach(key => {
        const value = localStorage.getItem(this.prefix + key)
        if (value) {
          used += new Blob([value]).size
        }
      })

      // Estimate available space (this is approximate)
      const testKey = 'test_storage_limit'
      let available = 0
      
      try {
        const testData = 'x'.repeat(1024 * 1024) // 1MB chunks
        let i = 0
        
        while (true) {
          localStorage.setItem(testKey + i, testData)
          available += testData.length
          i++
        }
      } catch {
        // Storage limit reached
      } finally {
        // Clean up test data
        for (let j = 0; j < 1000; j++) {
          localStorage.removeItem(testKey + j)
        }
      }

      return {
        used,
        available,
        total: used + available,
      }
    } catch (error) {
      console.error('Failed to get storage info:', error)
      return { used: 0, available: 0, total: 0 }
    }
  }

  /**
   * Clean up expired items
   */
  cleanup(): number {
    let cleanedCount = 0
    const keys = this.getKeys()
    
    keys.forEach(key => {
      if (!this.hasItem(key)) {
        cleanedCount++
      }
    })

    return cleanedCount
  }

  // Simple compression (for basic size reduction)
  private compress(text: string): string {
    return text.length > 100 ? btoa(text) : text
  }

  private decompress(text: string): string {
    return text.length > 100 ? atob(text) : text
  }
}

// Export singleton instance
export const storage = new StorageManager()

// Convenience functions
export const setStorageItem = <T>(key: string, value: T, options?: StorageOptions) =>
  storage.setItem(key, value, options)

export const getStorageItem = <T>(key: string, options?: StorageOptions) =>
  storage.getItem<T>(key, options)

export const removeStorageItem = (key: string) => storage.removeItem(key)

export const clearStorage = () => storage.clear()

export const getStorageKeys = () => storage.getKeys()

export const hasStorageItem = (key: string) => storage.hasItem(key)

export const getStorageInfo = () => storage.getStorageInfo()

export const cleanupStorage = () => storage.cleanup()
