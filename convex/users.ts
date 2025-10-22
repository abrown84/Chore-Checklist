import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Query: Get user by ID
export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await getAuthUserId(ctx);
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Only return public user info
    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      points: user.points,
      level: user.level,
      lastActive: user.lastActive,
    };
  },
});

// Query: Get current user
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await getAuthUserId(ctx);
    if (!identity) {
      return null;
    }

    const user = await ctx.db.get(identity);
    if (!user) {
      return null;
    }

    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      points: user.points,
      level: user.level,
      lastActive: user.lastActive,
    };
  },
});

// Query: Get users by household
export const getUsersByHousehold = query({
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

    const members = await ctx.db
      .query("householdMembers")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    const users = await Promise.all(
      members.map(async (member) => {
        const user = await ctx.db.get(member.userId);
        if (!user) return null;
        
        return {
          _id: user._id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl,
          points: user.points,
          level: user.level,
          lastActive: user.lastActive,
          role: member.role,
          joinedAt: member.joinedAt,
        };
      })
    );

    return users.filter(Boolean);
  },
});

// Mutation: Create or update user
export const createOrUpdateUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await getAuthUserId(ctx);
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const existingUser = await ctx.db.get(identity);
    const now = Date.now();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(identity, {
        email: args.email,
        name: args.name,
        avatarUrl: args.avatarUrl,
        lastActive: now,
        updatedAt: now,
      });
      return identity;
    } else {
      // Create new user
      const userId = await ctx.db.insert("users", {
        email: args.email,
        name: args.name,
        avatarUrl: args.avatarUrl,
        points: 0,
        level: 1,
        lastActive: now,
        createdAt: now,
        updatedAt: now,
      });
      return userId;
    }
  },
});

// Mutation: Update user profile
export const updateUserProfile = mutation({
  args: {
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await getAuthUserId(ctx);
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(identity);
    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(identity, {
      ...args,
      lastActive: Date.now(),
      updatedAt: Date.now(),
    });

    return identity;
  },
});

// Mutation: Update user points (internal use)
export const updateUserPoints = mutation({
  args: {
    userId: v.id("users"),
    pointsChange: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await getAuthUserId(ctx);
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const newPoints = Math.max(0, user.points + args.pointsChange);
    const now = Date.now();

    await ctx.db.patch(args.userId, {
      points: newPoints,
      lastActive: now,
      updatedAt: now,
    });

    return {
      userId: args.userId,
      oldPoints: user.points,
      newPoints,
      pointsChange: args.pointsChange,
    };
  },
});

// Mutation: Calculate and update user level
export const updateUserLevel = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await getAuthUserId(ctx);
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Level calculation based on points
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

    let newLevel = 1;
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (user.points >= LEVELS[i].pointsRequired) {
        newLevel = LEVELS[i].level;
        break;
      }
    }

    if (newLevel !== user.level) {
      await ctx.db.patch(args.userId, {
        level: newLevel,
        updatedAt: Date.now(),
      });
    }

    return {
      userId: args.userId,
      oldLevel: user.level,
      newLevel,
      points: user.points,
    };
  },
});

// Mutation: Set level persistence (for point redemption)
export const setLevelPersistence = mutation({
  args: {
    userId: v.id("users"),
    level: v.number(),
    pointsAtRedemption: v.number(),
    gracePeriodDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await getAuthUserId(ctx);
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const gracePeriod = args.gracePeriodDays || 30;
    const expiresAt = Date.now() + (gracePeriod * 24 * 60 * 60 * 1000);

    // This would typically be stored in userStats table
    // For now, we'll just return success
    return {
      userId: args.userId,
      level: args.level,
      pointsAtRedemption: args.pointsAtRedemption,
      expiresAt,
    };
  },
});

// Mutation: Clear level persistence
export const clearLevelPersistence = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await getAuthUserId(ctx);
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // This would typically clear from userStats table
    return {
      userId: args.userId,
      cleared: true,
    };
  },
});
