import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getCurrentUserId } from "./authHelpers";

// App owner email - automatically granted site admin
const SITE_ADMIN_EMAILS = [
  "konfliktquake@gmail.com",
];

// Helper to check if a user is a site admin
const checkIsSiteAdmin = (user: { email?: string; isSiteAdmin?: boolean } | null): boolean => {
  if (!user) return false;
  return user.isSiteAdmin === true || SITE_ADMIN_EMAILS.includes(user.email || "");
};

// Check if the current user is a site admin
export const isSiteAdmin = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) return false;

    const user = await ctx.db.get(userId);
    return checkIsSiteAdmin(user);
  },
});

// Get the current user with site admin status
export const getCurrentUserWithAdminStatus = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    return user ? {
      id: user._id,
      email: user.email,
      name: user.name,
      isSiteAdmin: checkIsSiteAdmin(user),
    } : null;
  },
});

// Get all users (site admin only)
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) return [];

    const currentUser = await ctx.db.get(userId);
    if (!checkIsSiteAdmin(currentUser)) return [];

    const users = await ctx.db.query("users").collect();

    // Get household memberships for each user
    const usersWithHouseholds = await Promise.all(
      users.map(async (user) => {
        const memberships = await ctx.db
          .query("householdMembers")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();

        const households = await Promise.all(
          memberships.map(async (m) => {
            const household = await ctx.db.get(m.householdId);
            return household ? { id: household._id, name: household.name, role: m.role } : null;
          })
        );

        return {
          id: user._id,
          email: user.email,
          name: user.name,
          points: user.points || 0,
          level: user.level || 1,
          isSiteAdmin: checkIsSiteAdmin(user),
          createdAt: user.createdAt,
          lastActive: user.lastActive,
          households: households.filter(Boolean),
        };
      })
    );

    return usersWithHouseholds;
  },
});

// Get all households (site admin only)
export const getAllHouseholds = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) return [];

    const currentUser = await ctx.db.get(userId);
    if (!checkIsSiteAdmin(currentUser)) return [];

    const households = await ctx.db.query("households").collect();

    const householdsWithStats = await Promise.all(
      households.map(async (household) => {
        const members = await ctx.db
          .query("householdMembers")
          .withIndex("by_household", (q) => q.eq("householdId", household._id))
          .collect();

        const chores = await ctx.db
          .query("chores")
          .withIndex("by_household", (q) => q.eq("householdId", household._id))
          .collect();

        const completedChores = chores.filter(c => c.status === "completed").length;

        // Get creator info
        const creator = await ctx.db.get(household.createdBy);

        return {
          id: household._id,
          name: household.name,
          description: household.description,
          joinCode: household.joinCode,
          memberCount: members.length,
          choreCount: chores.length,
          completedChores,
          createdBy: creator ? { id: creator._id, name: creator.name, email: creator.email } : null,
          createdAt: household.createdAt,
          updatedAt: household.updatedAt,
        };
      })
    );

    return householdsWithStats;
  },
});

// Get global stats (site admin only)
export const getGlobalStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) return null;

    const currentUser = await ctx.db.get(userId);
    if (!checkIsSiteAdmin(currentUser)) return null;

    const users = await ctx.db.query("users").collect();
    const households = await ctx.db.query("households").collect();
    const chores = await ctx.db.query("chores").collect();
    const completions = await ctx.db.query("choreCompletions").collect();

    const completedChores = chores.filter(c => c.status === "completed").length;
    const totalPoints = users.reduce((sum, u) => sum + (u.points || 0), 0);

    // Get recent signups (last 7 days)
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentUsers = users.filter(u => (u.createdAt || 0) > oneWeekAgo).length;
    const recentHouseholds = households.filter(h => h.createdAt > oneWeekAgo).length;

    return {
      totalUsers: users.length,
      totalHouseholds: households.length,
      totalChores: chores.length,
      completedChores,
      totalCompletions: completions.length,
      totalPoints,
      recentUsers,
      recentHouseholds,
      completionRate: chores.length > 0 ? Math.round((completedChores / chores.length) * 100) : 0,
    };
  },
});

// Toggle site admin status (site admin only, or first admin bootstrap)
export const toggleSiteAdmin = mutation({
  args: {
    targetUserId: v.id("users"),
    makeAdmin: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const currentUser = await ctx.db.get(userId);

    // Check if any site admins exist (bootstrap case)
    const existingAdmins = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("isSiteAdmin"), true))
      .collect();

    // If no admins exist and user is trying to make themselves admin, allow it
    const isBootstrap = existingAdmins.length === 0 && args.targetUserId === userId && args.makeAdmin;

    if (!isBootstrap && !checkIsSiteAdmin(currentUser)) {
      throw new Error("Only site admins can manage admin status");
    }

    // Prevent removing the last site admin
    if (!args.makeAdmin && existingAdmins.length === 1 && existingAdmins[0]._id === args.targetUserId) {
      throw new Error("Cannot remove the last site admin");
    }

    await ctx.db.patch(args.targetUserId, {
      isSiteAdmin: args.makeAdmin,
    });

    return { success: true };
  },
});

// Delete a user (site admin only)
export const deleteUser = mutation({
  args: {
    targetUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const currentUser = await ctx.db.get(userId);
    if (!checkIsSiteAdmin(currentUser)) {
      throw new Error("Only site admins can delete users");
    }

    // Cannot delete yourself
    if (args.targetUserId === userId) {
      throw new Error("Cannot delete your own account from admin panel");
    }

    // Remove from all households
    const memberships = await ctx.db
      .query("householdMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.targetUserId))
      .collect();

    for (const membership of memberships) {
      await ctx.db.delete(membership._id);
    }

    // Delete user stats
    const stats = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", args.targetUserId))
      .collect();

    for (const stat of stats) {
      await ctx.db.delete(stat._id);
    }

    // Delete the user
    await ctx.db.delete(args.targetUserId);

    return { success: true };
  },
});

// Delete a household (site admin only)
export const deleteHouseholdAdmin = mutation({
  args: {
    householdId: v.id("households"),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const currentUser = await ctx.db.get(userId);
    if (!checkIsSiteAdmin(currentUser)) {
      throw new Error("Only site admins can delete households");
    }

    // Delete all household members
    const members = await ctx.db
      .query("householdMembers")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    for (const member of members) {
      await ctx.db.delete(member._id);
    }

    // Delete all chores
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

    // Delete user stats for this household
    const stats = await ctx.db
      .query("userStats")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    for (const stat of stats) {
      await ctx.db.delete(stat._id);
    }

    // Delete the household
    await ctx.db.delete(args.householdId);

    return { success: true };
  },
});
