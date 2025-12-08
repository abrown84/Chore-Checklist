import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAInstallContextType {
  deferredPrompt: BeforeInstallPromptEvent | null;
  isInstallable: boolean;
  isInstalled: boolean;
  promptInstall: () => Promise<boolean>;
}

const PWAInstallContext = createContext<PWAInstallContextType | undefined>(undefined);

export const PWAInstallProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const promptCapturedRef = useRef(false);

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInStandaloneMode = (window.navigator as any).standalone === true;
      const installed = isStandalone || isInStandaloneMode;
      setIsInstalled(installed);
      console.log('PWA Install Context initialized', {
        isInstalled: installed,
        isStandalone,
        isInStandaloneMode,
        hasServiceWorker: 'serviceWorker' in navigator,
        protocol: window.location.protocol
      });
    };

    checkInstalled();

    // Handle beforeinstallprompt event - this will be captured once
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      console.log('✅ PWA install prompt captured!');
      promptCapturedRef.current = true;
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Log when listener is set up
    console.log('Setting up beforeinstallprompt listener');
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app was just installed
    window.addEventListener('appinstalled', () => {
      console.log('App was installed');
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    // Log if event doesn't fire after a delay (for debugging)
    // Only log in development to reduce console noise
    const timeout = setTimeout(() => {
      if (!promptCapturedRef.current && import.meta.env.DEV) {
        // Only log in development mode
        console.debug('beforeinstallprompt event not fired. This is normal if:', {
          reason: 'App already installed, user dismissed prompt, or browser doesn\'t support it',
          hasManifest: document.querySelector('link[rel="manifest"]') !== null,
          hasServiceWorker: 'serviceWorker' in navigator
        });
      }
    }, 3000);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const promptInstall = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error prompting for installation:', error);
      return false;
    }
  };

  return (
    <PWAInstallContext.Provider
      value={{
        deferredPrompt,
        isInstallable: !!deferredPrompt && !isInstalled,
        isInstalled,
        promptInstall,
      }}
    >
      {children}
    </PWAInstallContext.Provider>
  );
};

export const usePWAInstall = (): PWAInstallContextType => {
  const context = useContext(PWAInstallContext);
  if (context === undefined) {
    throw new Error('usePWAInstall must be used within a PWAInstallProvider');
  }
  return context;
};

