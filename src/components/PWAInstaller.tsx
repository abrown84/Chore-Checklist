import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { CheckCircle, Download, RefreshCw, Wifi, WifiOff } from 'lucide-react';

// Conditional import for PWA registration
let registerSW: any = null;
try {
  registerSW = require('virtual:pwa-register').registerSW;
} catch {
  // PWA plugin not available in development
  registerSW = () => ({
    onNeedRefresh: () => {},
    onOfflineReady: () => {},
  });
}

interface PWAInstallerProps {
  className?: string;
}

export const PWAInstaller: React.FC<PWAInstallerProps> = ({ className }) => {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Register service worker
    registerSW({
      onNeedRefresh() {
        setNeedRefresh(true);
      },
      onOfflineReady() {
        setOfflineReady(true);
      },
    });

    // Handle online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Handle install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallPrompt(false);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleRefresh = () => {
    setNeedRefresh(false);
    window.location.reload();
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallPrompt(false);
        setDeferredPrompt(null);
      }
    }
  };

  const handleDismissInstall = () => {
    setShowInstallPrompt(false);
    setDeferredPrompt(null);
  };

  if (!needRefresh && !offlineReady && !showInstallPrompt && isOnline) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 space-y-2 ${className}`}>
      {/* Update Available */}
      {needRefresh && (
        <Card className="w-80 bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <RefreshCw className="h-5 w-5 animate-spin" />
              Update Available
            </CardTitle>
            <CardDescription className="text-purple-100">
              A new version is ready to install
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleRefresh}
              className="w-full bg-white text-purple-600 hover:bg-purple-50"
            >
              Update Now
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Offline Ready */}
      {offlineReady && (
        <Card className="w-80 bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="h-5 w-5" />
              Ready for Offline
            </CardTitle>
            <CardDescription className="text-green-100">
              App is now available offline
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setOfflineReady(false)}
              className="w-full bg-white text-green-600 hover:bg-green-50"
            >
              Got it!
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Install Prompt */}
      {showInstallPrompt && (
        <Card className="w-80 bg-gradient-to-r from-orange-600 to-red-600 text-white border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Download className="h-5 w-5" />
              Install App
            </CardTitle>
            <CardDescription className="text-orange-100">
              Add to home screen for quick access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              onClick={handleInstall}
              className="w-full bg-white text-orange-600 hover:bg-orange-50"
            >
              Install
            </Button>
            <Button 
              onClick={handleDismissInstall}
              variant="ghost"
              className="w-full text-white hover:bg-orange-700"
            >
              Maybe Later
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Offline Status */}
      {!isOnline && (
        <Card className="w-80 bg-gradient-to-r from-gray-600 to-slate-600 text-white border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <WifiOff className="h-5 w-5" />
              Offline Mode
            </CardTitle>
            <CardDescription className="text-gray-100">
              Working offline - some features may be limited
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              <Wifi className="h-4 w-4" />
              <span>Reconnect to restore full functionality</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
