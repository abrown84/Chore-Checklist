import React from 'react';
import { Card, CardContent } from './ui/card';
import { CheckCircle } from '@phosphor-icons/react';

export const PWAInstallGuide: React.FC = () => {
  const getDeviceType = () => {
    const userAgent = navigator.userAgent;
    if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      if (/iPad|Android.*Tablet|Tablet/i.test(userAgent)) {
        return 'tablet';
      }
      return 'mobile';
    }
    return 'desktop';
  };

  const currentDevice = getDeviceType();

  const getInstallationSteps = () => {
    switch (currentDevice) {
      case 'mobile':
        return [
          { step: 1, title: 'Open in Safari/Chrome', description: 'Navigate to the app in your mobile browser' },
          { step: 2, title: 'Tap Share Button', description: 'Look for the share button (square with arrow up) in your browser' },
          { step: 3, title: 'Add to Home Screen', description: 'Select "Add to Home Screen" from the share menu' },
          { step: 4, title: 'Confirm Installation', description: 'Tap "Add" to confirm and the app will appear on your home screen' }
        ];
      case 'tablet':
        return [
          { step: 1, title: 'Open in Browser', description: 'Navigate to the app in your tablet browser' },
          { step: 2, title: 'Access Menu', description: 'Tap the menu button (three dots) in your browser' },
          { step: 3, title: 'Install App', description: 'Look for "Install app" or "Add to Home Screen" option' },
          { step: 4, title: 'Confirm Installation', description: 'Follow the prompts to complete the installation' }
        ];
      default:
        return [
          { step: 1, title: 'Open in Chrome/Edge', description: 'Navigate to the app in your desktop browser' },
          { step: 2, title: 'Look for Install Button', description: 'You should see an install button (plus icon) in the address bar' },
          { step: 3, title: 'Click Install', description: 'Click the install button and confirm the installation' },
          { step: 4, title: 'Launch from Desktop', description: 'The app will be installed and can be launched from your desktop' }
        ];
    }
  };

  const steps = getInstallationSteps();

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Installation Steps for {currentDevice === 'mobile' ? 'Mobile' : currentDevice === 'tablet' ? 'Tablet' : 'Desktop'}</h3>
        <p className="text-sm text-muted-foreground">Follow these steps to install the app on your device</p>
      </div>

      <div className="grid gap-4">
        {steps.map((step) => (
          <Card key={step.step} className="border-l-4 border-l-primary">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  {step.step}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{step.title}</h4>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>
              {currentDevice === 'mobile' && 'Once installed, the app will work offline and provide a native app experience.'}
              {currentDevice === 'tablet' && 'The app will be accessible from your home screen and work offline.'}
              {currentDevice === 'desktop' && 'The app will be installed as a desktop application with offline capabilities.'}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="pt-4 border-t">
        <div className="text-sm text-muted-foreground">
          <p className="mb-2"><strong>Benefits of installing:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Quick access from your home screen</li>
            <li>Works offline for basic functionality</li>
            <li>Native app-like experience</li>
            <li>Automatic updates when available</li>
            <li>Better performance and reliability</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
