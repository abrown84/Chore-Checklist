import React, { memo } from 'react'
import { SpeakerSimpleHigh, SpeakerSimpleSlash, SpeakerSimpleLow } from '@phosphor-icons/react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { useSound } from '../contexts/SoundContext'

export const SoundSettings: React.FC = memo(() => {
  const { soundEnabled, setSoundEnabled, volume, setVolume, playSound } = useSound()

  const handleToggle = () => {
    const newState = !soundEnabled
    setSoundEnabled(newState)
    // Play a preview sound when enabling
    if (newState) {
      setTimeout(() => playSound('success'), 100)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    // Play a preview sound to hear the new volume
    if (soundEnabled) {
      playSound('click')
    }
  }

  const getStatusInfo = () => {
    if (!soundEnabled) {
      return {
        icon: SpeakerSimpleSlash,
        text: 'Sound effects disabled',
        description: 'Enable for audio feedback on actions.',
        color: 'text-muted-foreground',
      }
    }

    if (volume < 0.3) {
      return {
        icon: SpeakerSimpleLow,
        text: 'Sound effects enabled (quiet)',
        description: 'Subtle audio feedback on actions.',
        color: 'text-green-500',
      }
    }

    return {
      icon: SpeakerSimpleHigh,
      text: 'Sound effects enabled',
      description: 'Audio feedback on button clicks and achievements.',
      color: 'text-green-500',
    }
  }

  const status = getStatusInfo()
  const StatusIcon = status.icon

  return (
    <Card className="bg-card/60 rounded-2xl border-border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`p-2 rounded-lg bg-muted/50 ${status.color}`}>
              <StatusIcon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground text-sm">
                {status.text}
              </h4>
              <p className="text-xs text-muted-foreground truncate">
                {status.description}
              </p>
            </div>
          </div>

          <Button
            variant={soundEnabled ? 'outline' : 'default'}
            size="sm"
            onClick={handleToggle}
            className="flex-shrink-0"
          >
            {soundEnabled ? 'Disable' : 'Enable'}
          </Button>
        </div>

        {/* Volume Slider - only shown when sound is enabled */}
        {soundEnabled && (
          <div className="mt-4 flex items-center gap-3">
            <SpeakerSimpleLow className="w-4 h-4 text-muted-foreground" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              aria-label="Volume"
            />
            <SpeakerSimpleHigh className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground min-w-[3ch]">
              {Math.round(volume * 100)}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
})

SoundSettings.displayName = 'SoundSettings'
