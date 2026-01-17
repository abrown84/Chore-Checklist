import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * List all auth accounts to identify problematic entries
 */
export const listAuthAccounts = query({
  args: {},
  handler: async (ctx) => {
    const accounts = await ctx.db.query("authAccounts").collect();

    // For each account, check if the linked user exists
    const results = await Promise.all(
      accounts.map(async (account) => {
        const user = account.userId ? await ctx.db.get(account.userId) : null;
        return {
          accountId: account._id,
          visibleId: account.providerAccountId, // This is usually the email
          provider: account.provider,
          userId: account.userId,
          userExists: !!user,
          userEmail: user?.email,
        };
      })
    );

    return results;
  },
});

/**
 * Delete an auth account by its ID
 * Use this to remove corrupt accounts that don't have valid users
 */
export const deleteAuthAccount = mutation({
  args: { accountId: v.id("authAccounts") },
  handler: async (ctx, { accountId }) => {
    const account = await ctx.db.get(accountId);
    if (!account) {
      throw new Error("Account not found");
    }

    await ctx.db.delete(accountId);
    return { deleted: true, accountId };
  },
});

/**
 * Clean up orphaned auth accounts (accounts without valid users)
 */
export const cleanupOrphanedAccounts = mutation({
  args: {},
  handler: async (ctx) => {
    const accounts = await ctx.db.query("authAccounts").collect();

    let deleted = 0;
    for (const account of accounts) {
      if (account.userId) {
        const user = await ctx.db.get(account.userId);
        if (!user) {
          // User doesn't exist, delete the orphaned account
          await ctx.db.delete(account._id);
          deleted++;
        }
      }
    }

    return { deleted, message: `Cleaned up ${deleted} orphaned auth accounts` };
  },
});

/**
 * Delete auth account by email (provider account ID)
 */
export const deleteAuthAccountByEmail = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const accounts = await ctx.db
      .query("authAccounts")
      .filter((q) => q.eq(q.field("providerAccountId"), email))
      .collect();

    if (accounts.length === 0) {
      return { deleted: 0, message: "No accounts found for this email" };
    }

    for (const account of accounts) {
      await ctx.db.delete(account._id);
    }

    return { deleted: accounts.length, message: `Deleted ${accounts.length} account(s) for ${email}` };
  },
});
