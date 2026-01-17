import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import GitHub from "@auth/core/providers/github";
import Google from "@auth/core/providers/google";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Email provider for password reset via Resend
const ResendPasswordReset = {
  id: "resend-otp-reset",
  name: "Resend",
  type: "email" as const,
  maxAge: 60 * 15, // 15 minutes
  async sendVerificationRequest({
    identifier: email,
    token,
  }: {
    identifier: string;
    token: string;
  }) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("RESEND_API_KEY is not configured");
      throw new Error("Email service not configured. Please contact support.");
    }

    const fromEmail = process.env.EMAIL_FROM || "Daily Bag <onboarding@resend.dev>";

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: email,
          subject: "Reset your Daily Bag password",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Reset Your Password</h2>
              <p>You requested to reset your password for Daily Bag.</p>
              <p>Your verification code is:</p>
              <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; letter-spacing: 8px; font-weight: bold; margin: 20px 0;">
                ${token}
              </div>
              <p>This code expires in 15 minutes.</p>
              <p>If you didn't request this, you can safely ignore this email.</p>
            </div>
          `,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Resend API error:", response.status, errorData);
        throw new Error("Failed to send reset email. Please try again.");
      }
    } catch (error) {
      console.error("Password reset email error:", error);
      throw error;
    }
  },
};

// Convex Auth setup with Password + OAuth providers
export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Password({ reset: ResendPasswordReset }),
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
    // Redirect after OAuth sign-in - ensures users go back to the app
    async redirect({ redirectTo }) {
      // Return the SITE_URL (or redirectTo if valid)
      // This ensures OAuth always redirects back to the frontend
      return redirectTo || process.env.SITE_URL || "/";
    },

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

/**
 * Check if the current user has password authentication set up
 */
export const hasPasswordAuth = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return false;
    }

    // Check if user has a password auth account
    const authAccount = await ctx.db
      .query("authAccounts")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), userId),
          q.eq(q.field("provider"), "password")
        )
      )
      .first();

    return !!authAccount;
  },
});

/**
 * Debug: List all auth accounts for the current user
 */
export const debugAuthAccounts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { userId: null, accounts: [] };
    }

    const user = await ctx.db.get(userId);
    const accounts = await ctx.db
      .query("authAccounts")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    return {
      userId,
      userEmail: user?.email,
      accounts: accounts.map(a => ({
        provider: a.provider,
        providerAccountId: a.providerAccountId,
      })),
    };
  },
});

/**
 * Delete the current user's account and all associated data
 */
export const deleteAccount = mutation({
  args: {
    confirmEmail: v.string(),
  },
  handler: async (ctx, { confirmEmail }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get the user to verify email
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Verify email matches for confirmation
    if (user.email?.toLowerCase() !== confirmEmail.toLowerCase()) {
      throw new Error("Email confirmation does not match");
    }

    // Delete auth accounts (password, OAuth links)
    const authAccounts = await ctx.db
      .query("authAccounts")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    for (const account of authAccounts) {
      await ctx.db.delete(account._id);
    }

    // Delete auth sessions
    const authSessions = await ctx.db
      .query("authSessions")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    for (const session of authSessions) {
      await ctx.db.delete(session._id);
    }

    // Delete household memberships
    const memberships = await ctx.db
      .query("householdMembers")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    for (const membership of memberships) {
      await ctx.db.delete(membership._id);
    }

    // Delete user's chores
    const chores = await ctx.db
      .query("chores")
      .filter((q) => q.eq(q.field("assignedTo"), userId))
      .collect();

    for (const chore of chores) {
      await ctx.db.delete(chore._id);
    }

    // Delete subscriptions
    const subscriptions = await ctx.db
      .query("subscriptions")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    for (const subscription of subscriptions) {
      await ctx.db.delete(subscription._id);
    }

    // Finally, delete the user
    await ctx.db.delete(userId);

    return { success: true };
  },
});
