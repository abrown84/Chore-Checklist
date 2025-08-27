import React from 'react'
import { Palette, Target, Star, Eye, Zap, Sparkle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

interface ThemeCustomizationProps {
  selectedCustomizations: {
    theme: string
    border: string
    background: string
    animation: string
    font: string
    effect: string
  }
  currentLevel: number
  onCustomizationChange: (category: string, value: string) => void
}

export const ThemeCustomization: React.FC<ThemeCustomizationProps> = ({
  selectedCustomizations,
  currentLevel,
  onCustomizationChange
}) => {
  const getAvailableOptions = (category: string) => {
    const options: { value: string; label: string; level: number; icon: string; locked?: boolean }[] = []
    
    // Add default option first
    options.push({
      value: 'default',
      label: 'Default',
      level: 1,
      icon: '🌱'
    })

    // Theme options
    if (category === 'theme') {
      if (currentLevel >= 2) {
        options.push({ value: 'theme_2', label: 'Green Theme', level: 2, icon: '🟢' })
        options.push({ value: 'theme_2_alt', label: 'Emerald Theme', level: 2, icon: '💚' })
      }
      if (currentLevel >= 3) {
        options.push({ value: 'theme_3', label: 'Blue Theme', level: 3, icon: '🔵' })
        options.push({ value: 'theme_3_alt', label: 'Cyan Theme', level: 3, icon: '🔷' })
      }
      if (currentLevel >= 4) {
        options.push({ value: 'theme_4', label: 'Purple-Pink Gradient', level: 4, icon: '🟣' })
        options.push({ value: 'theme_4_alt', label: 'Violet Theme', level: 4, icon: '💜' })
      }
      if (currentLevel >= 5) {
        options.push({ value: 'theme_5', label: 'Yellow-Orange Gradient', level: 5, icon: '🟡' })
        options.push({ value: 'theme_5_alt', label: 'Amber Theme', level: 5, icon: '🟠' })
      }
      if (currentLevel >= 6) {
        options.push({ value: 'theme_6', label: 'Red-Pink Gradient', level: 6, icon: '🔴' })
        options.push({ value: 'theme_6_alt', label: 'Rose Theme', level: 6, icon: '🌹' })
      }
      if (currentLevel >= 7) {
        options.push({ value: 'theme_7', label: 'Indigo-Purple Gradient', level: 7, icon: '🟦' })
        options.push({ value: 'theme_7_alt', label: 'Sky Theme', level: 7, icon: '☁️' })
      }
      if (currentLevel >= 8) {
        options.push({ value: 'theme_8', label: 'Pink-Rose Gradient', level: 8, icon: '💗' })
        options.push({ value: 'theme_8_alt', label: 'Fuchsia Theme', level: 8, icon: '🟪' })
      }
      if (currentLevel >= 9) {
        options.push({ value: 'theme_9', label: 'Emerald-Teal Gradient', level: 9, icon: '🟢' })
        options.push({ value: 'theme_9_alt', label: 'Lime Theme', level: 9, icon: '🍋' })
      }
      if (currentLevel >= 10) {
        options.push({ value: 'theme_10', label: 'Amber-Yellow Gradient', level: 10, icon: '🟡' })
        options.push({ value: 'theme_10_alt', label: 'Orange Theme', level: 10, icon: '🟠' })
      }
    }

    // Border options
    if (category === 'border') {
      if (currentLevel >= 2) {
        options.push({ value: 'border_2', label: 'Simple Border', level: 2, icon: '🔲' })
      }
      if (currentLevel >= 4) {
        options.push({ value: 'border_4', label: 'Rounded Border', level: 4, icon: '🔘' })
      }
      if (currentLevel >= 6) {
        options.push({ value: 'border_6', label: 'Gradient Border', level: 6, icon: '🌈' })
      }
      if (currentLevel >= 8) {
        options.push({ value: 'border_8', label: 'Animated Border', level: 8, icon: '✨' })
      }
    }

    // Background options
    if (category === 'background') {
      if (currentLevel >= 2) {
        options.push({ value: 'background_2', label: 'Subtle Pattern', level: 2, icon: '🔲' })
      }
      if (currentLevel >= 4) {
        options.push({ value: 'background_4', label: 'Geometric Pattern', level: 4, icon: '🔷' })
      }
      if (currentLevel >= 6) {
        options.push({ value: 'background_6', label: 'Gradient Background', level: 6, icon: '🌈' })
      }
      if (currentLevel >= 8) {
        options.push({ value: 'background_8', label: 'Animated Background', level: 8, icon: '✨' })
      }
    }

    // Animation options
    if (category === 'animation') {
      if (currentLevel >= 3) {
        options.push({ value: 'animation_3', label: 'Fade In', level: 3, icon: '🌅' })
      }
      if (currentLevel >= 5) {
        options.push({ value: 'animation_5', label: 'Slide In', level: 5, icon: '➡️' })
      }
      if (currentLevel >= 7) {
        options.push({ value: 'animation_7', label: 'Bounce', level: 7, icon: '⚡' })
      }
      if (currentLevel >= 9) {
        options.push({ value: 'animation_9', label: 'Pulse', level: 9, icon: '💫' })
      }
    }

    // Font options
    if (category === 'font') {
      if (currentLevel >= 2) {
        options.push({ value: 'font_2', label: 'Serif', level: 2, icon: '📝' })
      }
      if (currentLevel >= 4) {
        options.push({ value: 'font_4', label: 'Monospace', level: 4, icon: '💻' })
      }
      if (currentLevel >= 6) {
        options.push({ value: 'font_6', label: 'Display', level: 6, icon: '🎨' })
      }
      if (currentLevel >= 8) {
        options.push({ value: 'font_8', label: 'Handwriting', level: 8, icon: '✍️' })
      }
    }

    // Effect options
    if (category === 'effect') {
      if (currentLevel >= 3) {
        options.push({ value: 'effect_3', label: 'Shadow', level: 3, icon: '👻' })
      }
      if (currentLevel >= 5) {
        options.push({ value: 'effect_5', label: 'Glow', level: 5, icon: '💡' })
      }
      if (currentLevel >= 7) {
        options.push({ value: 'effect_7', label: 'Blur', level: 7, icon: '🌫️' })
      }
      if (currentLevel >= 9) {
        options.push({ value: 'effect_9', label: '3D', level: 9, icon: '🎯' })
      }
    }

    return options
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'theme': return <Palette className="w-5 h-5" />
      case 'border': return <Target className="w-5 h-5" />
      case 'background': return <Star className="w-5 h-5" />
      case 'animation': return <Zap className="w-5 h-5" />
      case 'font': return <Eye className="w-5 h-5" />
      case 'effect': return <Sparkle className="w-5 h-5" />
      default: return <Palette className="w-5 h-5" />
    }
  }

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'theme': return 'Theme Colors'
      case 'border': return 'Border Styles'
      case 'background': return 'Background Patterns'
      case 'animation': return 'Animation Effects'
      case 'font': return 'Font Styles'
      case 'effect': return 'Visual Effects'
      default: return 'Customization'
    }
  }

  const categories = ['theme', 'border', 'background', 'animation', 'font', 'effect']

  return (
    <div className="space-y-6">
      {categories.map((category) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getCategoryIcon(category)}
              <span>{getCategoryTitle(category)}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {getAvailableOptions(category).map((option) => (
                <button
                  key={option.value}
                  onClick={() => onCustomizationChange(category, option.value)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    selectedCustomizations[category as keyof typeof selectedCustomizations] === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  } ${option.locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  disabled={option.locked}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className="text-2xl">{option.icon}</div>
                    <div className="text-xs text-center">
                      <div className="font-medium">{option.label}</div>
                      <div className="text-gray-500">Level {option.level}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}



