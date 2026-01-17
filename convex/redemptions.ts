import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUserId } from "./authHelpers";
import { calculateUserStats } from "./stats";

// Query: Get redemption requests for a user
export const getUserRedemptionRequests = query({
  args: {
    userId: v.id("users"),
    householdId: v.id("households"),
    status: v.optional(
      v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"))
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household_user", (q) =>
        q.eq("householdId", args.householdId).eq("userId", userId as any)
      )
      .first();

    if (!membership) {
      throw new Error("Not a member of this household");
    }

    // Query by household first to maintain household boundary, then filter by user and status
    const allHouseholdRedemptions = await ctx.db
      .query("redemptionRequests")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    // Filter by user and optional status
    const userRedemptions = allHouseholdRedemptions.filter(
      (req) => req.userId === args.userId && (!args.status || req.status === args.status)
    );

    return userRedemptions;
  },
});

// Query: Get all redemption requests for a household
export const getHouseholdRedemptionRequests = query({
  args: {
    householdId: v.id("households"),
    status: v.optional(
      v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"))
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household_user", (q) =>
        q.eq("householdId", args.householdId).eq("userId", userId as any)
      )
      .first();

    if (!membership) {
      throw new Error("Not a member of this household");
    }

    // SECURITY: Always query by household first to maintain household boundary
    const allHouseholdRedemptions = await ctx.db
      .query("redemptionRequests")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    // Filter by status if specified (after household boundary is enforced)
    const results = args.status
      ? allHouseholdRedemptions.filter((r) => r.status === args.status)
      : allHouseholdRedemptions;

    // Sort by requestedAt date, newest first
    return results.sort((a, b) => b.requestedAt - a.requestedAt);
  },
});

// Mutation: Create redemption request
export const createRedemptionRequest = mutation({
  args: {
    userId: v.id("users"),
    householdId: v.id("households"),
    pointsRequested: v.number(),
    cashAmount: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // SECURITY: Validate points and amount are positive
    if (args.pointsRequested <= 0) {
      throw new Error("Points requested must be positive");
    }
    if (args.cashAmount <= 0) {
      throw new Error("Cash amount must be positive");
    }

    // SECURITY: Verify conversion rate matches expected 100:1 ratio
    const expectedAmount = args.pointsRequested / 100;
    if (Math.abs(expectedAmount - args.cashAmount) > 0.01) {
      throw new Error("Invalid conversion rate");
    }

    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household_user", (q) =>
        q.eq("householdId", args.householdId).eq("userId", userId as any)
      )
      .first();

    if (!membership) {
      throw new Error("Not a member of this household");
    }

    // Verify user has enough points (household-specific)
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Get household-specific user stats
    const userStats = await ctx.db
      .query("userStats")
      .withIndex("by_user_household", (q) =>
        q.eq("userId", args.userId).eq("householdId", args.householdId)
      )
      .first();

    // Use household-specific earnedPoints, not global user.points
    const availablePoints = userStats?.earnedPoints ?? 0;
    
    if (availablePoints < args.pointsRequested) {
      throw new Error(`Insufficient points. You have ${availablePoints} available points in this household.`);
    }

    const now = Date.now();
    const requestId = await ctx.db.insert("redemptionRequests", {
      userId: args.userId,
      householdId: args.householdId,
      pointsRequested: args.pointsRequested,
      cashAmount: args.cashAmount,
      status: "pending",
      requestedAt: now,
    });

    return requestId;
  },
});

// Mutation: Update redemption request status
export const updateRedemptionRequestStatus = mutation({
  args: {
    requestId: v.id("redemptionRequests"),
    status: v.union(v.literal("approved"), v.literal("rejected")),
    adminNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Redemption request not found");
    }

    // Verify user is admin of household
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household_user", (q) =>
        q.eq("householdId", request.householdId).eq("userId", userId as any)
      )
      .first();

    if (!membership || membership.role !== "admin") {
      throw new Error("Not authorized to update redemption request");
    }

    const now = Date.now();
    const updates: any = {
      status: args.status,
      processedAt: now,
      processedBy: userId as any,
    };

    if (args.adminNotes) {
      updates.adminNotes = args.adminNotes;
    }

    await ctx.db.patch(args.requestId, updates);

    // If approved, deduct points and create deduction record
    if (args.status === "approved") {
      const user = await ctx.db.get(request.userId);
      if (user) {
        // No need to set level persistence - levels are based on lifetimePoints
        // which never decrease, so redemptions won't affect level

        // Points are now managed in userStats table (household-specific)
        // No need to update global user.points field

        // Create point deduction record (for audit trail)
        await ctx.db.insert("pointDeductions", {
          userId: request.userId,
          householdId: request.householdId,
          pointsDeducted: request.pointsRequested,
          reason: `Redemption request approved: ${request.cashAmount}`,
          redemptionRequestId: args.requestId,
          deductedAt: now,
          deductedBy: userId as any,
        });

        // Recalculate user stats - this will use redemptionRequests as source of truth
        // and properly calculate earnedPoints = lifetimePoints - pointsRedeemed
        await calculateUserStats(ctx, request.userId, request.householdId);
      }
    }

    return args.requestId;
  },
});

// Query: Get point deductions for a user
export const getUserPointDeductions = query({
  args: {
    userId: v.id("users"),
    householdId: v.id("households"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getCurrentUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }
    
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household_user", (q) =>
        q.eq("householdId", args.householdId).eq("userId", currentUserId as any)
      )
      .first();

    if (!membership) {
      throw new Error("Not a member of this household");
    }

    // Query by household first to maintain household boundary, then filter by user
    const allHouseholdDeductions = await ctx.db
      .query("pointDeductions")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    const deductions = allHouseholdDeductions.filter((d) => d.userId === args.userId);

    return deductions;
  },
});

// Query: Get total point deductions for a user (sum)
export const getTotalPointDeductions = query({
  args: {
    userId: v.id("users"),
    householdId: v.id("households"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getCurrentUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }
    
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household_user", (q) =>
        q.eq("householdId", args.householdId).eq("userId", currentUserId as any)
      )
      .first();

    if (!membership) {
      throw new Error("Not a member of this household");
    }

    // Query by household first to maintain household boundary, then filter by user
    const allHouseholdDeductions = await ctx.db
      .query("pointDeductions")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    const householdDeductions = allHouseholdDeductions.filter((d) => d.userId === args.userId);
    const total = householdDeductions.reduce((sum, d) => sum + d.pointsDeducted, 0);
    
    return { total, deductions: householdDeductions };
  },
});

// Query: Get all point deductions for a household (grouped by user)
export const getHouseholdPointDeductions = query({
  args: {
    householdId: v.id("households"),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household_user", (q) =>
        q.eq("householdId", args.householdId).eq("userId", userId as any)
      )
      .first();

    if (!membership) {
      throw new Error("Not a member of this household");
    }

    const deductions = await ctx.db
      .query("pointDeductions")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    // Group by user and sum
    const deductionsByUser: Record<string, number> = {};
    deductions.forEach((d) => {
      const dUserId = d.userId;
      if (!deductionsByUser[dUserId]) {
        deductionsByUser[dUserId] = 0;
      }
      deductionsByUser[dUserId] += d.pointsDeducted;
    });

    return deductionsByUser;
  },
});

// Mutation: Set conversion rate (stored per household, could be in household settings)
// For now, we'll store it in a simple way - could be moved to household table later
export const setConversionRate = mutation({
  args: {
    householdId: v.id("households"),
    rate: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Verify user is admin of household
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household_user", (q) =>
        q.eq("householdId", args.householdId).eq("userId", userId as any)
      )
      .first();

    if (!membership || membership.role !== "admin") {
      throw new Error("Not authorized to set conversion rate");
    }

    // For now, we'll just return success
    // In a full implementation, this would be stored in household settings
    return { success: true, rate: args.rate };
  },
});
