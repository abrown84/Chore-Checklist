import React from 'react'
import { Card, CardContent } from './ui/card'
import { SpeakerHigh, SpeakerSlash } from '@phosphor-icons/react'
import { Button } from './ui/button'

export const SoundSettings: React.FC = () => {
  const [soundEnabled, setSoundEnabled] = React.useState(true)

  return (
    <Card className="bg-card/60 rounded-2xl border-border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`p-2 rounded-lg bg-muted/50 ${soundEnabled ? 'text-green-500' : 'text-muted-foreground'}`}>
              {soundEnabled ? <SpeakerHigh className="w-5 h-5" /> : <SpeakerSlash className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground text-sm">
                {soundEnabled ? 'Sound effects enabled' : 'Sound effects disabled'}
              </h4>
              <p className="text-xs text-muted-foreground truncate">
                {soundEnabled ? 'Play sounds for achievements' : 'Enable to hear achievement sounds'}
              </p>
            </div>
          </div>
          <Button
            variant={soundEnabled ? 'outline' : 'default'}
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex-shrink-0"
          >
            {soundEnabled ? 'Disable' : 'Enable'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

SoundSettings.displayName = 'SoundSettings'
