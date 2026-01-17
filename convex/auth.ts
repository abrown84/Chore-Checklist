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
    // Account linking: allows users to sign in with multiple methods (OAuth + password)
    async createOrUpdateUser(ctx, args) {
      // If user already exists for this auth account, return their ID
      if (args.existingUserId) {
        return args.existingUserId;
      }

      // Try to find existing user by email to link accounts
      const email = args.profile.email;
      if (email) {
        const existingUser = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("email"), email))
          .first();

        if (existingUser) {
          // Link this new auth method to the existing user
          return existingUser._id;
        }
      }

      // No existing user found - create a new one
      const name = args.profile.name ?? (email ? email.split("@")[0] : "User");
      return ctx.db.insert("users", {
        email,
        name,
        role: "member",
        level: 1,
        points: 0,
        hasCompletedOnboarding: false,
        createdAt: Date.now(),
      });
    },

    async afterUserCreatedOrUpdated(ctx, { userId, profile }) {
      // Get the user record
      const user = await ctx.db.get(userId);
      if (!user) return;

      // Update OAuth profile image if available and different
      const oauthImage = profile?.image ?? profile?.picture;
      if (oauthImage && oauthImage !== user.image) {
        await ctx.db.patch(userId, { image: oauthImage });
      }
    },
  },
});
