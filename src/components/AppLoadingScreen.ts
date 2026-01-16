import React from 'react'

/**
 * Hide the initial HTML splash screen once React mounts.
 */
export function hideSplashScreen(): void {
  const splash = document.getElementById('splash-screen')
  if (!splash) return

  splash.style.opacity = '0'

  // Remove after transition completes
  const remove = () => {
    splash.removeEventListener('transitionend', remove)
    splash.remove()
  }

  splash.addEventListener('transitionend', remove)

  // Fallback in case transitionend doesn't fire
  window.setTimeout(() => {
    if (document.body.contains(splash)) {
      splash.remove()
    }
  }, 600)
}

/**
 * Simple loading screen component for auth loading states
 */
interface AppLoadingScreenProps {
  message?: string
}

export function AppLoadingScreen({ message = 'Loading...' }: AppLoadingScreenProps): React.ReactElement {
  return React.createElement('div', {
    className: 'min-h-screen flex items-center justify-center bg-background'
  },
    React.createElement('div', {
      className: 'text-center'
    },
      React.createElement('div', {
        className: 'animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'
      }),
      React.createElement('p', {
        className: 'text-muted-foreground'
      }, message)
    )
  )
}
