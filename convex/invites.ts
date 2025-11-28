import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUserId } from "./authHelpers";

// Query: Get invites for a household
export const getHouseholdInvites = query({
  args: { householdId: v.id("households") },
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

    const invites = await ctx.db
      .query("userInvites")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    return invites;
  },
});

// Query: Get invites by status
export const getInvitesByStatus = query({
  args: {
    householdId: v.id("households"),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("declined"),
      v.literal("expired")
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

    const invites = await ctx.db
      .query("userInvites")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();

    return invites.filter((invite) => invite.householdId === args.householdId);
  },
});

// Mutation: Create invite
export const createInvite = mutation({
  args: {
    householdId: v.id("households"),
    email: v.string(),
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
      throw new Error("Not authorized to create invites");
    }

    // Check if invite already exists for this email
    const existingInvite = await ctx.db
      .query("userInvites")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .filter((q) => q.eq(q.field("householdId"), args.householdId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (existingInvite) {
      throw new Error("Invite already exists for this email");
    }

    // Generate token
    const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const now = Date.now();
    const expiresAt = now + 7 * 24 * 60 * 60 * 1000; // 7 days

    const inviteId = await ctx.db.insert("userInvites", {
      email: args.email,
      householdId: args.householdId,
      invitedBy: userId as any,
      status: "pending",
      token,
      expiresAt,
      createdAt: now,
    });

    return inviteId;
  },
});

// Mutation: Accept invite
export const acceptInvite = mutation({
  args: {
    inviteId: v.id("userInvites"),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const invite = await ctx.db.get(args.inviteId);
    if (!invite) {
      throw new Error("Invite not found");
    }

    if (invite.status !== "pending") {
      throw new Error("Invite is not pending");
    }

    // Check if invite is expired
    if (invite.expiresAt && Date.now() > invite.expiresAt) {
      await ctx.db.patch(args.inviteId, { status: "expired" });
      throw new Error("Invite has expired");
    }

    // Check if user is already a member
    const existingMembership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household_user", (q) =>
        q.eq("householdId", invite.householdId).eq("userId", userId as any)
      )
      .first();

    if (existingMembership) {
      await ctx.db.patch(args.inviteId, { status: "accepted" });
      throw new Error("User is already a member of this household");
    }

    // Add user as member
    const now = Date.now();
    await ctx.db.insert("householdMembers", {
      householdId: invite.householdId,
      userId: userId as any,
      role: "member",
      joinedAt: now,
    });

    // Update invite status
    await ctx.db.patch(args.inviteId, {
      status: "accepted",
    });

    return { success: true, householdId: invite.householdId };
  },
});

// Mutation: Decline invite
export const declineInvite = mutation({
  args: {
    inviteId: v.id("userInvites"),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const invite = await ctx.db.get(args.inviteId);
    if (!invite) {
      throw new Error("Invite not found");
    }

    await ctx.db.patch(args.inviteId, {
      status: "declined",
    });

    return { success: true };
  },
});

// Mutation: Cancel invite (admin only)
export const cancelInvite = mutation({
  args: {
    inviteId: v.id("userInvites"),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const invite = await ctx.db.get(args.inviteId);
    if (!invite) {
      throw new Error("Invite not found");
    }

    // Verify user is admin of household
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household_user", (q) =>
        q.eq("householdId", invite.householdId).eq("userId", userId as any)
      )
      .first();

    if (!membership || membership.role !== "admin") {
      throw new Error("Not authorized to cancel invites");
    }

    await ctx.db.delete(args.inviteId);
    return { success: true };
  },
});

