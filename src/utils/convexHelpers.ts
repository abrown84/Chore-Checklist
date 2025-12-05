// Helper functions to convert between Convex types and frontend types
import type { Id } from "../../convex/_generated/dataModel";
import { Chore } from "../types/chore";
import { User } from "../types/user";

// Convert Convex chore to frontend Chore type
export function convexChoreToChore(convexChore: any, storageUrl?: string | null): Chore {
  const chore: Chore = {
    id: convexChore._id,
    title: convexChore.title,
    description: convexChore.description || "",
    difficulty: convexChore.difficulty,
    points: convexChore.points,
    category: convexChore.category,
    priority: convexChore.priority,
    completed: convexChore.status === "completed",
    completedAt: convexChore.completedAt ? new Date(convexChore.completedAt) : undefined,
    completedBy: convexChore.completedBy,
    createdAt: new Date(convexChore.createdAt),
    dueDate: convexChore.dueDate ? new Date(convexChore.dueDate) : undefined,
    assignedTo: convexChore.assignedTo,
    finalPoints: convexChore.finalPoints,
    bonusMessage: convexChore.bonusMessage,
    proofPhotoId: convexChore.proofPhotoId,
  };
  
  // Add photo URL if we have a storage ID and URL
  if (convexChore.proofPhotoId && storageUrl) {
    chore.proofPhotoUrl = storageUrl;
  }
  
  return chore;
}

// Convert frontend Chore type to Convex mutation args
export function choreToConvexArgs(chore: Omit<Chore, "id" | "createdAt" | "completed">, householdId: Id<"households">) {
  return {
    title: chore.title,
    description: chore.description || undefined,
    points: chore.points,
    difficulty: chore.difficulty,
    category: chore.category,
    priority: chore.priority,
    householdId,
    assignedTo: chore.assignedTo as Id<"users"> | undefined,
    dueDate: chore.dueDate ? chore.dueDate.getTime() : undefined,
  };
}

// Helper function to get a safe display name (never exposes email addresses)
export function getDisplayName(name?: string | null, email?: string | null): string {
  // Only use name if it exists and is non-empty
  if (name && name.trim().length > 0) {
    return name.trim();
  }
  // For privacy, never expose email addresses in the UI
  // Extract a friendly display name from email if available, otherwise use generic fallback
  if (email) {
    const emailName = email.split('@')[0];
    // Capitalize first letter and make it more friendly
    return emailName.charAt(0).toUpperCase() + emailName.slice(1);
  }
  return 'Unknown User';
}

// Convert Convex household member to frontend User type
export function convexMemberToUser(member: any): User {
  return {
    id: member.userId,
    email: member.user.email || "",
    name: member.user.name || "",
    avatar: member.user.avatarUrl || "👤",
    role: (member.role as User['role']) || 'member',
    joinedAt: new Date(member.joinedAt),
    isActive: true,
    canApproveRedemptions: member.role === 'admin' || member.role === 'parent' || member.canApproveRedemptions === true,
  };
}

