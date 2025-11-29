import React, { useState } from 'react'
import { Level } from '../../types/chore'

interface LevelMemeProps {
  level: Level
  className?: string
}

export const LevelMeme: React.FC<LevelMemeProps> = ({ level, className = '' }) => {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  if (!level.meme) return null

  const isGif = level.meme.toLowerCase().endsWith('.gif')

  return (
    <div className={`relative overflow-hidden rounded-lg bg-muted/10 ${className}`}>
      {!error && (
        <>
          {isGif ? (
            <video
              src={level.meme}
              autoPlay
              loop
              muted
              playsInline
              className={`w-full h-full object-contain transition-opacity duration-300 ${
                loaded ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ maxHeight: '100%', maxWidth: '100%' }}
              onLoadedData={() => setLoaded(true)}
              onError={() => {
                setError(true)
                setLoaded(false)
              }}
            />
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

