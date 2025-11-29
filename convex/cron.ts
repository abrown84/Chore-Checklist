import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Daily reset: Run every day at midnight UTC
crons.daily(
  "reset daily chores",
  {
    hourUTC: 0, // Midnight UTC
    minuteUTC: 0,
  },
  internal.cronFunctions.resetDailyChores
);

// Weekly reset: Run every Monday at midnight UTC
crons.weekly(
  "reset weekly chores",
  {
    dayOfWeek: "monday",
    hourUTC: 0, // Midnight UTC
    minuteUTC: 0,
  },
  internal.cronFunctions.resetWeeklyChores
);

// Monthly reset: Run on the 1st of every month at midnight UTC
crons.monthly(
  "reset monthly chores",
  {
    day: 1,
    hourUTC: 0, // Midnight UTC
    minuteUTC: 0,
  },
  internal.cronFunctions.resetMonthlyChores
);

// Seasonal reset: Run quarterly (every 3 months) on the 1st at midnight UTC
// This runs on Jan 1, Apr 1, Jul 1, Oct 1
crons.monthly(
  "reset seasonal chores",
  {
    day: 1,
    hourUTC: 0, // Midnight UTC
    minuteUTC: 0,
  },
  internal.cronFunctions.resetSeasonalChores
);

// Cleanup expired level persistence: Run daily at 2 AM UTC
crons.daily(
  "cleanup expired level persistence",
  {
    hourUTC: 2,
    minuteUTC: 0,
  },
  internal.cronFunctions.cleanupExpiredLevelPersistence
);

// Recalculate stats: Run daily at 3 AM UTC
crons.daily(
  "recalculate active household stats",
  {
    hourUTC: 3,
    minuteUTC: 0,
  },
  internal.cronFunctions.recalculateActiveHouseholdStats
);

export default crons;
