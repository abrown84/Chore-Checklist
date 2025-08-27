export interface NavigationItem {
  id: string
  label: string
  icon: string
  color: string
}

export const navigationItems: NavigationItem[] = [
  { id: 'chores', label: 'Chores', icon: '📋', color: 'text-primary' },
  { id: 'leaderboard', label: 'Leaderboard', icon: '🏆', color: 'text-warning' },
  { id: 'household', label: 'Household', icon: '👥', color: 'text-success' },
  { id: 'profile', label: 'Profile & Rewards', icon: '🎨', color: 'text-chart-4' },
  { id: 'redemption', label: 'Redemption', icon: '💰', color: 'text-success' }
]



