import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Migration: Import localStorage data to Convex
export const migrateLocalStorageData = mutation({
  args: {
    chores: v.array(v.any()),
    users: v.array(v.any()),
    userStats: v.any(),
    levelPersistence: v.optional(v.any()),
    pointDeductions: v.optional(v.any()),
    redemptionRequests: v.optional(v.array(v.any())),
  },
  handler: async (ctx, args) => {
    // With Convex Auth, getAuthUserId returns the user's _id directly
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();
    let migratedCount = 0;

    try {
      // 1. Update user profile with migrated data
      const existingUser = await ctx.db.get(userId);
      
      if (existingUser) {
        // Get localStorage user data to merge
        const localStorageUser = args.users[0];
        if (localStorageUser) {
          await ctx.db.patch(userId, {
            name: localStorageUser.name || existingUser.name || "Migrated User",
            avatarUrl: localStorageUser.avatarUrl || existingUser.avatarUrl || "👤",
            points: localStorageUser.points || existingUser.points || 0,
            level: localStorageUser.level || existingUser.level || 1,
            role: localStorageUser.role || existingUser.role || "admin",
            lastActive: now,
            updatedAt: now,
            createdAt: existingUser.createdAt || now,
          });
          migratedCount++;
        }
      }
      
      // 2. Create a default household for the user
      const householdId = await ctx.db.insert("households", {
        name: "My Household",
        createdBy: userId as any,
        createdAt: now,
        updatedAt: now,
      });

      // Add user as admin member
      await ctx.db.insert("householdMembers", {
        householdId,
        userId: userId as any,
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
            assignedTo: userId as any, // Assign to current user
            status: chore.completed ? "completed" : "pending",
            dueDate: chore.dueDate ? new Date(chore.dueDate).getTime() : undefined,
            completedAt: chore.completedAt ? new Date(chore.completedAt).getTime() : undefined,
            completedBy: chore.completedBy ? userId as any : undefined,
            finalPoints: chore.finalPoints || chore.points,
            bonusMessage: chore.bonusMessage,
            createdAt: chore.createdAt ? new Date(chore.createdAt).getTime() : now,
            updatedAt: now,
          });

          // Create completion record if chore was completed
          if (chore.completed && chore.completedAt) {
            await ctx.db.insert("choreCompletions", {
              choreId,
              userId: userId,
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
          // Check if levelPersistenceInfo should come from separate levelPersistence arg
          let levelPersistenceInfo = stats.levelPersistenceInfo;
          // Try to find level persistence by any key (we don't know the old localStorage key format)
          if (args.levelPersistence) {
            const lpValues = Object.values(args.levelPersistence);
            if (lpValues.length > 0) {
              const lp = lpValues[0] as any;
              levelPersistenceInfo = {
                level: lp.level,
                expiresAt: lp.expiresAt,
                pointsAtRedemption: lp.pointsAtRedemption,
              };
            }
          }

          await ctx.db.insert("userStats", {
            userId: userId,
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
            levelPersistenceInfo,
            updatedAt: now,
          });
        }
      }

      // 5. Migrate point deductions (assign all to current user since we can't map old IDs)
      if (args.pointDeductions) {
        const deductions = args.pointDeductions as Record<string, number>;
        for (const [_oldUserId, pointsDeducted] of Object.entries(deductions)) {
          if (pointsDeducted > 0) {
            await ctx.db.insert("pointDeductions", {
              userId: userId, // Assign to current user
              householdId,
              pointsDeducted,
              reason: "Migrated from localStorage",
              deductedAt: now,
            });
          }
        }
      }

      // 6. Migrate redemption requests
      if (args.redemptionRequests && Array.isArray(args.redemptionRequests)) {
        for (const request of args.redemptionRequests) {
          try {
            await ctx.db.insert("redemptionRequests", {
              userId: request.userId as any,
              householdId,
              pointsRequested: request.pointsRequested || 0,
              cashAmount: request.cashAmount || 0,
              status: request.status || "pending",
              requestedAt: request.requestedAt ? new Date(request.requestedAt).getTime() : now,
              processedAt: request.processedAt ? new Date(request.processedAt).getTime() : undefined,
              processedBy: request.processedBy as any,
              adminNotes: request.adminNotes,
            });
          } catch (error) {
            console.error("Error migrating redemption request:", error);
          }
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
