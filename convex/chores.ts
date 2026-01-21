import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUserId } from "./authHelpers";
import { calculateUserStats } from "./stats";

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

    const chores = await query.collect();
    
    // Filter by assignedTo if provided (must filter after collecting to maintain household boundary)
    const filteredChores = args.assignedTo 
      ? chores.filter((chore) => chore.assignedTo === args.assignedTo)
      : chores;
    
    // Get photo URLs for chores with proof photos
    const choresWithPhotos = await Promise.all(
      filteredChores.map(async (chore) => {
        if (chore.proofPhotoId) {
          const photoUrl = await ctx.storage.getUrl(chore.proofPhotoId);
          return { ...chore, proofPhotoUrl: photoUrl };
        }
        return chore;
      })
    );
    
    // Sort by due date, then by priority, then by creation date
    return choresWithPhotos.sort((a, b) => {
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

// Mutation: Generate upload URL for photo proof
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

// Mutation: Complete a chore
export const completeChore = mutation({
  args: {
    choreId: v.id("chores"),
    completedBy: v.id("users"),
    proofPhotoId: v.optional(v.id("_storage")),
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
      proofPhotoId: args.proofPhotoId,
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
      proofPhotoId: args.proofPhotoId,
    });

    // Update user lastActive timestamp
    const user = await ctx.db.get(args.completedBy);
    if (user) {
      await ctx.db.patch(args.completedBy, {
        lastActive: now,
        updatedAt: now,
      });
    } else {
      console.error(`[completeChore] User ${args.completedBy} not found!`)
    }

    // Update user stats in the userStats table (household-specific points)
    console.log(`[completeChore] Calling calculateUserStats for user ${args.completedBy} in household ${chore.householdId}`)
    console.log(`[completeChore] Chore being completed: ${chore.title}, finalPoints: ${finalPoints}, points: ${chore.points}`)
    
    // Verify the chore was updated correctly by fetching it again
    const updatedChore = await ctx.db.get(args.choreId);
    if (updatedChore) {
      console.log(`[completeChore] Verified updated chore - status: ${updatedChore.status}, completedBy: ${updatedChore.completedBy}, finalPoints: ${updatedChore.finalPoints}`);
    }
    
    // Get stats BEFORE completing the chore for comparison
    const statsBefore = await ctx.db
      .query("userStats")
      .withIndex("by_user_household", (q: any) => q.eq("userId", args.completedBy).eq("householdId", chore.householdId))
      .first();

    const previousLevel = statsBefore?.currentLevel || 1;

    if (statsBefore) {
      console.log(`[completeChore] Stats BEFORE completion - earnedPoints: ${statsBefore.earnedPoints}, lifetimePoints: ${statsBefore.lifetimePoints}, level: ${previousLevel}`)
    }

    const updatedStats = await calculateUserStats(ctx, args.completedBy, chore.householdId);

    const calculatedPointsRedeemed = updatedStats.lifetimePoints - updatedStats.earnedPoints
    console.log(`[completeChore] Stats updated - earnedPoints: ${updatedStats.earnedPoints}, lifetimePoints: ${updatedStats.lifetimePoints}, calculated pointsRedeemed: ${calculatedPointsRedeemed}`)

    // Check if user leveled up
    const newLevel = updatedStats.currentLevel;
    const leveledUp = newLevel > previousLevel;

    if (leveledUp) {
      console.log(`[completeChore] 🎉 LEVEL UP! ${previousLevel} → ${newLevel}`)
    }

    // Double-check the stats were saved correctly by reading them back
    const verifyStats = await ctx.db
      .query("userStats")
      .withIndex("by_user_household", (q: any) => q.eq("userId", args.completedBy).eq("householdId", chore.householdId))
      .first();
    if (verifyStats) {
      console.log(`[completeChore] Verified saved stats - earnedPoints: ${verifyStats.earnedPoints}, lifetimePoints: ${verifyStats.lifetimePoints}`)
      if (verifyStats.earnedPoints !== updatedStats.earnedPoints) {
        console.error(`[completeChore] ERROR: earnedPoints mismatch! Expected: ${updatedStats.earnedPoints}, Got: ${verifyStats.earnedPoints}`)
      }
    }

    return {
      choreId: args.choreId,
      finalPoints,
      bonusMessage,
      isEarly,
      isLate,
      leveledUp,
      newLevel,
      previousLevel,
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

// Mutation: Reset all chores for a household (admin only)
// Resets all completed chores back to pending status and seeds default chores
export const resetAllChores = mutation({
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

    // Only admins and parents can reset chores
    if (membership.role !== "admin" && membership.role !== "parent") {
      throw new Error("Only admins and parents can reset chores");
    }

    const now = Date.now();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    // Get all chores for this household
    const allChores = await ctx.db
      .query("chores")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    let resetCount = 0;

    // Reset all completed chores to pending
    for (const chore of allChores) {
      if (chore.status === "completed") {
        // Calculate new due date based on category
        let newDueDate: Date;
        switch (chore.category) {
          case "daily":
            newDueDate = new Date(today);
            newDueDate.setDate(newDueDate.getDate() + 1);
            newDueDate.setHours(18, 0, 0, 0); // 6:00 PM tomorrow
            break;
          case "weekly":
            newDueDate = new Date(today);
            newDueDate.setDate(newDueDate.getDate() + 7);
            newDueDate.setHours(18, 0, 0, 0); // 6:00 PM next week
            break;
          case "monthly":
            newDueDate = new Date(today);
            newDueDate.setMonth(newDueDate.getMonth() + 1);
            newDueDate.setHours(18, 0, 0, 0); // 6:00 PM next month
            break;
          case "seasonal":
            newDueDate = new Date(today);
            newDueDate.setMonth(newDueDate.getMonth() + 3);
            newDueDate.setHours(18, 0, 0, 0); // 6:00 PM next season
            break;
          default:
            newDueDate = new Date(today);
            newDueDate.setDate(newDueDate.getDate() + 1);
            newDueDate.setHours(18, 0, 0, 0);
        }

        await ctx.db.patch(chore._id, {
          status: "pending",
          completedAt: undefined,
          completedBy: undefined,
          finalPoints: undefined,
          bonusMessage: undefined,
          dueDate: newDueDate.getTime(),
          updatedAt: now,
        });

        resetCount++;
      }
    }

    // Seed default chores that don't already exist
    // Create a set of existing chore titles (case-insensitive) for quick lookup
    const existingChoreTitles = new Set(
      allChores.map((chore) => chore.title.toLowerCase().trim())
    );

    let addedCount = 0;
    const addedChoreIds: string[] = [];

    // Add default chores that don't already exist
    for (const defaultChore of DEFAULT_CHORES) {
      const normalizedTitle = defaultChore.title.toLowerCase().trim();
      
      // Only add if a chore with this title doesn't already exist
      if (!existingChoreTitles.has(normalizedTitle)) {
        const choreId = await ctx.db.insert("chores", {
          title: defaultChore.title,
          description: defaultChore.description,
          points: defaultChore.points,
          difficulty: defaultChore.difficulty,
          category: defaultChore.category,
          priority: defaultChore.priority,
          householdId: args.householdId,
          status: "pending",
          dueDate: getDueDateForCategory(defaultChore.category),
          createdAt: now,
          updatedAt: now,
        });
        addedChoreIds.push(choreId);
        addedCount++;
      }
    }

    return {
      success: true,
      resetCount,
      addedCount,
      totalChores: allChores.length,
      message: `Reset ${resetCount} completed chore(s) and added ${addedCount} default chore(s).`,
    };
  },
});

// Mutation: Reset all data for a household (admin only)
// This is a comprehensive reset that clears all chores, stats, points, redemptions, etc.
export const resetAllData = mutation({
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

    // Only admins can reset all data
    if (membership.role !== "admin") {
      throw new Error("Only admins can reset all data");
    }

    const now = Date.now();
    let deletedCounts = {
      chores: 0,
      completions: 0,
      stats: 0,
      redemptions: 0,
      deductions: 0,
    };
    let resetUsers = 0;

    // 1. Delete all chores and their completions
    const allChores = await ctx.db
      .query("chores")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    for (const chore of allChores) {
      // Delete related completion records
      const completions = await ctx.db
        .query("choreCompletions")
        .withIndex("by_chore", (q) => q.eq("choreId", chore._id))
        .collect();

      for (const completion of completions) {
        await ctx.db.delete(completion._id);
        deletedCounts.completions++;
      }

      await ctx.db.delete(chore._id);
      deletedCounts.chores++;
    }

    // 2. Delete all chore completions (in case any were orphaned)
    const remainingCompletions = await ctx.db
      .query("choreCompletions")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    for (const completion of remainingCompletions) {
      await ctx.db.delete(completion._id);
      deletedCounts.completions++;
    }

    // 3. Delete all user stats for household members
    const allStats = await ctx.db
      .query("userStats")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    for (const stat of allStats) {
      await ctx.db.delete(stat._id);
      deletedCounts.stats++;
    }

    // 4. Reset user points and levels for all household members
    const householdMembers = await ctx.db
      .query("householdMembers")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    for (const member of householdMembers) {
      const user = await ctx.db.get(member.userId);
      if (user) {
        await ctx.db.patch(member.userId, {
          points: 0,
          level: 1,
          lastActive: now,
          updatedAt: now,
        });
        resetUsers++;
      }
    }

    // 5. Delete all redemption requests
    const redemptions = await ctx.db
      .query("redemptionRequests")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    for (const redemption of redemptions) {
      await ctx.db.delete(redemption._id);
      deletedCounts.redemptions++;
    }

    // 6. Delete all point deductions
    const deductions = await ctx.db
      .query("pointDeductions")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    for (const deduction of deductions) {
      await ctx.db.delete(deduction._id);
      deletedCounts.deductions++;
    }

    // 7. Seed default chores
    let addedChoresCount = 0;
    for (const chore of DEFAULT_CHORES) {
      await ctx.db.insert("chores", {
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
      addedChoresCount++;
    }

    return {
      success: true,
      deletedCounts,
      resetUsers,
      addedChoresCount,
      message: `Reset complete: ${deletedCounts.chores} chores deleted, ${deletedCounts.completions} completions, ${deletedCounts.stats} stats, ${deletedCounts.redemptions} redemptions, ${deletedCounts.deductions} deductions, reset ${resetUsers} users' points/levels, and added ${addedChoresCount} default chores.`,
    };
  },
});

// Point values for difficulty levels
const DIFFICULTY_POINTS = {
  easy: 5,
  medium: 10,
  hard: 15,
} as const;

// Default chores data - Global, straightforward chores available to all households
const DEFAULT_CHORES: Array<{
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  category: "daily" | "weekly" | "monthly" | "seasonal";
  priority: "low" | "medium" | "high";
  points: number;
}> = [
  // ===== DAILY CHORES =====
  {
    title: "Make Your Bed",
    description: "Straighten sheets, arrange pillows, and tidy your bedroom",
    difficulty: "easy",
    points: DIFFICULTY_POINTS.easy,
    category: "daily",
    priority: "medium",
  },
  {
    title: "Take Out Trash",
    description: "Collect and take out all household trash",
    difficulty: "easy",
    points: DIFFICULTY_POINTS.easy,
    category: "daily",
    priority: "high",
  },
  {
    title: "Wipe Kitchen Counters",
    description: "Clean and sanitize kitchen countertops",
    difficulty: "easy",
    points: DIFFICULTY_POINTS.easy,
    category: "daily",
    priority: "high",
  },
  {
    title: "Do the Dishes",
    description: "Wash, dry, and put away dishes",
    difficulty: "easy",
    points: DIFFICULTY_POINTS.easy,
    category: "daily",
    priority: "medium",
  },
  {
    title: "Clean Bathroom Sink",
    description: "Wipe down bathroom sink and mirror",
    difficulty: "easy",
    points: DIFFICULTY_POINTS.easy,
    category: "daily",
    priority: "medium",
  },
  {
    title: "Feed Pets",
    description: "Feed and give water to pets",
    difficulty: "easy",
    points: DIFFICULTY_POINTS.easy,
    category: "daily",
    priority: "high",
  },
  {
    title: "Tidy Living Room",
    description: "Put away items and organize common areas",
    difficulty: "easy",
    points: DIFFICULTY_POINTS.easy,
    category: "daily",
    priority: "low",
  },
  {
    title: "Clean Kitchen",
    description: "Wash dishes, wipe counters, and clean surfaces",
    difficulty: "medium",
    points: DIFFICULTY_POINTS.medium,
    category: "daily",
    priority: "high",
  },
  {
    title: "Sweep Floors",
    description: "Sweep high-traffic areas like kitchen and entryway",
    difficulty: "medium",
    points: DIFFICULTY_POINTS.medium,
    category: "daily",
    priority: "medium",
  },
  {
    title: "Water Plants",
    description: "Water indoor plants as needed",
    difficulty: "medium",
    points: DIFFICULTY_POINTS.medium,
    category: "daily",
    priority: "low",
  },

  // ===== WEEKLY CHORES =====
  {
    title: "Change Bed Sheets",
    description: "Remove old sheets and put on fresh bedding",
    difficulty: "easy",
    points: DIFFICULTY_POINTS.easy,
    category: "weekly",
    priority: "medium",
  },
  {
    title: "Take Out All Trash",
    description: "Collect trash from all rooms and take to bins",
    difficulty: "easy",
    points: DIFFICULTY_POINTS.easy,
    category: "weekly",
    priority: "high",
  },
  {
    title: "Clean Mirrors and Windows",
    description: "Wipe down mirrors and clean windows",
    difficulty: "easy",
    points: DIFFICULTY_POINTS.easy,
    category: "weekly",
    priority: "low",
  },
  {
    title: "Sort Mail and Papers",
    description: "Organize mail, file important papers, and recycle junk",
    difficulty: "easy",
    points: DIFFICULTY_POINTS.easy,
    category: "weekly",
    priority: "medium",
  },
  {
    title: "Do Laundry",
    description: "Wash, dry, fold, and put away clothes",
    difficulty: "medium",
    points: DIFFICULTY_POINTS.medium,
    category: "weekly",
    priority: "high",
  },
  {
    title: "Vacuum Floors",
    description: "Vacuum carpets and rugs throughout the house",
    difficulty: "medium",
    points: DIFFICULTY_POINTS.medium,
    category: "weekly",
    priority: "medium",
  },
  {
    title: "Clean Bathroom",
    description: "Scrub toilet, sink, shower, and wipe down surfaces",
    difficulty: "medium",
    points: DIFFICULTY_POINTS.medium,
    category: "weekly",
    priority: "medium",
  },
  {
    title: "Mow Lawn / Yard Work",
    description: "Mow grass, trim edges, and maintain yard",
    difficulty: "medium",
    points: DIFFICULTY_POINTS.medium,
    category: "weekly",
    priority: "low",
  },
  {
    title: "Grocery Shopping",
    description: "Plan meals, make shopping list, and buy groceries",
    difficulty: "medium",
    points: DIFFICULTY_POINTS.medium,
    category: "weekly",
    priority: "high",
  },
  {
    title: "Clean Out Fridge",
    description: "Throw away expired food and wipe down shelves",
    difficulty: "medium",
    points: DIFFICULTY_POINTS.medium,
    category: "weekly",
    priority: "medium",
  },
  {
    title: "Deep Clean Kitchen",
    description: "Clean appliances, scrub surfaces, and organize pantry",
    difficulty: "hard",
    points: DIFFICULTY_POINTS.hard,
    category: "weekly",
    priority: "medium",
  },
  {
    title: "Organize and Declutter",
    description: "Go through rooms and organize or donate unused items",
    difficulty: "hard",
    points: DIFFICULTY_POINTS.hard,
    category: "weekly",
    priority: "low",
  },

  // ===== MONTHLY CHORES =====
  {
    title: "Change Light Bulbs",
    description: "Replace any burnt out light bulbs",
    difficulty: "easy",
    points: DIFFICULTY_POINTS.easy,
    category: "monthly",
    priority: "low",
  },
  {
    title: "Wash Blankets and Pillows",
    description: "Wash throw blankets, decorative pillows, and comforters",
    difficulty: "easy",
    points: DIFFICULTY_POINTS.easy,
    category: "monthly",
    priority: "low",
  },
  {
    title: "Clean Air Vents",
    description: "Dust and clean air vents and filters",
    difficulty: "easy",
    points: DIFFICULTY_POINTS.easy,
    category: "monthly",
    priority: "low",
  },
  {
    title: "Deep Clean Oven",
    description: "Clean inside of oven and stovetop thoroughly",
    difficulty: "medium",
    points: DIFFICULTY_POINTS.medium,
    category: "monthly",
    priority: "medium",
  },
  {
    title: "Wash Windows",
    description: "Clean all windows inside and out",
    difficulty: "medium",
    points: DIFFICULTY_POINTS.medium,
    category: "monthly",
    priority: "low",
  },
  {
    title: "Deep Clean Carpets",
    description: "Vacuum thoroughly and spot clean carpets",
    difficulty: "medium",
    points: DIFFICULTY_POINTS.medium,
    category: "monthly",
    priority: "low",
  },
  {
    title: "Organize Pantry",
    description: "Sort food items, check expiration dates, and organize shelves",
    difficulty: "medium",
    points: DIFFICULTY_POINTS.medium,
    category: "monthly",
    priority: "medium",
  },
  {
    title: "Organize Closet",
    description: "Sort clothes, donate unused items, and organize wardrobe",
    difficulty: "hard",
    points: DIFFICULTY_POINTS.hard,
    category: "monthly",
    priority: "low",
  },
  {
    title: "Deep Clean Entire House",
    description: "Thoroughly clean all rooms, including baseboards and corners",
    difficulty: "hard",
    points: DIFFICULTY_POINTS.hard,
    category: "monthly",
    priority: "low",
  },
  {
    title: "Organize Garage / Storage",
    description: "Sort tools, organize storage, and clean garage or storage area",
    difficulty: "hard",
    points: DIFFICULTY_POINTS.hard,
    category: "monthly",
    priority: "low",
  },

  // ===== SEASONAL CHORES =====
  {
    title: "Change Seasonal Decorations",
    description: "Update decorations to match the current season",
    difficulty: "easy",
    points: DIFFICULTY_POINTS.easy,
    category: "seasonal",
    priority: "low",
  },
  {
    title: "Switch Seasonal Clothes",
    description: "Put away off-season clothes and bring out current season items",
    difficulty: "easy",
    points: DIFFICULTY_POINTS.easy,
    category: "seasonal",
    priority: "low",
  },
  {
    title: "Seasonal Yard Work",
    description: "Plant seasonal flowers, trim bushes, and maintain landscaping",
    difficulty: "medium",
    points: DIFFICULTY_POINTS.medium,
    category: "seasonal",
    priority: "medium",
  },
  {
    title: "Service HVAC System",
    description: "Change air filters and have HVAC system checked",
    difficulty: "medium",
    points: DIFFICULTY_POINTS.medium,
    category: "seasonal",
    priority: "high",
  },
  {
    title: "Deep Seasonal Cleaning",
    description: "Complete deep cleaning of all areas, including neglected spaces",
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

// Admin setup mutation - seeds chores (requires admin authentication)
export const adminSeedChores = mutation({
  args: {
    householdId: v.id("households"),
    category: v.optional(v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly"), v.literal("seasonal"))),
    clearExisting: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // SECURITY: Require authentication
    const userId = await getCurrentUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Verify household exists
    const household = await ctx.db.get(args.householdId);
    if (!household) {
      throw new Error("Household not found");
    }

    // SECURITY: Verify user is admin of this household
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household_user", (q) => q.eq("householdId", args.householdId).eq("userId", userId as any))
      .first();

    if (!membership || membership.role !== "admin") {
      throw new Error("Not authorized: Only household admins can seed chores");
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