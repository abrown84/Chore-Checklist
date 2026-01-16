import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { MutationCtx } from "./_generated/server";
import { DataModel } from "./_generated/dataModel";

// Configure Convex Auth with Password provider (simple, no password reset)
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
        
        // Efficiently check if this is the first user (make them admin)
        const allUsers = await ctx.db.query("users").collect();
        const isFirstUser = allUsers.length === 1;
        
        // Get the user to check if name was already set by profile method
        const user = await ctx.db.get(userId);
        
        // Set default values for new user
        await ctx.db.patch(userId, {
          points: user?.points ?? 0,
          level: user?.level ?? 1,
          role: user?.role ?? (isFirstUser ? "admin" : "member"),
          avatarUrl: user?.avatarUrl ?? "👤",
          lastActive: now,
          createdAt: user?.createdAt ?? now,
          updatedAt: now,
          hasCompletedOnboarding: false,
        });
      }
    },
  },
});
