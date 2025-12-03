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

        // Get user stats first (we'll use it for points and metrics)
        // Points should be household-specific, not global user.points
        const userStats = await ctx.db
          .query("userStats")
          .withIndex("by_user_household", (q: any) => 
            q.eq("userId", membership.userId).eq("householdId", household._id))
          .first();

        // Prioritize household-specific userStats.earnedPoints over global user.points
        let userPoints = 0;
        
        if (userStats && userStats.earnedPoints > 0) {
          // Use household-specific points from userStats
          userPoints = userStats.earnedPoints;
          console.log(`[getGlobalLeaderboard] Using userStats.earnedPoints for ${user.name} in ${household.name}: ${userPoints}`);
        } else {
          // Calculate from chore completions for this specific household
          const completions = await ctx.db
            .query("choreCompletions")
            .withIndex("by_user_household", (q: any) => 
              q.eq("userId", membership.userId).eq("householdId", household._id))
            .collect();
          
          userPoints = completions.reduce((sum, c) => sum + (c.pointsEarned || 0), 0);
          if (userPoints > 0) {
            console.log(`[getGlobalLeaderboard] Calculated points from completions for ${user.name} in ${household.name}: ${userPoints}`);
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

        // Extract display name - use name if available, otherwise use default
        const getDisplayName = (fullName: string | undefined | null): string => {
          // If name exists, extract first name
          if (fullName && fullName.trim().length > 0) {
            const firstName = fullName.trim().split(/\s+/)[0];
            if (firstName) return firstName;
          }
          // Default name for users without a name set
          return 'Member';
        };
        
        memberDetails.push({
          userId: membership.userId,
          name: getDisplayName(user.name),
          points: userPoints,
          level: user.level || 1,
        });

        memberCount++;
      }

      // Include all households, even those with 0 points, so everyone can see each other
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

// Query: Get public global leaderboard (no authentication required)
// This is used for the landing page to show top households
export const getPublicGlobalLeaderboard = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10; // Default to top 10

    // Get all households
    const allHouseholds = await ctx.db
      .query("households")
      .collect();

    // Calculate total points for each household
    const householdLeaderboard: any[] = [];

    for (const household of allHouseholds) {
      // Get all members of this household
      const memberships = await ctx.db
        .query("householdMembers")
        .withIndex("by_household", (q: any) => q.eq("householdId", household._id))
        .collect();
      
      if (memberships.length === 0) {
        continue;
      }

      // Sum up points from all members
      let totalHouseholdPoints = 0;
      let memberCount = 0;
      const memberDetails: any[] = [];

      for (const membership of memberships) {
        const user = await ctx.db.get(membership.userId);
        if (!user) {
          continue;
        }

        // Get user stats for points
        // Points should be household-specific, not global user.points
        const userStats = await ctx.db
          .query("userStats")
          .withIndex("by_user_household", (q: any) => 
            q.eq("userId", membership.userId).eq("householdId", household._id))
          .first();

        // Prioritize household-specific userStats.earnedPoints over global user.points
        let userPoints = 0;
        
        if (userStats && userStats.earnedPoints > 0) {
          // Use household-specific points from userStats
          userPoints = userStats.earnedPoints;
        } else {
          // Calculate from chore completions for this specific household
          const completions = await ctx.db
            .query("choreCompletions")
            .withIndex("by_user_household", (q: any) => 
              q.eq("userId", membership.userId).eq("householdId", household._id))
            .collect();
          
          userPoints = completions.reduce((sum, c) => sum + (c.pointsEarned || 0), 0);
        }
        
        totalHouseholdPoints += userPoints;

        // Extract display name - use name if available, otherwise use default
        const getDisplayName = (fullName: string | undefined | null): string => {
          // If name exists, extract first name
          if (fullName && fullName.trim().length > 0) {
            const firstName = fullName.trim().split(/\s+/)[0];
            if (firstName) return firstName;
          }
          // Default name for users without a name set
          return 'Member';
        };
        
        memberDetails.push({
          userId: membership.userId,
          name: getDisplayName(user.name),
          points: userPoints,
          level: user.level || 1,
        });

        memberCount++;
      }

      // Include all households, even those with 0 points, so everyone can see each other
      householdLeaderboard.push({
        householdId: household._id,
        householdName: household.name,
        totalPoints: totalHouseholdPoints,
        earnedPoints: totalHouseholdPoints,
        memberCount,
        members: memberDetails.slice(0, 3), // Only show top 3 members
      });
    }

    // Sort by total points (descending) and limit
    const sorted = householdLeaderboard
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, limit);
    
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

// Mutation: Update user stats (can be called directly from other mutations)
export const updateUserStats = mutation({
  args: {
    userId: v.id("users"),
    householdId: v.id("households"),
  },
  handler: async (ctx, args) => {
    await calculateUserStats(ctx, args.userId, args.householdId);
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
      if (!userStats) {
        throw new Error("Failed to create user stats");
      }
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

// Helper function: Calculate user stats (exported so it can be called from other files)
export async function calculateUserStats(ctx: any, userId: any, householdId: any) {
  const user = await ctx.db.get(userId);
  if (!user) {
    throw new Error("User not found");
  }

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
  
  // Calculate lifetime points (matching frontend calculation)
  // Base earned points from completed chores
  const baseEarnedPoints = completedChores.reduce((sum: number, chore: any) => {
    return sum + (chore.finalPoints || chore.points || 0);
  }, 0);

  // Reset chores points (incomplete chores with finalPoints - these are points from chores that were reset)
  const resetChoresPoints = userChores.reduce((sum: number, chore: any) => {
    if (!chore.status || chore.status !== "completed") {
      // Include points from incomplete chores that have finalPoints (from resets)
      if (chore.finalPoints !== undefined && chore.finalPoints !== null) {
        return sum + chore.finalPoints;
      }
    }
    return sum;
  }, 0);

  // Total lifetime points (completed + reset chores) - all points ever earned
  const lifetimePoints = baseEarnedPoints + resetChoresPoints;

  // Get approved redemption requests for this user in this household
  // This is the source of truth for redeemed points
  const redemptionRequests = await ctx.db
    .query("redemptionRequests")
    .withIndex("by_user_status", (q: any) => q.eq("userId", userId).eq("status", "approved"))
    .collect();

  const householdRedemptions = redemptionRequests.filter(
    (req: any) => req.householdId === householdId
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
  const now = Math.floor(Date.now());
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
    lastActive: user.lastActive ? Math.floor(user.lastActive) : now,
    updatedAt: now,
  };

  // Check if stats already exist
  const existingStats = await ctx.db
    .query("userStats")
    .withIndex("by_user_household", (q: any) => q.eq("userId", userId).eq("householdId", householdId))
    .first();

  if (existingStats) {
    // Level persistence is not needed - levels are based on lifetimePoints which never decrease
    // Clear any existing levelPersistenceInfo since it's no longer used
    // Create patch data without any system fields - explicitly list only data fields
    const patchData: any = {
      userId: stats.userId,
      householdId: stats.householdId,
      totalChores: stats.totalChores,
      completedChores: stats.completedChores,
      totalPoints: stats.totalPoints,
      lifetimePoints: stats.lifetimePoints,
      earnedPoints: stats.earnedPoints,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      currentLevel: stats.currentLevel,
      currentLevelPoints: stats.currentLevelPoints,
      pointsToNextLevel: stats.pointsToNextLevel,
      efficiencyScore: stats.efficiencyScore,
      seasonalPoints: stats.seasonalPoints,
      seasonalLevel: stats.seasonalLevel,
      currentSeason: stats.currentSeason,
      lastActive: stats.lastActive ? Math.floor(stats.lastActive) : undefined,
      updatedAt: Math.floor(stats.updatedAt),
      levelPersistenceInfo: undefined, // Explicitly clear levelPersistenceInfo
    };
    
    // Patch the document - Convex will handle system fields automatically
    await ctx.db.patch(existingStats._id, patchData);
    
    // Return updated stats by fetching from DB to ensure we have correct system fields
    const updatedStats = await ctx.db.get(existingStats._id);
    if (!updatedStats) {
      throw new Error("Failed to retrieve updated stats after patch");
    }
    return updatedStats;
  } else {
    // Insert new record - Convex automatically manages _creationTime, don't include it
    const statsId = await ctx.db.insert("userStats", stats);
    const insertedStats = await ctx.db.get(statsId);
    if (!insertedStats) {
      throw new Error("Failed to retrieve inserted stats");
    }
    return insertedStats;
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
