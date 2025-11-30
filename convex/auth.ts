import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { query, MutationCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { DataModel } from "./_generated/dataModel";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Password<DataModel>({
      // Extract custom fields from FormData and save them to user profile
      profile(params) {
        return {
          email: params.email as string,
          name: params.name as string | undefined,
        };
      },
    }),
  ],
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
        
        // Get the user to check if name was already set by profile method
        const user = await ctx.db.get(userId);
        
        // Set default values for new user (only if not already set by profile)
        await ctx.db.patch(userId, {
          points: user?.points ?? 0,
          level: user?.level ?? 1,
          role: user?.role ?? (isFirstUser ? "admin" : "member"),
          avatarUrl: user?.avatarUrl ?? "👤",
          lastActive: now,
          createdAt: user?.createdAt ?? now,
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

