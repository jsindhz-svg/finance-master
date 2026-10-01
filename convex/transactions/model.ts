import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

export async function getCreditCardAccountIds(
  ctx: QueryCtx,
  userId: Id<"users">,
): Promise<Set<Id<"plaidAccounts">>> {
  const accounts = await ctx.db
    .query("plaidAccounts")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
  return new Set(
    accounts.filter((a) => a.type === "credit").map((a) => a._id),
  );
}

export async function getTransactionsForUserAndMonth(
  ctx: QueryCtx,
  userId: Id<"users">,
  month: string,
) {
  return ctx.db
    .query("transactions")
    .withIndex("by_user_type_and_month", (q) =>
      q.eq("userId", userId).eq("type", "expense").eq("month", month),
    )
    .collect();
}

export async function getAllTransactionsForUser(ctx: QueryCtx, userId: Id<"users">) {
  return ctx.db
    .query("transactions")
    .withIndex("by_user_type_and_month", (q) =>
      q.eq("userId", userId).eq("type", "expense"),
    )
    .collect();
}

export async function getIncomeForUserAndMonth(
  ctx: QueryCtx,
  userId: Id<"users">,
  month: string,
) {
  return ctx.db
    .query("transactions")
    .withIndex("by_user_type_and_month", (q) =>
      q.eq("userId", userId).eq("type", "income").eq("month", month),
    )
    .collect();
}

export async function getAllIncomeForUser(ctx: QueryCtx, userId: Id<"users">) {
  return ctx.db
    .query("transactions")
    .withIndex("by_user_type_and_month", (q) =>
      q.eq("userId", userId).eq("type", "income"),
    )
    .collect();
}

export async function getAllTransactionsForUserAllTypes(ctx: QueryCtx, userId: Id<"users">) {
  return ctx.db
    .query("transactions")
    .withIndex("by_user_and_month", (q) => q.eq("userId", userId))
    .collect();
}

export async function getTransactionsForUserAndMonthAllTypes(
  ctx: QueryCtx,
  userId: Id<"users">,
  month: string,
) {
  return ctx.db
    .query("transactions")
    .withIndex("by_user_and_month", (q) =>
      q.eq("userId", userId).eq("month", month),
    )
    .collect();
}

export async function insertTransaction(
  ctx: MutationCtx,
  data: {
    userId: Id<"users">;
    type: "income" | "expense";
    categoryId?: Id<"categories">;
    month: string;
    description: string;
    amount: number;
    date: string;
  },
) {
  return ctx.db.insert("transactions", data);
}

export async function getTransaction(ctx: QueryCtx, transactionId: Id<"transactions">) {
  return ctx.db.get(transactionId);
}

export async function deleteTransaction(
  ctx: MutationCtx,
  transactionId: Id<"transactions">,
) {
  await ctx.db.delete(transactionId);
}
