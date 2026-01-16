import { mutation } from "./_generated/server"
import { v } from "convex/values"
import { getAuthUserId } from "@convex-dev/auth/server"

export const completeOnboarding = mutation({
  args: { dontShowAgain: v.boolean() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error("Not authenticated")

    await ctx.db.patch(userId, {
      hasCompletedOnboarding: true,
      onboardingDismissedPermanently: args.dontShowAgain,
    })

    return { success: true }
  },
})
