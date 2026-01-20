import React, { createContext, useContext, useState, useCallback, useRef, useEffect, memo } from 'react'

type SoundType = 'click' | 'success' | 'levelUp' | 'points' | 'bonus' | 'error' | 'woosh'

interface SoundContextType {
  soundEnabled: boolean
  setSoundEnabled: (enabled: boolean) => void
  playSound: (type: SoundType) => void
  volume: number
  setVolume: (volume: number) => void
}

const SoundContext = createContext<SoundContextType | null>(null)

// Sound frequencies and patterns (using Web Audio API oscillators)
const SOUND_CONFIGS: Record<SoundType, { frequencies: number[]; durations: number[]; type: OscillatorType; gain: number }> = {
  click: {
    frequencies: [800, 600],
    durations: [30, 30],
    type: 'sine',
    gain: 0.1
  },
  success: {
    frequencies: [523, 659, 784], // C5, E5, G5 - major chord
    durations: [80, 80, 120],
    type: 'sine',
    gain: 0.15
  },
  levelUp: {
    frequencies: [392, 523, 659, 784, 1047], // G4, C5, E5, G5, C6 - ascending
    durations: [100, 100, 100, 100, 200],
    type: 'sine',
    gain: 0.2
  },
  points: {
    frequencies: [880, 1100],
    durations: [50, 80],
    type: 'sine',
    gain: 0.1
  },
  bonus: {
    frequencies: [587, 784, 988], // D5, G5, B5
    durations: [60, 60, 100],
    type: 'triangle',
    gain: 0.15
  },
  error: {
    frequencies: [200, 150],
    durations: [100, 150],
    type: 'sawtooth',
    gain: 0.1
  },
  woosh: {
    frequencies: [400, 200, 100],
    durations: [50, 50, 100],
    type: 'sine',
    gain: 0.08
  }
}

interface SoundProviderProps {
  children: React.ReactNode
}

export const SoundProvider = memo<SoundProviderProps>(({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    // Load preference from localStorage, default to false (off)
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('soundEnabled')
      return saved === 'true'
    }
    return false
  })
  const [volume, setVolume] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('soundVolume')
      return saved ? parseFloat(saved) : 0.5
    }
    return 0.5
  })

  const audioContextRef = useRef<AudioContext | null>(null)

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('soundEnabled', String(soundEnabled))
  }, [soundEnabled])

  useEffect(() => {
    localStorage.setItem('soundVolume', String(volume))
  }, [volume])

  // Initialize AudioContext on first user interaction
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    // Resume if suspended (browsers require user gesture)
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume()
    }
    return audioContextRef.current
  }, [])

  const playSound = useCallback((type: SoundType) => {
    if (!soundEnabled) return

    try {
      const ctx = getAudioContext()
      const config = SOUND_CONFIGS[type]

      let startTime = ctx.currentTime

      config.frequencies.forEach((freq, index) => {
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()

        oscillator.type = config.type
        oscillator.frequency.setValueAtTime(freq, startTime)

        // Apply volume with envelope for smooth sound
        const noteGain = config.gain * volume
        gainNode.gain.setValueAtTime(0, startTime)
        gainNode.gain.linearRampToValueAtTime(noteGain, startTime + 0.01)
        gainNode.gain.linearRampToValueAtTime(0, startTime + config.durations[index] / 1000)

        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)

        oscillator.start(startTime)
        oscillator.stop(startTime + config.durations[index] / 1000 + 0.05)

        startTime += config.durations[index] / 1000
      })
    } catch (error) {
      // Silently fail if audio isn't available
      console.debug('Sound playback failed:', error)
    }
  }, [soundEnabled, volume, getAudioContext])

  // Cleanup AudioContext on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const value: SoundContextType = {
    soundEnabled,
    setSoundEnabled,
    playSound,
    volume,
    setVolume
  }

  return (
    <SoundContext.Provider value={value}>
      {children}
    </SoundContext.Provider>
  )
})

SoundProvider.displayName = 'SoundProvider'

export function useSound() {
  const context = useContext(SoundContext)
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider')
  }
  return context
}

// Simple hook for components that just need to play sounds
export function useSoundEffect() {
  const { playSound, soundEnabled } = useSound()
  return { playSound, soundEnabled }
}
