import { query } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import * as TransactionsModel from "./model";
import * as CategoriesModel from "../categories/model";

export const getTransactionsPageData = query({
  args: { month: v.optional(v.string()) },
  handler: async (ctx, { month }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const [transactions, categories] = await Promise.all([
      month
        ? TransactionsModel.getTransactionsForUserAndMonthAllTypes(ctx, userId, month)
        : TransactionsModel.getAllTransactionsForUserAllTypes(ctx, userId),
      CategoriesModel.getVisibleCategoriesForUser(ctx, userId, month ?? "0000-00"),
    ]);

    const categoryMap: Record<string, string> = {};
    for (const cat of categories) {
      categoryMap[cat._id] = cat.name;
    }

    return { transactions, categories, categoryMap };
  },
});
