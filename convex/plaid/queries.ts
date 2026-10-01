import { query, mutation, internalMutation, internalQuery } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// --- Internal functions (called from Node.js actions) ---

export const getPlaidItemById = internalQuery({
  args: { plaidItemId: v.id("plaidItems") },
  handler: async (ctx, { plaidItemId }) => {
    return await ctx.db.get(plaidItemId);
  },
});

export const savePlaidItem = internalMutation({
  args: {
    userId: v.id("users"),
    itemId: v.string(),
    accessToken: v.string(),
    institutionId: v.optional(v.string()),
    institutionName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("plaidItems", {
      userId: args.userId,
      itemId: args.itemId,
      accessToken: args.accessToken,
      institutionId: args.institutionId,
      institutionName: args.institutionName,
      status: "active",
      lastSyncedAt: Date.now(),
    });
  },
});

export const saveAccounts = internalMutation({
  args: {
    accounts: v.array(
      v.object({
        userId: v.id("users"),
        plaidItemId: v.id("plaidItems"),
        accountId: v.string(),
        name: v.string(),
        officialName: v.optional(v.string()),
        type: v.string(),
        subtype: v.optional(v.string()),
        mask: v.optional(v.string()),
        balanceCurrent: v.optional(v.number()),
        balanceAvailable: v.optional(v.number()),
        balanceLimit: v.optional(v.number()),
        isoCurrencyCode: v.optional(v.string()),
        lastSyncedAt: v.optional(v.number()),
      })
    ),
    plaidItemId: v.id("plaidItems"),
  },
  handler: async (ctx, { accounts, plaidItemId }) => {
    const now = Date.now();
    for (const account of accounts) {
      const existing = await ctx.db
        .query("plaidAccounts")
        .withIndex("by_account_id", (q) => q.eq("accountId", account.accountId))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          name: account.name,
          officialName: account.officialName,
          type: account.type,
          subtype: account.subtype,
          mask: account.mask,
          balanceCurrent: account.balanceCurrent,
          balanceAvailable: account.balanceAvailable,
          balanceLimit: account.balanceLimit,
          isoCurrencyCode: account.isoCurrencyCode,
          lastSyncedAt: account.lastSyncedAt ?? now,
        });
      } else {
        await ctx.db.insert("plaidAccounts", {
          ...account,
          lastSyncedAt: account.lastSyncedAt ?? now,
        });
      }
    }
  },
});

export const markItemSynced = internalMutation({
  args: {
    plaidItemId: v.id("plaidItems"),
    syncedAt: v.number(),
  },
  handler: async (ctx, { plaidItemId, syncedAt }) => {
    await ctx.db.patch(plaidItemId, { lastSyncedAt: syncedAt });
  },
});

export const getPlaidAccountByAccountId = internalQuery({
  args: { accountId: v.string() },
  handler: async (ctx, { accountId }) => {
    return await ctx.db
      .query("plaidAccounts")
      .withIndex("by_account_id", (q) => q.eq("accountId", accountId))
      .first();
  },
});

export const getPlaidAccountsForItem = internalQuery({
  args: { plaidItemId: v.id("plaidItems") },
  handler: async (ctx, { plaidItemId }) => {
    return await ctx.db
      .query("plaidAccounts")
      .withIndex("by_plaid_item", (q) => q.eq("plaidItemId", plaidItemId))
      .collect();
  },
});

export const ensureCreditCardPaymentCategory = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const existing = categories.find((c) => c.isCreditCardPayment === true);
    if (existing) return existing._id;

    const maxSortOrder = categories.reduce((max, c) => Math.max(max, c.sortOrder), 0);
    return await ctx.db.insert("categories", {
      userId,
      name: "Credit Card Payments",
      sortOrder: maxSortOrder + 1,
      isHidden: false,
      isCreditCardPayment: true,
    });
  },
});

export const savePlaidTransactions = internalMutation({
  args: {
    transactions: v.array(
      v.object({
        userId: v.id("users"),
        type: v.union(v.literal("expense"), v.literal("income"), v.literal("cc_payment")),
        month: v.string(),
        description: v.string(),
        amount: v.number(),
        date: v.string(),
        plaidTransactionId: v.string(),
        plaidAccountId: v.optional(v.id("plaidAccounts")),
      })
    ),
  },
  handler: async (ctx, { transactions }) => {
    for (const txn of transactions) {
      // Skip if already exists (deduplication)
      const existing = await ctx.db
        .query("transactions")
        .withIndex("by_plaid_transaction_id", (q) =>
          q.eq("plaidTransactionId", txn.plaidTransactionId)
        )
        .first();
      if (!existing) {
        await ctx.db.insert("transactions", txn);
      }
    }
  },
});

export const updatePlaidTransactions = internalMutation({
  args: {
    transactions: v.array(
      v.object({
        plaidTransactionId: v.string(),
        type: v.union(v.literal("expense"), v.literal("income"), v.literal("cc_payment")),
        month: v.string(),
        description: v.string(),
        amount: v.number(),
        date: v.string(),
        plaidAccountId: v.optional(v.id("plaidAccounts")),
      })
    ),
  },
  handler: async (ctx, { transactions }) => {
    for (const txn of transactions) {
      const existing = await ctx.db
        .query("transactions")
        .withIndex("by_plaid_transaction_id", (q) =>
          q.eq("plaidTransactionId", txn.plaidTransactionId)
        )
        .first();
      if (existing) {
        await ctx.db.patch(existing._id, {
          type: txn.type,
          month: txn.month,
          description: txn.description,
          amount: txn.amount,
          date: txn.date,
          plaidAccountId: txn.plaidAccountId,
        });
      }
    }
  },
});

export const removePlaidTransactions = internalMutation({
  args: {
    plaidTransactionIds: v.array(v.string()),
  },
  handler: async (ctx, { plaidTransactionIds }) => {
    for (const plaidTransactionId of plaidTransactionIds) {
      const existing = await ctx.db
        .query("transactions")
        .withIndex("by_plaid_transaction_id", (q) =>
          q.eq("plaidTransactionId", plaidTransactionId)
        )
        .first();
      if (existing) {
        await ctx.db.delete(existing._id);
      }
    }
  },
});

export const updatePlaidItemCursor = internalMutation({
  args: {
    plaidItemId: v.id("plaidItems"),
    cursor: v.string(),
    syncedAt: v.number(),
  },
  handler: async (ctx, { plaidItemId, cursor, syncedAt }) => {
    await ctx.db.patch(plaidItemId, { cursor, lastSyncedAt: syncedAt });
  },
});

export const getLinkedAccounts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const items = await ctx.db
      .query("plaidItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const result = await Promise.all(
      items.map(async (item) => {
        const accounts = await ctx.db
          .query("plaidAccounts")
          .withIndex("by_plaid_item", (q) => q.eq("plaidItemId", item._id))
          .collect();

        // Strip accessToken before returning to client
        const { accessToken: _, ...safeItem } = item;
        return {
          ...safeItem,
          accounts,
        };
      })
    );

    return result;
  },
});

export const unlinkAccount = mutation({
  args: { plaidItemId: v.id("plaidItems") },
  handler: async (ctx, { plaidItemId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const item = await ctx.db.get(plaidItemId);
    if (!item || item.userId !== userId) {
      throw new Error("Plaid item not found");
    }

    // Delete all accounts for this item
    const accounts = await ctx.db
      .query("plaidAccounts")
      .withIndex("by_plaid_item", (q) => q.eq("plaidItemId", plaidItemId))
      .collect();

    for (const account of accounts) {
      await ctx.db.delete(account._id);
    }

    // Delete the item itself
    await ctx.db.delete(plaidItemId);
  },
});
