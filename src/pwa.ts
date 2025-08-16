// PWA Service Worker Registration
// Conditional import for PWA registration
let registerSW: any = null;
try {
  registerSW = require('virtual:pwa-register').registerSW;
} catch {
  // PWA plugin not available in development
  registerSW = () => ({
    onNeedRefresh: () => {},
    onOfflineReady: () => {},
    onRegistered: () => {},
    onRegisterError: () => {},
  });
}

// Register the service worker
export const registerPWA = () => {
  if ('serviceWorker' in navigator) {
    const updateSW = registerSW({
      onNeedRefresh() {
        // Handle when a new version is available
        console.log('New version available');
      },
      onOfflineReady() {
        // Handle when the app is ready for offline use
        console.log('App ready for offline use');
      },
      onRegistered(swRegistration: any) {
        // Handle when service worker is registered
        console.log('Service Worker registered');
        
        // Check for updates every hour
        setInterval(() => {
          swRegistration.update();
        }, 60 * 60 * 1000);
      },
      onRegisterError(error: any) {
        // Handle registration errors
        console.error('Service Worker registration failed:', error);
      }
    });

    return updateSW;
  }
  
  return null;
};

// Handle offline/online events
export const setupOfflineHandling = () => {
  const handleOnline = () => {
    console.log('App is online');
    // You can add custom logic here for when the app comes back online
  };

  const handleOffline = () => {
    console.log('App is offline');
    // You can add custom logic here for when the app goes offline
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

// Initialize PWA functionality
export const initializePWA = () => {
  const updateSW = registerPWA();
  const cleanupOfflineHandling = setupOfflineHandling();

  return {
    updateSW,
    cleanup: cleanupOfflineHandling
  };
};
