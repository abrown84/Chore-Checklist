import { Chore, DIFFICULTY_POINTS } from '../types/chore'

export const defaultChores: Omit<Chore, 'id' | 'createdAt' | 'completed'>[] = [
  // ===== DAILY CHORES =====
  // Daily Chores - Easy (5 points)
  {
    title: 'Morning Setup Routine',
    description: 'Execute bedroom optimization: straighten linens, arrange pillows, and organize space for peak daily performance',
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
    title: 'Waste Management Protocol',
    description: 'Complete household waste elimination cycle: collect, process, and dispatch to designated collection point',
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
    title: 'Kitchen Surface Optimization',
    description: 'Maintain food prep zone efficiency: sanitize work surfaces and optimize counter space for productivity',
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
    title: 'Dishware Cycle Management',
    description: 'Execute kitchen automation cycle: process clean inventory and queue next cleaning batch',
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
    title: 'Bathroom Efficiency Check',
    description: 'Optimize personal care station: refresh surfaces, organize essentials, and maintain functional layout',
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
    title: 'Pet Care Protocol',
    description: 'Execute daily pet wellness routine: provide nutrition and hydration for optimal household harmony',
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
    title: '5-Minute Reset Sprint',
    description: 'Execute rapid declutter protocol: restore common areas to baseline organization standards',
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
    title: 'Kitchen Command Center Reset',
    description: 'Complete kitchen ecosystem restoration: process dishware, optimize surfaces, and organize workflow zones',
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
    title: 'Floor Maintenance Protocol',
    description: 'Execute surface restoration for high-traffic zones: sweep debris and optimize floor condition',
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
    title: 'Living Space Optimization',
    description: 'Restore social zone to peak functionality: organize items, refresh seating, and align furniture for maximum comfort',
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
    title: 'Plant Wellness Check',
    description: 'Execute indoor ecosystem maintenance: assess hydration needs and optimize plant health for enhanced air quality',
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
    title: 'Sleep Environment Upgrade',
    description: 'Complete bedding refresh cycle: deploy fresh linens for optimal rest and recovery performance',
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
    title: 'Complete Waste Audit',
    description: 'Execute full-scale waste elimination: collect from all zones and complete disposal protocol',
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
    title: 'Visual Clarity Enhancement',
    description: 'Optimize light transmission and reflection: restore mirrors and windows to crystal-clear performance standards',
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
    title: 'Information Management Sprint',
    description: 'Process incoming data streams: sort correspondence, archive critical documents, and eliminate clutter',
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
    title: 'Textile Care Cycle',
    description: 'Execute complete garment processing: sort, clean, dry, and organize wardrobe inventory for optimal accessibility',
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
    title: 'Deep Surface Restoration',
    description: 'Execute comprehensive carpet maintenance: extract debris, optimize furniture placement, and refresh hidden zones',
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
    title: 'Bathroom System Overhaul',
    description: 'Complete sanitation protocol: restore tile integrity, optimize fixture performance, and organize care products',
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
    title: 'Outdoor Ecosystem Management',
    description: 'Execute landscape optimization: eliminate invasive growth, trim for health, and maintain irrigation systems',
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
    title: 'Weekly Nutrition Strategy',
    description: 'Execute meal optimization protocol: plan nutrition goals, acquire resources, and prep ingredients for peak efficiency',
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
    title: 'Food Storage Audit',
    description: 'Optimize cold storage efficiency: eliminate expired inventory, sanitize compartments, and organize for accessibility',
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
    title: 'Kitchen System Optimization',
    description: 'Execute comprehensive culinary zone upgrade: restore appliance performance, optimize storage, and deep-clean all surfaces',
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
    title: 'Strategic Declutter Mission',
    description: 'Execute comprehensive space optimization: audit possessions, redistribute unused items, and maximize functional storage',
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
    title: 'Illumination System Maintenance',
    description: 'Optimize lighting performance: clear debris from fixtures, refresh bulbs, and restore maximum brightness output',
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
    title: 'Comfort Textile Refresh',
    description: 'Execute decorative textile maintenance: restore softness and cleanliness of comfort accessories',
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
    title: 'Airflow Optimization Protocol',
    description: 'Enhance HVAC efficiency: clear obstructions from ventilation systems for optimal air circulation',
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
    title: 'Cooking System Deep Clean',
    description: 'Restore culinary equipment to peak performance: eliminate buildup from cooking surfaces and ventilation',
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
    title: 'Complete Window System Overhaul',
    description: 'Maximize natural light transmission: restore all window components to crystal clarity inside and out',
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
    title: 'Carpet Restoration Protocol',
    description: 'Execute comprehensive floor covering maintenance: eliminate embedded debris and restore surface integrity',
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
    title: 'Food Inventory Optimization',
    description: 'Execute pantry efficiency audit: organize provisions, validate freshness, and maximize storage accessibility',
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
    title: 'Wardrobe Management System',
    description: 'Execute seasonal clothing optimization: categorize by usage, redistribute excess inventory, and organize for accessibility',
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
    title: 'Comprehensive Home Reset',
    description: 'Execute full-scale household optimization: deep clean all zones, eliminate clutter, and restore organization standards',
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
    title: 'Storage Facility Optimization',
    description: 'Execute workshop/storage zone overhaul: organize equipment, restore floor condition, and maximize storage efficiency',
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
    title: 'Seasonal Aesthetic Update',
    description: 'Execute environmental refresh protocol: transition decorative elements to match current season and optimize ambiance',
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
    title: 'Clothing Inventory Transition',
    description: 'Execute seasonal wardrobe optimization: archive off-season items and deploy current climate-appropriate clothing',
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
    title: 'Landscape Seasonal Strategy',
    description: 'Execute outdoor ecosystem transition: deploy seasonal plantings and optimize irrigation for changing climate conditions',
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
    title: 'Climate Control System Service',
    description: 'Execute HVAC performance optimization: install fresh filtration and conduct seasonal system diagnostic',
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
    title: 'Comprehensive System Refresh',
    description: 'Execute full-scale seasonal maintenance: deep clean neglected zones and restore all systems to peak performance',
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
