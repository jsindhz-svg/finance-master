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
import type * as budget_functions from "../budget/functions.js";
import type * as budget_model from "../budget/model.js";
import type * as categories_functions from "../categories/functions.js";
import type * as categories_model from "../categories/model.js";
import type * as categoryBudgets_functions from "../categoryBudgets/functions.js";
import type * as categoryBudgets_model from "../categoryBudgets/model.js";
import type * as http from "../http.js";
import type * as plaid_actions from "../plaid/actions.js";
import type * as plaid_plaidClient from "../plaid/plaidClient.js";
import type * as plaid_queries from "../plaid/queries.js";
import type * as reports_functions from "../reports/functions.js";
import type * as reports_model from "../reports/model.js";
import type * as router from "../router.js";
import type * as shared_budgetMath from "../shared/budgetMath.js";
import type * as shared_validators from "../shared/validators.js";
import type * as transactions_functions from "../transactions/functions.js";
import type * as transactions_model from "../transactions/model.js";
import type * as transactions_queries from "../transactions/queries.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  "budget/functions": typeof budget_functions;
  "budget/model": typeof budget_model;
  "categories/functions": typeof categories_functions;
  "categories/model": typeof categories_model;
  "categoryBudgets/functions": typeof categoryBudgets_functions;
  "categoryBudgets/model": typeof categoryBudgets_model;
  http: typeof http;
  "plaid/actions": typeof plaid_actions;
  "plaid/plaidClient": typeof plaid_plaidClient;
  "plaid/queries": typeof plaid_queries;
  "reports/functions": typeof reports_functions;
  "reports/model": typeof reports_model;
  router: typeof router;
  "shared/budgetMath": typeof shared_budgetMath;
  "shared/validators": typeof shared_validators;
  "transactions/functions": typeof transactions_functions;
  "transactions/model": typeof transactions_model;
  "transactions/queries": typeof transactions_queries;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
