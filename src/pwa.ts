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
        
        // If corruption error, clear cache and re-register
        if (error?.message?.includes('Corruption') || error?.message?.includes('checksum')) {
          console.warn('Cache corruption detected, clearing cache...');
          clearCorruptedCache().then(() => {
            console.log('Cache cleared, please refresh the page');
            // Optionally reload after a short delay
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          });
        }
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

// Clear corrupted cache
export const clearCorruptedCache = async (): Promise<void> => {
  try {
    // Clear all caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('All caches cleared');
    }

    // Unregister all service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map(registration => registration.unregister())
      );
      console.log('All service workers unregistered');
    }

    // Clear IndexedDB if needed
    if ('indexedDB' in window) {
      // Note: This is a simplified approach. For production, you might want to
      // be more selective about what to clear
      try {
        indexedDB.databases().then(databases => {
          databases.forEach(db => {
            if (db.name) {
              indexedDB.deleteDatabase(db.name);
            }
          });
        });
      } catch (e) {
        console.warn('Could not clear IndexedDB:', e);
      }
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

// Initialize PWA functionality
export const initializePWA = () => {
  // Add global error handler for corruption errors
  // Use a one-time handler to prevent infinite loops
  let corruptionHandled = false;
  
  const handleCorruptionError = (event: ErrorEvent | PromiseRejectionEvent) => {
    if (corruptionHandled) return;
    
    const message = 'message' in event ? event.message : String(event.reason || '');
    const isCorruptionError = message?.includes('Corruption') || 
                              message?.includes('checksum') ||
                              message?.includes('block checksum mismatch');
    
    if (isCorruptionError) {
      corruptionHandled = true;
      console.warn('Cache corruption detected, clearing cache and reloading...');
      
      // Prevent the error from propagating
      if ('preventDefault' in event) {
        event.preventDefault();
      }
      
      // Clear cache and reload
      clearCorruptedCache().then(() => {
        // Reload after a short delay to allow cache clearing to complete
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }).catch(() => {
        // If clearing fails, just reload anyway
        window.location.reload();
      });
    }
  };

  window.addEventListener('error', handleCorruptionError as EventListener, { once: true });

  // Handle unhandled promise rejections (like the corruption error)
  window.addEventListener('unhandledrejection', handleCorruptionError as EventListener, { once: true });

  const updateSW = registerPWA();
  const cleanupOfflineHandling = setupOfflineHandling();

  return {
    updateSW,
    cleanup: cleanupOfflineHandling
  };
};
