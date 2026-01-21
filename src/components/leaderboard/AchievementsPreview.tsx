import React from 'react'
import { Sparkle, CheckCircle, ShareNetwork } from '@phosphor-icons/react'
import { toast } from 'sonner'
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

  // Empty state when no user stats
  if (!currentUserStats) {
    return (
      <div className="bg-card p-6 rounded-xl border shadow-sm animate-fade-in" style={{ animationDelay: '0.8s' }}>
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Sparkle className="w-5 h-5 mr-2 text-warning animate-sparkle" />
          Achievements
        </h3>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <span className="text-5xl mb-3">🏅</span>
          <h4 className="text-base font-semibold text-foreground mb-1">Start Your Journey</h4>
          <p className="text-muted-foreground text-sm max-w-[180px]">
            Complete chores to unlock achievements and level up!
          </p>
        </div>
      </div>
    )
  }

  const handleShare = async () => {
    const level = currentUserStats?.currentLevel || 1
    const levelData = LEVELS.find(l => l.level === level)
    const shareText = `🏆 My Daily Bag Progress:\n\nLevel ${level} - ${levelData?.name || 'Beginner'}\n${level} achievements unlocked!\n\nKeep the house clean, earn rewards!`

    const shareData = {
      title: 'My Daily Bag Progress',
      text: shareText,
      url: window.location.origin,
    }

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData)
        toast.success('Shared!')
      } else {
        await navigator.clipboard.writeText(`${shareText}\n\n${window.location.origin}`)
        toast.success('Copied to clipboard!')
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(`${shareText}\n\n${window.location.origin}`)
          toast.success('Copied!')
        } catch {
          toast.error('Could not share')
        }
      }
    }
  }

  return (
    <div className="bg-card p-6 rounded-xl border shadow-sm animate-fade-in" style={{ animationDelay: '0.8s' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center">
          <Sparkle className="w-5 h-5 mr-2 text-warning animate-sparkle" />
          Achievements
        </h3>
        <button
          onClick={handleShare}
          className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          title="Share Progress"
        >
          <ShareNetwork className="w-4 h-4" />
        </button>
      </div>
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
