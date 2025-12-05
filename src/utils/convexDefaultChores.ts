// Client-side version of Convex DEFAULT_CHORES
// This matches exactly what users see when signed in
// Keep this in sync with convex/chores.ts DEFAULT_CHORES

import { Chore, DIFFICULTY_POINTS } from '../types/chore'

// Helper to calculate due date based on category (matches Convex logic)
function getDueDateForCategory(category: "daily" | "weekly" | "monthly" | "seasonal"): Date {
  const now = new Date()
  let dueDate = new Date()

  switch (category) {
    case "daily":
      dueDate.setDate(now.getDate() + 1)
      dueDate.setHours(18, 0, 0, 0) // 6:00 PM
      break
    case "weekly":
      // Next Sunday at 6 PM
      const daysUntilSunday = (7 - now.getDay()) % 7 || 7
      dueDate.setDate(now.getDate() + daysUntilSunday)
      dueDate.setHours(18, 0, 0, 0)
      break
    case "monthly":
      // First day of next month at 6 PM
      dueDate.setMonth(now.getMonth() + 1, 1)
      dueDate.setHours(18, 0, 0, 0)
      break
    case "seasonal":
      // Next season start (approximate)
      const month = now.getMonth()
      if (month < 3) {
        // Spring (March)
        dueDate.setMonth(2, 21)
      } else if (month < 6) {
        // Summer (June)
        dueDate.setMonth(5, 21)
      } else if (month < 9) {
        // Fall (September)
        dueDate.setMonth(8, 23)
      } else {
        // Winter (December)
        dueDate.setMonth(11, 21)
        if (now.getMonth() === 11) {
          dueDate.setFullYear(now.getFullYear() + 1)
        }
      }
      dueDate.setHours(18, 0, 0, 0)
      break
  }

  return dueDate
}

// Default chores that match convex/chores.ts DEFAULT_CHORES exactly
export const convexDefaultChores: Omit<Chore, 'id' | 'createdAt' | 'completed'>[] = [
  // ===== DAILY CHORES =====
  {
    title: "Make Your Bed",
    description: "Straighten sheets, arrange pillows, and tidy your bedroom",
    difficulty: "easy",
    points: DIFFICULTY_POINTS.easy,
    category: "daily",
    priority: "medium",
    dueDate: getDueDateForCategory("daily"),
  },
  {
    title: "Take Out Trash",
    description: "Collect and take out all household trash",
    difficulty: "easy",
    points: DIFFICULTY_POINTS.easy,
    category: "daily",
    priority: "high",
    dueDate: getDueDateForCategory("daily"),
  },
  {
    title: "Wipe Kitchen Counters",
    description: "Clean and sanitize kitchen countertops",
    difficulty: "easy",
    points: DIFFICULTY_POINTS.easy,
    category: "daily",
    priority: "high",
    dueDate: getDueDateForCategory("daily"),
  },
  {
    title: "Do the Dishes",
    description: "Wash, dry, and put away dishes",
    difficulty: "easy",
    points: DIFFICULTY_POINTS.easy,
    category: "daily",
    priority: "medium",
    dueDate: getDueDateForCategory("daily"),
  },
  {
    title: "Clean Bathroom Sink",
    description: "Wipe down bathroom sink and mirror",
    difficulty: "easy",
    points: DIFFICULTY_POINTS.easy,
    category: "daily",
    priority: "medium",
    dueDate: getDueDateForCategory("daily"),
  },
  {
    title: "Feed Pets",
    description: "Feed and give water to pets",
    difficulty: "easy",
    points: DIFFICULTY_POINTS.easy,
    category: "daily",
    priority: "high",
    dueDate: getDueDateForCategory("daily"),
  },
  {
    title: "Tidy Living Room",
    description: "Put away items and organize common areas",
    difficulty: "easy",
    points: DIFFICULTY_POINTS.easy,
    category: "daily",
    priority: "low",
    dueDate: getDueDateForCategory("daily"),
  },
  {
    title: "Clean Kitchen",
    description: "Wash dishes, wipe counters, and clean surfaces",
    difficulty: "medium",
    points: DIFFICULTY_POINTS.medium,
    category: "daily",
    priority: "high",
    dueDate: getDueDateForCategory("daily"),
  },
  {
    title: "Sweep Floors",
    description: "Sweep high-traffic areas like kitchen and entryway",
    difficulty: "medium",
    points: DIFFICULTY_POINTS.medium,
    category: "daily",
    priority: "medium",
    dueDate: getDueDateForCategory("daily"),
  },
  {
    title: "Water Plants",
    description: "Water indoor plants as needed",
    difficulty: "medium",
    points: DIFFICULTY_POINTS.medium,
    category: "daily",
    priority: "low",
    dueDate: getDueDateForCategory("daily"),
  },

  // ===== WEEKLY CHORES =====
  {
    title: "Change Bed Sheets",
    description: "Remove old sheets and put on fresh bedding",
    difficulty: "easy",
    points: DIFFICULTY_POINTS.easy,
    category: "weekly",
    priority: "medium",
    dueDate: getDueDateForCategory("weekly"),
  },
  {
    title: "Take Out All Trash",
    description: "Collect trash from all rooms and take to bins",
    difficulty: "easy",
    points: DIFFICULTY_POINTS.easy,
    category: "weekly",
    priority: "high",
    dueDate: getDueDateForCategory("weekly"),
  },
  {
    title: "Clean Mirrors and Windows",
    description: "Wipe down mirrors and clean windows",
    difficulty: "easy",
    points: DIFFICULTY_POINTS.easy,
    category: "weekly",
    priority: "low",
    dueDate: getDueDateForCategory("weekly"),
  },
  {
    title: "Sort Mail and Papers",
    description: "Organize mail, file important papers, and recycle junk",
    difficulty: "easy",
    points: DIFFICULTY_POINTS.easy,
    category: "weekly",
    priority: "medium",
    dueDate: getDueDateForCategory("weekly"),
  },
  {
    title: "Do Laundry",
    description: "Wash, dry, fold, and put away clothes",
    difficulty: "medium",
    points: DIFFICULTY_POINTS.medium,
    category: "weekly",
    priority: "high",
    dueDate: getDueDateForCategory("weekly"),
  },
  {
    title: "Vacuum Floors",
    description: "Vacuum carpets and rugs throughout the house",
    difficulty: "medium",
    points: DIFFICULTY_POINTS.medium,
    category: "weekly",
    priority: "medium",
    dueDate: getDueDateForCategory("weekly"),
  },
  {
    title: "Clean Bathroom",
    description: "Scrub toilet, sink, shower, and wipe down surfaces",
    difficulty: "medium",
    points: DIFFICULTY_POINTS.medium,
    category: "weekly",
    priority: "medium",
    dueDate: getDueDateForCategory("weekly"),
  },
  {
    title: "Mow Lawn / Yard Work",
    description: "Mow grass, trim edges, and maintain yard",
    difficulty: "medium",
    points: DIFFICULTY_POINTS.medium,
    category: "weekly",
    priority: "low",
    dueDate: getDueDateForCategory("weekly"),
  },
  {
    title: "Grocery Shopping",
    description: "Plan meals, make shopping list, and buy groceries",
    difficulty: "medium",
    points: DIFFICULTY_POINTS.medium,
    category: "weekly",
    priority: "high",
    dueDate: getDueDateForCategory("weekly"),
  },
  {
    title: "Clean Out Fridge",
    description: "Throw away expired food and wipe down shelves",
    difficulty: "medium",
    points: DIFFICULTY_POINTS.medium,
    category: "weekly",
    priority: "medium",
    dueDate: getDueDateForCategory("weekly"),
  },
  {
    title: "Deep Clean Kitchen",
    description: "Clean appliances, scrub surfaces, and organize pantry",
    difficulty: "hard",
    points: DIFFICULTY_POINTS.hard,
    category: "weekly",
    priority: "medium",
    dueDate: getDueDateForCategory("weekly"),
  },
  {
    title: "Organize and Declutter",
    description: "Go through rooms and organize or donate unused items",
    difficulty: "hard",
    points: DIFFICULTY_POINTS.hard,
    category: "weekly",
    priority: "low",
    dueDate: getDueDateForCategory("weekly"),
  },

  // ===== MONTHLY CHORES =====
  {
    title: "Change Light Bulbs",
    description: "Replace any burnt out light bulbs",
    difficulty: "easy",
    points: DIFFICULTY_POINTS.easy,
    category: "monthly",
    priority: "low",
    dueDate: getDueDateForCategory("monthly"),
  },
  {
    title: "Wash Blankets and Pillows",
    description: "Wash throw blankets, decorative pillows, and comforters",
    difficulty: "easy",
    points: DIFFICULTY_POINTS.easy,
    category: "monthly",
    priority: "low",
    dueDate: getDueDateForCategory("monthly"),
  },
  {
    title: "Clean Air Vents",
    description: "Dust and clean air vents and filters",
    difficulty: "easy",
    points: DIFFICULTY_POINTS.easy,
    category: "monthly",
    priority: "low",
    dueDate: getDueDateForCategory("monthly"),
  },
  {
    title: "Deep Clean Oven",
    description: "Clean inside of oven and stovetop thoroughly",
    difficulty: "medium",
    points: DIFFICULTY_POINTS.medium,
    category: "monthly",
    priority: "medium",
    dueDate: getDueDateForCategory("monthly"),
  },
  {
    title: "Wash Windows",
    description: "Clean all windows inside and out",
    difficulty: "medium",
    points: DIFFICULTY_POINTS.medium,
    category: "monthly",
    priority: "low",
    dueDate: getDueDateForCategory("monthly"),
  },
  {
    title: "Deep Clean Carpets",
    description: "Vacuum thoroughly and spot clean carpets",
    difficulty: "medium",
    points: DIFFICULTY_POINTS.medium,
    category: "monthly",
    priority: "low",
    dueDate: getDueDateForCategory("monthly"),
  },
  {
    title: "Organize Pantry",
    description: "Sort food items, check expiration dates, and organize shelves",
    difficulty: "medium",
    points: DIFFICULTY_POINTS.medium,
    category: "monthly",
    priority: "medium",
    dueDate: getDueDateForCategory("monthly"),
  },
  {
    title: "Organize Closet",
    description: "Sort clothes, donate unused items, and organize wardrobe",
    difficulty: "hard",
    points: DIFFICULTY_POINTS.hard,
    category: "monthly",
    priority: "low",
    dueDate: getDueDateForCategory("monthly"),
  },
  {
    title: "Deep Clean Entire House",
    description: "Thoroughly clean all rooms, including baseboards and corners",
    difficulty: "hard",
    points: DIFFICULTY_POINTS.hard,
    category: "monthly",
    priority: "low",
    dueDate: getDueDateForCategory("monthly"),
  },
  {
    title: "Organize Garage / Storage",
    description: "Sort tools, organize storage, and clean garage or storage area",
    difficulty: "hard",
    points: DIFFICULTY_POINTS.hard,
    category: "monthly",
    priority: "low",
    dueDate: getDueDateForCategory("monthly"),
  },

  // ===== SEASONAL CHORES =====
  {
    title: "Change Seasonal Decorations",
    description: "Update decorations to match the current season",
    difficulty: "easy",
    points: DIFFICULTY_POINTS.easy,
    category: "seasonal",
    priority: "low",
    dueDate: getDueDateForCategory("seasonal"),
  },
  {
    title: "Switch Seasonal Clothes",
    description: "Put away off-season clothes and bring out current season items",
    difficulty: "easy",
    points: DIFFICULTY_POINTS.easy,
    category: "seasonal",
    priority: "low",
    dueDate: getDueDateForCategory("seasonal"),
  },
  {
    title: "Seasonal Yard Work",
    description: "Plant seasonal flowers, trim bushes, and maintain landscaping",
    difficulty: "medium",
    points: DIFFICULTY_POINTS.medium,
    category: "seasonal",
    priority: "medium",
    dueDate: getDueDateForCategory("seasonal"),
  },
  {
    title: "Service HVAC System",
    description: "Change air filters and have HVAC system checked",
    difficulty: "medium",
    points: DIFFICULTY_POINTS.medium,
    category: "seasonal",
    priority: "high",
    dueDate: getDueDateForCategory("seasonal"),
  },
  {
    title: "Deep Seasonal Cleaning",
    description: "Complete deep cleaning of all areas, including neglected spaces",
    difficulty: "hard",
    points: DIFFICULTY_POINTS.hard,
    category: "seasonal",
    priority: "low",
    dueDate: getDueDateForCategory("seasonal"),
  },
]




