import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { components, internal } from "./_generated/api";
import { registerRoutes } from "@convex-dev/stripe";

const http = httpRouter();

// Register Convex Auth HTTP routes (handles sign-in, sign-out, etc.)
auth.addHttpRoutes(http);

// Type helper for Stripe subscription objects from webhooks
interface StripeSubscriptionEvent {
  id: string;
  customer: string;
  status: string;
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  trial_end: number | null;
  metadata: Record<string, string>;
  items?: {
    data: Array<{
      price?: {
        id: string;
      };
    }>;
  };
}

// Type helper for Stripe invoice objects from webhooks
interface StripeInvoiceEvent {
  customer: string;
  subscription: string | null;
  lines?: {
    data: Array<{
      period?: {
        end: number;
      };
    }>;
  };
}

// Type helper for Stripe checkout session objects from webhooks (for Payment Links)
interface StripeCheckoutSessionEvent {
  id: string;
  customer: string;
  subscription: string | null;
  client_reference_id: string | null; // This is our userId from Payment Links
  customer_email: string | null;
  mode: string;
  metadata: Record<string, string>;
}

// Register Stripe webhook routes
// Webhook URL will be: https://<deployment>.convex.site/stripe/webhook
registerRoutes(http, components.stripe, {
  webhookPath: "/stripe/webhook",
  // Handle specific Stripe events
  events: {
    // Handle checkout session completion (from Payment Links)
    // This is where we get the client_reference_id (userId)
    "checkout.session.completed": async (ctx, event) => {
      const session = event.data.object as unknown as StripeCheckoutSessionEvent;

      // Only handle subscription checkouts
      if (session.mode !== "subscription" || !session.subscription) {
        console.log("Skipping non-subscription checkout session");
        return;
      }

      // Get userId from client_reference_id (set when user clicks Payment Link)
      const userId = session.client_reference_id;
      if (!userId) {
        console.warn("No client_reference_id in checkout session - cannot associate with user");
        return;
      }

      console.log(`Payment Link checkout completed for user ${userId}`);

      // Store the userId mapping for this subscription
      // The subscription.created event will fire separately with full subscription data
      // We pass the userId through metadata so it can be picked up
      await ctx.runAction(internal.stripe.handleStripeWebhook, {
        eventType: "checkout.session.completed",
        subscriptionId: session.subscription,
        customerId: session.customer,
        metadata: {
          userId: userId,
          convexUserId: userId,
        },
      });
    },
    "customer.subscription.created": async (ctx, event) => {
      const subscription = event.data.object as unknown as StripeSubscriptionEvent;
      await ctx.runAction(internal.stripe.handleStripeWebhook, {
        eventType: "customer.subscription.created",
        subscriptionId: subscription.id,
        customerId: subscription.customer,
        priceId: subscription.items?.data[0]?.price?.id,
        status: subscription.status,
        currentPeriodStart: subscription.current_period_start * 1000,
        currentPeriodEnd: subscription.current_period_end * 1000,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        trialEnd: subscription.trial_end ? subscription.trial_end * 1000 : undefined,
        metadata: subscription.metadata,
      });
    },
    "customer.subscription.updated": async (ctx, event) => {
      const subscription = event.data.object as unknown as StripeSubscriptionEvent;
      await ctx.runAction(internal.stripe.handleStripeWebhook, {
        eventType: "customer.subscription.updated",
        subscriptionId: subscription.id,
        customerId: subscription.customer,
        priceId: subscription.items?.data[0]?.price?.id,
        status: subscription.status,
        currentPeriodStart: subscription.current_period_start * 1000,
        currentPeriodEnd: subscription.current_period_end * 1000,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        trialEnd: subscription.trial_end ? subscription.trial_end * 1000 : undefined,
        metadata: subscription.metadata,
      });
    },
    "customer.subscription.deleted": async (ctx, event) => {
      const subscription = event.data.object as unknown as StripeSubscriptionEvent;
      await ctx.runAction(internal.stripe.handleStripeWebhook, {
        eventType: "customer.subscription.deleted",
        subscriptionId: subscription.id,
        customerId: subscription.customer,
        status: "canceled",
        metadata: subscription.metadata,
      });
    },
    "invoice.payment_failed": async (ctx, event) => {
      const invoice = event.data.object as unknown as StripeInvoiceEvent;
      if (invoice.subscription) {
        await ctx.runAction(internal.stripe.handleStripeWebhook, {
          eventType: "invoice.payment_failed",
          subscriptionId: invoice.subscription,
          customerId: invoice.customer,
          status: "past_due",
        });
      }
    },
    "invoice.payment_succeeded": async (ctx, event) => {
      const invoice = event.data.object as unknown as StripeInvoiceEvent;
      if (invoice.subscription) {
        await ctx.runAction(internal.stripe.handleStripeWebhook, {
          eventType: "invoice.payment_succeeded",
          subscriptionId: invoice.subscription,
          customerId: invoice.customer,
          status: "active",
          currentPeriodEnd: invoice.lines?.data[0]?.period?.end
            ? invoice.lines.data[0].period.end * 1000
            : undefined,
        });
      }
    },
  },
  // Log all events for debugging
  onEvent: async (_ctx, event) => {
    console.log(`Stripe webhook received: ${event.type}`);
  },
});

export default http;













