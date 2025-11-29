import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { WifiOff, RefreshCw, Home } from 'lucide-react';

interface OfflinePageProps {
  onRetry: () => void;
  onGoHome: () => void;
}

export const OfflinePage: React.FC<OfflinePageProps> = ({ onRetry, onGoHome }) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <WifiOff className="w-8 h-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">You're Offline</CardTitle>
          <p className="text-muted-foreground">
            Daily Bag is currently offline. Some features may not be available.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">What you can do offline:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• View your chore list</li>
              <li>• Check your progress</li>
              <li>• View your profile</li>
              <li>• Access basic app features</li>
            </ul>
          </div>
          
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">What requires internet:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Syncing with household members</li>
              <li>• Real-time leaderboard updates</li>
              <li>• New chore assignments</li>
              <li>• Cloud data synchronization</li>
            </ul>
          </div>

          <div className="flex flex-col space-y-2">
            <Button onClick={onRetry} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={onGoHome} variant="outline" className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Go to Home
            </Button>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            <p>Your data is saved locally and will sync when you're back online.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
