import { useState, useEffect, useCallback } from 'react'

const NOTIFICATION_STORAGE_KEY = 'notificationsEnabled'

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSupported, setIsSupported] = useState(false)
  const [isEnabled, setIsEnabled] = useState(false)

  useEffect(() => {
    const supported = 'Notification' in window
    setIsSupported(supported)

    if (supported) {
      setPermission(Notification.permission)
      // Check localStorage for user preference
      const storedPreference = localStorage.getItem(NOTIFICATION_STORAGE_KEY)
      setIsEnabled(storedPreference === 'true' && Notification.permission === 'granted')
    }
  }, [])

  const requestPermission = useCallback(async () => {
    if (!isSupported) return false

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      const granted = result === 'granted'
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, granted ? 'true' : 'false')
      setIsEnabled(granted)
      return granted
    } catch {
      return false
    }
  }, [isSupported])

  const disableNotifications = useCallback(() => {
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, 'false')
    setIsEnabled(false)
  }, [])

  const enableNotifications = useCallback(async () => {
    if (permission === 'granted') {
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, 'true')
      setIsEnabled(true)
      return true
    }
    return await requestPermission()
  }, [permission, requestPermission])

  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (permission !== 'granted' || !isEnabled) return null

    try {
      const notification = new Notification(title, {
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        ...options
      })
      return notification
    } catch {
      // Fallback for service worker context
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification(title, {
            icon: '/pwa-192x192.png',
            badge: '/pwa-192x192.png',
            ...options
          })
        })
      }
      return null
    }
  }, [permission, isEnabled])

  const scheduleChoreReminder = useCallback((choreName: string, delayMs: number = 0) => {
    if (permission !== 'granted' || !isEnabled) return null

    const timeoutId = setTimeout(() => {
      showNotification('Chore Reminder', {
        body: `Don't forget: ${choreName}`,
        tag: `chore-${choreName.replace(/\s+/g, '-').toLowerCase()}`,
        requireInteraction: false,
      })
    }, delayMs)

    return timeoutId
  }, [permission, isEnabled, showNotification])

  const cancelScheduledReminder = useCallback((timeoutId: ReturnType<typeof setTimeout>) => {
    clearTimeout(timeoutId)
  }, [])

  return {
    isSupported,
    permission,
    isEnabled,
    requestPermission,
    enableNotifications,
    disableNotifications,
    showNotification,
    scheduleChoreReminder,
    cancelScheduledReminder,
  }
}
