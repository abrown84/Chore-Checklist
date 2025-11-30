import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { getCurrentUserId } from "./authHelpers";

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
    const userId = await getCurrentUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household_user", (q) => q.eq("householdId", args.householdId).eq("userId", userId as any))
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
    const userId = await getCurrentUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household_user", (q) => q.eq("householdId", args.householdId).eq("userId", userId as any))
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
    const userId = await getCurrentUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household_user", (q) => q.eq("householdId", args.householdId).eq("userId", userId as any))
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

// Query: Get global leaderboard (all households aggregated by total points)
export const getGlobalLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const identity = await getAuthUserId(ctx);
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = await getCurrentUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get all households
    const allHouseholds = await ctx.db
      .query("households")
      .collect();

    console.log(`[getGlobalLeaderboard] Found ${allHouseholds.length} households`);

    // Calculate total points for each household
    const householdLeaderboard: any[] = [];

    for (const household of allHouseholds) {
      console.log(`[getGlobalLeaderboard] Processing household: ${household.name} (${household._id})`);
      // Get all members of this household
      const memberships = await ctx.db
        .query("householdMembers")
        .withIndex("by_household", (q: any) => q.eq("householdId", household._id))
        .collect();

      console.log(`[getGlobalLeaderboard] Found ${memberships.length} memberships for household ${household.name}`);
      
      if (memberships.length === 0) {
        console.log(`[getGlobalLeaderboard] Skipping household ${household.name} - no members`);
        continue;
      }

      // Sum up points from all members
      let totalHouseholdPoints = 0;
      let totalChores = 0;
      let completedChores = 0;
      let totalEfficiencyScore = 0;
      let memberCount = 0;
      const memberDetails: any[] = [];

      for (const membership of memberships) {
        const user = await ctx.db.get(membership.userId);
        if (!user) {
          console.log(`[getGlobalLeaderboard] User ${membership.userId} not found`);
          continue;
        }

        // Get user stats first (we'll use it for points fallback and metrics)
        const userStats = await ctx.db
          .query("userStats")
          .withIndex("by_user_household", (q: any) => 
            q.eq("userId", membership.userId).eq("householdId", household._id))
          .first();

        // Try to get points from user.points first, then fall back to userStats or calculate from completions
        let userPoints = user.points || 0;
        
        // If user.points is 0, try to get from userStats
        if (userPoints === 0 && userStats && userStats.earnedPoints > 0) {
          userPoints = userStats.earnedPoints;
          console.log(`[getGlobalLeaderboard] Using userStats.earnedPoints for ${user.name}: ${userPoints}`);
        } else if (userPoints === 0) {
          // Calculate from chore completions as last resort
          const completions = await ctx.db
            .query("choreCompletions")
            .withIndex("by_user_household", (q: any) => 
              q.eq("userId", membership.userId).eq("householdId", household._id))
            .collect();
          
          const calculatedPoints = completions.reduce((sum, c) => sum + (c.pointsEarned || 0), 0);
          if (calculatedPoints > 0) {
            userPoints = calculatedPoints;
            console.log(`[getGlobalLeaderboard] Calculated points from completions for ${user.name}: ${userPoints}`);
          }
        }
        
        console.log(`[getGlobalLeaderboard] User ${user.name || membership.userId}: ${userPoints} points (from user.points: ${user.points || 0})`);
        totalHouseholdPoints += userPoints;

        // Use user stats for additional metrics
        if (userStats) {
          totalChores += userStats.totalChores || 0;
          completedChores += userStats.completedChores || 0;
          totalEfficiencyScore += userStats.efficiencyScore || 0;
        }

        // Extract first name from signup name
        const getFirstName = (fullName: string | undefined | null): string => {
          if (!fullName) return `User ${membership.userId.slice(0, 8)}`;
          // Split by space and take the first part
          const firstName = fullName.trim().split(/\s+/)[0];
          return firstName || `User ${membership.userId.slice(0, 8)}`;
        };
        
        memberDetails.push({
          userId: membership.userId,
          name: getFirstName(user.name),
          points: userPoints,
          level: user.level || 1,
        });

        memberCount++;
      }

      // Skip households with no points
      if (totalHouseholdPoints <= 0) {
        console.log(`[getGlobalLeaderboard] Skipping household ${household.name} - no points (${totalHouseholdPoints})`);
        continue;
      }
      
      console.log(`[getGlobalLeaderboard] Adding household ${household.name} with ${totalHouseholdPoints} points`);

      // Calculate average efficiency
      const averageEfficiency = memberCount > 0 ? totalEfficiencyScore / memberCount : 0;

      householdLeaderboard.push({
        householdId: household._id,
        householdName: household.name,
        totalPoints: totalHouseholdPoints,
        earnedPoints: totalHouseholdPoints, // For compatibility with existing code
        memberCount,
        totalChores,
        completedChores,
        averageEfficiency,
        completionRate: totalChores > 0 ? (completedChores / totalChores) * 100 : 0,
        members: memberDetails,
        createdAt: household.createdAt,
      });
    }

    // Sort by total points (descending)
    const sorted = householdLeaderboard.sort((a, b) => b.totalPoints - a.totalPoints);
    console.log(`[getGlobalLeaderboard] Returning ${sorted.length} households`);
    console.log(`[getGlobalLeaderboard] Households summary:`, sorted.map(h => ({
      name: h.householdName,
      points: h.totalPoints,
      members: h.memberCount
    })));
    
    // If no households found, include debug info in the response
    if (sorted.length === 0) {
      console.log(`[getGlobalLeaderboard] DEBUG: No households with points found.`);
      console.log(`[getGlobalLeaderboard] DEBUG: Checked ${allHouseholds.length} total households.`);
      
      // Get some debug data to help diagnose
      const allMemberships = await ctx.db
        .query("householdMembers")
        .collect();
      
      const sampleUsers = await ctx.db
        .query("users")
        .take(3);
      
      const debugInfo = {
        totalHouseholds: allHouseholds.length,
        totalMemberships: allMemberships.length,
        householdNames: allHouseholds.map(h => h.name),
        sampleUsers: sampleUsers.map(u => ({
          name: u.name,
          points: u.points || 0,
          hasUserStats: false, // We'll check this
          earnedPoints: 0 // Will be set below
        })),
        message: "No households with points found. Check console logs for details."
      };
      
      // Check if sample users have userStats
      for (const user of sampleUsers) {
        const userStats = await ctx.db
          .query("userStats")
          .withIndex("by_user", (q: any) => q.eq("userId", user._id))
          .first();
        const userIndex = debugInfo.sampleUsers.findIndex(u => u.name === user.name);
        if (userIndex >= 0) {
          debugInfo.sampleUsers[userIndex].hasUserStats = !!userStats;
          if (userStats) {
            debugInfo.sampleUsers[userIndex].earnedPoints = userStats.earnedPoints || 0;
          }
        }
      }
      
      console.log(`[getGlobalLeaderboard] DEBUG Info:`, JSON.stringify(debugInfo, null, 2));
      
      // Return empty array but log debug info
      return sorted;
    }
    
    return sorted;
  },
});

// Query: Debug global leaderboard (temporary - for debugging)
// Note: This function doesn't require authentication for debugging purposes
export const debugGlobalLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    // No authentication required for debugging

    // Get all households
    const allHouseholds = await ctx.db
      .query("households")
      .collect();

    // Get all household members
    const allMemberships = await ctx.db
      .query("householdMembers")
      .collect();

    // Get sample users
    const sampleUsers = await ctx.db
      .query("users")
      .take(5);

    const debugInfo = {
      totalHouseholds: allHouseholds.length,
      totalMemberships: allMemberships.length,
      householdNames: allHouseholds.map(h => h.name),
      sampleUsers: sampleUsers.map(u => ({
        id: u._id,
        name: u.name,
        points: u.points || 0,
        email: u.email
      })),
      membershipsByHousehold: {} as Record<string, number>
    };

    // Count memberships per household
    for (const household of allHouseholds) {
      const count = allMemberships.filter(m => m.householdId === household._id).length;
      debugInfo.membershipsByHousehold[household.name] = count;
    }

    return debugInfo;
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
    const userId = await getCurrentUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household_user", (q) => q.eq("householdId", args.householdId).eq("userId", userId as any))
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
          userName: user?.name ? user.name.trim().split(/\s+/)[0] : `User ${user?._id?.slice(0, 8) || 'unknown'}`,
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
    const userId = await getCurrentUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household_user", (q) => q.eq("householdId", args.householdId).eq("userId", userId as any))
      .first();

    if (!membership) {
      throw new Error("Not a member of this household");
    }

    const newStats = await calculateUserStats(ctx, args.userId, args.householdId);
    return newStats;
  },
});

// Mutation: Set level persistence in userStats
export const setLevelPersistenceInStats = mutation({
  args: {
    userId: v.id("users"),
    householdId: v.id("households"),
    level: v.number(),
    pointsAtRedemption: v.number(),
    gracePeriodDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await getAuthUserId(ctx);
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Verify user is member of household
    const userId = await getCurrentUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household_user", (q) => q.eq("householdId", args.householdId).eq("userId", userId as any))
      .first();

    if (!membership) {
      throw new Error("Not a member of this household");
    }

    const gracePeriod = args.gracePeriodDays || 30;
    const expiresAt = Date.now() + (gracePeriod * 24 * 60 * 60 * 1000);

    // Get or create user stats
    let userStats = await ctx.db
      .query("userStats")
      .withIndex("by_user_household", (q) => q.eq("userId", args.userId).eq("householdId", args.householdId))
      .first();

    if (!userStats) {
      // Create stats if they don't exist
      userStats = await calculateUserStats(ctx, args.userId, args.householdId);
    }

    // Update level persistence info
    await ctx.db.patch(userStats._id, {
      levelPersistenceInfo: {
        level: args.level,
        expiresAt,
        pointsAtRedemption: args.pointsAtRedemption,
      },
      updatedAt: Date.now(),
    });

    return { success: true, expiresAt };
  },
});

// Mutation: Clear level persistence from userStats
export const clearLevelPersistenceFromStats = mutation({
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
    const userId = await getCurrentUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household_user", (q) => q.eq("householdId", args.householdId).eq("userId", userId as any))
      .first();

    if (!membership) {
      throw new Error("Not a member of this household");
    }

    // Get user stats
    const userStats = await ctx.db
      .query("userStats")
      .withIndex("by_user_household", (q) => q.eq("userId", args.userId).eq("householdId", args.householdId))
      .first();

    if (userStats) {
      await ctx.db.patch(userStats._id, {
        levelPersistenceInfo: undefined,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
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

  let currentLevel = 1;
  let currentLevelPoints = earnedPoints;
  let pointsToNextLevel = 25; // Default to Level 2 requirement (25 points)

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

  // Calculate efficiency score - pass completions and longestStreak for accurate calculation
  const efficiencyScore = calculateEfficiencyScore(userChores, completedChores, completions, longestStreak);

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
  const baseEarnedPoints = completedChores.reduce((sum: number, c: any) => {
    const earnedPoints = c.finalPoints !== undefined ? c.finalPoints : c.points;
    return sum + earnedPoints;
  }, 0);
  
  const resetChoresPoints = userChores.reduce((sum: number, c: any) => {
    if (c.status !== "completed" && c.finalPoints !== undefined) {
      return sum + c.finalPoints;
    }
    return sum;
  }, 0);
  
  const totalLifetimePoints = baseEarnedPoints + resetChoresPoints;
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
