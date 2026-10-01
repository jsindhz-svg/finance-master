import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { monthValidator, amountValidator, validateMonth, validateAmount } from "../shared/validators";
import * as CategoryBudgetsModel from "./model";
import * as CategoriesModel from "../categories/model";

export const assignBudget = mutation({
  args: {
    categoryId: v.id("categories"),
    month: monthValidator,
    assigned: amountValidator,
  },
  handler: async (ctx, { categoryId, month, assigned }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    validateMonth(month);
    validateAmount(assigned);
    const category = await CategoriesModel.getCategory(ctx, categoryId);
    if (!category || category.userId !== userId) {
      throw new Error("Category not found");
    }
    return CategoryBudgetsModel.upsertBudget(ctx, {
      userId,
      categoryId,
      month,
      assigned,
    });
  },
});
