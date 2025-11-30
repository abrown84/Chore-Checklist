import React, { useState, useRef, useEffect } from 'react'
import { Level } from '../../types/chore'

interface LevelMemeProps {
  level: Level
  className?: string
}

export const LevelMeme: React.FC<LevelMemeProps> = ({ level, className = '' }) => {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const [needsInteraction, setNeedsInteraction] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  if (!level.meme) return null

  const isVideo = level.meme.toLowerCase().endsWith('.mp4') || level.meme.toLowerCase().endsWith('.webm')
  const isGif = level.meme.toLowerCase().endsWith('.gif')

  // Note: GIF files are actually MP4 videos saved with .gif extension
  // So we treat .gif files as videos for proper playback
  const shouldUseVideo = isVideo || isGif

  // Try to play video on mount (mobile browsers may block autoplay)
  useEffect(() => {
    if (shouldUseVideo && videoRef.current && loaded) {
      const playPromise = videoRef.current.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Autoplay worked
            setNeedsInteraction(false)
          })
          .catch(() => {
            // Autoplay was prevented - show play button
            setNeedsInteraction(true)
          })
      }
    }
  }, [shouldUseVideo, loaded])

  const handlePlayClick = () => {
    if (videoRef.current) {
      videoRef.current.play()
      setNeedsInteraction(false)
    }
  }

  return (
    <div className={`relative overflow-hidden rounded-lg bg-muted/10 ${className}`}>
      {!error && (
        <>
          {shouldUseVideo ? (
            <>
              <video
                ref={videoRef}
                src={level.meme}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className={`w-full h-full object-contain transition-opacity duration-300 ${
                  loaded ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ maxHeight: '100%', maxWidth: '100%' }}
                onLoadedData={() => setLoaded(true)}
                onError={() => {
                  setError(true)
                  setLoaded(false)
                }}
                onPlay={() => setNeedsInteraction(false)}
              />
              {/* Play button overlay for mobile if autoplay fails */}
              {needsInteraction && loaded && (
                <div
                  className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer z-10"
                  onClick={handlePlayClick}
                  onTouchStart={handlePlayClick}
                >
                  <div className="bg-white/90 rounded-full p-4 hover:bg-white transition-colors">
                    <svg
                      className="w-12 h-12 text-primary"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              )}
            </>
          ) : (
            <img 
              src={level.meme} 
              alt={`${level.name} meme`}
              className={`w-full h-full object-contain transition-opacity duration-300 ${
                loaded ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ maxHeight: '100%', maxWidth: '100%' }}
              onLoad={() => setLoaded(true)}
              onError={() => {
                setError(true)
                setLoaded(false)
              }}
              loading="lazy"
            />
          )}
        </>
      )}
      {/* Fallback if image doesn't exist or fails to load */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/30 text-muted-foreground text-xs p-2 text-center">
          Meme coming soon
        </div>
      )}
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
          <div className="text-xs text-muted-foreground">Loading...</div>
        </div>
      )}
    </div>
  )
}

