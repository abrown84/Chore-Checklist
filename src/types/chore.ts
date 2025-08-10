export interface Chore {
  id: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  points: number
  category: 'daily' | 'weekly' | 'monthly' | 'seasonal'
  priority: 'low' | 'medium' | 'high'
  completed: boolean
  completedAt?: Date
  completedBy?: string
  createdAt: Date
  dueDate?: Date
  assignedTo?: string
  finalPoints?: number
  bonusMessage?: string
}

export interface ChoreStats {
  totalChores: number
  completedChores: number
  totalPoints: number
  earnedPoints: number
  currentStreak: number
  longestStreak: number
  // Leveling system
  currentLevel: number
  currentLevelPoints: number
  pointsToNextLevel: number
  totalLevels: number
}

export interface Level {
  level: number
  name: string
  pointsRequired: number
  color: string
  icon: string
  rewards: string[]
}

export const DIFFICULTY_POINTS = {
  easy: 5,
  medium: 10,
  hard: 15
} as const

export const PRIORITY_COLORS = {
  low: 'text-green-600 bg-green-50',
  medium: 'text-yellow-600 bg-yellow-50',
  high: 'text-red-600 bg-red-50'
} as const

export const DIFFICULTY_COLORS = {
  easy: 'text-green-600 bg-green-50',
  medium: 'text-blue-600 bg-blue-50',
  hard: 'text-purple-600 bg-purple-50'
} as const

// Leveling system configuration
export const LEVELS: Level[] = [
  { level: 1, name: "Down Bad", pointsRequired: 0, color: "text-gray-600", icon: "🌱", rewards: ["Basic access", "Starting your journey"] },
  { level: 2, name: "Mid", pointsRequired: 25, color: "text-green-600", icon: "📚", rewards: ["Profile avatar selection", "Basic color themes", "Simple borders"] },
  { level: 3, name: "Valid'", pointsRequired: 75, color: "text-blue-600", icon: "🛠️", rewards: ["Custom profile borders", "Priority sorting", "Streak tracking", "Custom avatar upload"] },
  { level: 4, name: "Locked In", pointsRequired: 150, color: "text-purple-600", icon: "⭐", rewards: ["Profile badges", "Advanced analytics", "Custom backgrounds", "Gradient themes", "Animated borders"] },
  { level: 5, name: "Main Character", pointsRequired: 300, color: "text-yellow-600", icon: "🏆", rewards: ["Animated avatars", "Custom themes", "Profile animations", "Glow effects", "Particle backgrounds"] },
  { level: 6, name: "Living My Best Life", pointsRequired: 500, color: "text-red-600", icon: "👑", rewards: ["Exclusive avatars", "Premium themes", "Custom fonts", "3D effects", "Sound effects"] },
  { level: 7, name: "Iconic", pointsRequired: 1000, color: "text-indigo-600", icon: "🌟", rewards: ["Legendary avatars", "Hall of fame", "Profile effects", "Holographic themes", "Interactive elements"] },
  { level: 8, name: "That Person", pointsRequired: 2000, color: "text-pink-600", icon: "💎", rewards: ["Diamond avatars", "VIP themes", "Custom animations", "Neon effects", "Premium badges"] },
  { level: 9, name: "Goated", pointsRequired: 3500, color: "text-emerald-600", icon: "✨", rewards: ["God mode avatars", "All themes", "Legendary effects", "Rainbow themes", "Exclusive animations"] },
  { level: 10, name: "Literally Everything", pointsRequired: 5000, color: "text-amber-600", icon: "👑", rewards: ["Ultimate flex", "Unlimited customization", "Legendary status", "All effects", "Master themes"] }
]

export const MAX_LEVEL = LEVELS.length
