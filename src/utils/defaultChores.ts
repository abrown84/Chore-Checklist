import { Chore, DIFFICULTY_POINTS } from '../types/chore'

export const defaultChores: Omit<Chore, 'id' | 'createdAt' | 'completed'>[] = [
  // ===== DAILY CHORES =====
  // Daily Chores - Easy (5 points)
  {
    title: 'Make the bed',
    description: 'Straighten sheets, fluff pillows, and arrange blankets neatly',
    difficulty: 'easy',
    points: DIFFICULTY_POINTS.easy,
    category: 'daily',
    priority: 'medium',
    dueDate: (() => {
      const date = new Date()
      date.setHours(18, 0, 0, 0) // 6:00 PM
      return date
    })(),
    // Removed approval fields - no longer needed
  },
  {
    title: 'Take out trash',
    description: 'Empty all trash bins and take to the curb',
    difficulty: 'easy',
    points: DIFFICULTY_POINTS.easy,
    category: 'daily',
    priority: 'high',
    dueDate: (() => {
      const date = new Date()
      date.setHours(18, 0, 0, 0) // 6:00 PM
      return date
    })(),
    // Removed approval fields - no longer needed
  },
  {
    title: 'Wipe kitchen counters',
    description: 'Clean and sanitize kitchen countertops and surfaces',
    difficulty: 'easy',
    points: DIFFICULTY_POINTS.easy,
    category: 'daily',
    priority: 'high',
    dueDate: (() => {
      const date = new Date()
      date.setHours(18, 0, 0, 0) // 6:00 PM
      return date
    })(),
    // Removed approval fields - no longer needed
  },
  {
    title: 'Load/unload dishwasher',
    description: 'Empty clean dishes and load dirty ones',
    difficulty: 'easy',
    points: DIFFICULTY_POINTS.easy,
    category: 'daily',
    priority: 'medium',
    dueDate: (() => {
      const date = new Date()
      date.setHours(18, 0, 0, 0) // 6:00 PM
      return date
    })(),
    // Removed approval fields - no longer needed
  },
  {
    title: 'Quick bathroom tidy',
    description: 'Wipe down sink, mirror, and organize toiletries',
    difficulty: 'easy',
    points: DIFFICULTY_POINTS.easy,
    category: 'daily',
    priority: 'medium',
    dueDate: (() => {
      const date = new Date()
      date.setHours(18, 0, 0, 0) // 6:00 PM
      return date
    })(),
    // Removed approval fields - no longer needed
  },
  {
    title: 'Feed pets',
    description: 'Give fresh food and water to household pets',
    difficulty: 'easy',
    points: DIFFICULTY_POINTS.easy,
    category: 'daily',
    priority: 'high',
    dueDate: (() => {
      const date = new Date()
      date.setHours(18, 0, 0, 0) // 6:00 PM
      return date
    })(),
    // Removed approval fields - no longer needed
  },
  {
    title: 'Pick up clutter',
    description: 'Quick 5-minute tidy of common areas',
    difficulty: 'easy',
    points: DIFFICULTY_POINTS.easy,
    category: 'daily',
    priority: 'low',
    dueDate: (() => {
      const date = new Date()
      date.setHours(18, 0, 0, 0) // 6:00 PM
      return date
    })(),
    // Removed approval fields - no longer needed
  },

  // Daily Chores - Medium (10 points)
  {
    title: 'Clean the kitchen',
    description: 'Wash dishes, wipe counters, and organize the sink area',
    difficulty: 'medium',
    points: DIFFICULTY_POINTS.medium,
    category: 'daily',
    priority: 'high',
    dueDate: (() => {
      const date = new Date()
      date.setHours(18, 0, 0, 0) // 6:00 PM
      return date
    })(),
    // Removed approval fields - no longer needed
  },
  {
    title: 'Sweep/mop floors',
    description: 'Clean high-traffic areas and kitchen floors',
    difficulty: 'medium',
    points: DIFFICULTY_POINTS.medium,
    category: 'daily',
    priority: 'medium',
    dueDate: (() => {
      const date = new Date()
      date.setHours(18, 0, 0, 0) // 6:00 PM
      return date
    })(),
    // Removed approval fields - no longer needed
  },
  {
    title: 'Organize living room',
    description: 'Pick up items, fluff cushions, and straighten furniture',
    difficulty: 'medium',
    points: DIFFICULTY_POINTS.medium,
    category: 'daily',
    priority: 'low',
    dueDate: (() => {
      const date = new Date()
      date.setHours(18, 0, 0, 0) // 6:00 PM
      return date
    })(),
    // Removed approval fields - no longer needed
  },
  {
    title: 'Water indoor plants',
    description: 'Check soil moisture and water plants as needed',
    difficulty: 'medium',
    points: DIFFICULTY_POINTS.medium,
    category: 'daily',
    priority: 'low',
    dueDate: (() => {
      const date = new Date()
      date.setHours(18, 0, 0, 0) // 6:00 PM
      return date
    })(),
    // Removed approval fields - no longer needed
  },

  // ===== WEEKLY CHORES =====
  // Weekly Chores - Easy (5 points)
  {
    title: 'Change bed sheets',
    description: 'Remove old sheets and put on fresh ones',
    difficulty: 'easy',
    points: DIFFICULTY_POINTS.easy,
    category: 'weekly',
    priority: 'medium',
    dueDate: (() => {
      const date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      date.setHours(18, 0, 0, 0) // 6:00 PM
      return date
    })(),
    // Removed approval fields - no longer needed
  },
  {
    title: 'Empty all trash bins',
    description: 'Collect trash from all rooms and take to curb',
    difficulty: 'easy',
    points: DIFFICULTY_POINTS.easy,
    category: 'weekly',
    priority: 'high',
    dueDate: (() => {
      const date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      date.setHours(18, 0, 0, 0) // 6:00 PM
      return date
    })(),
    // Removed approval fields - no longer needed
  },
  {
    title: 'Clean mirrors and windows',
    description: 'Wipe down all mirrors and clean window surfaces',
    difficulty: 'easy',
    points: DIFFICULTY_POINTS.easy,
    category: 'weekly',
    priority: 'low',
    dueDate: (() => {
      const date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      date.setHours(18, 0, 0, 0) // 6:00 PM
      return date
    })(),
    // Removed approval fields - no longer needed
  },
  {
    title: 'Organize mail and papers',
    description: 'Sort through mail, file important documents, and recycle junk',
    difficulty: 'easy',
    points: DIFFICULTY_POINTS.easy,
    category: 'weekly',
    priority: 'medium',
    dueDate: (() => {
      const date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      date.setHours(18, 0, 0, 0) // 6:00 PM
      return date
    })(),
    // Removed approval fields - no longer needed
  },

  // Weekly Chores - Medium (10 points)
  {
    title: 'Do laundry',
    description: 'Sort clothes, wash, dry, and fold everything',
    difficulty: 'medium',
    points: DIFFICULTY_POINTS.medium,
    category: 'weekly',
    priority: 'high',
    dueDate: (() => {
      const date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      date.setHours(18, 0, 0, 0) // 6:00 PM
      return date
    })(),
    // Removed approval fields - no longer needed
  },
  {
    title: 'Vacuum living room',
    description: 'Vacuum carpets, move furniture, and clean under cushions',
    difficulty: 'medium',
    points: DIFFICULTY_POINTS.medium,
    category: 'weekly',
    priority: 'medium',
    dueDate: (() => {
      const date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      date.setHours(18, 0, 0, 0) // 6:00 PM
      return date
    })(),
    // Removed approval fields - no longer needed
  },
  {
    title: 'Deep clean bathroom',
    description: 'Scrub tiles, clean grout, polish fixtures, and organize toiletries',
    difficulty: 'medium',
    points: DIFFICULTY_POINTS.medium,
    category: 'weekly',
    priority: 'medium',
    dueDate: (() => {
      const date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      date.setHours(18, 0, 0, 0) // 6:00 PM
      return date
    })(),
    // Removed approval fields - no longer needed
  },
  {
    title: 'Garden maintenance',
    description: 'Weed, prune, water plants, and maintain outdoor spaces',
    difficulty: 'medium',
    points: DIFFICULTY_POINTS.medium,
    category: 'weekly',
    priority: 'low',
    dueDate: (() => {
      const date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      date.setHours(18, 0, 0, 0) // 6:00 PM
      return date
    })(),
    // Removed approval fields - no longer needed
  },
  {
    title: 'Meal prep for the week',
    description: 'Plan meals, grocery shop, and prepare ingredients for the week ahead',
    difficulty: 'medium',
    points: DIFFICULTY_POINTS.medium,
    category: 'weekly',
    priority: 'high',
    dueDate: (() => {
      const date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      date.setHours(18, 0, 0, 0) // 6:00 PM
      return date
    })(),
    // Removed approval fields - no longer needed
  },
  {
    title: 'Clean refrigerator',
    description: 'Remove expired items, clean shelves, and organize contents',
    difficulty: 'medium',
    points: DIFFICULTY_POINTS.medium,
    category: 'weekly',
    priority: 'medium',
    dueDate: (() => {
      const date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      date.setHours(18, 0, 0, 0) // 6:00 PM
      return date
    })(),
    // Removed approval fields - no longer needed
  },

  // Weekly Chores - Hard (15 points)
  {
    title: 'Deep clean kitchen',
    description: 'Clean inside appliances, organize cabinets, and deep clean surfaces',
    difficulty: 'hard',
    points: DIFFICULTY_POINTS.hard,
    category: 'weekly',
    priority: 'medium',
    dueDate: (() => {
      const date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      date.setHours(18, 0, 0, 0) // 6:00 PM
      return date
    })(),
    // Removed approval fields - no longer needed
  },
  {
    title: 'Organize and declutter',
    description: 'Go through items, donate unused things, and organize spaces',
    difficulty: 'hard',
    points: DIFFICULTY_POINTS.hard,
    category: 'weekly',
    priority: 'low',
    dueDate: (() => {
      const date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      date.setHours(18, 0, 0, 0) // 6:00 PM
      return date
    })(),
    // Removed approval fields - no longer needed
  },

  // ===== MONTHLY CHORES =====
  // Monthly Chores - Easy (5 points)
  {
    title: 'Clean light fixtures',
    description: 'Dust and clean light bulbs, lampshades, and fixtures',
    difficulty: 'easy',
    points: DIFFICULTY_POINTS.easy,
    category: 'monthly',
    priority: 'low',
    dueDate: (() => {
      const date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      date.setHours(18, 0, 0, 0) // 6:00 PM
      return date
    })(),
    // Removed approval fields - no longer needed
  },
  {
    title: 'Wash throw blankets',
    description: 'Clean decorative blankets and throws',
    difficulty: 'easy',
    points: DIFFICULTY_POINTS.easy,
    category: 'monthly',
    priority: 'low',
    dueDate: (() => {
      const date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      date.setHours(18, 0, 0, 0) // 6:00 PM
      return date
    })(),
    // Removed approval fields - no longer needed
  },
  {
    title: 'Clean air vents',
    description: 'Remove dust and debris from air conditioning and heating vents',
    difficulty: 'easy',
    points: DIFFICULTY_POINTS.easy,
    category: 'monthly',
    priority: 'low',
    dueDate: (() => {
      const date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      date.setHours(18, 0, 0, 0) // 6:00 PM
      return date
    })(),
    // Removed approval fields - no longer needed
  },

  // Monthly Chores - Medium (10 points)
  {
    title: 'Clean oven and stove',
    description: 'Deep clean oven interior, stovetop, and range hood',
    difficulty: 'medium',
    points: DIFFICULTY_POINTS.medium,
    category: 'monthly',
    priority: 'medium',
    dueDate: (() => {
      const date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      date.setHours(18, 0, 0, 0) // 6:00 PM
      return date
    })(),
    // Removed approval fields - no longer needed
  },
  {
    title: 'Wash windows thoroughly',
    description: 'Clean window frames, sills, and glass inside and out',
    difficulty: 'medium',
    points: DIFFICULTY_POINTS.medium,
    category: 'monthly',
    priority: 'low',
    dueDate: (() => {
      const date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      date.setHours(18, 0, 0, 0) // 6:00 PM
      return date
    })(),
    // Removed approval fields - no longer needed
  },
  {
    title: 'Deep clean carpets',
    description: 'Vacuum thoroughly and spot clean any stains',
    difficulty: 'medium',
    points: DIFFICULTY_POINTS.medium,
    category: 'monthly',
    priority: 'low',
    dueDate: (() => {
      const date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      date.setHours(18, 0, 0, 0) // 6:00 PM
      return date
    })(),
    // Removed approval fields - no longer needed
  },
  {
    title: 'Organize pantry',
    description: 'Sort through food items, check expiration dates, and reorganize shelves',
    difficulty: 'medium',
    points: DIFFICULTY_POINTS.medium,
    category: 'monthly',
    priority: 'medium',
    dueDate: (() => {
      const date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      date.setHours(18, 0, 0, 0) // 6:00 PM
      return date
    })(),
    // Removed approval fields - no longer needed
  },

  // Monthly Chores - Hard (15 points)
  {
    title: 'Organize closet',
    description: 'Sort clothes by season, donate unused items, and arrange neatly',
    difficulty: 'hard',
    points: DIFFICULTY_POINTS.hard,
    category: 'monthly',
    priority: 'low',
    dueDate: (() => {
      const date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      date.setHours(18, 0, 0, 0) // 6:00 PM
      return date
    })(),
    // Removed approval fields - no longer needed
  },
  {
    title: 'Spring cleaning',
    description: 'Deep clean entire house, declutter, and organize all rooms',
    difficulty: 'hard',
    points: DIFFICULTY_POINTS.hard,
    category: 'monthly',
    priority: 'low',
    dueDate: (() => {
      const date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      date.setHours(18, 0, 0, 0) // 6:00 PM
      return date
    })(),
    // Removed approval fields - no longer needed
  },
  {
    title: 'Clean garage/shed',
    description: 'Organize tools, clean floors, and declutter storage areas',
    difficulty: 'hard',
    points: DIFFICULTY_POINTS.hard,
    category: 'monthly',
    priority: 'low',
    dueDate: (() => {
      const date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      date.setHours(18, 0, 0, 0) // 6:00 PM
      return date
    })(),
    // Removed approval fields - no longer needed
  },

  // ===== SEASONAL CHORES =====
  // Seasonal Chores - Easy (5 points)
  {
    title: 'Change seasonal decorations',
    description: 'Update home decor for the current season or upcoming holiday',
    difficulty: 'easy',
    points: DIFFICULTY_POINTS.easy,
    category: 'seasonal',
    priority: 'low',
    dueDate: (() => {
      const date = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      date.setHours(18, 0, 0, 0) // 6:00 PM
      return date
    })(),
    // Removed approval fields - no longer needed
  },
  {
    title: 'Seasonal wardrobe rotation',
    description: 'Pack away out-of-season clothes and bring out current season items',
    difficulty: 'easy',
    points: DIFFICULTY_POINTS.easy,
    category: 'seasonal',
    priority: 'low',
    dueDate: (() => {
      const date = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      date.setHours(18, 0, 0, 0) // 6:00 PM
      return date
    })(),
    // Removed approval fields - no longer needed
  },

  // Seasonal Chores - Medium (10 points)
  {
    title: 'Garden seasonal prep',
    description: 'Prepare garden for new season - plant seasonal flowers, adjust irrigation',
    difficulty: 'medium',
    points: DIFFICULTY_POINTS.medium,
    category: 'seasonal',
    priority: 'medium',
    dueDate: (() => {
      const date = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      date.setHours(18, 0, 0, 0) // 6:00 PM
      return date
    })(),
    // Removed approval fields - no longer needed
  },
  {
    title: 'HVAC filter replacement',
    description: 'Replace air filters and check HVAC system for seasonal maintenance',
    difficulty: 'medium',
    points: DIFFICULTY_POINTS.medium,
    category: 'seasonal',
    priority: 'high',
    dueDate: (() => {
      const date = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      date.setHours(18, 0, 0, 0) // 6:00 PM
      return date
    })(),
    // Removed approval fields - no longer needed
  },

  // Seasonal Chores - Hard (15 points)
  {
    title: 'Deep seasonal cleaning',
    description: 'Comprehensive cleaning including areas not cleaned regularly',
    difficulty: 'hard',
    points: DIFFICULTY_POINTS.hard,
    category: 'seasonal',
    priority: 'low',
    dueDate: (() => {
      const date = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      date.setHours(18, 0, 0, 0) // 6:00 PM
      return date
    })(),
    // Removed approval fields - no longer needed
  }
]

export function addDefaultChores(addChore: (chore: Omit<Chore, 'id' | 'createdAt' | 'completed'>) => void) {
  defaultChores.forEach(chore => {
    addChore(chore)
  })
}

export function getDefaultChoresByCategory() {
  const categories = {
    daily: defaultChores.filter(chore => chore.category === 'daily'),
    weekly: defaultChores.filter(chore => chore.category === 'weekly'),
    monthly: defaultChores.filter(chore => chore.category === 'monthly'),
    seasonal: defaultChores.filter(chore => chore.category === 'seasonal')
  }
  
  return categories
}

export function getDefaultChoresByDifficulty() {
  const difficulties = {
    easy: defaultChores.filter(chore => chore.difficulty === 'easy'),
    medium: defaultChores.filter(chore => chore.difficulty === 'medium'),
    hard: defaultChores.filter(chore => chore.difficulty === 'hard')
  }
  
  return difficulties
}

export function getDefaultChoresByPriority() {
  const priorities = {
    high: defaultChores.filter(chore => chore.priority === 'high'),
    medium: defaultChores.filter(chore => chore.priority === 'medium'),
    low: defaultChores.filter(chore => chore.priority === 'low')
  }
  
  return priorities
}

export function resetChoresToDefaults() {
  // Clear localStorage
  localStorage.removeItem('chores')
  
  // Return fresh default chores with new dates set to 6:00 PM
  return defaultChores.map(chore => {
    const now = new Date()
    let dueDate = new Date()
    
    // Set appropriate due dates based on category, all at 6:00 PM
    switch (chore.category) {
      case 'daily':
        // Set to 6:00 PM today
        dueDate = new Date(now)
        dueDate.setHours(18, 0, 0, 0) // 6:00 PM
        break
      case 'weekly':
        // Set to 6:00 PM next week
        dueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        dueDate.setHours(18, 0, 0, 0) // 6:00 PM
        break
      case 'monthly':
        // Set to 6:00 PM next month
        dueDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        dueDate.setHours(18, 0, 0, 0) // 6:00 PM
        break
      case 'seasonal':
        // Set to 6:00 PM in 3 months
        dueDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
        dueDate.setHours(18, 0, 0, 0) // 6:00 PM
        break
      default:
        dueDate = new Date(now)
        dueDate.setHours(18, 0, 0, 0) // 6:00 PM
    }
    
    return {
      ...chore,
      dueDate
    }
  })
}
