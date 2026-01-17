import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUserId } from "./authHelpers";
import { internal } from "./_generated/api";

// Query: Get household by ID
export const getHousehold = query({
  args: { householdId: v.id("households") },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const household = await ctx.db.get(args.householdId);
    if (!household) {
      throw new Error("Household not found");
    }

    // Verify user is member of household
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household_user", (q) => q.eq("householdId", args.householdId).eq("userId", userId as any))
      .first();

    if (!membership) {
      throw new Error("Not a member of this household");
    }

    return household;
  },
});

// Query: Get user's households
export const getUserHouseholds = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) {
      return [];
    }

    const memberships = await ctx.db
      .query("householdMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId as any))
      .collect();

    const households = await Promise.all(
      memberships.map(async (membership) => {
        const household = await ctx.db.get(membership.householdId);
        if (!household) return null;
        
        return {
          ...household,
          role: membership.role,
          joinedAt: membership.joinedAt,
        };
      })
    );

    return households.filter(Boolean);
  },
});

// Query: Get household members
export const getHouseholdMembers = query({
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

    const members = await ctx.db
      .query("householdMembers")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    const membersWithUserData = await Promise.all(
      members.map(async (member) => {
        const user = await ctx.db.get(member.userId);
        if (!user) return null;
        
        return {
          _id: member._id,
          userId: member.userId,
          role: member.role,
          joinedAt: member.joinedAt,
          user: {
            _id: user._id,
            email: user.email,
            name: user.name,
            avatarUrl: user.avatarUrl,
            points: user.points, // Legacy field - not updated, use userStats.earnedPoints for household-specific points
            level: user.level,
            lastActive: user.lastActive,
          },
        };
      })
    );

    return membersWithUserData.filter(Boolean);
  },
});

// Mutation: Create household
export const createHousehold = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();
    
    // Generate unique join code (6 characters, alphanumeric)
    const generateJoinCode = () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };
    
    // SECURITY FIX: Retry loop for join code generation to prevent collisions
    let joinCode = generateJoinCode();
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      const existing = await ctx.db
        .query("households")
        .withIndex("by_join_code", (q) => q.eq("joinCode", joinCode))
        .first();

      if (!existing) {
        break; // Code is unique
      }

      joinCode = generateJoinCode();
      attempts++;
    }

    if (attempts >= maxAttempts) {
      throw new Error("Unable to generate unique join code. Please try again.");
    }
    
    // Create household
    const householdId = await ctx.db.insert("households", {
      name: args.name,
      createdBy: userId as any,
      joinCode,
      createdAt: now,
      updatedAt: now,
    });

    // Add creator as admin member
    await ctx.db.insert("householdMembers", {
      householdId,
      userId: userId as any,
      role: "admin",
      joinedAt: now,
    });

    // Automatically seed default chores for the new household
    // Use scheduler to run the internal mutation asynchronously
    await ctx.scheduler.runAfter(0, internal.chores.seedDefaultChoresInternal, {
      householdId,
    });

    return householdId;
  },
});

// Mutation: Update household
export const updateHousehold = mutation({
  args: {
    householdId: v.id("households"),
    name: v.string(),
    description: v.optional(v.string()),
    settings: v.optional(
      v.object({
        allowInvites: v.boolean(),
        requireApproval: v.boolean(),
        maxMembers: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const household = await ctx.db.get(args.householdId);
    if (!household) {
      throw new Error("Household not found");
    }

    // Verify user is admin of household
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household_user", (q) => q.eq("householdId", args.householdId).eq("userId", userId as any))
      .first();

    if (!membership || membership.role !== "admin") {
      throw new Error("Not an admin of this household");
    }

    const updateData: any = {
      name: args.name,
      updatedAt: Date.now(),
    };

    if (args.description !== undefined) {
      updateData.description = args.description;
    }

    if (args.settings !== undefined) {
      updateData.settings = args.settings;
    }

    await ctx.db.patch(args.householdId, updateData);

    return args.householdId;
  },
});

// Mutation: Add member to household
export const addHouseholdMember = mutation({
  args: {
    householdId: v.id("households"),
    userId: v.id("users"),
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
    const currentUserId = await getCurrentUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    const household = await ctx.db.get(args.householdId);
    if (!household) {
      throw new Error("Household not found");
    }

    // Verify user is admin of household
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household_user", (q) => q.eq("householdId", args.householdId).eq("userId", currentUserId as any))
      .first();

    if (!membership || membership.role !== "admin") {
      throw new Error("Not an admin of this household");
    }

    // Check if user is already a member
    const existingMembership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household_user", (q) => q.eq("householdId", args.householdId).eq("userId", args.userId))
      .first();

    if (existingMembership) {
      throw new Error("User is already a member of this household");
    }

    const now = Date.now();
    const memberId = await ctx.db.insert("householdMembers", {
      householdId: args.householdId,
      userId: args.userId,
      role: args.role || "member",
      joinedAt: now,
    });

    return memberId;
  },
});

// Mutation: Remove member from household
export const removeHouseholdMember = mutation({
  args: {
    householdId: v.id("households"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getCurrentUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    const household = await ctx.db.get(args.householdId);
    if (!household) {
      throw new Error("Household not found");
    }

    // Verify user is admin of household or removing themselves
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household_user", (q) => q.eq("householdId", args.householdId).eq("userId", currentUserId as any))
      .first();

    if (!membership) {
      throw new Error("Not a member of this household");
    }

    if (membership.role !== "admin" && currentUserId !== args.userId) {
      throw new Error("Not authorized to remove this member");
    }

    // Find the membership to remove
    const memberToRemove = await ctx.db
      .query("householdMembers")
      .withIndex("by_household_user", (q) => q.eq("householdId", args.householdId).eq("userId", args.userId))
      .first();

    if (!memberToRemove) {
      throw new Error("User is not a member of this household");
    }

    // SECURITY FIX: Don't allow removing the last admin
    if (memberToRemove.role === "admin") {
      const adminMembers = await ctx.db
        .query("householdMembers")
        .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
        .filter((q) => q.eq(q.field("role"), "admin"))
        .collect();

      // Must have at least 2 admins to remove one (need 1 remaining after removal)
      if (adminMembers.length < 2) {
        throw new Error("Cannot remove the last admin from household");
      }
    }

    await ctx.db.delete(memberToRemove._id);
    return memberToRemove._id;
  },
});

// Mutation: Update member role
export const updateMemberRole = mutation({
  args: {
    householdId: v.id("households"),
    userId: v.id("users"),
    role: v.union(
      v.literal("admin"),
      v.literal("parent"),
      v.literal("teen"),
      v.literal("kid"),
      v.literal("member")
    ),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getCurrentUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    const household = await ctx.db.get(args.householdId);
    if (!household) {
      throw new Error("Household not found");
    }

    // Verify user is admin of household
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household_user", (q) => q.eq("householdId", args.householdId).eq("userId", currentUserId as any))
      .first();

    if (!membership || membership.role !== "admin") {
      throw new Error("Not an admin of this household");
    }

    // Find the membership to update
    const memberToUpdate = await ctx.db
      .query("householdMembers")
      .withIndex("by_household_user", (q) => q.eq("householdId", args.householdId).eq("userId", args.userId))
      .first();

    if (!memberToUpdate) {
      throw new Error("User is not a member of this household");
    }

    // Don't allow demoting the last admin
    if (
      memberToUpdate.role === "admin" &&
      args.role !== "admin"
    ) {
      const adminCount = await ctx.db
        .query("householdMembers")
        .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
        .filter((q) => q.eq(q.field("role"), "admin"))
        .collect();

      if (adminCount.length <= 1) {
        throw new Error("Cannot demote the last admin from household");
      }
    }

    await ctx.db.patch(memberToUpdate._id, {
      role: args.role,
    });

    return memberToUpdate._id;
  },
});

// Mutation: Delete household
export const deleteHousehold = mutation({
  args: { householdId: v.id("households") },
  handler: async (ctx, args) => {
    const currentUserId = await getCurrentUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    const household = await ctx.db.get(args.householdId);
    if (!household) {
      throw new Error("Household not found");
    }

    // Verify user is admin of household
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household_user", (q) => q.eq("householdId", args.householdId).eq("userId", currentUserId as any))
      .first();

    if (!membership || membership.role !== "admin") {
      throw new Error("Not an admin of this household");
    }

    // Delete all related data
    // 1. Delete household members
    const members = await ctx.db
      .query("householdMembers")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    for (const member of members) {
      await ctx.db.delete(member._id);
    }

    // 2. Delete chores
    const chores = await ctx.db
      .query("chores")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    for (const chore of chores) {
      // Delete chore completions
      const completions = await ctx.db
        .query("choreCompletions")
        .withIndex("by_chore", (q) => q.eq("choreId", chore._id))
        .collect();

      for (const completion of completions) {
        await ctx.db.delete(completion._id);
      }

      await ctx.db.delete(chore._id);
    }

    // 3. Delete user stats
    const userStats = await ctx.db
      .query("userStats")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    for (const stat of userStats) {
      await ctx.db.delete(stat._id);
    }

    // 4. Delete invites
    const invites = await ctx.db
      .query("userInvites")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    for (const invite of invites) {
      await ctx.db.delete(invite._id);
    }

    // 5. Delete redemption requests
    const redemptionRequests = await ctx.db
      .query("redemptionRequests")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    for (const request of redemptionRequests) {
      // Delete associated point deductions
      const deductions = await ctx.db
        .query("pointDeductions")
        .withIndex("by_redemption_request", (q) => q.eq("redemptionRequestId", request._id))
        .collect();

      for (const deduction of deductions) {
        await ctx.db.delete(deduction._id);
      }

      await ctx.db.delete(request._id);
    }

    // 6. Delete point deductions (any remaining)
    const pointDeductions = await ctx.db
      .query("pointDeductions")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    for (const deduction of pointDeductions) {
      await ctx.db.delete(deduction._id);
    }

    // 7. Delete household
    await ctx.db.delete(args.householdId);

    return args.householdId;
  },
});

// Query: Search household by join code
export const searchHouseholdByCode = query({
  args: {
    joinCode: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const household = await ctx.db
      .query("households")
      .withIndex("by_join_code", (q) => q.eq("joinCode", args.joinCode.toUpperCase()))
      .first();

    if (!household) {
      return null;
    }

    // Check if join by code is allowed
    const settings = household.settings;
    if (settings && settings.allowJoinByCode === false) {
      return null; // Join by code is disabled
    }

    // Check if user is already a member
    const existingMembership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household_user", (q) =>
        q.eq("householdId", household._id).eq("userId", userId as any)
      )
      .first();

    if (existingMembership) {
      return { ...household, alreadyMember: true };
    }

    // Check member limit
    const members = await ctx.db
      .query("householdMembers")
      .withIndex("by_household", (q) => q.eq("householdId", household._id))
      .collect();

    const maxMembers = settings?.maxMembers || 10;
    if (members.length >= maxMembers) {
      return { ...household, isFull: true };
    }

    return { ...household, alreadyMember: false, isFull: false };
  },
});

// Mutation: Join household by code
export const joinHouseholdByCode = mutation({
  args: {
    joinCode: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const household = await ctx.db
      .query("households")
      .withIndex("by_join_code", (q) => q.eq("joinCode", args.joinCode.toUpperCase()))
      .first();

    if (!household) {
      throw new Error("Household not found with this code");
    }

    // Check if join by code is allowed
    const settings = household.settings;
    if (settings && settings.allowJoinByCode === false) {
      throw new Error("This household does not allow joining by code");
    }

    // Check if user is already a member
    const existingMembership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household_user", (q) =>
        q.eq("householdId", household._id).eq("userId", userId as any)
      )
      .first();

    if (existingMembership) {
      throw new Error("You are already a member of this household");
    }

    // Check member limit
    const members = await ctx.db
      .query("householdMembers")
      .withIndex("by_household", (q) => q.eq("householdId", household._id))
      .collect();

    const maxMembers = settings?.maxMembers || 10;
    if (members.length >= maxMembers) {
      throw new Error("This household has reached its member limit");
    }

    // Check if approval is required
    if (settings?.requireApproval) {
      // Create a pending invite instead
      const now = Date.now();
      const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const user = await ctx.db.get(userId as any);
      const userEmail = (user && 'email' in user) ? (user.email || "") : "";

      const inviteId = await ctx.db.insert("userInvites", {
        email: userEmail,
        householdId: household._id,
        invitedBy: household.createdBy,
        status: "pending",
        token,
        expiresAt: now + 7 * 24 * 60 * 60 * 1000, // 7 days
        createdAt: now,
      });

      return { success: true, householdId: household._id, requiresApproval: true, inviteId };
    }

    // Add user as member
    const now = Date.now();
    await ctx.db.insert("householdMembers", {
      householdId: household._id,
      userId: userId as any,
      role: "member",
      joinedAt: now,
    });

    return { success: true, householdId: household._id, requiresApproval: false };
  },
});

// Mutation: Regenerate join code (admin only)
export const regenerateJoinCode = mutation({
  args: {
    householdId: v.id("households"),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const household = await ctx.db.get(args.householdId);
    if (!household) {
      throw new Error("Household not found");
    }

    // Verify user is admin of household
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household_user", (q) =>
        q.eq("householdId", args.householdId).eq("userId", userId as any)
      )
      .first();

    if (!membership || membership.role !== "admin") {
      throw new Error("Not authorized to regenerate join code");
    }

    // Generate unique join code
    const generateJoinCode = () => {
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Exclude confusing chars
      let code = "";
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    let joinCode = generateJoinCode();
    // Ensure code is unique
    const existing = await ctx.db
      .query("households")
      .withIndex("by_join_code", (q) => q.eq("joinCode", joinCode))
      .filter((q) => q.neq(q.field("_id"), args.householdId))
      .first();
    if (existing) {
      joinCode = generateJoinCode(); // Regenerate if collision
    }

    await ctx.db.patch(args.householdId, {
      joinCode,
      updatedAt: Date.now(),
    });

    return { joinCode };
  },
});

// Mutation: Leave household (user leaves themselves)
export const leaveHousehold = mutation({
  args: {
    householdId: v.id("households"),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const household = await ctx.db.get(args.householdId);
    if (!household) {
      throw new Error("Household not found");
    }

    // Find user's membership
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household_user", (q) =>
        q.eq("householdId", args.householdId).eq("userId", userId as any)
      )
      .first();

    if (!membership) {
      throw new Error("You are not a member of this household");
    }

    // Allow admins to leave (they can delete the household if needed)

    // Delete membership
    await ctx.db.delete(membership._id);

    // Clean up user stats for this household
    const userStats = await ctx.db
      .query("userStats")
      .withIndex("by_user_household", (q) =>
        q.eq("userId", userId as any).eq("householdId", args.householdId)
      )
      .first();

    if (userStats) {
      await ctx.db.delete(userStats._id);
    }

    return { success: true };
  },
});
