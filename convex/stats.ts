import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Query: Get user stats for a household
export const getUserStats = query({
  args: {
    userId: v.id("users"),
    householdId: v.id("households"),
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

    // Get or create user stats
    let userStats = await ctx.db
      .query("userStats")
      .withIndex("by_user_household", (q) => q.eq("userId", args.userId).eq("householdId", args.householdId))
      .first();

    if (!userStats) {
      // Calculate stats if they don't exist
      userStats = await calculateUserStats(ctx, args.userId, args.householdId);
    }

    return userStats;
  },
});

// Query: Get all user stats for a household (leaderboard)
export const getHouseholdStats = query({
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

    // Get all user stats for this household
    const allStats = await ctx.db
      .query("userStats")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    // Sort by points (descending)
    return allStats.sort((a, b) => b.earnedPoints - a.earnedPoints);
  },
});

// Query: Get efficiency leaderboard
export const getEfficiencyLeaderboard = query({
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

    // Get all user stats for this household
    const allStats = await ctx.db
      .query("userStats")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    // Sort by efficiency score (descending)
    return allStats.sort((a, b) => b.efficiencyScore - a.efficiencyScore);
  },
});

// Query: Get recent activity
export const getRecentActivity = query({
  args: {
    householdId: v.id("households"),
    limit: v.optional(v.number()),
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

    const limit = args.limit || 20;
    
    // Get recent chore completions
    const recentCompletions = await ctx.db
      .query("choreCompletions")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .order("desc")
      .take(limit);

    // Get user info for each completion
    const activity = await Promise.all(
      recentCompletions.map(async (completion) => {
        const user = await ctx.db.get(completion.userId);
        const chore = await ctx.db.get(completion.choreId);
        
        return {
          _id: completion._id,
          userId: completion.userId,
          userName: user?.name || "Unknown",
          choreTitle: chore?.title || "Unknown Chore",
          pointsEarned: completion.pointsEarned,
          completedAt: completion.completedAt,
          bonusMessage: completion.bonusMessage,
          isEarly: completion.isEarly,
          isLate: completion.isLate,
        };
      })
    );

    return activity;
  },
});

// Mutation: Recalculate user stats
export const recalculateUserStats = mutation({
  args: {
    userId: v.id("users"),
    householdId: v.id("households"),
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

    const newStats = await calculateUserStats(ctx, args.userId, args.householdId);
    return newStats;
  },
});

// Helper function: Calculate user stats
async function calculateUserStats(ctx: any, userId: any, householdId: any) {
  const user = await ctx.db.get(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Get all chores for this user in this household
  const userChores = await ctx.db
    .query("chores")
    .withIndex("by_household", (q: any) => q.eq("householdId", householdId))
    .filter((q: any) => q.eq(q.field("assignedTo"), userId))
    .collect();

  // Get all chore completions for this user in this household
  const completions = await ctx.db
    .query("choreCompletions")
    .withIndex("by_user_household", (q: any) => q.eq("userId", userId).eq("householdId", householdId))
    .collect();

  const completedChores = userChores.filter((chore: any) => chore.status === "completed");
  
  // Calculate points
  const totalPoints = userChores.reduce((sum: number, chore: any) => {
    return sum + (chore.finalPoints || chore.points);
  }, 0);

  const earnedPoints = completedChores.reduce((sum: number, chore: any) => {
    return sum + (chore.finalPoints || chore.points);
  }, 0);

  // Calculate streaks
  const { currentStreak, longestStreak } = calculateStreaks(completions);

  // Calculate level
  const LEVELS = [
    { level: 1, pointsRequired: 0 },
    { level: 2, pointsRequired: 100 },
    { level: 3, pointsRequired: 250 },
    { level: 4, pointsRequired: 500 },
    { level: 5, pointsRequired: 1000 },
    { level: 6, pointsRequired: 2000 },
    { level: 7, pointsRequired: 3500 },
    { level: 8, pointsRequired: 5500 },
    { level: 9, pointsRequired: 8000 },
    { level: 10, pointsRequired: 12000 },
  ];

  let currentLevel = 1;
  let currentLevelPoints = earnedPoints;
  let pointsToNextLevel = 100;

  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (earnedPoints >= LEVELS[i].pointsRequired) {
      currentLevel = LEVELS[i].level;
      currentLevelPoints = earnedPoints - LEVELS[i].pointsRequired;
      if (i < LEVELS.length - 1) {
        pointsToNextLevel = LEVELS[i + 1].pointsRequired - earnedPoints;
      } else {
        pointsToNextLevel = 0;
      }
      break;
    }
  }

  // Calculate efficiency score
  const efficiencyScore = calculateEfficiencyScore(userChores, completedChores);

  const now = Date.now();
  const stats = {
    userId,
    householdId,
    totalChores: userChores.length,
    completedChores: completedChores.length,
    totalPoints,
    earnedPoints,
    currentStreak,
    longestStreak,
    currentLevel,
    currentLevelPoints,
    pointsToNextLevel,
    efficiencyScore,
    lastActive: user.lastActive,
    updatedAt: now,
    _creationTime: now,
  };

  // Check if stats already exist
  const existingStats = await ctx.db
    .query("userStats")
    .withIndex("by_user_household", (q: any) => q.eq("userId", userId).eq("householdId", householdId))
    .first();

  if (existingStats) {
    await ctx.db.patch(existingStats._id, stats);
    return { ...stats, _id: existingStats._id };
  } else {
    const statsId = await ctx.db.insert("userStats", stats);
    return { ...stats, _id: statsId };
  }
}

// Helper function: Calculate streaks
function calculateStreaks(completions: any[]) {
  if (completions.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Sort completions by date (newest first)
  const sortedCompletions = completions.sort((a, b) => b.completedAt - a.completedAt);
  
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (const completion of sortedCompletions) {
    const completionDate = new Date(completion.completedAt);
    completionDate.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - completionDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) {
      tempStreak++;
      currentStreak = Math.max(currentStreak, tempStreak);
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 0;
    }
  }
  
  longestStreak = Math.max(longestStreak, tempStreak);
  
  return { currentStreak, longestStreak };
}

// Helper function: Calculate efficiency score
function calculateEfficiencyScore(userChores: any[], completedChores: any[]) {
  if (userChores.length === 0) return 0;
  
  const completionRate = completedChores.length / userChores.length;
  const averagePoints = completedChores.reduce((sum, chore) => sum + (chore.finalPoints || chore.points), 0) / Math.max(completedChores.length, 1);
  
  // Efficiency score combines completion rate and average points
  return Math.round((completionRate * 50) + (averagePoints / 10));
}
