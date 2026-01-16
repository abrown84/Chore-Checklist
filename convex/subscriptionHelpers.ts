import { internalMutation, internalQuery } from "./_generated/server"
import { v } from "convex/values"

/**
 * Internal mutation to handle checkout.session.completed from Payment Links
 * Creates a preliminary subscription record that will be updated by subscription.created
 */
export const handleCheckoutSessionCompleted = internalMutation({
  args: {
    userId: v.string(), // This is the client_reference_id from Payment Link
    stripeSubscriptionId: v.string(),
    stripeCustomerId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Check if subscription already exists (subscription.created may have fired first)
    const existingSubscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripe_subscription", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId)
      )
      .first()

    if (existingSubscription) {
      // Update existing subscription with userId if missing
      if (!existingSubscription.userId) {
        await ctx.db.patch(existingSubscription._id, {
          userId: args.userId as any, // Cast to Id<"users">
          stripeCustomerId: args.stripeCustomerId,
          updatedAt: now,
        })
      }
      return existingSubscription._id
    }

    // Create preliminary subscription record
    // subscription.created will update this with full details
    const subscriptionId = await ctx.db.insert("subscriptions", {
      userId: args.userId as any, // Cast to Id<"users">
      stripeCustomerId: args.stripeCustomerId,
      stripeSubscriptionId: args.stripeSubscriptionId,
      stripePriceId: "", // Will be filled by subscription.created
      status: "incomplete", // Will be updated by subscription.created
      plan: "premium", // Assume premium since they're checking out
      currentPeriodStart: now,
      currentPeriodEnd: now,
      cancelAtPeriodEnd: false,
      createdAt: now,
      updatedAt: now,
    })

    console.log(`Created preliminary subscription for user ${args.userId}`)
    return subscriptionId
  },
})

/**
 * Internal query to get userId from an existing subscription record
 * Used when subscription.created fires without metadata
 */
export const getUserIdBySubscription = internalQuery({
  args: {
    stripeSubscriptionId: v.string(),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripe_subscription", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId)
      )
      .first()

    return subscription?.userId ?? null
  },
})

// Plan limits configuration
export const PLAN_LIMITS = {
  free: {
    maxHouseholds: 1,
    maxMembersPerHousehold: 4,
  },
  premium: {
    maxHouseholds: Infinity,
    maxMembersPerHousehold: Infinity,
  },
} as const;

// Subscription status type
export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "trialing"
  | "incomplete"
  | "incomplete_expired"
  | "unpaid"
  | "paused";

// Plan type
export type PlanType = "free" | "premium";

/**
 * Internal mutation to sync subscription data from Stripe webhook events
 */
export const syncSubscriptionFromStripe = internalMutation({
  args: {
    userId: v.id("users"),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    stripePriceId: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("canceled"),
      v.literal("past_due"),
      v.literal("trialing"),
      v.literal("incomplete"),
      v.literal("incomplete_expired"),
      v.literal("unpaid"),
      v.literal("paused")
    ),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
    trialEnd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Check if subscription already exists
    const existingSubscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripe_subscription", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId)
      )
      .first();

    // Determine plan based on status
    const plan: PlanType =
      args.status === "active" || args.status === "trialing"
        ? "premium"
        : "free";

    if (existingSubscription) {
      // Update existing subscription
      await ctx.db.patch(existingSubscription._id, {
        status: args.status,
        stripePriceId: args.stripePriceId,
        currentPeriodStart: args.currentPeriodStart,
        currentPeriodEnd: args.currentPeriodEnd,
        cancelAtPeriodEnd: args.cancelAtPeriodEnd,
        trialEnd: args.trialEnd,
        plan,
        updatedAt: now,
      });

      return existingSubscription._id;
    } else {
      // Create new subscription
      const subscriptionId = await ctx.db.insert("subscriptions", {
        userId: args.userId,
        stripeCustomerId: args.stripeCustomerId,
        stripeSubscriptionId: args.stripeSubscriptionId,
        stripePriceId: args.stripePriceId,
        status: args.status,
        plan,
        currentPeriodStart: args.currentPeriodStart,
        currentPeriodEnd: args.currentPeriodEnd,
        cancelAtPeriodEnd: args.cancelAtPeriodEnd,
        trialEnd: args.trialEnd,
        createdAt: now,
        updatedAt: now,
      });

      return subscriptionId;
    }
  },
});

/**
 * Internal mutation to handle subscription changes (cancellation, reactivation, etc.)
 */
export const handleSubscriptionChange = internalMutation({
  args: {
    stripeSubscriptionId: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("canceled"),
      v.literal("past_due"),
      v.literal("trialing"),
      v.literal("incomplete"),
      v.literal("incomplete_expired"),
      v.literal("unpaid"),
      v.literal("paused")
    ),
    cancelAtPeriodEnd: v.optional(v.boolean()),
    currentPeriodEnd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripe_subscription", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId)
      )
      .first();

    if (!subscription) {
      console.warn(
        `Subscription not found for Stripe ID: ${args.stripeSubscriptionId}`
      );
      return null;
    }

    // Determine plan based on new status
    const plan: PlanType =
      args.status === "active" || args.status === "trialing"
        ? "premium"
        : "free";

    const updateData: Record<string, unknown> = {
      status: args.status,
      plan,
      updatedAt: Date.now(),
    };

    if (args.cancelAtPeriodEnd !== undefined) {
      updateData.cancelAtPeriodEnd = args.cancelAtPeriodEnd;
    }

    if (args.currentPeriodEnd !== undefined) {
      updateData.currentPeriodEnd = args.currentPeriodEnd;
    }

    await ctx.db.patch(subscription._id, updateData);

    return subscription._id;
  },
});

/**
 * Internal mutation to delete a subscription (when it's fully canceled/expired)
 */
export const deleteSubscription = internalMutation({
  args: {
    stripeSubscriptionId: v.string(),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripe_subscription", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId)
      )
      .first();

    if (subscription) {
      await ctx.db.delete(subscription._id);
      return true;
    }

    return false;
  },
});

/**
 * Internal query to get subscription by user ID
 */
export const getSubscriptionByUserId = internalQuery({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});

/**
 * Internal query to get user ID from Stripe customer ID
 */
export const getUserIdByStripeCustomer = internalQuery({
  args: {
    stripeCustomerId: v.string(),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripe_customer", (q) =>
        q.eq("stripeCustomerId", args.stripeCustomerId)
      )
      .first();

    return subscription?.userId ?? null;
  },
});

/**
 * Internal query to check if user has premium access
 */
export const checkPremiumAccess = internalQuery({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!subscription) {
      return { hasPremium: false, plan: "free" as PlanType };
    }

    const hasPremium =
      subscription.plan === "premium" &&
      (subscription.status === "active" || subscription.status === "trialing");

    return {
      hasPremium,
      plan: hasPremium ? ("premium" as PlanType) : ("free" as PlanType),
      subscription,
    };
  },
});

/**
 * Internal query to get plan limits for a user
 */
export const getUserPlanLimits = internalQuery({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    const isPremium =
      subscription &&
      subscription.plan === "premium" &&
      (subscription.status === "active" || subscription.status === "trialing");

    return isPremium ? PLAN_LIMITS.premium : PLAN_LIMITS.free;
  },
});

/**
 * Internal query to check if user can create more households
 */
export const canCreateHousehold = internalQuery({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get user's current households count
    const memberships = await ctx.db
      .query("householdMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Count households where user is an admin (creator)
    let ownedHouseholdsCount = 0;
    for (const membership of memberships) {
      if (membership.role === "admin") {
        ownedHouseholdsCount++;
      }
    }

    // Get user's plan limits
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    const isPremium =
      subscription &&
      subscription.plan === "premium" &&
      (subscription.status === "active" || subscription.status === "trialing");

    const limits = isPremium ? PLAN_LIMITS.premium : PLAN_LIMITS.free;

    return {
      canCreate: ownedHouseholdsCount < limits.maxHouseholds,
      currentCount: ownedHouseholdsCount,
      maxAllowed: limits.maxHouseholds,
      isPremium,
    };
  },
});

/**
 * Internal query to check if household can add more members
 */
export const canAddHouseholdMember = internalQuery({
  args: {
    householdId: v.id("households"),
  },
  handler: async (ctx, args) => {
    // Get household
    const household = await ctx.db.get(args.householdId);
    if (!household) {
      return { canAdd: false, reason: "Household not found" };
    }

    // Get current member count
    const members = await ctx.db
      .query("householdMembers")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    // Get the household creator's subscription status
    const creatorSubscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", household.createdBy))
      .first();

    const isPremium =
      creatorSubscription &&
      creatorSubscription.plan === "premium" &&
      (creatorSubscription.status === "active" ||
        creatorSubscription.status === "trialing");

    const limits = isPremium ? PLAN_LIMITS.premium : PLAN_LIMITS.free;

    return {
      canAdd: members.length < limits.maxMembersPerHousehold,
      currentCount: members.length,
      maxAllowed: limits.maxMembersPerHousehold,
      isPremium,
    };
  },
});
