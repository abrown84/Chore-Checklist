// Performance optimization utilities

/**
 * Debounce function to limit how often a function can be called
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Throttle function to limit function execution rate
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
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
      return cache.get(key)
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
  let batchArgs: Parameters<T>[] = []
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    batchArgs.push(args)
    
    if (timeout) clearTimeout(timeout)
    
    timeout = setTimeout(() => {
      if (batchArgs.length > 0) {
        func(...batchArgs[batchArgs.length - 1]) // Execute with last args
        batchArgs = []
      }
    }, delay)
  }
}

/**
 * Intersection Observer utility for lazy loading
 */
export function createIntersectionObserver(
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit = {}
): IntersectionObserver {
  return new IntersectionObserver(callback, {
    root: null,
    rootMargin: '0px',
    threshold: 0.1,
    ...options,
  })
}

/**
 * Request Animation Frame utility for smooth animations
 */
export function requestAnimationFramePromise(): Promise<number> {
  return new Promise(resolve => {
    requestAnimationFrame(resolve)
  })
}

/**
 * Performance measurement utility
 */
export function measurePerformance<T>(
  name: string,
  fn: () => T
): T {
  const start = performance.now()
  const result = fn()
  const end = performance.now()
  
  // Log performance measurement
  console.log(`Performance: ${name} took ${end - start}ms`)
  
  return result
}

/**
 * Async performance measurement utility
 */
export async function measureAsyncPerformance<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now()
  const result = await fn()
  const end = performance.now()
  
  // Log async performance measurement
  console.log(`Async Performance: ${name} took ${end - start}ms`)
  
  return result
}
