import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

export async function getBudgetsForUserAndMonth(
  ctx: QueryCtx,
  userId: Id<"users">,
  month: string,
) {
  return ctx.db
    .query("categoryBudgets")
    .withIndex("by_user_and_month", (q) => q.eq("userId", userId).eq("month", month))
    .collect();
}

export async function getAllBudgetsForUser(ctx: QueryCtx, userId: Id<"users">) {
  return ctx.db
    .query("categoryBudgets")
    .withIndex("by_user_and_month", (q) => q.eq("userId", userId))
    .collect();
}

export async function getBudgetForCategoryAndMonth(
  ctx: QueryCtx,
  categoryId: Id<"categories">,
  month: string,
) {
  return ctx.db
    .query("categoryBudgets")
    .withIndex("by_category_and_month", (q) =>
      q.eq("categoryId", categoryId).eq("month", month),
    )
    .unique();
}

export async function upsertBudget(
  ctx: MutationCtx,
  data: {
    userId: Id<"users">;
    categoryId: Id<"categories">;
    month: string;
    assigned: number;
  },
) {
  const existing = await getBudgetForCategoryAndMonth(ctx, data.categoryId, data.month);
  if (existing) {
    await ctx.db.patch(existing._id, { assigned: data.assigned });
    return existing._id;
  }
  return ctx.db.insert("categoryBudgets", data);
}
