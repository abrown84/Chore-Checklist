import { storage, setStorageItem, getStorageItem, removeStorageItem, clearStorage, getStorageKeys, hasStorageItem, getStorageInfo, cleanupStorage } from '../utils/storage'

describe('Storage Utility with Mocks', () => {
  beforeEach(() => {
    // Clear all storage before each test
    localStorage.clear()
    sessionStorage.clear()
  })

  describe('StorageManager Class', () => {
    test('should set and get items', () => {
      const testData = { name: 'Test User', points: 100 }
      
      const success = storage.setItem('user', testData)
      expect(success).toBe(true)
      
      const retrieved = storage.getItem('user')
      expect(retrieved).toEqual(testData)
    })

    test('should handle JSON parsing errors gracefully', () => {
      // Manually corrupt localStorage to simulate parsing error
      localStorage.setItem('choreApp_corrupted', 'invalid json {')
      
      const result = storage.getItem('corrupted')
      expect(result).toBeNull()
    })

    test('should remove items', () => {
      storage.setItem('test', 'value')
      expect(storage.hasItem('test')).toBe(true)
      
      storage.removeItem('test')
      expect(storage.hasItem('test')).toBe(false)
    })

    test('should clear all app items', () => {
      storage.setItem('key1', 'value1')
      storage.setItem('key2', 'value2')
      
      expect(storage.getKeys().length).toBe(2)
      
      storage.clear()
      expect(storage.getKeys().length).toBe(0)
    })

    test('should get all keys with prefix', () => {
      storage.setItem('key1', 'value1')
      storage.setItem('key2', 'value2')
      
      const keys = storage.getKeys()
      expect(keys).toContain('key1')
      expect(keys).toContain('key2')
      expect(keys.length).toBe(2)
    })

    test('should check if item exists', () => {
      expect(storage.hasItem('nonexistent')).toBe(false)
      
      storage.setItem('exists', 'value')
      expect(storage.hasItem('exists')).toBe(true)
    })

    test('should handle TTL expiration', () => {
      const testData = { name: 'Test' }
      
      // Set item with 1ms TTL
      storage.setItem('expiring', testData, { ttl: 1 })
      
      // Item should exist initially
      expect(storage.getItem('expiring')).toEqual(testData)
      
      // Wait for expiration
      jest.advanceTimersByTime(2)
      
      // Item should be automatically removed
      expect(storage.getItem('expiring')).toBeNull()
    })

    test('should handle encryption', () => {
      const testData = { secret: 'password123' }
      
      storage.setItem('encrypted', testData, { encrypt: true })
      
      // Should be encrypted (base64 encoded)
      const rawData = localStorage.getItem('choreApp_encrypted')
      expect(rawData).toBeDefined()
      expect(rawData).not.toContain('password123') // Should be encrypted
      
      // Should decrypt properly when retrieved
      const decrypted = storage.getItem('encrypted', { encrypt: true })
      expect(decrypted).toEqual(testData)
    })

    test('should handle compression', () => {
      const longData = 'x'.repeat(200) // Long enough to trigger compression
      
      storage.setItem('compressed', longData, { compress: true })
      
      // Should be compressed (base64 encoded)
      const rawData = localStorage.getItem('choreApp_compressed')
      expect(rawData).toBeDefined()
      
      // Should decompress properly when retrieved
      const decompressed = storage.getItem('compressed', { compress: true })
      expect(decompressed).toBe(longData)
    })

    test('should get storage info', () => {
      storage.setItem('key1', 'value1')
      storage.setItem('key2', 'value2')
      
      const info = storage.getStorageInfo()
      expect(info.used).toBeGreaterThan(0)
      expect(info.total).toBeGreaterThan(info.used)
    })

    test('should cleanup expired items', () => {
      // Set items with different TTLs
      storage.setItem('expired', 'value1', { ttl: 1 })
      storage.setItem('valid', 'value2', { ttl: 1000 })
      
      // Wait for first item to expire
      jest.advanceTimersByTime(2)
      
      const cleanedCount = storage.cleanup()
      expect(cleanedCount).toBe(1)
      
      // Expired item should be gone
      expect(storage.getItem('expired')).toBeNull()
      
      // Valid item should remain
      expect(storage.getItem('valid')).toBe('value2')
    })
  })

  describe('Convenience Functions', () => {
    test('should set storage item', () => {
      const success = setStorageItem('test', 'value')
      expect(success).toBe(true)
      expect(getStorageItem('test')).toBe('value')
    })

    test('should get storage item', () => {
      setStorageItem('test', 'value')
      expect(getStorageItem('test')).toBe('value')
    })

    test('should remove storage item', () => {
      setStorageItem('test', 'value')
      expect(hasStorageItem('test')).toBe(true)
      
      removeStorageItem('test')
      expect(hasStorageItem('test')).toBe(false)
    })

    test('should clear storage', () => {
      setStorageItem('key1', 'value1')
      setStorageItem('key2', 'value2')
      
      expect(getStorageKeys().length).toBe(2)
      
      clearStorage()
      expect(getStorageKeys().length).toBe(0)
    })

    test('should get storage keys', () => {
      setStorageItem('key1', 'value1')
      setStorageItem('key2', 'value2')
      
      const keys = getStorageKeys()
      expect(keys).toContain('key1')
      expect(keys).toContain('key2')
    })

    test('should check if storage item exists', () => {
      expect(hasStorageItem('nonexistent')).toBe(false)
      
      setStorageItem('exists', 'value')
      expect(hasStorageItem('exists')).toBe(true)
    })

    test('should get storage info', () => {
      setStorageItem('key1', 'value1')
      setStorageItem('key2', 'value2')
      
      const info = getStorageInfo()
      expect(info.used).toBeGreaterThan(0)
      expect(info.total).toBeGreaterThan(info.used)
    })

    test('should cleanup storage', () => {
      setStorageItem('expired', 'value1', { ttl: 1 })
      setStorageItem('valid', 'value2', { ttl: 1000 })
      
      // Wait for first item to expire
      jest.advanceTimersByTime(2)
      
      const cleanedCount = cleanupStorage()
      expect(cleanedCount).toBe(1)
    })
  })

  describe('Error Handling', () => {
    test('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw error
      const originalSetItem = localStorage.setItem
      localStorage.setItem = jest.fn().mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })
      
      const success = storage.setItem('test', 'value')
      expect(success).toBe(false)
      
      // Restore original method
      localStorage.setItem = originalSetItem
    })

    test('should handle corrupted data gracefully', () => {
      // Manually insert corrupted data
      localStorage.setItem('choreApp_corrupted', 'invalid json {')
      
      const result = storage.getItem('corrupted')
      expect(result).toBeNull()
      
      // Corrupted data should be cleaned up
      expect(localStorage.getItem('choreApp_corrupted')).toBeNull()
    })
  })

  describe('Integration with React Components', () => {
    test('should work with component state persistence', () => {
      const componentState = {
        theme: 'dark',
        language: 'en',
        settings: { notifications: true, sound: false }
      }
      
      // Simulate component saving state
      setStorageItem('componentState', componentState)
      
      // Simulate component retrieving state
      const retrievedState = getStorageItem('componentState')
      expect(retrievedState).toEqual(componentState)
    })

    test('should handle user preferences with TTL', () => {
      const userPrefs = {
        lastUpdated: Date.now(),
        theme: 'light',
        layout: 'compact'
      }
      
      // Set with 1 hour TTL
      setStorageItem('userPrefs', userPrefs, { ttl: 60 * 60 * 1000 })
      
      // Should exist initially
      expect(hasStorageItem('userPrefs')).toBe(true)
      
      // Simulate time passing (1 hour + 1 second)
      jest.advanceTimersByTime(60 * 60 * 1000 + 1000)
      
      // Should be expired
      expect(hasStorageItem('userPrefs')).toBe(false)
    })
  })
})
