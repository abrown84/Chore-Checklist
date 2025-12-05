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
  proofPhotoId?: string // Storage ID for photo proof
  proofPhotoUrl?: string // URL for displaying photo (derived from storage ID)
  // Removed approval system fields - no longer needed for chores
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
  meme?: string // URL or path to meme image for this level
}

export const DIFFICULTY_POINTS = {
  easy: 5,
  medium: 10,
  hard: 15
} as const

export const PRIORITY_COLORS = {
  low: 'text-success bg-success/10 dark:text-success dark:bg-success/10',
  medium: 'text-warning bg-warning/10 dark:text-warning dark:bg-warning/10',
  high: 'text-destructive bg-destructive/10 dark:text-destructive dark:bg-destructive/10'
} as const

export const DIFFICULTY_COLORS = {
  easy: 'text-success bg-success/10 dark:text-success dark:bg-success/10',
  medium: 'text-primary bg-primary/10 dark:text-primary dark:bg-primary/10',
  hard: 'text-chart-4 bg-chart-4/10 dark:text-chart-4 dark:bg-chart-4/10'
} as const

export const CATEGORY_COLORS = {
  // Keep card base background via component; only apply subtle border + faint overlay
  daily: 'border-success/25 dark:border-success/30 bg-gradient-to-br from-success/5 to-transparent',
  weekly: 'border-primary/25 dark:border-primary/30 bg-gradient-to-br from-primary/5 to-transparent',
  monthly: 'border-chart-4/25 dark:border-chart-4/30 bg-gradient-to-br from-chart-4/5 to-transparent',
  seasonal: 'border-warning/25 dark:border-warning/30 bg-gradient-to-br from-warning/5 to-transparent'
} as const

// Leveling system configuration
export const LEVELS: Level[] = [
  { level: 1, name: "Down Bad", pointsRequired: 0, color: "text-muted-foreground", icon: "🌱", rewards: ["Basic access", "Starting your journey"], meme: "/memes/level1-down-bad.gif" },
  { level: 2, name: "Mid", pointsRequired: 25, color: "text-success", icon: "📚", rewards: ["Profile avatar selection", "Basic color themes", "Simple borders"], meme: "/memes/level2-mid.gif" },
  { level: 3, name: "Valid'", pointsRequired: 75, color: "text-primary", icon: "✨", rewards: ["Custom profile borders", "Priority sorting", "Streak tracking", "Custom avatar upload"], meme: "/memes/level3-valid.gif" },
  { level: 4, name: "Locked In", pointsRequired: 150, color: "text-chart-4", icon: "⭐", rewards: ["Profile badges", "Advanced analytics", "Custom backgrounds", "Gradient themes", "Animated borders"], meme: "/memes/level4-locked-in.gif" },
  { level: 5, name: "Main Character", pointsRequired: 300, color: "text-warning", icon: "🏆", rewards: ["Animated avatars", "Custom themes", "Profile animations", "Glow effects", "Particle backgrounds"], meme: "/memes/level5-main-character.gif" },
  { level: 6, name: "Living My Best Life", pointsRequired: 500, color: "text-destructive", icon: "👑", rewards: ["Exclusive avatars", "Premium themes", "Custom fonts", "3D effects", "Sound effects"], meme: "/memes/level6-living-my-best-life.gif" },
  { level: 7, name: "Iconic", pointsRequired: 1000, color: "text-chart-2", icon: "🌟", rewards: ["Legendary avatars", "Hall of fame", "Profile effects", "Holographic themes", "Interactive elements"], meme: "/memes/level7-iconic.gif" },
  { level: 8, name: "That Person", pointsRequired: 2000, color: "text-chart-5", icon: "💎", rewards: ["Diamond avatars", "VIP themes", "Custom animations", "Neon effects", "Premium badges"], meme: "/memes/level8-that-person.gif" },
  { level: 9, name: "Goated", pointsRequired: 3500, color: "text-success", icon: "✨", rewards: ["God mode avatars", "All themes", "Legendary effects", "Rainbow themes", "Exclusive animations"], meme: "/memes/level9-goated.gif" },
  { level: 10, name: "Literally Everything", pointsRequired: 5000, color: "text-warning", icon: "👑", rewards: ["Ultimate flex", "Unlimited customization", "Legendary status", "All effects", "Master themes"], meme: "/memes/level10-literally-everything.gif" }
]

export const MAX_LEVEL = LEVELS.length
