import { action, query, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { components, internal } from "./_generated/api";
import { StripeSubscriptions } from "@convex-dev/stripe";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";
import { PLAN_LIMITS, type PlanType } from "./subscriptionHelpers";

// Initialize the Stripe client using the component
const stripeClient = new StripeSubscriptions(components.stripe, {
  // Uses STRIPE_SECRET_KEY from environment by default
});

// Price IDs from environment variables
// These should be set in Convex dashboard:
// - STRIPE_PRICE_MONTHLY: price_xxx for $4.99/mo
// - STRIPE_PRICE_YEARLY: price_xxx for $39.99/yr
// Trial periods should be configured in Stripe Dashboard on the prices themselves

// Admin/Creator emails who get free premium access
// Add your email here to bypass subscription requirements
const ADMIN_EMAILS = [
  "konfliktquake@gmail.com", // Creator email
];

/**
 * Check if a user is an admin/creator (gets free premium access)
 */
async function isAdmin(ctx: any, userId: string): Promise<boolean> {
  const user = await ctx.db.get(userId);
  if (!user?.email) return false;

  return ADMIN_EMAILS.includes(user.email.toLowerCase());
}

/**
 * Create a Stripe Checkout session for premium subscription
 * Note: Trial periods should be configured in Stripe Dashboard on the Price itself
 */
export const createCheckoutSession = action({
  args: {
    priceId: v.string(),
    successUrl: v.optional(v.string()),
    cancelUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the user ID from identity
    const userId = identity.subject;

    // Get or create a Stripe customer
    const customer = await stripeClient.getOrCreateCustomer(ctx, {
      userId: userId,
      email: identity.email ?? undefined,
      name: identity.name ?? undefined,
    });

    // Create checkout session
    const session = await stripeClient.createCheckoutSession(ctx, {
      priceId: args.priceId,
      customerId: customer.customerId,
      mode: "subscription",
      successUrl: args.successUrl ?? `${process.env.SITE_URL ?? "http://localhost:5173"}?success=true`,
      cancelUrl: args.cancelUrl ?? `${process.env.SITE_URL ?? "http://localhost:5173"}?canceled=true`,
      subscriptionMetadata: {
        userId: userId,
        convexUserId: userId,
      },
    });

    return {
      sessionId: session.sessionId,
      url: session.url,
    };
  },
});

/**
 * Create an embedded Stripe Checkout session for in-app payment modal
 * Returns a client_secret for the frontend to render the checkout
 * Note: Trial periods should be configured in Stripe Dashboard on the Price itself
 */
export const createEmbeddedCheckoutSession = action({
  args: {
    billingInterval: v.union(v.literal("monthly"), v.literal("yearly")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get price ID from environment based on billing interval
    const priceId = args.billingInterval === "monthly"
      ? process.env.STRIPE_PRICE_MONTHLY
      : process.env.STRIPE_PRICE_YEARLY;

    if (!priceId) {
      throw new Error(`Stripe price not configured for ${args.billingInterval} billing`);
    }

    const userId = identity.subject;

    // Get or create a Stripe customer
    const customer = await stripeClient.getOrCreateCustomer(ctx, {
      userId: userId,
      email: identity.email ?? undefined,
      name: identity.name ?? undefined,
    });

    // Use Stripe SDK directly for embedded checkout (requires ui_mode: 'embedded')
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    const returnUrl = `${process.env.SITE_URL ?? "http://localhost:5173"}?session_id={CHECKOUT_SESSION_ID}`;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      ui_mode: "embedded",
      customer: customer.customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      return_url: returnUrl,
      subscription_data: {
        metadata: {
          userId: userId,
          convexUserId: userId,
        },
      },
    });

    return {
      clientSecret: session.client_secret,
    };
  },
});

/**
 * Create a Stripe Customer Portal session for managing existing subscription
 */
export const createCustomerPortalSession = action({
  args: {
    returnUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Find user's subscription to get customer ID
    const subscriptions = await ctx.runQuery(
      components.stripe.public.listSubscriptionsByUserId,
      { userId: identity.subject }
    );

    if (subscriptions.length === 0) {
      return null;
    }

    // Create portal session
    const portal = await stripeClient.createCustomerPortalSession(ctx, {
      customerId: subscriptions[0].stripeCustomerId,
      returnUrl: args.returnUrl ?? process.env.SITE_URL ?? "http://localhost:5173",
    });

    return portal;
  },
});

/**
 * Get the current user's subscription status
 */
export const getUserSubscription = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    // Check if user is admin/creator - they get free premium access
    const userIsAdmin = await isAdmin(ctx, userId);
    if (userIsAdmin) {
      return {
        plan: "premium" as PlanType,
        status: "active",
        isActive: true,
        isPremium: true,
        limits: PLAN_LIMITS.premium,
        cancelAtPeriodEnd: false,
        currentPeriodEnd: null,
        isAdmin: true, // Flag to identify admin users
      };
    }

    // Query our local subscriptions table
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!subscription) {
      return {
        plan: "free" as PlanType,
        status: null,
        isActive: false,
        isPremium: false,
        limits: PLAN_LIMITS.free,
        cancelAtPeriodEnd: false,
        currentPeriodEnd: null,
      };
    }

    const isActive =
      subscription.status === "active" || subscription.status === "trialing";
    const isPremium = subscription.plan === "premium" && isActive;

    return {
      plan: subscription.plan,
      status: subscription.status,
      isActive,
      isPremium,
      limits: isPremium ? PLAN_LIMITS.premium : PLAN_LIMITS.free,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      currentPeriodEnd: subscription.currentPeriodEnd,
      trialEnd: subscription.trialEnd,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
    };
  },
});

/**
 * Check if a specific premium feature is enabled for the current user
 */
export const isFeatureEnabled = query({
  args: {
    feature: v.union(
      v.literal("unlimited_households"),
      v.literal("unlimited_members"),
      v.literal("premium_features")
    ),
  },
  handler: async (ctx, _args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return false;
    }

    // Check if user is admin/creator - they get all features
    const userIsAdmin = await isAdmin(ctx, userId);
    if (userIsAdmin) {
      return true;
    }

    // Query subscription status
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const isPremium =
      subscription &&
      subscription.plan === "premium" &&
      (subscription.status === "active" || subscription.status === "trialing");

    // All premium features are enabled for premium users
    if (isPremium) {
      return true;
    }

    // Free users don't have access to premium features
    return false;
  },
});

/**
 * Get plan limits for the current user
 */
export const getUserPlanLimits = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return PLAN_LIMITS.free;
    }

    // Check if user is admin/creator - they get premium limits
    const userIsAdmin = await isAdmin(ctx, userId);
    if (userIsAdmin) {
      return PLAN_LIMITS.premium;
    }

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const isPremium =
      subscription &&
      subscription.plan === "premium" &&
      (subscription.status === "active" || subscription.status === "trialing");

    return isPremium ? PLAN_LIMITS.premium : PLAN_LIMITS.free;
  },
});

/**
 * Check if user can create more households
 */
export const canCreateHousehold = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { canCreate: false, reason: "Not authenticated" };
    }

    // Check if user is admin/creator - they can create unlimited households
    const userIsAdmin = await isAdmin(ctx, userId);
    if (userIsAdmin) {
      return {
        canCreate: true,
        currentCount: 0,
        maxAllowed: PLAN_LIMITS.premium.maxHouseholds,
        isPremium: true,
        reason: undefined,
      };
    }

    // Get user's current households count (where they are admin)
    const memberships = await ctx.db
      .query("householdMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    let ownedHouseholdsCount = 0;
    for (const membership of memberships) {
      if (membership.role === "admin") {
        ownedHouseholdsCount++;
      }
    }

    // Get subscription status
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
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
      reason:
        ownedHouseholdsCount >= limits.maxHouseholds
          ? isPremium
            ? "Maximum households reached"
            : "Free plan allows only 1 household. Upgrade to premium for unlimited."
          : undefined,
    };
  },
});

/**
 * Check if a household can add more members
 */
export const canAddHouseholdMember = query({
  args: {
    householdId: v.id("households"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { canAdd: false, reason: "Not authenticated" };
    }

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

    // Check if household creator is admin - they get unlimited members
    const creatorIsAdmin = await isAdmin(ctx, household.createdBy);
    if (creatorIsAdmin) {
      return {
        canAdd: true,
        currentCount: members.length,
        maxAllowed: PLAN_LIMITS.premium.maxMembersPerHousehold,
        isPremium: true,
        reason: undefined,
      };
    }

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
      reason:
        members.length >= limits.maxMembersPerHousehold
          ? isPremium
            ? "Maximum members reached"
            : `Free plan allows only ${limits.maxMembersPerHousehold} members. Upgrade to premium for unlimited.`
          : undefined,
    };
  },
});

/**
 * Get available subscription plans with pricing
 * Note: Price IDs are NOT exposed to client for security
 */
export const getSubscriptionPlans = query({
  args: {},
  handler: async (_ctx) => {
    return {
      free: {
        name: "Free",
        price: 0,
        features: [
          "1 household",
          "Up to 4 members",
          "Basic chore tracking",
          "Points & rewards",
        ],
        limits: PLAN_LIMITS.free,
      },
      premiumMonthly: {
        name: "Premium Monthly",
        price: 4.99,
        interval: "month" as const,
        features: [
          "Unlimited households",
          "Unlimited members",
          "Advanced analytics",
          "Priority support",
        ],
        limits: PLAN_LIMITS.premium,
      },
      premiumYearly: {
        name: "Premium Yearly",
        price: 39.99,
        interval: "year" as const,
        savings: "Save $20/year",
        features: [
          "Unlimited households",
          "Unlimited members",
          "Advanced analytics",
          "Priority support",
        ],
        limits: PLAN_LIMITS.premium,
      },
    };
  },
});

/**
 * Internal action to handle webhook events from Stripe
 * This is called by the webhook handler in http.ts
 */
export const handleStripeWebhook = internalAction({
  args: {
    eventType: v.string(),
    subscriptionId: v.string(),
    customerId: v.string(),
    priceId: v.optional(v.string()),
    status: v.optional(v.string()),
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
    trialEnd: v.optional(v.number()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { eventType, subscriptionId, customerId, metadata } = args;

    console.log(`Processing Stripe webhook: ${eventType}`);

    // Map Stripe status to our status type
    const mapStatus = (stripeStatus: string | undefined) => {
      const statusMap: Record<string, string> = {
        active: "active",
        canceled: "canceled",
        past_due: "past_due",
        trialing: "trialing",
        incomplete: "incomplete",
        incomplete_expired: "incomplete_expired",
        unpaid: "unpaid",
        paused: "paused",
      };
      return (statusMap[stripeStatus || ""] || "incomplete") as
        | "active"
        | "canceled"
        | "past_due"
        | "trialing"
        | "incomplete"
        | "incomplete_expired"
        | "unpaid"
        | "paused";
    };

    switch (eventType) {
      // Handle checkout.session.completed from Payment Links
      // This event has the client_reference_id (userId) that we need
      case "checkout.session.completed": {
        const userId = metadata?.userId || metadata?.convexUserId;
        if (userId) {
          await ctx.runMutation(internal.subscriptionHelpers.handleCheckoutSessionCompleted, {
            userId: userId,
            stripeSubscriptionId: subscriptionId,
            stripeCustomerId: customerId,
          });
        } else {
          console.warn(`No userId in checkout.session.completed for subscription ${subscriptionId}`);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        // Try to get userId from metadata first
        let userId = metadata?.userId || metadata?.convexUserId;

        // If not in metadata, try to get from existing subscription record
        // (created by checkout.session.completed)
        if (!userId) {
          userId = await ctx.runQuery(
            internal.subscriptionHelpers.getUserIdBySubscription,
            { stripeSubscriptionId: subscriptionId }
          );
        }

        if (!userId) {
          console.warn(`No userId found for subscription ${subscriptionId}`);
          return;
        }

        await ctx.runMutation(internal.subscriptionHelpers.syncSubscriptionFromStripe, {
          userId: userId as Id<"users">,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          stripePriceId: args.priceId || "",
          status: mapStatus(args.status),
          currentPeriodStart: args.currentPeriodStart || Date.now(),
          currentPeriodEnd: args.currentPeriodEnd || Date.now(),
          cancelAtPeriodEnd: args.cancelAtPeriodEnd || false,
          trialEnd: args.trialEnd,
        });
        break;
      }

      case "customer.subscription.deleted": {
        await ctx.runMutation(internal.subscriptionHelpers.handleSubscriptionChange, {
          stripeSubscriptionId: subscriptionId,
          status: "canceled",
          cancelAtPeriodEnd: true,
        });
        break;
      }

      case "invoice.payment_failed": {
        await ctx.runMutation(internal.subscriptionHelpers.handleSubscriptionChange, {
          stripeSubscriptionId: subscriptionId,
          status: "past_due",
        });
        break;
      }

      case "invoice.payment_succeeded": {
        if (args.status === "active") {
          await ctx.runMutation(internal.subscriptionHelpers.handleSubscriptionChange, {
            stripeSubscriptionId: subscriptionId,
            status: "active",
            currentPeriodEnd: args.currentPeriodEnd,
          });
        }
        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${eventType}`);
    }
  },
});
