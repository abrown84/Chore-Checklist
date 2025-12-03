/**
 * Performance utilities for optimizing React components
 */

/**
 * Throttle function calls to limit execution frequency
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Debounce function calls to delay execution until after a pause
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function(this: any, ...args: Parameters<T>) {
    const context = this
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      func.apply(context, args)
    }, wait)
  }
}

/**
 * Memoize function results to avoid recalculations
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>()
  
  return ((...args: Parameters<T>) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)!
    }
    
    const result = func(...args)
    cache.set(key, result)
    return result
  }) as T
}

/**
 * Batch multiple function calls into a single execution
 */
export function batch<T extends (...args: any[]) => any>(
  func: T,
  delay: number = 0
): (...args: Parameters<T>) => void {
  let batchedArgs: Parameters<T>[] = []
  let timeout: NodeJS.Timeout | null = null
  
  return function(this: any, ...args: Parameters<T>) {
    batchedArgs.push(args)
    
    if (timeout) clearTimeout(timeout)
    
    timeout = setTimeout(() => {
      if (batchedArgs.length > 0) {
        func.apply(this, batchedArgs)
        batchedArgs = []
      }
    }, delay)
  }
}

/**
 * Check if code is running in production
 */
export const isProduction = import.meta.env.PROD

/**
 * Check if code is running in development
 */
export const isDevelopment = import.meta.env.DEV
