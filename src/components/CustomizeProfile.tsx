import React, { useState, useCallback, useMemo } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { useUsers } from '../contexts/UserContext'
import { useStats } from '../contexts/StatsContext'
import { 
  Palette, 
  User, 
  X, 
  Save,
  Lock,
  Target,
  Award,
  Edit
} from 'lucide-react'

// DEPRECATED: This component has been merged into ProfileAndRewards.tsx
// Keeping for reference only - can be deleted after testing
const CustomizeProfile_DEPRECATED: React.FC = () => {
  const { state: { currentUser, household }, updateCurrentUser } = useUsers();
  const { getUserStats } = useStats();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(currentUser?.name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const userStats = currentUser ? getUserStats(currentUser.id) : undefined;
  const currentLevel = userStats?.currentLevel || 1;
  const currentPoints = userStats?.earnedPoints || 0;
  const currentStreak = userStats?.currentStreak || 0;

  // Level-based customization options
  const customizationOptions = useMemo(() => ({
    avatar: [
      { value: 'default', label: 'Default', icon: '👤', level: 1 },
      { value: 'star', label: 'Star', icon: '⭐', level: 2 },
      { value: 'crown', label: 'Crown', icon: '👑', level: 3 },
      { value: 'dragon', label: 'Dragon', icon: '🐉', level: 5 },
      { value: 'phoenix', label: 'Phoenix', icon: '🔥', level: 7 },
      { value: 'legendary', label: 'Legendary', icon: '⚡', level: 10 }
    ],
    theme: [
      { value: 'classic', label: 'Classic', level: 1 },
      { value: 'modern', label: 'Modern', level: 2 },
      { value: 'dark', label: 'Dark', level: 3 },
      { value: 'colorful', label: 'Colorful', level: 4 },
      { value: 'holographic', label: 'Holographic', level: 7 },
      { value: 'neon', label: 'Neon', level: 8 },
      { value: 'rainbow', label: 'Rainbow', level: 9 },
      { value: 'legendary', label: 'Legendary', level: 10 }
    ],
    border: [
      { value: 'none', label: 'None', level: 1 },
      { value: 'simple', label: 'Simple', level: 2 },
      { value: 'rounded', label: 'Rounded', level: 3 },
      { value: 'glowing', label: 'Glowing', level: 5 },
      { value: 'animated', label: 'Animated', level: 7 },
      { value: 'cosmic', label: 'Cosmic', level: 9 }
    ],
    badge: [
      { value: 'none', label: 'None', level: 1 },
      { value: 'beginner', label: 'Beginner', level: 2 },
      { value: 'dedicated', label: 'Dedicated', level: 4 },
      { value: 'expert', label: 'Expert', level: 6 },
      { value: 'master', label: 'Master', level: 8 },
      { value: 'legendary', label: 'Legendary', level: 10 }
    ]
  }), []);

  const handleNameEdit = useCallback(() => {
    setIsEditingName(true);
    setEditedName(currentUser?.name || '');
  }, [currentUser?.name]);

  const handleNameSave = useCallback(async () => {
    if (!currentUser || !editedName.trim()) return;
    
    setIsSaving(true);
    try {
      await updateCurrentUser({ name: editedName.trim() });
      setIsEditingName(false);
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to update name:', error);
    } finally {
      setIsSaving(false);
    }
  }, [currentUser, editedName, updateCurrentUser]);

  const handleNameCancel = useCallback(() => {
    setIsEditingName(false);
    setEditedName(currentUser?.name || '');
  }, [currentUser?.name]);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedName(e.target.value);
  }, []);

  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  }, []);

  const isCategoryExpanded = useCallback((category: string) => {
    return expandedCategories.has(category);
  }, [expandedCategories]);

  const getAvailableOptions = useCallback((category: keyof typeof customizationOptions) => {
    return customizationOptions[category].filter(option => option.level <= currentLevel);
  }, [customizationOptions, currentLevel]);

  const getAvatarGradient = useCallback((name: string) => {
    const colors = [
      'from-blue-400 to-blue-600',
      'from-green-400 to-green-600',
      'from-purple-400 to-purple-600',
      'from-pink-400 to-pink-600',
      'from-yellow-400 to-yellow-600',
      'from-red-400 to-red-600'
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }, []);

  if (!currentUser) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <p className="text-center text-gray-500">Loading profile...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🎯 Your Profile & Rewards
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Profile Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Avatar and Name */}
            <div className="flex flex-col items-center space-y-4">
              <div className={`w-32 h-32 rounded-full flex items-center justify-center text-white text-5xl font-bold bg-gradient-to-br ${getAvatarGradient(currentUser.name)} shadow-2xl border-4 border-white`}>
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              
              <div className="text-center">
                {isEditingName ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={editedName}
                      onChange={handleNameChange}
                      className="text-xl font-semibold text-center bg-blue-50 border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter name"
                      maxLength={20}
                    />
                    <Button
                      size="sm"
                      onClick={handleNameSave}
                      disabled={isSaving || !editedName.trim()}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleNameCancel}
                      className="border-gray-300 text-gray-600 hover:bg-gray-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-gray-800">
                      {currentUser.name}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleNameEdit}
                      className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {showSaveSuccess && (
                <div className="text-center">
                  <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-md">
                    <span className="text-sm font-medium">Name updated successfully! 🎉</span>
                  </div>
                </div>
              )}

              <p className="text-gray-500 text-sm">{currentUser.email}</p>
            </div>

            {/* Level and Progress */}
            <div className="flex flex-col items-center space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">Level {currentLevel}</div>
                <div className="text-lg text-gray-600 mb-4">🎯 {currentPoints} Points</div>
                
                {/* Progress Bar */}
                <div className="w-48 bg-gray-200 rounded-full h-3 mb-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((currentPoints % 100) / 100 * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-500">
                  {currentPoints % 100} / 100 to next level
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-col items-center space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 mb-2">🔥 {currentStreak}</div>
                <div className="text-sm text-gray-600">Day Streak</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">🏆</div>
                <div className="text-sm text-gray-600">Achievements</div>
              </div>
            </div>
          </div>

          {/* Household Information */}
          <div className="border-t border-gray-200 pt-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
              🏠 Household Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Household:</span>
                <span className="font-medium text-gray-800">
                  {household?.name || 'No household'}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Member since:</span>
                <span className="font-medium text-gray-800">
                  {household?.createdAt 
                    ? new Date(household.createdAt).toLocaleDateString()
                    : 'Unknown'
                  }
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customization Options */}
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-gray-800">
            🎨 Customization Options
          </CardTitle>
          <p className="text-center text-gray-600">
            Unlock new customization options by leveling up!
          </p>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Avatar Selection */}
            <div className="border rounded-lg">
              <button
                onClick={() => toggleCategory('avatar')}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900">Avatar Selection</span>
                  <span className="text-sm text-gray-500">({getAvailableOptions('avatar').length} options)</span>
                </div>
                <div className={`transform transition-transform ${isCategoryExpanded('avatar') ? 'rotate-180' : ''}`}>
                  ▼
                </div>
              </button>
              
              {isCategoryExpanded('avatar') && (
                <div className="p-4 border-t bg-gray-50">
                  <div className="grid grid-cols-3 gap-2">
                    {customizationOptions.avatar.map((option) => {
                      const isUnlocked = option.level <= currentLevel;
                      return (
                        <button
                          key={option.value}
                          disabled={!isUnlocked}
                          className={`p-3 rounded-lg border-2 text-center transition-all ${
                            isUnlocked
                              ? 'border-blue-500 bg-blue-50 hover:border-blue-600'
                              : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <div className="text-2xl mb-1">{option.icon}</div>
                          <div className="text-xs">{option.label}</div>
                          <div className="text-xs text-gray-500">Level {option.level}</div>
                          {!isUnlocked && <Lock className="w-3 h-3 mx-auto mt-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Selection */}
            <div className="border rounded-lg">
              <button
                onClick={() => toggleCategory('theme')}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Palette className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-gray-900">Theme Selection</span>
                  <span className="text-sm text-gray-500">({getAvailableOptions('theme').length} options)</span>
                </div>
                <div className={`transform transition-transform ${isCategoryExpanded('theme') ? 'rotate-180' : ''}`}>
                  ▼
                </div>
              </button>
              
              {isCategoryExpanded('theme') && (
                <div className="p-4 border-t bg-gray-50">
                  <div className="grid grid-cols-2 gap-2">
                    {customizationOptions.theme.map((option) => {
                      const isUnlocked = option.level <= currentLevel;
                      return (
                        <button
                          key={option.value}
                          disabled={!isUnlocked}
                          className={`p-3 rounded-lg border-2 text-center transition-all ${
                            isUnlocked
                              ? 'border-blue-500 bg-blue-50 hover:border-blue-600'
                              : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <div className="text-sm font-medium">{option.label}</div>
                          <div className="text-xs text-gray-500">Level {option.level}</div>
                          {!isUnlocked && <Lock className="w-3 h-3 mx-auto mt-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Border Selection */}
            <div className="border rounded-lg">
              <button
                onClick={() => toggleCategory('border')}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Target className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-900">Border Style</span>
                  <span className="text-sm text-gray-500">({getAvailableOptions('border').length} options)</span>
                </div>
                <div className={`transform transition-transform ${isCategoryExpanded('border') ? 'rotate-180' : ''}`}>
                  ▼
                </div>
              </button>
              
              {isCategoryExpanded('border') && (
                <div className="p-4 border-t bg-gray-50">
                  <div className="grid grid-cols-2 gap-2">
                    {customizationOptions.border.map((option) => {
                      const isUnlocked = option.level <= currentLevel;
                      return (
                        <button
                          key={option.value}
                          disabled={!isUnlocked}
                          className={`p-3 rounded-lg border-2 text-center transition-all ${
                            isUnlocked
                              ? 'border-blue-500 bg-blue-50 hover:border-blue-600'
                              : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <div className="text-sm font-medium">{option.label}</div>
                          <div className="text-xs text-gray-500">Level {option.level}</div>
                          {!isUnlocked && <Lock className="w-3 h-3 mx-auto mt-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Badge Selection */}
            <div className="border rounded-lg">
              <button
                onClick={() => toggleCategory('badge')}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Award className="w-5 h-5 text-amber-600" />
                  <span className="font-medium text-gray-900">Badge Selection</span>
                  <span className="text-sm text-gray-500">({getAvailableOptions('badge').length} options)</span>
                </div>
                <div className={`transform transition-transform ${isCategoryExpanded('badge') ? 'rotate-180' : ''}`}>
                  ▼
                </div>
              </button>
              
              {isCategoryExpanded('badge') && (
                <div className="p-4 border-t bg-gray-50">
                  <div className="grid grid-cols-2 gap-2">
                    {customizationOptions.badge.map((option) => {
                      const isUnlocked = option.level <= currentLevel;
                      return (
                        <button
                          key={option.value}
                          disabled={!isUnlocked}
                          className={`p-3 rounded-lg border-2 text-center transition-all ${
                            isUnlocked
                              ? 'border-blue-500 bg-blue-50 hover:border-blue-600'
                              : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <div className="text-sm font-medium">{option.label}</div>
                          <div className="text-xs text-gray-500">Level {option.level}</div>
                          {!isUnlocked && <Lock className="w-3 h-3 mx-auto mt-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Level Up Motivation */}
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                🚀 Keep Leveling Up!
              </h3>
              <p className="text-blue-700 text-sm">
                Complete more chores to unlock new customization options and rewards.
              </p>
              <div className="mt-4 flex justify-center space-x-4 text-sm text-blue-600">
                <span>Next unlock at Level {Math.min(currentLevel + 1, 10)}</span>
                <span>•</span>
                <span>{100 - (currentPoints % 100)} points to go</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomizeProfile_DEPRECATED;
