import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Migration: Import localStorage data to Convex
export const migrateLocalStorageData = mutation({
  args: {
    chores: v.array(v.any()),
    users: v.array(v.any()),
    userStats: v.any(),
  },
  handler: async (ctx, args) => {
    const identity = await getAuthUserId(ctx);
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();
    let migratedCount = 0;

    try {
      // 1. Create or update user
      const user = await ctx.db.get(identity);
      if (!user) {
        // Create user from localStorage data
        const localStorageUser = args.users.find((u: any) => u.id === identity) || args.users[0];
        if (localStorageUser) {
          await ctx.db.insert("users", {
            email: localStorageUser.email || "migrated@example.com",
            name: localStorageUser.name || "Migrated User",
            avatarUrl: localStorageUser.avatarUrl,
            points: localStorageUser.points || 0,
            level: localStorageUser.level || 1,
            lastActive: now,
            createdAt: now,
            updatedAt: now,
          });
          migratedCount++;
        }
      }

      // 2. Create a default household for the user
      const householdId = await ctx.db.insert("households", {
        name: "My Household",
        createdBy: identity,
        createdAt: now,
        updatedAt: now,
      });

      // Add user as admin member
      await ctx.db.insert("householdMembers", {
        householdId,
        userId: identity,
        role: "admin",
        joinedAt: now,
      });

      // 3. Migrate chores
      for (const chore of args.chores) {
        try {
          const choreId = await ctx.db.insert("chores", {
            title: chore.title,
            description: chore.description,
            points: chore.points,
            difficulty: chore.difficulty || "medium",
            category: chore.category || "daily",
            priority: chore.priority || "medium",
            householdId,
            assignedTo: identity, // Assign to current user
            status: chore.completed ? "completed" : "pending",
            dueDate: chore.dueDate ? new Date(chore.dueDate).getTime() : undefined,
            completedAt: chore.completedAt ? new Date(chore.completedAt).getTime() : undefined,
            completedBy: chore.completedBy ? identity : undefined,
            finalPoints: chore.finalPoints || chore.points,
            bonusMessage: chore.bonusMessage,
            createdAt: chore.createdAt ? new Date(chore.createdAt).getTime() : now,
            updatedAt: now,
          });

          // Create completion record if chore was completed
          if (chore.completed && chore.completedAt) {
            await ctx.db.insert("choreCompletions", {
              choreId,
              userId: identity,
              householdId,
              completedAt: new Date(chore.completedAt).getTime(),
              pointsEarned: chore.finalPoints || chore.points,
              bonusPoints: chore.finalPoints && chore.finalPoints > chore.points ? chore.finalPoints - chore.points : undefined,
              penaltyPoints: chore.finalPoints && chore.finalPoints < chore.points ? chore.points - chore.finalPoints : undefined,
              bonusMessage: chore.bonusMessage,
              isEarly: false, // Would need to calculate based on due date
              isLate: false, // Would need to calculate based on due date
            });
          }

          migratedCount++;
        } catch (error) {
          console.error("Error migrating chore:", error);
        }
      }

      // 4. Migrate user stats
      if (args.userStats) {
        const stats = Object.values(args.userStats)[0] as any;
        if (stats) {
          await ctx.db.insert("userStats", {
            userId: identity,
            householdId,
            totalChores: stats.totalChores || 0,
            completedChores: stats.completedChores || 0,
            totalPoints: stats.totalPoints || 0,
            earnedPoints: stats.earnedPoints || 0,
            currentStreak: stats.currentStreak || 0,
            longestStreak: stats.longestStreak || 0,
            currentLevel: stats.currentLevel || 1,
            currentLevelPoints: stats.currentLevelPoints || 0,
            pointsToNextLevel: stats.pointsToNextLevel || 100,
            efficiencyScore: stats.efficiencyScore || 0,
            lastActive: stats.lastActive ? new Date(stats.lastActive).getTime() : now,
            levelPersistenceInfo: stats.levelPersistenceInfo,
            updatedAt: now,
          });
        }
      }

      return {
        success: true,
        migratedCount,
        householdId,
        message: `Successfully migrated ${migratedCount} items to Convex`,
      };
    } catch (error) {
      console.error("Migration error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        migratedCount,
      };
    }
  },
});

// Query: Check if user has data to migrate
export const checkMigrationStatus = query({
  args: {},
  handler: async (ctx) => {
    const identity = await getAuthUserId(ctx);
    if (!identity) {
      return { needsMigration: false, reason: "Not authenticated" };
    }

    // Check if user already has data in Convex
    const user = await ctx.db.get(identity);
    if (!user) {
      return { needsMigration: true, reason: "User not found in Convex" };
    }

    // Check if user has any households
    const households = await ctx.db
      .query("householdMembers")
      .withIndex("by_user", (q) => q.eq("userId", identity))
      .collect();

    if (households.length === 0) {
      return { needsMigration: true, reason: "No households found" };
    }

    // Check if user has any chores
    const chores = await ctx.db
      .query("chores")
      .withIndex("by_household", (q) => q.eq("householdId", households[0].householdId))
      .collect();

    if (chores.length === 0) {
      return { needsMigration: true, reason: "No chores found" };
    }

    return { needsMigration: false, reason: "Data already exists in Convex" };
  },
});

// Query: Get migration instructions
export const getMigrationInstructions = query({
  args: {},
  handler: async (_ctx) => {
    return {
      instructions: [
        "1. Open your browser's developer tools (F12)",
        "2. Go to the Application/Storage tab",
        "3. Find localStorage and copy the following keys:",
        "   - 'chores' (array of chore objects)",
        "   - 'choreAppUsers' (array of user objects)", 
        "   - 'userStats' (object with user statistics)",
        "4. Use the migrateLocalStorageData mutation with this data",
        "5. After successful migration, you can clear localStorage"
      ],
      localStorageKeys: ["chores", "choreAppUsers", "userStats"],
    };
  },
});
