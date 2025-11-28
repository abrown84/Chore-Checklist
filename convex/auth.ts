import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { query, MutationCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [Password],
  callbacks: {
    // Initialize user profile with app-specific fields after sign up
    async afterUserCreatedOrUpdated(ctx: MutationCtx, { userId, existingUserId }) {
      // Only set defaults for new users (not updates)
      if (!existingUserId) {
        const now = Date.now();
        
        // Check if this is the first user (make them admin)
        const existingUsers = await ctx.db
          .query("users")
          .filter((q) => q.neq(q.field("role"), undefined))
          .collect();
        const isFirstUser = existingUsers.length === 0;
        
        // Set default values for new user
        await ctx.db.patch(userId, {
          points: 0,
          level: 1,
          role: isFirstUser ? "admin" : "member",
          avatarUrl: "👤",
          lastActive: now,
          createdAt: now,
          updatedAt: now,
        });
      }
    },
  },
});

// Query to get current authenticated user ID
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return await getAuthUserId(ctx);
  },
});

