// Application-wide constants and configuration
export const APP_CONFIG = {
  // Animation delays
  ANIMATION_DELAYS: {
    FADE_IN: 0.2,
    SCALE_IN: 0.1,
    STAGGERED: 0.1,
    FLOAT: 0.5,
    SPARKLE: 1.0,
  },
  
  // Display limits
  DISPLAY_LIMITS: {
    LEADERBOARD_TOP: 5,
    RECENT_ACTIVITY: 5,
    LEVEL_OVERVIEW: 3,
    ACHIEVEMENTS_PREVIEW: 4,
  },
  
  // Performance thresholds
  PERFORMANCE: {
    DEBOUNCE_DELAY: 300,
    THROTTLE_DELAY: 100,
  },
  
  // UI constants
  UI: {
    PROGRESS_BAR_HEIGHT: 'h-3',
    CARD_PADDING: 'p-6',
    BORDER_RADIUS: 'rounded-xl',
  },
} as const

// Leaderboard ranking modes
export const RANKING_MODES = {
  POINTS: 'points',
  EFFICIENCY: 'efficiency',
  LIFETIME: 'lifetime',
} as const

export type RankingMode = typeof RANKING_MODES[keyof typeof RANKING_MODES]

// Efficiency score thresholds
export const EFFICIENCY_THRESHOLDS = {
  MASTER: 85,
  HIGHLY_EFFICIENT: 70,
  EFFICIENT: 55,
  GETTING_THERE: 40,
} as const

// Rank colors and icons - now using theme tokens
export const RANK_CONFIG = {
  COLORS: {
    0: 'bg-warning/10 text-warning border-warning/30',
    1: 'bg-muted text-foreground border-border',
    2: 'bg-chart-3/10 text-chart-3 border-chart-3/30',
    DEFAULT: 'bg-info/10 text-info border-info/30',
  },
  ICONS: {
    0: '🥇',
    1: '🥈',
    2: '🥉',
  },
} as const

// Animation classes
export const ANIMATION_CLASSES = {
  FADE_IN: 'animate-fade-in',
  SLIDE_IN: 'animate-slide-in',
  SCALE_IN: 'animate-scale-in',
  FLOAT: 'animate-float',
  SPARKLE: 'animate-sparkle',
  PULSE: 'animate-pulse',
} as const
