import { Infer } from "convex/values";
import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { targetTypeValidator } from "../shared/validators";

export async function getCategoriesForUser(ctx: QueryCtx, userId: Id<"users">) {
  return ctx.db
    .query("categories")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
}

export async function getVisibleCategoriesForUser(ctx: QueryCtx, userId: Id<"users">, month: string) {
  const all = await getCategoriesForUser(ctx, userId);
  return all
    .filter((c) => !c.isHidden || (c.hiddenFromMonth !== undefined && month < c.hiddenFromMonth))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function insertCategory(
  ctx: MutationCtx,
  data: {
    userId: Id<"users">;
    name: string;
    sortOrder: number;
    isHidden: boolean;
  },
) {
  return ctx.db.insert("categories", data);
}

export async function getCategory(ctx: QueryCtx, categoryId: Id<"categories">) {
  return ctx.db.get(categoryId);
}

export async function hideCategory(ctx: MutationCtx, categoryId: Id<"categories">) {
  await ctx.db.patch(categoryId, { isHidden: true, hiddenFromMonth: undefined });
}

export async function hideCategoryFromMonth(ctx: MutationCtx, categoryId: Id<"categories">, fromMonth: string) {
  await ctx.db.patch(categoryId, { isHidden: true, hiddenFromMonth: fromMonth });
}

export async function unhideCategory(ctx: MutationCtx, categoryId: Id<"categories">) {
  await ctx.db.patch(categoryId, { isHidden: false, hiddenFromMonth: undefined });
}

export async function getArchivedCategoriesForUser(ctx: QueryCtx, userId: Id<"users">, month: string) {
  const all = await getCategoriesForUser(ctx, userId);
  return all
    .filter((c) => c.isHidden && (!c.hiddenFromMonth || month >= c.hiddenFromMonth))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function setTarget(
  ctx: MutationCtx,
  categoryId: Id<"categories">,
  target: {
    targetType?: Infer<typeof targetTypeValidator>;
    targetAmount?: number;
    targetFrequency?: "monthly" | "yearly" | "custom_date";
    targetDate?: string;
  },
) {
  await ctx.db.patch(categoryId, target);
}

export async function removeTarget(ctx: MutationCtx, categoryId: Id<"categories">) {
  await ctx.db.patch(categoryId, {
    targetType: undefined,
    targetAmount: undefined,
    targetFrequency: undefined,
    targetDate: undefined,
  });
}
