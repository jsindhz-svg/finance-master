import { query } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { monthValidator } from "../shared/validators";
import * as BudgetModel from "./model";

export const getBudgetData = query({
  args: { month: monthValidator },
  handler: async (ctx, { month }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return BudgetModel.getBudgetData(ctx, userId, month);
  },
});
