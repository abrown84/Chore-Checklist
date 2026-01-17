import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import GitHub from "@auth/core/providers/github";
import Google from "@auth/core/providers/google";

// Convex Auth setup with Password + OAuth providers
export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Password,
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx, { userId, existingUserId, profile }) {
      // Get the user record from the users table
      const existingUser = await ctx.db.get(userId);

      if (!existingUser) {
        // This shouldn't happen as Convex Auth creates the user record,
        // but handle it gracefully
        return;
      }

      // Check if we have a full user profile (with our custom fields)
      const hasUserProfile = existingUser.role !== undefined;

      if (!hasUserProfile) {
        // Create full user profile for new OAuth users
        const email = profile?.email ?? existingUser.email;
        const name = profile?.name ?? (email ? email.split("@")[0] : "User");
        const image = profile?.image ?? profile?.picture ?? undefined;

        await ctx.db.patch(userId, {
          email,
          name,
          image,
          role: "admin", // First user should be admin
          level: 1,
          points: 0,
          hasCompletedOnboarding: false,
          createdAt: Date.now(),
        });
      } else if (existingUserId) {
        // User exists and is being updated (e.g., re-authenticating via OAuth)
        // Update the image if it comes from OAuth and is different
        const oauthImage = profile?.image ?? profile?.picture;
        if (oauthImage && oauthImage !== existingUser.image) {
          await ctx.db.patch(userId, {
            image: oauthImage,
          });
        }
      }
    },
  },
});
