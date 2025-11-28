import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'

/**
 * Hook to get the current user's household
 * Returns the first household the user is a member of, or null if none exists
 * 
 * Note: This hook must be called unconditionally (not inside conditionals)
 * to maintain consistent hook order. The query will return undefined if not authenticated,
 * which is handled gracefully.
 */
export function useCurrentHousehold(): Id<"households"> | null {
  // Always call useQuery unconditionally - it handles loading/error states internally
  // Pass empty object as args - the query doesn't require any arguments
  // If user is not authenticated, query will return undefined
  const households = useQuery(api.households.getUserHouseholds, {})
  
  // Return null if query is still loading (undefined), failed, or no households found
  // useQuery returns undefined while loading, null on error, or the data when ready
  if (households === undefined || households === null || !Array.isArray(households) || households.length === 0) {
    return null
  }
  
  // Return the first household (could be enhanced to support multiple households)
  const firstHousehold = households[0]
  if (!firstHousehold) {
    return null
  }
  return firstHousehold._id as Id<"households">
}

