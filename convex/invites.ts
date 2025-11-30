import { mutation, query, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUserId } from "./authHelpers";
import { internal } from "./_generated/api";

// Query: Get invites for a household
export const getHouseholdInvites = query({
  args: { householdId: v.id("households") },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household_user", (q) =>
        q.eq("householdId", args.householdId).eq("userId", userId as any)
      )
      .first();

    if (!membership) {
      throw new Error("Not a member of this household");
    }

    const invites = await ctx.db
      .query("userInvites")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    return invites;
  },
});

// Query: Get invites by status
export const getInvitesByStatus = query({
  args: {
    householdId: v.id("households"),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("declined"),
      v.literal("expired")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household_user", (q) =>
        q.eq("householdId", args.householdId).eq("userId", userId as any)
      )
      .first();

    if (!membership) {
      throw new Error("Not a member of this household");
    }

    const invites = await ctx.db
      .query("userInvites")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();

    return invites.filter((invite) => invite.householdId === args.householdId);
  },
});

// Mutation: Create invite
export const createInvite = mutation({
  args: {
    householdId: v.id("households"),
    email: v.string(),
    phoneNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Verify user is admin of household
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household_user", (q) =>
        q.eq("householdId", args.householdId).eq("userId", userId as any)
      )
      .first();

    if (!membership || membership.role !== "admin") {
      throw new Error("Not authorized to create invites");
    }

    // Get household to retrieve join code
    const household = await ctx.db.get(args.householdId);
    if (!household) {
      throw new Error("Household not found");
    }

    // Check if invite already exists for this email
    const existingInvite = await ctx.db
      .query("userInvites")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .filter((q) => q.eq(q.field("householdId"), args.householdId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (existingInvite) {
      throw new Error("Invite already exists for this email");
    }

    // Generate token
    const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const now = Date.now();
    const expiresAt = now + 7 * 24 * 60 * 60 * 1000; // 7 days

    const inviteId = await ctx.db.insert("userInvites", {
      email: args.email,
      householdId: args.householdId,
      invitedBy: userId as any,
      status: "pending",
      token,
      expiresAt,
      createdAt: now,
    });

    // Send SMS with household code if phone number is provided
    if (args.phoneNumber && household.joinCode) {
      // Schedule SMS sending as an action (non-blocking)
      await ctx.scheduler.runAfter(0, internal.invites.sendInviteSMS, {
        phoneNumber: args.phoneNumber,
        householdName: household.name,
        joinCode: household.joinCode,
        inviteId,
      });
    }

    return inviteId;
  },
});

// Mutation: Accept invite
export const acceptInvite = mutation({
  args: {
    inviteId: v.id("userInvites"),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const invite = await ctx.db.get(args.inviteId);
    if (!invite) {
      throw new Error("Invite not found");
    }

    if (invite.status !== "pending") {
      throw new Error("Invite is not pending");
    }

    // Check if invite is expired
    if (invite.expiresAt && Date.now() > invite.expiresAt) {
      await ctx.db.patch(args.inviteId, { status: "expired" });
      throw new Error("Invite has expired");
    }

    // Check if user is already a member
    const existingMembership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household_user", (q) =>
        q.eq("householdId", invite.householdId).eq("userId", userId as any)
      )
      .first();

    if (existingMembership) {
      await ctx.db.patch(args.inviteId, { status: "accepted" });
      throw new Error("User is already a member of this household");
    }

    // Add user as member
    const now = Date.now();
    await ctx.db.insert("householdMembers", {
      householdId: invite.householdId,
      userId: userId as any,
      role: "member",
      joinedAt: now,
    });

    // Update invite status
    await ctx.db.patch(args.inviteId, {
      status: "accepted",
    });

    return { success: true, householdId: invite.householdId };
  },
});

// Mutation: Decline invite
export const declineInvite = mutation({
  args: {
    inviteId: v.id("userInvites"),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const invite = await ctx.db.get(args.inviteId);
    if (!invite) {
      throw new Error("Invite not found");
    }

    await ctx.db.patch(args.inviteId, {
      status: "declined",
    });

    return { success: true };
  },
});

// Mutation: Cancel invite (admin only)
export const cancelInvite = mutation({
  args: {
    inviteId: v.id("userInvites"),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const invite = await ctx.db.get(args.inviteId);
    if (!invite) {
      throw new Error("Invite not found");
    }

    // Verify user is admin of household
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household_user", (q) =>
        q.eq("householdId", invite.householdId).eq("userId", userId as any)
      )
      .first();

    if (!membership || membership.role !== "admin") {
      throw new Error("Not authorized to cancel invites");
    }

    await ctx.db.delete(args.inviteId);
    return { success: true };
  },
});

// Query: Get invites sent to current user (by email)
export const getMyInvites = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) {
      return [];
    }

    // Get current user's email
    const user = await ctx.db.get(userId as any);
    if (!user || !('email' in user) || !user.email) {
      return [];
    }

    // Find all pending invites for this email
    const invites = await ctx.db
      .query("userInvites")
      .withIndex("by_email", (q) => q.eq("email", user.email as string))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    // Filter out expired invites and enrich with household info
    const now = Date.now();
    const validInvites = await Promise.all(
      invites
        .filter((invite) => !invite.expiresAt || invite.expiresAt > now)
        .map(async (invite) => {
          const household = await ctx.db.get(invite.householdId);
          const inviter = await ctx.db.get(invite.invitedBy);
          
          return {
            ...invite,
            household: household
              ? {
                  _id: household._id,
                  name: household.name,
                  description: household.description,
                }
              : null,
            inviter: inviter
              ? {
                  _id: inviter._id,
                  name: inviter.name,
                  email: inviter.email,
                }
              : null,
          };
        })
    );

    return validInvites;
  },
});

// Internal action: Send SMS with household join code
export const sendInviteSMS = internalAction({
  args: {
    phoneNumber: v.string(),
    householdName: v.string(),
    joinCode: v.string(),
    inviteId: v.id("userInvites"),
  },
  handler: async (_ctx, args) => {
    // Get Twilio credentials from environment
    // In Convex, environment variables are accessed via process.env
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    // If Twilio is not configured, log and return (don't fail the invite)
    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      console.log("Twilio not configured. SMS not sent. Invite created successfully.");
      return { success: false, reason: "SMS service not configured" };
    }

    try {
      // Format phone number (ensure it starts with +)
      let formattedPhone = args.phoneNumber.trim();
      if (!formattedPhone.startsWith("+")) {
        // Assume US number if no country code
        if (formattedPhone.startsWith("1")) {
          formattedPhone = "+" + formattedPhone;
        } else {
          formattedPhone = "+1" + formattedPhone.replace(/\D/g, "");
        }
      }

      // Create SMS message
      const message = `You've been invited to join ${args.householdName} on Daily Bag! Use join code: ${args.joinCode}`;

      // Send SMS via Twilio
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
      
      const formData = new URLSearchParams();
      formData.append("To", formattedPhone);
      formData.append("From", twilioPhoneNumber);
      formData.append("Body", message);

      const response = await fetch(twilioUrl, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Twilio SMS error:", errorText);
        return { success: false, reason: "SMS sending failed" };
      }

      const result = await response.json();
      console.log("SMS sent successfully:", result.sid);
      return { success: true, messageSid: result.sid };
    } catch (error) {
      console.error("Error sending SMS:", error);
      // Don't throw - invite was already created, SMS failure shouldn't break the flow
      return { success: false, reason: error instanceof Error ? error.message : "Unknown error" };
    }
  },
});

