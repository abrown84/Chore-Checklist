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
      // Set new due date for tomorrow at 6:00 PM
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(18, 0, 0, 0); // 6:00 PM tomorrow

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
      // Set new due date for next week at 6:00 PM
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      nextWeek.setHours(18, 0, 0, 0); // 6:00 PM next week

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
      nextMonth.setHours(18, 0, 0, 0); // 6:00 PM next month

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

// Internal mutation: Reset seasonal chores
export const resetSeasonalChores = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    // Only run on first day of each quarter (Jan 1, Apr 1, Jul 1, Oct 1)
    const month = today.getMonth(); // 0 = Jan, 3 = Apr, 6 = Jul, 9 = Oct
    if (month !== 0 && month !== 3 && month !== 6 && month !== 9) {
      console.log(`Skipping seasonal reset - not a quarter start month (current month: ${month + 1})`);
      return { resetCount: 0, skipped: true };
    }
    
    // Get all seasonal chores that are completed
    const completedSeasonalChores = await ctx.db
      .query("chores")
      .withIndex("by_category", (q) => q.eq("category", "seasonal"))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    // Reset completed seasonal chores to pending
    for (const chore of completedSeasonalChores) {
      // Set new due date for next season (3 months)
      const nextSeason = new Date(today);
      nextSeason.setMonth(nextSeason.getMonth() + 3);
      nextSeason.setHours(18, 0, 0, 0); // 6:00 PM next season

      await ctx.db.patch(chore._id, {
        status: "pending",
        completedAt: undefined,
        completedBy: undefined,
        finalPoints: undefined,
        bonusMessage: undefined,
        dueDate: nextSeason.getTime(),
        updatedAt: now,
      });
    }

    console.log(`Reset ${completedSeasonalChores.length} seasonal chores`);
    return { resetCount: completedSeasonalChores.length };
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
  // Include chores that are assigned to the user OR completed by the user
  const allHouseholdChores = await ctx.db
    .query("chores")
    .withIndex("by_household", (q: any) => q.eq("householdId", householdId))
    .collect();

  const userChores = allHouseholdChores.filter((chore: any) => 
    chore.assignedTo === userId || chore.completedBy === userId
  );

  // Get all chore completions for this user in this household
  const completions = await ctx.db
    .query("choreCompletions")
    .withIndex("by_user_household", (q: any) => q.eq("userId", userId).eq("householdId", householdId))
    .collect();

  const completedChores = userChores.filter((chore: any) => 
    chore.status === "completed" && chore.completedBy === userId
  );
  
  // Calculate lifetime points (all points ever earned)
  // Includes: completed chores + incomplete chores with finalPoints (from resets)
  const lifetimePoints = userChores.reduce((sum: number, chore: any) => {
    const points = chore.finalPoints || chore.points || 0;
    
    // Count points from completed chores
    if (chore.status === "completed" && chore.completedBy === userId) {
      return sum + points;
    }
    
    // Count points from incomplete chores that have finalPoints (chores that were reset)
    if (chore.status !== "completed" && chore.finalPoints !== undefined && chore.finalPoints !== null) {
      return sum + points;
    }
    
    return sum;
  }, 0);

  // Get approved redemption requests for this user in this household
  // This is the source of truth for redeemed points
  // IMPORTANT: Query by household first, then filter by user and status
  // to ensure we only get redemptions from THIS household
  const allHouseholdRedemptions = await ctx.db
    .query("redemptionRequests")
    .withIndex("by_household", (q: any) => q.eq("householdId", householdId))
    .collect();

  // Filter to only approved redemptions for this user in this household
  const householdRedemptions = allHouseholdRedemptions.filter(
    (req: any) => req.userId === userId && req.status === "approved"
  );
  const pointsRedeemed = householdRedemptions.reduce(
    (sum: number, req: any) => sum + (req.pointsRequested || 0),
    0
  );

  // Earned points = lifetime points minus points redeemed (current usable points)
  const earnedPoints = Math.max(0, lifetimePoints - pointsRedeemed);

  // Calculate total points (for display purposes)
  const totalPoints = userChores.reduce((sum: number, chore: any) => {
    return sum + (chore.finalPoints || chore.points || 0);
  }, 0);

  // Calculate streaks
  const { currentStreak, longestStreak } = calculateStreaks(completions);

  // Calculate level - MUST MATCH frontend LEVELS in src/types/chore.ts
  const LEVELS = [
    { level: 1, pointsRequired: 0 },
    { level: 2, pointsRequired: 25 },
    { level: 3, pointsRequired: 75 },
    { level: 4, pointsRequired: 150 },
    { level: 5, pointsRequired: 300 },
    { level: 6, pointsRequired: 500 },
    { level: 7, pointsRequired: 1000 },
    { level: 8, pointsRequired: 2000 },
    { level: 9, pointsRequired: 3500 },
    { level: 10, pointsRequired: 5000 },
  ];

  // Calculate level based on lifetime points (all points ever earned)
  let currentLevel = 1;
  let currentLevelPoints = lifetimePoints;
  let pointsToNextLevel = 25; // Default to Level 2 requirement (25 points)

  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (lifetimePoints >= LEVELS[i].pointsRequired) {
      currentLevel = LEVELS[i].level;
      currentLevelPoints = lifetimePoints - LEVELS[i].pointsRequired;
      if (i < LEVELS.length - 1) {
        pointsToNextLevel = LEVELS[i + 1].pointsRequired - lifetimePoints;
      } else {
        pointsToNextLevel = 0;
      }
      break;
    }
  }

  // Calculate efficiency score - pass completions and longestStreak for accurate calculation
  const efficiencyScore = calculateEfficiencyScore(userChores, completedChores, completions, longestStreak);

  // Calculate seasonal stats
  const now = Date.now();
  const currentDate = new Date(now);
  const currentMonth = currentDate.getMonth() + 1; // 1-12
  const currentDay = currentDate.getDate();
  
  // Determine current season
  let currentSeasonName: string;
  let seasonYear: number;
  if ((currentMonth === 3 && currentDay >= 20) || currentMonth === 4 || currentMonth === 5 || (currentMonth === 6 && currentDay < 21)) {
    currentSeasonName = 'Spring';
    seasonYear = currentDate.getFullYear();
  } else if ((currentMonth === 6 && currentDay >= 21) || currentMonth === 7 || currentMonth === 8 || (currentMonth === 9 && currentDay < 22)) {
    currentSeasonName = 'Summer';
    seasonYear = currentDate.getFullYear();
  } else if ((currentMonth === 9 && currentDay >= 22) || currentMonth === 10 || currentMonth === 11 || (currentMonth === 12 && currentDay < 21)) {
    currentSeasonName = 'Fall';
    seasonYear = currentDate.getFullYear();
  } else {
    currentSeasonName = 'Winter';
    if (currentMonth === 12 && currentDay >= 21) {
      seasonYear = currentDate.getFullYear();
    } else {
      seasonYear = currentDate.getFullYear() - 1; // Winter started last year
    }
  }
  const currentSeason = `${currentSeasonName} ${seasonYear}`;
  
  // Calculate seasonal points (points from chores completed in current season)
  // Get season start and end dates
  let seasonStart: Date;
  let seasonEnd: Date;
  if (currentSeasonName === 'Spring') {
    seasonStart = new Date(seasonYear, 2, 20); // March 20
    seasonEnd = new Date(seasonYear, 5, 20); // June 20
  } else if (currentSeasonName === 'Summer') {
    seasonStart = new Date(seasonYear, 5, 21); // June 21
    seasonEnd = new Date(seasonYear, 8, 21); // September 21
  } else if (currentSeasonName === 'Fall') {
    seasonStart = new Date(seasonYear, 8, 22); // September 22
    seasonEnd = new Date(seasonYear, 11, 20); // December 20
  } else {
    // Winter
    if (currentMonth === 12 && currentDay >= 21) {
      seasonStart = new Date(seasonYear, 11, 21); // December 21
      seasonEnd = new Date(seasonYear + 1, 2, 19); // March 19 next year
    } else {
      seasonStart = new Date(seasonYear, 11, 21); // December 21 last year
      seasonEnd = new Date(seasonYear + 1, 2, 19); // March 19 this year
    }
  }
  
  const seasonStartTime = seasonStart.getTime();
  const seasonEndTime = seasonEnd.getTime();
  
  // Calculate seasonal points from completions in current season
  const seasonalCompletions = completions.filter((c: any) => {
    const completedAt = c.completedAt;
    return completedAt >= seasonStartTime && completedAt <= seasonEndTime;
  });
  
  // Get seasonal points from completed chores in this season
  const seasonalPoints = seasonalCompletions.reduce((sum: number, completion: any) => {
    const chore = userChores.find((c: any) => c._id === completion.choreId);
    if (chore && chore.status === 'completed') {
      return sum + (chore.finalPoints || chore.points || 0);
    }
    return sum;
  }, 0);
  
  // Calculate seasonal level based on seasonal points
  let seasonalLevel = 1;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (seasonalPoints >= LEVELS[i].pointsRequired) {
      seasonalLevel = LEVELS[i].level;
      break;
    }
  }

  const stats = {
    userId,
    householdId,
    totalChores: userChores.length,
    completedChores: completedChores.length,
    totalPoints,
    lifetimePoints, // Total points ever earned
    earnedPoints, // Current usable points (lifetimePoints - deductions)
    currentStreak,
    longestStreak,
    currentLevel,
    currentLevelPoints,
    pointsToNextLevel,
    efficiencyScore,
    seasonalPoints, // Points earned in current season
    seasonalLevel, // Level based on seasonal points
    currentSeason, // Current season identifier
    lastActive: user.lastActive,
    updatedAt: now,
  };

  // Check if stats already exist
  const existingStats = await ctx.db
    .query("userStats")
    .withIndex("by_user_household", (q: any) => q.eq("userId", userId).eq("householdId", householdId))
    .first();

  if (existingStats) {
    // Don't include _creationTime when patching - it's a system field
    await ctx.db.patch(existingStats._id, stats);
  } else {
    // Insert new record - Convex automatically manages _creationTime, don't include it
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
// MUST MATCH frontend calculateEfficiencyScore in src/utils/statsCalculations.ts
function calculateEfficiencyScore(userChores: any[], completedChores: any[], completions: any[] = [], longestStreak: number = 0) {
  if (userChores.length === 0) return 0;

  // 1. Lifetime Completion Rate (30% weight) - Most important factor
  const completionRate = completedChores.length / userChores.length;
  
  // 2. Lifetime Timeliness Score (25% weight) - Rewards consistent early completion over time
  let timelinessScore = 0;
  let totalTimeliness = 0;
  let validTimelinessChores = 0;
  
  // Use completions table if available for more accurate timeliness data
  if (completions.length > 0) {
    completions.forEach((completion: any) => {
      const chore = userChores.find((c: any) => c._id === completion.choreId);
      if (chore && chore.dueDate) {
        const completedDate = completion.completedAt;
        const dueDate = chore.dueDate;
        const timeDiff = dueDate - completedDate;
        const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
        
        // Reward early completion, penalize late completion
        if (daysDiff > 0) {
          // Completed early - reward up to +1
          totalTimeliness += Math.min(1, daysDiff / 7); // Cap at 1 week early
        } else if (daysDiff < 0) {
          // Completed late - penalize up to -1
          totalTimeliness += Math.max(-1, daysDiff / 7); // Cap at 1 week late
        }
        validTimelinessChores++;
      }
    });
  } else {
    // Fallback to using chore data directly
    completedChores.forEach((chore: any) => {
      if (chore.completedAt && chore.dueDate) {
        const completedDate = chore.completedAt;
        const dueDate = chore.dueDate;
        const timeDiff = dueDate - completedDate;
        const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
        
        if (daysDiff > 0) {
          totalTimeliness += Math.min(1, daysDiff / 7);
        } else if (daysDiff < 0) {
          totalTimeliness += Math.max(-1, daysDiff / 7);
        }
        validTimelinessChores++;
      }
    });
  }
  
  timelinessScore = validTimelinessChores > 0 ? totalTimeliness / validTimelinessChores : 0;
  
  // 3. Difficulty Balance (20% weight) - Rewards tackling harder chores
  const difficultyDistribution: Record<string, number> = {};
  completedChores.forEach((chore: any) => {
    const difficulty = chore.difficulty || 'medium';
    difficultyDistribution[difficulty] = (difficultyDistribution[difficulty] || 0) + 1;
  });
  
  const totalCompleted = completedChores.length;
  const difficultyBalance = totalCompleted > 0 ? (
    ((difficultyDistribution.hard || 0) * 1.5 + 
     (difficultyDistribution.medium || 0) * 1.0 + 
     (difficultyDistribution.easy || 0) * 0.5) / totalCompleted
  ) : 0;
  
  // 4. Streak Consistency (15% weight) - Rewards maintaining streaks
  const streakConsistency = totalCompleted > 0 ? Math.min(1, longestStreak / totalCompleted) : 0;
  
  // 5. Points Efficiency (10% weight) - Rewards earning more points from available chores
  const totalLifetimePoints = userChores.reduce((sum: number, c: any) => {
    const points = c.finalPoints || c.points || 0;
    
    // Count points from completed chores
    if (c.status === "completed") {
      return sum + points;
    }
    
    // Count points from incomplete chores that have finalPoints (chores that were reset)
    if (c.status !== "completed" && c.finalPoints !== undefined) {
      return sum + points;
    }
    
    return sum;
  }, 0);
  const totalPotentialPoints = userChores.reduce((sum: number, c: any) => sum + (c.points || 0), 0);
  const pointsEfficiency = totalPotentialPoints > 0 ? totalLifetimePoints / totalPotentialPoints : 0;
  
  // Calculate weighted lifetime efficiency score (0-100 scale)
  const efficiencyScore = (
    completionRate * 30 +
    (timelinessScore + 1) * 12.5 + // Normalize timeliness to 0-2 range, then scale
    difficultyBalance * 20 +
    streakConsistency * 15 +
    pointsEfficiency * 10
  );
  
  return Math.round(efficiencyScore * 100) / 100;
}
