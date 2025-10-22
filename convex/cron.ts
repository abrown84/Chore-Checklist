import { cronJobs } from "convex/server";
// import { internal } from "./_generated/api";

const crons = cronJobs();

// TODO: Re-enable cron jobs once basic functions are working
// For now, we'll handle resets manually through mutations

export default crons;
