import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Query: Get user by ID
export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
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
      points: user.points || 0,
      level: user.level || 1,
      lastActive: user.lastActive,
    };
  },
});

// Query: Get current user
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    // With Convex Auth, getAuthUserId returns the user's _id directly
    const user = await ctx.db.get(userId);
    
    if (!user) {
      return null;
    }

    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      points: user.points || 0,
      level: user.level || 1,
      role: user.role,
      createdAt: user.createdAt,
      lastActive: user.lastActive,
    };
  },
});

// Query: Get users by household
export const getUsersByHousehold = query({
  args: { householdId: v.id("households") },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    // Verify user is member of household
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household_user", (q) => q.eq("householdId", args.householdId).eq("userId", currentUserId))
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
          points: user.points || 0,
          level: user.level || 1,
          lastActive: user.lastActive,
          role: member.role,
          joinedAt: member.joinedAt,
        };
      })
    );

    return users.filter(Boolean);
  },
});

// Mutation: Create or update user profile (called after signup)
export const createOrUpdateUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    avatarUrl: v.optional(v.string()),
    role: v.optional(
      v.union(
        v.literal("admin"),
        v.literal("parent"),
        v.literal("teen"),
        v.literal("kid"),
        v.literal("member")
      )
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get existing user (created by Convex Auth)
    const existingUser = await ctx.db.get(userId);
    const now = Date.now();

    if (existingUser) {
      // Update existing user with profile data
      const updateData: Record<string, any> = {
        email: args.email,
        name: args.name,
        avatarUrl: args.avatarUrl || existingUser.avatarUrl || "👤",
        lastActive: now,
        updatedAt: now,
      };
      
      // Set default points/level if not set
      if (existingUser.points === undefined) {
        updateData.points = 0;
      }
      if (existingUser.level === undefined) {
        updateData.level = 1;
      }
      if (existingUser.createdAt === undefined) {
        updateData.createdAt = now;
      }
      
      if (args.role !== undefined) {
        updateData.role = args.role;
      } else if (!existingUser.role) {
        // Check if this is the first user with a role (make them admin)
        const usersWithRole = await ctx.db
          .query("users")
          .filter((q) => q.neq(q.field("role"), undefined))
          .collect();
        updateData.role = usersWithRole.length === 0 ? "admin" : "member";
      }
      
      await ctx.db.patch(userId, updateData);
      return userId;
    }
    
    // This shouldn't happen with Convex Auth (user should exist)
    throw new Error("User not found - authentication may have failed");
  },
});

// Mutation: Update user profile
export const updateUserProfile = mutation({
  args: {
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(userId, {
      ...args,
      lastActive: Date.now(),
      updatedAt: Date.now(),
    });

    return userId;
  },
});

// Mutation: Update user points (internal use)
export const updateUserPoints = mutation({
  args: {
    userId: v.id("users"),
    pointsChange: v.number(),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const currentPoints = user.points || 0;
    const newPoints = Math.max(0, currentPoints + args.pointsChange);
    const now = Date.now();

    await ctx.db.patch(args.userId, {
      points: newPoints,
      lastActive: now,
      updatedAt: now,
    });

    return {
      userId: args.userId,
      oldPoints: currentPoints,
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
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const userPoints = user.points || 0;
    const currentLevel = user.level || 1;

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
      if (userPoints >= LEVELS[i].pointsRequired) {
        newLevel = LEVELS[i].level;
        break;
      }
    }

    if (newLevel !== currentLevel) {
      await ctx.db.patch(args.userId, {
        level: newLevel,
        updatedAt: Date.now(),
      });
    }

    return {
      userId: args.userId,
      oldLevel: currentLevel,
      newLevel,
      points: userPoints,
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
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
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
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
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
