import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUserId } from "./authHelpers";

// Query: Get chores for a household
export const getChoresByHousehold = query({
  args: {
    householdId: v.id("households"),
    status: v.optional(v.union(v.literal("pending"), v.literal("in_progress"), v.literal("completed"))),
    category: v.optional(v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly"), v.literal("seasonal"))),
    assignedTo: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Verify user is member of household
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household_user", (q) => q.eq("householdId", args.householdId).eq("userId", userId as any))
      .first();

    if (!membership) {
      throw new Error("Not a member of this household");
    }

    let query = ctx.db
      .query("chores")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId));

    if (args.status) {
      query = ctx.db
        .query("chores")
        .withIndex("by_household_status", (q) => 
          q.eq("householdId", args.householdId).eq("status", args.status!)
        );
    }

    if (args.category) {
      query = ctx.db
        .query("chores")
        .withIndex("by_household_category", (q) => 
          q.eq("householdId", args.householdId).eq("category", args.category!)
        );
    }

    if (args.assignedTo) {
      query = ctx.db
        .query("chores")
        .withIndex("by_assigned_to", (q) => q.eq("assignedTo", args.assignedTo));
    }

    const chores = await query.collect();
    
    // Sort by due date, then by priority, then by creation date
    return chores.sort((a, b) => {
      // First sort by due date (nulls last)
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      if (a.dueDate && b.dueDate) {
        const dateDiff = a.dueDate - b.dueDate;
        if (dateDiff !== 0) return dateDiff;
      }

      // Then by priority (high > medium > low)
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Finally by creation date (newest first)
      return b.createdAt - a.createdAt;
    });
  },
});

// Query: Get a single chore
export const getChore = query({
  args: { choreId: v.id("chores") },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const chore = await ctx.db.get(args.choreId);
    if (!chore) {
      throw new Error("Chore not found");
    }

    // Verify user is member of household
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household_user", (q) => q.eq("householdId", chore.householdId).eq("userId", userId as any))
      .first();

    if (!membership) {
      throw new Error("Not a member of this household");
    }

    return chore;
  },
});

// Mutation: Add a new chore
export const addChore = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    points: v.number(),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    category: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly"), v.literal("seasonal")),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    householdId: v.id("households"),
    assignedTo: v.optional(v.id("users")),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Verify user is member of household
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household_user", (q) => q.eq("householdId", args.householdId).eq("userId", userId as any))
      .first();

    if (!membership) {
      throw new Error("Not a member of this household");
    }

    const now = Date.now();
    const choreId = await ctx.db.insert("chores", {
      ...args,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });

    return choreId;
  },
});

// Mutation: Complete a chore
export const completeChore = mutation({
  args: {
    choreId: v.id("chores"),
    completedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const chore = await ctx.db.get(args.choreId);
    if (!chore) {
      throw new Error("Chore not found");
    }

    if (chore.status === "completed") {
      throw new Error("Chore already completed");
    }

    // Verify user is member of household
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household_user", (q) => q.eq("householdId", chore.householdId).eq("userId", userId as any))
      .first();

    if (!membership) {
      throw new Error("Not a member of this household");
    }

    const now = Date.now();
    
    // Calculate bonus/penalty points
    let finalPoints = chore.points;
    let bonusMessage = "";
    let isEarly = false;
    let isLate = false;
    let daysEarly = 0;
    let daysLate = 0;

    if (chore.dueDate) {
      const hoursDiff = (chore.dueDate - now) / (1000 * 60 * 60);
      
      if (hoursDiff > 0) {
        // Early completion bonus
        const bonus = Math.round(chore.points * 0.2);
        finalPoints += bonus;
        isEarly = true;
        daysEarly = Math.floor(hoursDiff / 24);
        const hoursEarly = Math.floor(hoursDiff % 24);
        
        if (daysEarly > 0) {
          bonusMessage = `+${bonus} early bonus (${daysEarly} day${daysEarly > 1 ? 's' : ''} ${hoursEarly > 0 ? hoursEarly + ' hour' + (hoursEarly > 1 ? 's' : '') : ''} early)`;
        } else {
          bonusMessage = `+${bonus} early bonus (${hoursEarly} hour${hoursEarly > 1 ? 's' : ''} early)`;
        }
      } else if (hoursDiff < 0) {
        // Late completion penalty
        const penaltyMultiplier = Math.min(Math.abs(hoursDiff) * 0.005, 0.3);
        const penalty = Math.round(chore.points * penaltyMultiplier);
        finalPoints = Math.max(1, finalPoints - penalty);
        isLate = true;
        daysLate = Math.floor(Math.abs(hoursDiff) / 24);
        const hoursLate = Math.floor(Math.abs(hoursDiff) % 24);
        
        if (daysLate > 0) {
          bonusMessage = `-${penalty} late penalty (${daysLate} day${daysLate > 1 ? 's' : ''} ${hoursLate > 0 ? hoursLate + ' hour' + (hoursLate > 1 ? 's' : '') : ''} late)`;
        } else {
          bonusMessage = `-${penalty} late penalty (${hoursLate} hour${hoursLate > 1 ? 's' : ''} late)`;
        }
      } else {
        // On-time completion
        const onTimeBonus = Math.round(chore.points * 0.15);
        finalPoints += onTimeBonus;
        bonusMessage = `+${onTimeBonus} on-time bonus`;
      }
    }

    // Update chore
    await ctx.db.patch(args.choreId, {
      status: "completed",
      completedAt: now,
      completedBy: args.completedBy,
      finalPoints,
      bonusMessage,
      updatedAt: now,
    });

    // Create completion record
    await ctx.db.insert("choreCompletions", {
      choreId: args.choreId,
      userId: args.completedBy,
      householdId: chore.householdId,
      completedAt: now,
      pointsEarned: finalPoints,
      bonusPoints: isEarly ? finalPoints - chore.points : undefined,
      penaltyPoints: isLate ? chore.points - finalPoints : undefined,
      bonusMessage,
      isEarly,
      isLate,
      daysEarly: isEarly ? daysEarly : undefined,
      daysLate: isLate ? daysLate : undefined,
    });

    // Update user points
    const user = await ctx.db.get(args.completedBy);
    if (user) {
      await ctx.db.patch(args.completedBy, {
        points: (user.points ?? 0) + finalPoints,
        lastActive: now,
        updatedAt: now,
      });
    }

    return {
      choreId: args.choreId,
      finalPoints,
      bonusMessage,
      isEarly,
      isLate,
    };
  },
});

// Mutation: Update a chore
export const updateChore = mutation({
  args: {
    choreId: v.id("chores"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    points: v.optional(v.number()),
    difficulty: v.optional(v.union(v.literal("easy"), v.literal("medium"), v.literal("hard"))),
    category: v.optional(v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly"), v.literal("seasonal"))),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    assignedTo: v.optional(v.id("users")),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const chore = await ctx.db.get(args.choreId);
    if (!chore) {
      throw new Error("Chore not found");
    }

    // Verify user is member of household
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household_user", (q) => q.eq("householdId", chore.householdId).eq("userId", userId as any))
      .first();

    if (!membership) {
      throw new Error("Not a member of this household");
    }

    const { choreId, ...updates } = args;
    await ctx.db.patch(args.choreId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return args.choreId;
  },
});

// Mutation: Delete a chore
export const deleteChore = mutation({
  args: { choreId: v.id("chores") },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const chore = await ctx.db.get(args.choreId);
    if (!chore) {
      throw new Error("Chore not found");
    }

    // Verify user is member of household
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household_user", (q) => q.eq("householdId", chore.householdId).eq("userId", userId as any))
      .first();

    if (!membership) {
      throw new Error("Not a member of this household");
    }

    // Delete related completion records
    const completions = await ctx.db
      .query("choreCompletions")
      .withIndex("by_chore", (q) => q.eq("choreId", args.choreId))
      .collect();

    for (const completion of completions) {
      await ctx.db.delete(completion._id);
    }

    await ctx.db.delete(args.choreId);
    return args.choreId;
  },
});

// Mutation: Reset chores to defaults (for daily/weekly resets)
export const resetChoresToDefaults = mutation({
  args: { householdId: v.id("households") },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Verify user is member of household
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household_user", (q) => q.eq("householdId", args.householdId).eq("userId", userId as any))
      .first();

    if (!membership) {
      throw new Error("Not a member of this household");
    }

    // This would typically load default chores from a configuration
    // For now, we'll just return success - the actual default chores
    // would be loaded from the client side and added via addChore
    return { success: true };
  },
});

// Point values for difficulty levels
const DIFFICULTY_POINTS = {
  easy: 5,
  medium: 10,
  hard: 15,
} as const;

// Default chores data
const DEFAULT_CHORES: Array<{
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  category: "daily" | "weekly" | "monthly" | "seasonal";
  priority: "low" | "medium" | "high";
  points: number;
}> = [
  // ===== DAILY CHORES =====
  // Daily - Easy
  {
    title: "Morning Setup Routine",
    description: "Execute bedroom optimization: straighten linens, arrange pillows, and organize space for peak daily performance",
    difficulty: "easy",
    points: DIFFICULTY_POINTS.easy,
    category: "daily",
    priority: "medium",
  },
  {
    title: "Waste Management Protocol",
    description: "Complete household waste elimination cycle: collect, process, and dispatch to designated collection point",
    difficulty: "easy",
    points: DIFFICULTY_POINTS.easy,
    category: "daily",
    priority: "high",
  },
  {
    title: "Kitchen Surface Optimization",
    description: "Maintain food prep zone efficiency: sanitize work surfaces and optimize counter space for productivity",
    difficulty: "easy",
    points: DIFFICULTY_POINTS.easy,
    category: "daily",
    priority: "high",
  },
  {
    title: "Dishware Cycle Management",
    description: "Execute kitchen automation cycle: process clean inventory and queue next cleaning batch",
    difficulty: "easy",
    points: DIFFICULTY_POINTS.easy,
    category: "daily",
    priority: "medium",
  },
  {
    title: "Bathroom Efficiency Check",
    description: "Optimize personal care station: refresh surfaces, organize essentials, and maintain functional layout",
    difficulty: "easy",
    points: DIFFICULTY_POINTS.easy,
    category: "daily",
    priority: "medium",
  },
  {
    title: "Pet Care Protocol",
    description: "Execute daily pet wellness routine: provide nutrition and hydration for optimal household harmony",
    difficulty: "easy",
    points: DIFFICULTY_POINTS.easy,
    category: "daily",
    priority: "high",
  },
  {
    title: "5-Minute Reset Sprint",
    description: "Execute rapid declutter protocol: restore common areas to baseline organization standards",
    difficulty: "easy",
    points: DIFFICULTY_POINTS.easy,
    category: "daily",
    priority: "low",
  },
  // Daily - Medium
  {
    title: "Kitchen Command Center Reset",
    description: "Complete kitchen ecosystem restoration: process dishware, optimize surfaces, and organize workflow zones",
    difficulty: "medium",
    points: DIFFICULTY_POINTS.medium,
    category: "daily",
    priority: "high",
  },
  {
    title: "Floor Maintenance Protocol",
    description: "Execute surface restoration for high-traffic zones: sweep debris and optimize floor condition",
    difficulty: "medium",
    points: DIFFICULTY_POINTS.medium,
    category: "daily",
    priority: "medium",
  },
  {
    title: "Living Space Optimization",
    description: "Restore social zone to peak functionality: organize items, refresh seating, and align furniture for maximum comfort",
    difficulty: "medium",
    points: DIFFICULTY_POINTS.medium,
    category: "daily",
    priority: "low",
  },
  {
    title: "Plant Wellness Check",
    description: "Execute indoor ecosystem maintenance: assess hydration needs and optimize plant health for enhanced air quality",
    difficulty: "medium",
    points: DIFFICULTY_POINTS.medium,
    category: "daily",
    priority: "low",
  },

  // ===== WEEKLY CHORES =====
  // Weekly - Easy
  {
    title: "Sleep Environment Upgrade",
    description: "Complete bedding refresh cycle: deploy fresh linens for optimal rest and recovery performance",
    difficulty: "easy",
    points: DIFFICULTY_POINTS.easy,
    category: "weekly",
    priority: "medium",
  },
  {
    title: "Complete Waste Audit",
    description: "Execute full-scale waste elimination: collect from all zones and complete disposal protocol",
    difficulty: "easy",
    points: DIFFICULTY_POINTS.easy,
    category: "weekly",
    priority: "high",
  },
  {
    title: "Visual Clarity Enhancement",
    description: "Optimize light transmission and reflection: restore mirrors and windows to crystal-clear performance standards",
    difficulty: "easy",
    points: DIFFICULTY_POINTS.easy,
    category: "weekly",
    priority: "low",
  },
  {
    title: "Information Management Sprint",
    description: "Process incoming data streams: sort correspondence, archive critical documents, and eliminate clutter",
    difficulty: "easy",
    points: DIFFICULTY_POINTS.easy,
    category: "weekly",
    priority: "medium",
  },
  // Weekly - Medium
  {
    title: "Textile Care Cycle",
    description: "Execute complete garment processing: sort, clean, dry, and organize wardrobe inventory for optimal accessibility",
    difficulty: "medium",
    points: DIFFICULTY_POINTS.medium,
    category: "weekly",
    priority: "high",
  },
  {
    title: "Deep Surface Restoration",
    description: "Execute comprehensive carpet maintenance: extract debris, optimize furniture placement, and refresh hidden zones",
    difficulty: "medium",
    points: DIFFICULTY_POINTS.medium,
    category: "weekly",
    priority: "medium",
  },
  {
    title: "Bathroom System Overhaul",
    description: "Complete sanitation protocol: restore tile integrity, optimize fixture performance, and organize care products",
    difficulty: "medium",
    points: DIFFICULTY_POINTS.medium,
    category: "weekly",
    priority: "medium",
  },
  {
    title: "Outdoor Ecosystem Management",
    description: "Execute landscape optimization: eliminate invasive growth, trim for health, and maintain irrigation systems",
    difficulty: "medium",
    points: DIFFICULTY_POINTS.medium,
    category: "weekly",
    priority: "low",
  },
  {
    title: "Weekly Nutrition Strategy",
    description: "Execute meal optimization protocol: plan nutrition goals, acquire resources, and prep ingredients for peak efficiency",
    difficulty: "medium",
    points: DIFFICULTY_POINTS.medium,
    category: "weekly",
    priority: "high",
  },
  {
    title: "Food Storage Audit",
    description: "Optimize cold storage efficiency: eliminate expired inventory, sanitize compartments, and organize for accessibility",
    difficulty: "medium",
    points: DIFFICULTY_POINTS.medium,
    category: "weekly",
    priority: "medium",
  },
  // Weekly - Hard
  {
    title: "Kitchen System Optimization",
    description: "Execute comprehensive culinary zone upgrade: restore appliance performance, optimize storage, and deep-clean all surfaces",
    difficulty: "hard",
    points: DIFFICULTY_POINTS.hard,
    category: "weekly",
    priority: "medium",
  },
  {
    title: "Strategic Declutter Mission",
    description: "Execute comprehensive space optimization: audit possessions, redistribute unused items, and maximize functional storage",
    difficulty: "hard",
    points: DIFFICULTY_POINTS.hard,
    category: "weekly",
    priority: "low",
  },

  // ===== MONTHLY CHORES =====
  // Monthly - Easy
  {
    title: "Illumination System Maintenance",
    description: "Optimize lighting performance: clear debris from fixtures, refresh bulbs, and restore maximum brightness output",
    difficulty: "easy",
    points: DIFFICULTY_POINTS.easy,
    category: "monthly",
    priority: "low",
  },
  {
    title: "Comfort Textile Refresh",
    description: "Execute decorative textile maintenance: restore softness and cleanliness of comfort accessories",
    difficulty: "easy",
    points: DIFFICULTY_POINTS.easy,
    category: "monthly",
    priority: "low",
  },
  {
    title: "Airflow Optimization Protocol",
    description: "Enhance HVAC efficiency: clear obstructions from ventilation systems for optimal air circulation",
    difficulty: "easy",
    points: DIFFICULTY_POINTS.easy,
    category: "monthly",
    priority: "low",
  },
  // Monthly - Medium
  {
    title: "Cooking System Deep Clean",
    description: "Restore culinary equipment to peak performance: eliminate buildup from cooking surfaces and ventilation",
    difficulty: "medium",
    points: DIFFICULTY_POINTS.medium,
    category: "monthly",
    priority: "medium",
  },
  {
    title: "Complete Window System Overhaul",
    description: "Maximize natural light transmission: restore all window components to crystal clarity inside and out",
    difficulty: "medium",
    points: DIFFICULTY_POINTS.medium,
    category: "monthly",
    priority: "low",
  },
  {
    title: "Carpet Restoration Protocol",
    description: "Execute comprehensive floor covering maintenance: eliminate embedded debris and restore surface integrity",
    difficulty: "medium",
    points: DIFFICULTY_POINTS.medium,
    category: "monthly",
    priority: "low",
  },
  {
    title: "Food Inventory Optimization",
    description: "Execute pantry efficiency audit: organize provisions, validate freshness, and maximize storage accessibility",
    difficulty: "medium",
    points: DIFFICULTY_POINTS.medium,
    category: "monthly",
    priority: "medium",
  },
  // Monthly - Hard
  {
    title: "Wardrobe Management System",
    description: "Execute seasonal clothing optimization: categorize by usage, redistribute excess inventory, and organize for accessibility",
    difficulty: "hard",
    points: DIFFICULTY_POINTS.hard,
    category: "monthly",
    priority: "low",
  },
  {
    title: "Comprehensive Home Reset",
    description: "Execute full-scale household optimization: deep clean all zones, eliminate clutter, and restore organization standards",
    difficulty: "hard",
    points: DIFFICULTY_POINTS.hard,
    category: "monthly",
    priority: "low",
  },
  {
    title: "Storage Facility Optimization",
    description: "Execute workshop/storage zone overhaul: organize equipment, restore floor condition, and maximize storage efficiency",
    difficulty: "hard",
    points: DIFFICULTY_POINTS.hard,
    category: "monthly",
    priority: "low",
  },

  // ===== SEASONAL CHORES =====
  // Seasonal - Easy
  {
    title: "Seasonal Aesthetic Update",
    description: "Execute environmental refresh protocol: transition decorative elements to match current season and optimize ambiance",
    difficulty: "easy",
    points: DIFFICULTY_POINTS.easy,
    category: "seasonal",
    priority: "low",
  },
  {
    title: "Clothing Inventory Transition",
    description: "Execute seasonal wardrobe optimization: archive off-season items and deploy current climate-appropriate clothing",
    difficulty: "easy",
    points: DIFFICULTY_POINTS.easy,
    category: "seasonal",
    priority: "low",
  },
  // Seasonal - Medium
  {
    title: "Landscape Seasonal Strategy",
    description: "Execute outdoor ecosystem transition: deploy seasonal plantings and optimize irrigation for changing climate conditions",
    difficulty: "medium",
    points: DIFFICULTY_POINTS.medium,
    category: "seasonal",
    priority: "medium",
  },
  {
    title: "Climate Control System Service",
    description: "Execute HVAC performance optimization: install fresh filtration and conduct seasonal system diagnostic",
    difficulty: "medium",
    points: DIFFICULTY_POINTS.medium,
    category: "seasonal",
    priority: "high",
  },
  // Seasonal - Hard
  {
    title: "Comprehensive System Refresh",
    description: "Execute full-scale seasonal maintenance: deep clean neglected zones and restore all systems to peak performance",
    difficulty: "hard",
    points: DIFFICULTY_POINTS.hard,
    category: "seasonal",
    priority: "low",
  },
];

// Helper to calculate due date based on category
function getDueDateForCategory(category: "daily" | "weekly" | "monthly" | "seasonal"): number {
  const now = new Date();
  let dueDate = new Date();

  switch (category) {
    case "daily":
      dueDate.setHours(18, 0, 0, 0); // 6:00 PM today
      break;
    case "weekly":
      dueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      dueDate.setHours(18, 0, 0, 0);
      break;
    case "monthly":
      dueDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      dueDate.setHours(18, 0, 0, 0);
      break;
    case "seasonal":
      dueDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
      dueDate.setHours(18, 0, 0, 0);
      break;
  }

  return dueDate.getTime();
}

// Mutation: Seed default chores for a household
export const seedDefaultChores = mutation({
  args: {
    householdId: v.id("households"),
    category: v.optional(v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly"), v.literal("seasonal"))),
    clearExisting: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Verify user is member of household
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household_user", (q) => q.eq("householdId", args.householdId).eq("userId", userId as any))
      .first();

    if (!membership) {
      throw new Error("Not a member of this household");
    }

    // Optionally clear existing chores
    if (args.clearExisting) {
      const existingChores = await ctx.db
        .query("chores")
        .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
        .collect();

      for (const chore of existingChores) {
        // Delete related completion records
        const completions = await ctx.db
          .query("choreCompletions")
          .withIndex("by_chore", (q) => q.eq("choreId", chore._id))
          .collect();

        for (const completion of completions) {
          await ctx.db.delete(completion._id);
        }

        await ctx.db.delete(chore._id);
      }
    }

    // Filter chores by category if specified
    const choresToAdd = args.category
      ? DEFAULT_CHORES.filter((c) => c.category === args.category)
      : DEFAULT_CHORES;

    const now = Date.now();
    const addedChoreIds: string[] = [];

    for (const chore of choresToAdd) {
      const choreId = await ctx.db.insert("chores", {
        title: chore.title,
        description: chore.description,
        points: chore.points,
        difficulty: chore.difficulty,
        category: chore.category,
        priority: chore.priority,
        householdId: args.householdId,
        status: "pending",
        dueDate: getDueDateForCategory(chore.category),
        createdAt: now,
        updatedAt: now,
      });
      addedChoreIds.push(choreId);
    }

    return {
      success: true,
      addedCount: addedChoreIds.length,
      choreIds: addedChoreIds,
    };
  },
});

// Query: Get default chores list (without adding to database)
export const getDefaultChoresList = query({
  args: {
    category: v.optional(v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly"), v.literal("seasonal"))),
  },
  handler: async (_ctx, args) => {
    const choresToReturn = args.category
      ? DEFAULT_CHORES.filter((c) => c.category === args.category)
      : DEFAULT_CHORES;

    return choresToReturn.map((chore) => ({
      ...chore,
      dueDate: getDueDateForCategory(chore.category),
    }));
  },
});

// Internal mutation: Seed default chores (no auth required - for setup/admin use)
export const seedDefaultChoresInternal = internalMutation({
  args: {
    householdId: v.id("households"),
    category: v.optional(v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly"), v.literal("seasonal"))),
    clearExisting: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Optionally clear existing chores
    if (args.clearExisting) {
      const existingChores = await ctx.db
        .query("chores")
        .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
        .collect();

      for (const chore of existingChores) {
        const completions = await ctx.db
          .query("choreCompletions")
          .withIndex("by_chore", (q) => q.eq("choreId", chore._id))
          .collect();

        for (const completion of completions) {
          await ctx.db.delete(completion._id);
        }

        await ctx.db.delete(chore._id);
      }
    }

    // Filter chores by category if specified
    const choresToAdd = args.category
      ? DEFAULT_CHORES.filter((c) => c.category === args.category)
      : DEFAULT_CHORES;

    const now = Date.now();
    const addedChoreIds: string[] = [];

    for (const chore of choresToAdd) {
      const choreId = await ctx.db.insert("chores", {
        title: chore.title,
        description: chore.description,
        points: chore.points,
        difficulty: chore.difficulty,
        category: chore.category,
        priority: chore.priority,
        householdId: args.householdId,
        status: "pending",
        dueDate: getDueDateForCategory(chore.category),
        createdAt: now,
        updatedAt: now,
      });
      addedChoreIds.push(choreId);
    }

    return {
      success: true,
      addedCount: addedChoreIds.length,
      choreIds: addedChoreIds,
    };
  },
});

// Admin setup mutation - seeds chores without auth (for initial setup)
// WARNING: Remove or protect this in production!
export const adminSeedChores = mutation({
  args: {
    householdId: v.id("households"),
    category: v.optional(v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly"), v.literal("seasonal"))),
    clearExisting: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Verify household exists
    const household = await ctx.db.get(args.householdId);
    if (!household) {
      throw new Error("Household not found");
    }

    // Optionally clear existing chores
    if (args.clearExisting) {
      const existingChores = await ctx.db
        .query("chores")
        .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
        .collect();

      for (const chore of existingChores) {
        const completions = await ctx.db
          .query("choreCompletions")
          .withIndex("by_chore", (q) => q.eq("choreId", chore._id))
          .collect();

        for (const completion of completions) {
          await ctx.db.delete(completion._id);
        }

        await ctx.db.delete(chore._id);
      }
    }

    // Filter chores by category if specified
    const choresToAdd = args.category
      ? DEFAULT_CHORES.filter((c) => c.category === args.category)
      : DEFAULT_CHORES;

    const now = Date.now();
    const addedChoreIds: string[] = [];

    for (const chore of choresToAdd) {
      const choreId = await ctx.db.insert("chores", {
        title: chore.title,
        description: chore.description,
        points: chore.points,
        difficulty: chore.difficulty,
        category: chore.category,
        priority: chore.priority,
        householdId: args.householdId,
        status: "pending",
        dueDate: getDueDateForCategory(chore.category),
        createdAt: now,
        updatedAt: now,
      });
      addedChoreIds.push(choreId);
    }

    return {
      success: true,
      addedCount: addedChoreIds.length,
      choreIds: addedChoreIds,
    };
  },
});