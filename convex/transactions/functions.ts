import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { transactionFields, incomeFields, validateDate, validateAmount, validateString } from "../shared/validators";
import * as TransactionsModel from "./model";

export const addTransaction = mutation({
  args: transactionFields,
  handler: async (ctx, { categoryId, description, amount, date }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    validateDate(date);
    validateAmount(amount);
    validateString(description, "Description");
    const category = await ctx.db.get(categoryId);
    if (!category || category.userId !== userId) {
      throw new Error("Category not found");
    }
    const month = date.slice(0, 7); // "YYYY-MM"
    return TransactionsModel.insertTransaction(ctx, {
      userId,
      type: "expense",
      categoryId,
      month,
      description,
      amount,
      date,
    });
  },
});

export const deleteTransaction = mutation({
  args: { transactionId: v.id("transactions") },
  handler: async (ctx, { transactionId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const transaction = await TransactionsModel.getTransaction(ctx, transactionId);
    if (!transaction || transaction.userId !== userId) {
      throw new Error("Transaction not found");
    }
    await TransactionsModel.deleteTransaction(ctx, transactionId);
  },
});

export const updateTransactionCategory = mutation({
  args: {
    transactionId: v.id("transactions"),
    categoryId: v.id("categories"),
  },
  handler: async (ctx, { transactionId, categoryId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const transaction = await TransactionsModel.getTransaction(ctx, transactionId);
    if (!transaction || transaction.userId !== userId) {
      throw new Error("Transaction not found");
    }
    const category = await ctx.db.get(categoryId);
    if (!category || category.userId !== userId) {
      throw new Error("Category not found");
    }
    await ctx.db.patch(transactionId, { categoryId });
  },
});

export const addIncome = mutation({
  args: incomeFields,
  handler: async (ctx, { description, amount, date }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    validateDate(date);
    validateAmount(amount);
    validateString(description, "Description");
    const month = date.slice(0, 7); // "YYYY-MM"
    return TransactionsModel.insertTransaction(ctx, {
      userId,
      type: "income",
      month,
      description,
      amount,
      date,
    });
  },
});

export const deleteIncome = mutation({
  args: { transactionId: v.id("transactions") },
  handler: async (ctx, { transactionId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const transaction = await TransactionsModel.getTransaction(ctx, transactionId);
    if (!transaction || transaction.userId !== userId) {
      throw new Error("Income entry not found");
    }
    if (transaction.type !== "income") {
      throw new Error("Transaction is not an income entry");
    }
    await TransactionsModel.deleteTransaction(ctx, transactionId);
  },
});
