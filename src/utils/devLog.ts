// Development-only logging utility
// These logs are stripped in production builds

export const devLog = (...args: unknown[]) => {
  if (import.meta.env.DEV) {
    import.meta.env.DEV && console.log(...args)
  }
}

export const devWarn = (...args: unknown[]) => {
  if (import.meta.env.DEV) {
    console.warn(...args)
  }
}

export const devDebug = (...args: unknown[]) => {
  if (import.meta.env.DEV) {
    console.debug(...args)
  }
}
