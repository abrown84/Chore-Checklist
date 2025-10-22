import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table - stores user profiles and authentication info
  users: defineTable({
    email: v.string(),
    name: v.string(),
    avatarUrl: v.optional(v.string()),
    points: v.number(),
    level: v.number(),
    lastActive: v.number(), // timestamp
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_level", ["level"])
    .index("by_points", ["points"]),

  // Households table - groups of users (families)
  households: defineTable({
    name: v.string(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_creator", ["createdBy"]),

  // Household members - many-to-many relationship
  householdMembers: defineTable({
    householdId: v.id("households"),
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("member")),
    joinedAt: v.number(),
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
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("expired")),
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_household", ["householdId"])
    .index("by_status", ["status"])
    .index("by_token", ["token"]),
});
