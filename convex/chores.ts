import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Query: Get chores for a household
export const getChoresByHousehold = query({
  args: {
    householdId: v.id("households"),
    status: v.optional(v.union(v.literal("pending"), v.literal("in_progress"), v.literal("completed"))),
    category: v.optional(v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly"), v.literal("seasonal"))),
    assignedTo: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const identity = await getAuthUserId(ctx);
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Verify user is member of household
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household_user", (q) => q.eq("householdId", args.householdId).eq("userId", identity))
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
    const identity = await getAuthUserId(ctx);
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const chore = await ctx.db.get(args.choreId);
    if (!chore) {
      throw new Error("Chore not found");
    }

    // Verify user is member of household
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household_user", (q) => q.eq("householdId", chore.householdId).eq("userId", identity))
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
    const identity = await getAuthUserId(ctx);
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Verify user is member of household
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household_user", (q) => q.eq("householdId", args.householdId).eq("userId", identity))
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
    const identity = await getAuthUserId(ctx);
    if (!identity) {
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
      .withIndex("by_household_user", (q) => q.eq("householdId", chore.householdId).eq("userId", identity))
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
        points: user.points + finalPoints,
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
    const identity = await getAuthUserId(ctx);
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const chore = await ctx.db.get(args.choreId);
    if (!chore) {
      throw new Error("Chore not found");
    }

    // Verify user is member of household
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household_user", (q) => q.eq("householdId", chore.householdId).eq("userId", identity))
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
    const identity = await getAuthUserId(ctx);
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const chore = await ctx.db.get(args.choreId);
    if (!chore) {
      throw new Error("Chore not found");
    }

    // Verify user is member of household
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household_user", (q) => q.eq("householdId", chore.householdId).eq("userId", identity))
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
    const identity = await getAuthUserId(ctx);
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Verify user is member of household
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household_user", (q) => q.eq("householdId", args.householdId).eq("userId", identity))
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
