import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  // Include Convex Auth tables (authAccounts, authSessions, authRefreshTokens, authVerificationCodes, authVerifiers, authRateLimits)
  ...authTables,

  // Users table - stores user profiles and authentication info
  // Note: This extends/replaces the default users table from authTables
  users: defineTable({
    // Fields from Convex Auth (optional, for compatibility)
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    // Custom fields for our app
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    points: v.optional(v.number()),
    level: v.optional(v.number()),
    role: v.optional(
      v.union(
        v.literal("admin"),
        v.literal("parent"),
        v.literal("teen"),
        v.literal("kid"),
        v.literal("member")
      )
    ),
    lastActive: v.optional(v.number()), // timestamp
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("email", ["email"])
    .index("phone", ["phone"])
    .index("by_level", ["level"])
    .index("by_points", ["points"]),

  // Households table - groups of users (families)
  households: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    createdBy: v.id("users"),
    joinCode: v.optional(v.string()), // Unique code for joining
    settings: v.optional(
      v.object({
        allowInvites: v.boolean(),
        requireApproval: v.boolean(),
        maxMembers: v.number(),
        allowJoinByCode: v.optional(v.boolean()), // Allow joining via code
      })
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_creator", ["createdBy"])
    .index("by_join_code", ["joinCode"]),

  // Household members - many-to-many relationship
  householdMembers: defineTable({
    householdId: v.id("households"),
    userId: v.id("users"),
    role: v.union(
      v.literal("admin"),
      v.literal("parent"),
      v.literal("teen"),
      v.literal("kid"),
      v.literal("member")
    ),
    joinedAt: v.number(),
    parentId: v.optional(v.id("users")), // For kids/teens to link to their parent
    canApproveRedemptions: v.optional(v.boolean()),
  })
    .index("by_household", ["householdId"])
    .index("by_user", ["userId"])
    .index("by_household_user", ["householdId", "userId"]),

  // Chores table - the main chore data
  chores: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    points: v.number(),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    category: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly"), v.literal("seasonal")),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    householdId: v.id("households"),
    assignedTo: v.optional(v.id("users")),
    status: v.union(v.literal("pending"), v.literal("in_progress"), v.literal("completed")),
    dueDate: v.optional(v.number()), // timestamp
    completedAt: v.optional(v.number()), // timestamp
    completedBy: v.optional(v.id("users")),
    finalPoints: v.optional(v.number()), // includes bonuses/penalties
    bonusMessage: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_household", ["householdId"])
    .index("by_assigned_to", ["assignedTo"])
    .index("by_completed_by", ["completedBy"])
    .index("by_status", ["status"])
    .index("by_category", ["category"])
    .index("by_due_date", ["dueDate"])
    .index("by_household_status", ["householdId", "status"])
    .index("by_household_category", ["householdId", "category"]),

  // Chore completions - detailed completion history
  choreCompletions: defineTable({
    choreId: v.id("chores"),
    userId: v.id("users"),
    householdId: v.id("households"),
    completedAt: v.number(),
    pointsEarned: v.number(),
    bonusPoints: v.optional(v.number()),
    penaltyPoints: v.optional(v.number()),
    bonusMessage: v.optional(v.string()),
    isEarly: v.boolean(),
    isLate: v.boolean(),
    daysEarly: v.optional(v.number()),
    daysLate: v.optional(v.number()),
  })
    .index("by_chore", ["choreId"])
    .index("by_user", ["userId"])
    .index("by_household", ["householdId"])
    .index("by_user_household", ["userId", "householdId"])
    .index("by_completed_at", ["completedAt"])
    .index("by_user_completion", ["userId", "completedAt"]),

  // User stats - pre-calculated stats for performance
  userStats: defineTable({
    userId: v.id("users"),
    householdId: v.id("households"),
    totalChores: v.number(),
    completedChores: v.number(),
    totalPoints: v.number(),
    earnedPoints: v.number(),
    currentStreak: v.number(),
    longestStreak: v.number(),
    currentLevel: v.number(),
    currentLevelPoints: v.number(),
    pointsToNextLevel: v.number(),
    efficiencyScore: v.number(),
    lastActive: v.number(),
    levelPersistenceInfo: v.optional(v.object({
      level: v.number(),
      expiresAt: v.number(),
      pointsAtRedemption: v.number(),
    })),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_household", ["householdId"])
    .index("by_user_household", ["userId", "householdId"])
    .index("by_level", ["currentLevel"])
    .index("by_points", ["earnedPoints"])
    .index("by_efficiency", ["efficiencyScore"]),

  // User invites - for inviting family members
  userInvites: defineTable({
    email: v.string(),
    householdId: v.id("households"),
    invitedBy: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("declined"),
      v.literal("expired")
    ),
    token: v.string(),
    expiresAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_household", ["householdId"])
    .index("by_status", ["status"])
    .index("by_token", ["token"]),

  // Redemption requests - for point redemption
  redemptionRequests: defineTable({
    userId: v.id("users"),
    householdId: v.id("households"),
    pointsRequested: v.number(),
    cashAmount: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    requestedAt: v.number(),
    processedAt: v.optional(v.number()),
    processedBy: v.optional(v.id("users")),
    adminNotes: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_household", ["householdId"])
    .index("by_status", ["status"])
    .index("by_user_status", ["userId", "status"]),

  // Point deductions - track point deductions for redemptions
  pointDeductions: defineTable({
    userId: v.id("users"),
    householdId: v.id("households"),
    pointsDeducted: v.number(),
    reason: v.string(),
    redemptionRequestId: v.optional(v.id("redemptionRequests")),
    deductedAt: v.number(),
    deductedBy: v.optional(v.id("users")),
  })
    .index("by_user", ["userId"])
    .index("by_household", ["householdId"])
    .index("by_redemption_request", ["redemptionRequestId"]),
});
