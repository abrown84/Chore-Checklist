import { getAuthUserId } from "@convex-dev/auth/server";
import { QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Helper function to get the current user's document ID
 * With Convex Auth, getAuthUserId() returns the user's _id directly
 */
export async function getCurrentUserId(
  ctx: QueryCtx | MutationCtx
): Promise<Id<"users"> | null> {
  const userId = await getAuthUserId(ctx);
  return userId;
}

/**
 * Helper function to require authentication - throws if not authenticated
 */
export async function requireAuth(
  ctx: QueryCtx | MutationCtx
): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Not authenticated");
  }
  return userId;
}
