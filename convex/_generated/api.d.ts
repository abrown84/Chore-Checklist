/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as authHelpers from "../authHelpers.js";
import type * as chores from "../chores.js";
import type * as cron from "../cron.js";
import type * as cronFunctions from "../cronFunctions.js";
import type * as households from "../households.js";
import type * as http from "../http.js";
import type * as invites from "../invites.js";
import type * as migrations from "../migrations.js";
import type * as redemptions from "../redemptions.js";
import type * as stats from "../stats.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  authHelpers: typeof authHelpers;
  chores: typeof chores;
  cron: typeof cron;
  cronFunctions: typeof cronFunctions;
  households: typeof households;
  http: typeof http;
  invites: typeof invites;
  migrations: typeof migrations;
  redemptions: typeof redemptions;
  stats: typeof stats;
  users: typeof users;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
