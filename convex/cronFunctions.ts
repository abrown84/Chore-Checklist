import { internalMutation } from "./_generated/server";
// import { internalQuery } from "./_generated/server";
// import { v } from "convex/values";

// Internal mutation: Reset daily chores
export const resetDailyChores = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    // const todayStart = today.getTime();

    // Get all daily chores that are completed
    const completedDailyChores = await ctx.db
      .query("chores")
      .withIndex("by_category", (q) => q.eq("category", "daily"))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    // Reset completed daily chores to pending
    for (const chore of completedDailyChores) {
      // Set new due date for tomorrow
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(23, 59, 59, 999); // End of tomorrow

      await ctx.db.patch(chore._id, {
        status: "pending",
        completedAt: undefined,
        completedBy: undefined,
        finalPoints: undefined,
        bonusMessage: undefined,
        dueDate: tomorrow.getTime(),
        updatedAt: now,
      });
    }

    console.log(`Reset ${completedDailyChores.length} daily chores`);
    return { resetCount: completedDailyChores.length };
  },
});

// Internal mutation: Reset weekly chores
export const resetWeeklyChores = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    // Get all weekly chores that are completed
    const completedWeeklyChores = await ctx.db
      .query("chores")
      .withIndex("by_category", (q) => q.eq("category", "weekly"))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    // Reset completed weekly chores to pending
    for (const chore of completedWeeklyChores) {
      // Set new due date for next week
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      nextWeek.setHours(23, 59, 59, 999); // End of next week

      await ctx.db.patch(chore._id, {
        status: "pending",
        completedAt: undefined,
        completedBy: undefined,
        finalPoints: undefined,
        bonusMessage: undefined,
        dueDate: nextWeek.getTime(),
        updatedAt: now,
      });
    }

    console.log(`Reset ${completedWeeklyChores.length} weekly chores`);
    return { resetCount: completedWeeklyChores.length };
  },
});

// Internal mutation: Reset monthly chores
export const resetMonthlyChores = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    // Get all monthly chores that are completed
    const completedMonthlyChores = await ctx.db
      .query("chores")
      .withIndex("by_category", (q) => q.eq("category", "monthly"))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    // Reset completed monthly chores to pending
    for (const chore of completedMonthlyChores) {
      // Set new due date for next month
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      nextMonth.setHours(23, 59, 59, 999); // End of next month

      await ctx.db.patch(chore._id, {
        status: "pending",
        completedAt: undefined,
        completedBy: undefined,
        finalPoints: undefined,
        bonusMessage: undefined,
        dueDate: nextMonth.getTime(),
        updatedAt: now,
      });
    }

    console.log(`Reset ${completedMonthlyChores.length} monthly chores`);
    return { resetCount: completedMonthlyChores.length };
  },
});

// Internal mutation: Cleanup expired level persistence
export const cleanupExpiredLevelPersistence = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    // Get all user stats with expired level persistence
    const allStats = await ctx.db
      .query("userStats")
      .collect();

    let cleanedCount = 0;
    
    for (const stat of allStats) {
      if (stat.levelPersistenceInfo && stat.levelPersistenceInfo.expiresAt < now) {
        // Clear expired level persistence
        await ctx.db.patch(stat._id, {
          levelPersistenceInfo: undefined,
          updatedAt: now,
        });
        cleanedCount++;
      }
    }

    console.log(`Cleaned up ${cleanedCount} expired level persistence records`);
    return { cleanedCount };
  },
});

// Internal mutation: Recalculate stats for active households
export const recalculateActiveHouseholdStats = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    
    // Get households with recent activity (completions in last 24 hours)
    const recentCompletions = await ctx.db
      .query("choreCompletions")
      .withIndex("by_completed_at", (q) => q.gte("completedAt", oneDayAgo))
      .collect();

    const activeHouseholdIds = new Set(
      recentCompletions.map(completion => completion.householdId)
    );

    let recalculatedCount = 0;
    
    // Recalculate stats for each active household
    for (const householdId of activeHouseholdIds) {
      // Get all users in this household
      const members = await ctx.db
        .query("householdMembers")
        .withIndex("by_household", (q) => q.eq("householdId", householdId))
        .collect();

      // Recalculate stats for each member
      for (const member of members) {
        try {
          await recalculateUserStatsInternal(ctx, member.userId, householdId);
          recalculatedCount++;
        } catch (error) {
          console.error(`Error recalculating stats for user ${member.userId}:`, error);
        }
      }
    }

    console.log(`Recalculated stats for ${recalculatedCount} users in ${activeHouseholdIds.size} households`);
    return { recalculatedCount, householdCount: activeHouseholdIds.size };
  },
});

// Helper function: Recalculate user stats (internal version)
async function recalculateUserStatsInternal(ctx: any, userId: string, householdId: string) {
  const user = await ctx.db.get(userId);
  if (!user) return;

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
  };

  // Check if stats already exist
  const existingStats = await ctx.db
    .query("userStats")
    .withIndex("by_user_household", (q: any) => q.eq("userId", userId).eq("householdId", householdId))
    .first();

  if (existingStats) {
    await ctx.db.patch(existingStats._id, stats);
  } else {
    await ctx.db.insert("userStats", stats);
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
