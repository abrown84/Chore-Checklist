/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Global type definitions for the application
declare global {
  // Node.js types for browser environment
  namespace NodeJS {
    interface Timer {}
    interface Timeout extends Timer {}
  }

  // Browser API types that might be missing
  interface IntersectionObserverCallback {
    (entries: IntersectionObserverEntry[], observer: IntersectionObserver): void
  }

  interface IntersectionObserverInit {
    root?: Element | Document | null
    rootMargin?: string
    threshold?: number | number[]
  }

  interface ResizeObserverCallback {
    (entries: ResizeObserverEntry[], observer: ResizeObserver): void
  }

  interface FrameRequestCallback {
    (time: number): void
  }

  // Global variables
  var process: {
    env: { [key: string]: string | undefined }
    [key: string]: any
  }
  
  var __dirname: string
  var require: (module: string) => any
}

export {}
