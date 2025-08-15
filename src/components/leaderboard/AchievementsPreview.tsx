import React from 'react'
import { Sparkles, CheckCircle } from 'lucide-react'
import { LEVELS } from '../../types/chore'
import { UserStats } from '../../types/user'
import { APP_CONFIG } from '../../config/constants'
import { useAnimationDelays } from '../../hooks/useAnimationDelays'

interface AchievementsPreviewProps {
  currentUserStats?: UserStats
}

export const AchievementsPreview: React.FC<AchievementsPreviewProps> = React.memo(({ currentUserStats }) => {
  const { getDelayStyle } = useAnimationDelays({ 
    baseDelay: 0.9,
    count: APP_CONFIG.DISPLAY_LIMITS.ACHIEVEMENTS_PREVIEW 
  })

  const previewLevels = LEVELS.slice(0, APP_CONFIG.DISPLAY_LIMITS.ACHIEVEMENTS_PREVIEW)

  return (
    <div className="bg-card p-6 rounded-xl border shadow-sm animate-fade-in" style={{ animationDelay: '0.8s' }}>
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
        <Sparkles className="w-5 h-5 mr-2 text-warning animate-sparkle" />
        Achievements
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {previewLevels.map((level, index) => {
          const isUnlocked = (currentUserStats?.currentLevel || 1) >= level.level
          
          return (
            <div 
              key={level.level}
              className={`p-3 rounded-lg border text-center transition-all duration-300 hover:scale-105 animate-fade-in ${
                isUnlocked 
                  ? 'bg-success/10 border-success/30' 
                  : 'bg-muted border-border'
              }`}
              style={getDelayStyle(index)}
            >
              <div className="text-2xl mb-1 animate-float">{level.icon}</div>
              <div className="text-xs font-bold">Lv {level.level}</div>
              <div className={`text-xs truncate ${isUnlocked ? level.color : 'text-muted-foreground'}`}>
                {level.name}
              </div>
              {isUnlocked && (
                <CheckCircle className="w-3 h-3 text-success mx-auto mt-1 animate-sparkle" />
              )}
            </div>
          )
        })}
      </div>
      {LEVELS.length > APP_CONFIG.DISPLAY_LIMITS.ACHIEVEMENTS_PREVIEW && (
        <p className="text-xs text-muted-foreground text-center mt-3 animate-fade-in" style={{ animationDelay: '1.3s' }}>
          +{LEVELS.length - APP_CONFIG.DISPLAY_LIMITS.ACHIEVEMENTS_PREVIEW} more levels to unlock
        </p>
      )}
    </div>
  )
})

AchievementsPreview.displayName = 'AchievementsPreview'
