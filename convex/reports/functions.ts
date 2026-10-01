import { query } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { monthValidator } from "../shared/validators";
import * as ReportsModel from "./model";

export const getReportData = query({
  args: { month: monthValidator },
  handler: async (ctx, { month }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return ReportsModel.getReportData(ctx, userId, month);
  },
});
