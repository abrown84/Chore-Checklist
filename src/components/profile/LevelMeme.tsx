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

  // Set mobile-specific attributes and try to play video
  useEffect(() => {
    if (shouldUseVideo && videoRef.current) {
      const video = videoRef.current
      
      // Set webkit-playsinline for iOS Safari
      if ('playsInline' in video) {
        video.setAttribute('playsinline', 'true')
        video.setAttribute('webkit-playsinline', 'true')
      }
      
      // Ensure video is loaded before trying to play
      if (video.readyState >= 2) {
        // Video is loaded enough to play
        const playPromise = video.play()
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
      } else if (loaded) {
        // Video loaded event fired, try to play
        const playPromise = video.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setNeedsInteraction(false)
            })
            .catch(() => {
              setNeedsInteraction(true)
            })
        }
      }
    }
  }, [shouldUseVideo, loaded])
  
  // Additional effect to try playing when video can play (mobile fix)
  useEffect(() => {
    if (shouldUseVideo && videoRef.current) {
      const video = videoRef.current
      
      const handleCanPlay = () => {
        if (video.paused) {
          const playPromise = video.play()
          if (playPromise !== undefined) {
            playPromise
              .then(() => setNeedsInteraction(false))
              .catch(() => setNeedsInteraction(true))
          }
        }
      }
      
      video.addEventListener('canplay', handleCanPlay)
      video.addEventListener('canplaythrough', handleCanPlay)
      
      return () => {
        video.removeEventListener('canplay', handleCanPlay)
        video.removeEventListener('canplaythrough', handleCanPlay)
      }
    }
  }, [shouldUseVideo])

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
                style={{ maxHeight: '100%', maxWidth: '100%', display: 'block' }}
                onLoadedData={() => {
                  setLoaded(true)
                  // Try to play immediately when data is loaded (mobile fix)
                  if (videoRef.current && videoRef.current.paused) {
                    videoRef.current.play().catch(() => setNeedsInteraction(true))
                  }
                }}
                onLoadedMetadata={() => {
                  setLoaded(true)
                  // Also try on metadata loaded (mobile fix)
                  if (videoRef.current && videoRef.current.paused) {
                    videoRef.current.play().catch(() => setNeedsInteraction(true))
                  }
                }}
                onCanPlay={() => {
                  setLoaded(true)
                  // Try to play when video can play (mobile fix)
                  if (videoRef.current && videoRef.current.paused) {
                    videoRef.current.play().catch(() => setNeedsInteraction(true))
                  }
                }}
                onError={() => {
                  setError(true)
                  setLoaded(false)
                }}
                onPlay={() => {
                  setNeedsInteraction(false)
                  setLoaded(true)
                }}
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

