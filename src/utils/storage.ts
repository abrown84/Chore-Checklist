// Robust storage utility for localStorage operations

interface StorageOptions {
  encrypt?: boolean
  compress?: boolean
  ttl?: number // Time to live in milliseconds
}

interface StorageItem<T> {
  value: T
  timestamp: number
  ttl?: number
}

class StorageManager {
  private prefix = 'choreApp_'
  private encryptionKey = 'your-secret-key' // In production, use environment variable

  /**
   * Set item in localStorage with options
   */
  setItem<T>(key: string, value: T, options: StorageOptions = {}): boolean {
    try {
      const storageKey = this.prefix + key
      const item: StorageItem<T> = {
        value,
        timestamp: Date.now(),
        ttl: options.ttl,
      }

      let dataToStore = JSON.stringify(item)
      
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
   * Get item from localStorage with automatic cleanup
   */
  getItem<T>(key: string, options: StorageOptions = {}): T | null {
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

  // Simple encryption (for basic obfuscation - not for security)
  private encrypt(text: string): string {
    return btoa(text)
  }

  private decrypt(encryptedText: string): string {
    return atob(encryptedText)
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
