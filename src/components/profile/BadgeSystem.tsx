import React from 'react'
import { Award, Lock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

interface BadgeSystemProps {
  selectedBadge: string
  currentLevel: number
  onBadgeChange: (badge: string) => void
}

export const BadgeSystem: React.FC<BadgeSystemProps> = ({
  selectedBadge,
  currentLevel,
  onBadgeChange
}) => {
  const badgeOptions = {
    none: '',
    badge_4: '🏆 Achievement Unlocked',
    badge_5: '⭐ Star Performer',
    badge_6: '👑 Chore Master',
    badge_7: '🌟 Legendary Worker',
    badge_8: '💎 Diamond Status',
    badge_9: '✨ God Mode',
    badge_10: '👑 Ultimate Flex',
    badge_2: '🌱 Beginner',
    badge_3: '🛠️ Helper',
    badge_4_alt: '🎯 Goal Setter',
    badge_5_alt: '🔥 Streak Master',
    badge_6_alt: '⚡ Speed Demon',
    badge_7_alt: '🎨 Creative',
    badge_8_alt: '🚀 Overachiever',
    badge_9_alt: '💫 Legend',
    badge_10_alt: '🏅 Champion'
  }

  const badgeStyles = {
    none: '',
    badge_2: 'bg-green-100 text-green-800 border border-green-300',
    badge_3: 'bg-blue-100 text-blue-800 border border-blue-300',
    badge_4: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
    badge_4_alt: 'bg-orange-100 text-orange-800 border border-orange-300',
    badge_5: 'bg-orange-100 text-orange-800 border border-orange-300',
    badge_5_alt: 'bg-red-100 text-red-800 border border-red-300',
    badge_6: 'bg-red-100 text-red-800 border border-red-300',
    badge_6_alt: 'bg-purple-100 text-purple-800 border border-purple-300',
    badge_7: 'bg-indigo-100 text-indigo-800 border border-indigo-300',
    badge_7_alt: 'bg-pink-100 text-pink-800 border border-pink-300',
    badge_8: 'bg-pink-100 text-pink-800 border border-pink-300',
    badge_8_alt: 'bg-indigo-100 text-indigo-800 border border-indigo-300',
    badge_9: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
    badge_9_alt: 'bg-teal-100 text-teal-800 border border-teal-300',
    badge_10: 'bg-amber-100 text-amber-800 border border-amber-300',
    badge_10_alt: 'bg-yellow-100 text-yellow-800 border border-yellow-300'
  }

  const getAvailableBadgeOptions = () => {
    const options: { value: string; label: string; level: number; locked?: boolean }[] = []
    
    // Add no badge option
    options.push({
      value: 'none',
      label: 'No Badge',
      level: 1
    })

    // Add badge options based on level
    if (currentLevel >= 2) {
      options.push({ value: 'badge_2', label: '🌱 Beginner', level: 2 })
    }
    if (currentLevel >= 3) {
      options.push({ value: 'badge_3', label: '🛠️ Helper', level: 3 })
    }
    if (currentLevel >= 4) {
      options.push({ value: 'badge_4', label: '🏆 Achievement Unlocked', level: 4 })
      options.push({ value: 'badge_4_alt', label: '🎯 Goal Setter', level: 4 })
    }
    if (currentLevel >= 5) {
      options.push({ value: 'badge_5', label: '⭐ Star Performer', level: 5 })
      options.push({ value: 'badge_5_alt', label: '🔥 Streak Master', level: 5 })
    }
    if (currentLevel >= 6) {
      options.push({ value: 'badge_6', label: '👑 Chore Master', level: 6 })
      options.push({ value: 'badge_6_alt', label: '⚡ Speed Demon', level: 6 })
    }
    if (currentLevel >= 7) {
      options.push({ value: 'badge_7', label: '🌟 Legendary Worker', level: 7 })
      options.push({ value: 'badge_7_alt', label: '🎨 Creative', level: 7 })
    }
    if (currentLevel >= 8) {
      options.push({ value: 'badge_8', label: '💎 Diamond Status', level: 8 })
      options.push({ value: 'badge_8_alt', label: '🚀 Overachiever', level: 8 })
    }
    if (currentLevel >= 9) {
      options.push({ value: 'badge_9', label: '✨ God Mode', level: 9 })
      options.push({ value: 'badge_9_alt', label: '💫 Legend', level: 9 })
    }
    if (currentLevel >= 10) {
      options.push({ value: 'badge_10', label: '👑 Ultimate Flex', level: 10 })
      options.push({ value: 'badge_10_alt', label: '🏅 Champion', level: 10 })
    }

    return options
  }

  const getBadgeDisplay = (badgeValue: string) => {
    if (badgeValue === 'none') {
      return (
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
          <Award className="w-6 h-6" />
        </div>
      )
    }

    const style = badgeStyles[badgeValue as keyof typeof badgeStyles]
    const label = badgeOptions[badgeValue as keyof typeof badgeOptions]
    
    if (style && label) {
      return (
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${style}`}>
          {label.split(' ')[0]}
        </div>
      )
    }

    return (
      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
        ?
      </div>
    )
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Award className="w-5 h-5" />
          <span>Badge System</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Badge Display */}
        <div className="flex items-center space-x-4">
          <div className="text-sm font-medium">Current Badge:</div>
          {getBadgeDisplay(selectedBadge)}
          {selectedBadge !== 'none' && (
            <div className="text-sm text-gray-600">
              {badgeOptions[selectedBadge as keyof typeof badgeOptions]}
            </div>
          )}
        </div>

        {/* Badge Options Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {getAvailableBadgeOptions().map((option) => (
            <button
              key={option.value}
              onClick={() => onBadgeChange(option.value)}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                selectedBadge === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              } ${option.locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              disabled={option.locked}
            >
              <div className="flex flex-col items-center space-y-2">
                {getBadgeDisplay(option.value)}
                <div className="text-xs text-center">
                  <div className="font-medium">
                    {option.value === 'none' ? 'No Badge' : option.label}
                  </div>
                  <div className="text-gray-500">Level {option.level}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Locked Badges Preview */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Locked Badges (Complete chores to unlock):</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Object.entries(badgeOptions).map(([key, label]) => {
              const level = parseInt(key.split('_')[1]) || 1
              const isUnlocked = currentLevel >= level
              
              if (isUnlocked) return null
              
              return (
                <div
                  key={key}
                  className="p-3 rounded-lg border-2 border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div className="text-xs text-center">
                      <div className="font-medium text-gray-500">{label}</div>
                      <div className="text-gray-400">Level {level}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}



