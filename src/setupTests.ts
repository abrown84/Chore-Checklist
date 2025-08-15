import '@testing-library/jest-dom'

// ============================================================================
// COMPREHENSIVE MOCK IMPLEMENTATIONS
// ============================================================================

// Mock localStorage with working implementation
const localStorageMock: Storage = {
  store: {} as Record<string, string>,
  getItem: jest.fn((key: string): string | null => {
    return localStorageMock.store[key] || null
  }),
  setItem: jest.fn((key: string, value: string) => {
    localStorageMock.store[key] = value
  }),
  removeItem: jest.fn((key: string) => {
    delete localStorageMock.store[key]
  }),
  clear: jest.fn(() => {
    localStorageMock.store = {}
  }),
  length: 0,
  key: jest.fn((index: number): string | null => {
    const keys = Object.keys(localStorageMock.store)
    return keys[index] || null
  }),
}

// Update length getter
Object.defineProperty(localStorageMock, 'length', {
  get: () => Object.keys(localStorageMock.store).length,
  configurable: true,
})

global.localStorage = localStorageMock

// Mock sessionStorage with working implementation
const sessionStorageMock: Storage = {
  store: {} as Record<string, string>,
  getItem: jest.fn((key: string): string | null => {
    return sessionStorageMock.store[key] || null
  }),
  setItem: jest.fn((key: string, value: string) => {
    sessionStorageMock.store[key] = value
  }),
  removeItem: jest.fn((key: string) => {
    delete sessionStorageMock.store[key]
  }),
  clear: jest.fn(() => {
    sessionStorageMock.store = {}
  }),
  length: 0,
  key: jest.fn((index: number): string | null => {
    const keys = Object.keys(sessionStorageMock.store)
    return keys[index] || null
  }),
}

Object.defineProperty(sessionStorageMock, 'length', {
  get: () => Object.keys(sessionStorageMock.store).length,
  configurable: true,
})

global.sessionStorage = sessionStorageMock

// Mock matchMedia with working implementation
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver with working implementation
class MockIntersectionObserver {
  readonly root: Element | null
  readonly rootMargin: string
  readonly thresholds: ReadonlyArray<number>
  
  constructor(_callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.root = (options?.root as Element) || null
    this.rootMargin = options?.rootMargin || '0px'
    this.thresholds = Array.isArray(options?.threshold) ? options.threshold : [options?.threshold || 0]
  }
  
  observe = jest.fn()
  unobserve = jest.fn()
  disconnect = jest.fn()
  
  // Helper method to simulate intersection
  simulateIntersection(target: Element, isIntersecting: boolean = true) {
    // This would call the actual callback in a real implementation
    console.log(`Simulating intersection for element ${target.tagName}, intersecting: ${isIntersecting}`)
  }
}

global.IntersectionObserver = MockIntersectionObserver as any

// Mock ResizeObserver with working implementation
class MockResizeObserver {
  constructor(_callback: ResizeObserverCallback) {
    // Callback stored but not used in mock
  }
  
  observe = jest.fn()
  unobserve = jest.fn()
  disconnect = jest.fn()
  
  // Helper method to simulate resize
  simulateResize(target: Element, size: { width: number; height: number }) {
    // This would call the actual callback in a real implementation
    console.log(`Simulating resize for element ${target.tagName}, size: ${size.width}x${size.height}`)
  }
}

global.ResizeObserver = MockResizeObserver as any

// Mock requestAnimationFrame with working implementation
let rafId = 0
const rafCallbacks = new Map<number, FrameRequestCallback>()

global.requestAnimationFrame = jest.fn((callback: FrameRequestCallback) => {
  rafId++
  rafCallbacks.set(rafId, callback)
  
  // Simulate immediate execution for tests
  setTimeout(() => {
    if (rafCallbacks.has(rafId)) {
      callback(performance.now())
      rafCallbacks.delete(rafId)
    }
  }, 0)
  
  return rafId
})

global.cancelAnimationFrame = jest.fn((handle: number) => {
  rafCallbacks.delete(handle)
})

// Mock performance with working implementation
const mockPerformance = {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByType: jest.fn(() => []),
  getEntriesByName: jest.fn(() => []),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
  timeOrigin: Date.now(),
  getEntries: jest.fn(() => []),
  toJSON: jest.fn(() => ({})),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
}

global.performance = mockPerformance as any

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: jest.fn(),
})

// Mock window.scroll
Object.defineProperty(window, 'scroll', {
  writable: true,
  value: jest.fn(),
})

// Mock window.scrollBy
Object.defineProperty(window, 'scrollBy', {
  writable: true,
  value: jest.fn(),
})

// Mock window.scrollX and scrollY
Object.defineProperty(window, 'scrollX', {
  writable: true,
  value: 0,
})

Object.defineProperty(window, 'scrollY', {
  writable: true,
  value: 0,
})

// Mock window.innerWidth and innerHeight
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  value: 1024,
})

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  value: 768,
})

// Mock window.outerWidth and outerHeight
Object.defineProperty(window, 'outerWidth', {
  writable: true,
  value: 1024,
})

Object.defineProperty(window, 'outerHeight', {
  writable: true,
  value: 768,
})

// Mock window.devicePixelRatio
Object.defineProperty(window, 'devicePixelRatio', {
  writable: true,
  value: 1,
})

// Mock Element.prototype.scrollIntoView
Element.prototype.scrollIntoView = jest.fn()

// Mock Element.prototype.getBoundingClientRect
Element.prototype.getBoundingClientRect = jest.fn(() => ({
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  top: 0,
  right: 100,
  bottom: 100,
  left: 0,
  toJSON: () => ({}),
}))

// Mock Element.prototype.scrollTo
Element.prototype.scrollTo = jest.fn()

// Mock Element.prototype.scroll
Element.prototype.scroll = jest.fn()

// Mock Element.prototype.scrollBy
Element.prototype.scrollBy = jest.fn()

// Mock HTMLElement.prototype.focus
HTMLElement.prototype.focus = jest.fn()

// Mock HTMLElement.prototype.blur
HTMLElement.prototype.blur = jest.fn()

// Mock HTMLElement.prototype.click
HTMLElement.prototype.click = jest.fn()

// Mock HTMLInputElement.prototype.select (not HTMLElement)
// This is already handled by HTMLInputElement mocks below

// Mock HTMLInputElement.prototype.select
HTMLInputElement.prototype.select = jest.fn()

// Mock HTMLInputElement.prototype.setSelectionRange
HTMLInputElement.prototype.setSelectionRange = jest.fn()

// Mock HTMLInputElement.prototype.setRangeText
HTMLInputElement.prototype.setRangeText = jest.fn()

// Mock HTMLFormElement.prototype.submit
HTMLFormElement.prototype.submit = jest.fn()

// Mock HTMLFormElement.prototype.reset
HTMLFormElement.prototype.reset = jest.fn()

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url')

// Mock URL.revokeObjectURL
global.URL.revokeObjectURL = jest.fn()

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    formData: () => Promise.resolve(new FormData()),
    clone: function() { return this; },
  } as Response)
)

// Mock AbortController
global.AbortController = jest.fn().mockImplementation(() => ({
  signal: {
    aborted: false,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  },
  abort: jest.fn(),
})) as any

// Mock AbortSignal
global.AbortSignal = jest.fn().mockImplementation(() => ({
  aborted: false,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
})) as any

// Mock console methods to prevent noise in tests
const originalConsole = { ...console }

beforeAll(() => {
  // Suppress console warnings in tests
  console.error = jest.fn((...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
       args[0].includes('Warning: componentWillReceiveProps') ||
       args[0].includes('Warning: componentWillUpdate'))
    ) {
      return
    }
    // Log actual errors for debugging
    originalConsole.error(...args)
  })
  
  // Suppress console.warn in tests
  console.warn = jest.fn()
  
  // Keep console.log for debugging
  console.log = jest.fn((...args: any[]) => {
    if (process.env.NODE_ENV === 'test') {
      originalConsole.log(...args)
    }
  })
})

afterAll(() => {
  // Restore original console methods
  console.error = originalConsole.error
  console.warn = originalConsole.warn
  console.log = originalConsole.log
})

// Mock timers for better test control
beforeEach(() => {
  jest.useFakeTimers()
  
  // Reset all mocks
  jest.clearAllMocks()
  
  // Clear localStorage and sessionStorage
  localStorageMock.clear()
  sessionStorageMock.clear()
  
  // Reset performance mock
  mockPerformance.now.mockReturnValue(Date.now())
})

afterEach(() => {
  jest.useRealTimers()
  
  // Clean up any remaining timers
  jest.clearAllTimers()
})

// Export mock utilities for use in tests
export const mockUtils = {
  localStorage: localStorageMock,
  sessionStorage: sessionStorageMock,
  performance: mockPerformance,
  simulateIntersection: (target: Element, isIntersecting: boolean = true) => {
    const observer = new MockIntersectionObserver(() => {})
    observer.simulateIntersection(target, isIntersecting)
  },
  simulateResize: (target: Element, size: { width: number; height: number }) => {
    const observer = new MockResizeObserver(() => {})
    observer.simulateResize(target, size)
  },
  simulateRAF: (callback: FrameRequestCallback) => {
    requestAnimationFrame(callback)
  },
  setWindowSize: (width: number, height: number) => {
    Object.defineProperty(window, 'innerWidth', { value: width, writable: true })
    Object.defineProperty(window, 'innerHeight', { value: height, writable: true })
  },
  setDevicePixelRatio: (ratio: number) => {
    Object.defineProperty(window, 'devicePixelRatio', { value: ratio, writable: true })
  },
}
