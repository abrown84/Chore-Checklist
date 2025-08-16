import React, { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, Clock, Wifi, WifiOff } from 'lucide-react';

export const PWAStatus: React.FC = () => {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [swStatus, setSwStatus] = useState<'active' | 'installing' | 'error' | 'none'>('none');

  useEffect(() => {
    // Check if app is installed
    const checkInstallation = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }
    };

    // Check service worker status
    const checkServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            if (registration.active) {
              setSwStatus('active');
            } else if (registration.installing) {
              setSwStatus('installing');
            } else if (registration.waiting) {
              setSwStatus('installing');
            }
          } else {
            setSwStatus('none');
          }
        } catch (error) {
          setSwStatus('error');
        }
      }
    };

    // Handle online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    checkInstallation();
    checkServiceWorker();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="w-3 h-3" />;
    if (isInstalled) return <CheckCircle className="w-3 h-3" />;
    if (swStatus === 'active') return <CheckCircle className="w-3 h-3" />;
    if (swStatus === 'installing') return <Clock className="w-3 h-3" />;
    if (swStatus === 'error') return <XCircle className="w-3 h-3" />;
    return <Wifi className="w-3 h-3" />;
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (isInstalled) return 'Installed';
    if (swStatus === 'active') return 'PWA Ready';
    if (swStatus === 'installing') return 'Installing...';
    if (swStatus === 'error') return 'PWA Error';
    return 'PWA Available';
  };

  const getStatusColor = () => {
    if (!isOnline) return 'bg-gray-500';
    if (isInstalled || swStatus === 'active') return 'bg-green-500';
    if (swStatus === 'installing') return 'bg-yellow-500';
    if (swStatus === 'error') return 'bg-red-500';
    return 'bg-blue-500';
  };

  return (
    <Badge 
      variant="secondary" 
      className={`${getStatusColor()} text-white text-xs px-2 py-1 flex items-center gap-1`}
    >
      {getStatusIcon()}
      {getStatusText()}
    </Badge>
  );
};
