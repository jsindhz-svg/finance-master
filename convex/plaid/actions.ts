"use node";

import { v } from "convex/values";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import { getPlaidClient } from "./plaidClient";
import { Products, CountryCode } from "plaid";

export const createLinkToken = action({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const plaidClient = getPlaidClient();
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: userId },
      client_name: "BudgetZero",
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: "en",
    });

    return response.data.link_token;
  },
});

export const exchangePublicToken = action({
  args: { publicToken: v.string() },
  handler: async (ctx, { publicToken }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const plaidClient = getPlaidClient();

    // Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });
    const { access_token, item_id } = exchangeResponse.data;

    // Get institution info
    const itemResponse = await plaidClient.itemGet({ access_token });
    const institutionId = itemResponse.data.item.institution_id ?? undefined;
    let institutionName: string | undefined;

    if (institutionId) {
      try {
        const instResponse = await plaidClient.institutionsGetById({
          institution_id: institutionId,
          country_codes: [CountryCode.Us],
        });
        institutionName = instResponse.data.institution.name;
      } catch {
        // Institution name is optional, continue without it
      }
    }

    // Save the plaid item
    const plaidItemId = await ctx.runMutation(internal.plaid.queries.savePlaidItem, {
      userId,
      itemId: item_id,
      accessToken: access_token,
      institutionId,
      institutionName,
    });

    // Fetch and save account balances
    const balanceResponse = await plaidClient.accountsBalanceGet({
      access_token,
    });

    const accounts = balanceResponse.data.accounts.map((account) => ({
      userId,
      plaidItemId,
      accountId: account.account_id,
      name: account.name,
      officialName: account.official_name ?? undefined,
      type: account.type,
      subtype: account.subtype ?? undefined,
      mask: account.mask ?? undefined,
      balanceCurrent: account.balances.current ?? undefined,
      balanceAvailable: account.balances.available ?? undefined,
      balanceLimit: account.balances.limit ?? undefined,
      isoCurrencyCode: account.balances.iso_currency_code ?? undefined,
    }));

    await ctx.runMutation(internal.plaid.queries.saveAccounts, {
      accounts,
      plaidItemId,
    });

    // Build account_id → plaidAccount lookup for CC detection
    const plaidAccounts = await ctx.runQuery(
      internal.plaid.queries.getPlaidAccountsForItem,
      { plaidItemId },
    );
    const accountMap = new Map(
      plaidAccounts.map((a) => [a.accountId, a]),
    );

    // If any account is a credit card, ensure CC Payment category exists
    const hasCreditCard = plaidAccounts.some((a) => a.type === "credit");
    if (hasCreditCard) {
      await ctx.runMutation(internal.plaid.queries.ensureCreditCardPaymentCategory, {
        userId,
      });
    }

    // Initial transaction sync
    let cursor: string | undefined;
    let hasMore = true;

    while (hasMore) {
      const syncResponse = await plaidClient.transactionsSync({
        access_token,
        cursor,
      });

      const { added, next_cursor, has_more } = syncResponse.data;

      const newTransactions = added
        .filter((txn) => !txn.pending)
        .map((txn) => {
          const plaidAccount = accountMap.get(txn.account_id);
          const isCreditCard = plaidAccount?.type === "credit";
          let type: "expense" | "income" | "cc_payment";
          if (isCreditCard) {
            // Positive Plaid amount on CC = expense (purchase), negative = cc_payment (payment received)
            type = txn.amount >= 0 ? "expense" : "cc_payment";
          } else {
            type = txn.amount >= 0 ? "expense" : "income";
          }
          return {
            userId,
            type,
            amount: Math.abs(txn.amount),
            description: txn.merchant_name || txn.name,
            date: txn.date,
            month: txn.date.slice(0, 7),
            plaidTransactionId: txn.transaction_id,
            plaidAccountId: plaidAccount?._id,
          };
        });

      if (newTransactions.length > 0) {
        await ctx.runMutation(internal.plaid.queries.savePlaidTransactions, {
          transactions: newTransactions,
        });
      }

      cursor = next_cursor;
      await ctx.runMutation(internal.plaid.queries.updatePlaidItemCursor, {
        plaidItemId,
        cursor: next_cursor,
        syncedAt: Date.now(),
      });

      hasMore = has_more;
    }

    return { success: true };
  },
});

export const syncTransactions = action({
  args: { plaidItemId: v.id("plaidItems") },
  handler: async (ctx, { plaidItemId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Verify ownership and get access token
    const plaidItem = await ctx.runQuery(internal.plaid.queries.getPlaidItemById, {
      plaidItemId,
    });
    if (!plaidItem || plaidItem.userId !== userId) {
      throw new Error("Plaid item not found");
    }

    const plaidClient = getPlaidClient();

    // Build account_id → plaidAccount lookup for CC detection
    const plaidAccounts = await ctx.runQuery(
      internal.plaid.queries.getPlaidAccountsForItem,
      { plaidItemId },
    );
    const accountMap = new Map(
      plaidAccounts.map((a) => [a.accountId, a]),
    );

    // If any account is a credit card, ensure CC Payment category exists
    const hasCreditCard = plaidAccounts.some((a) => a.type === "credit");
    if (hasCreditCard) {
      await ctx.runMutation(internal.plaid.queries.ensureCreditCardPaymentCategory, {
        userId,
      });
    }

    let cursor = plaidItem.cursor ?? undefined;
    let hasMore = true;

    while (hasMore) {
      const response = await plaidClient.transactionsSync({
        access_token: plaidItem.accessToken,
        cursor,
      });

      const { added, modified, removed, next_cursor, has_more } = response.data;

      // Process added transactions (skip pending)
      const newTransactions = added
        .filter((txn) => !txn.pending)
        .map((txn) => {
          const plaidAccount = accountMap.get(txn.account_id);
          const isCreditCard = plaidAccount?.type === "credit";
          let type: "expense" | "income" | "cc_payment";
          if (isCreditCard) {
            type = txn.amount >= 0 ? "expense" : "cc_payment";
          } else {
            type = txn.amount >= 0 ? "expense" : "income";
          }
          return {
            userId,
            type,
            amount: Math.abs(txn.amount),
            description: txn.merchant_name || txn.name,
            date: txn.date,
            month: txn.date.slice(0, 7),
            plaidTransactionId: txn.transaction_id,
            plaidAccountId: plaidAccount?._id,
          };
        });

      if (newTransactions.length > 0) {
        await ctx.runMutation(internal.plaid.queries.savePlaidTransactions, {
          transactions: newTransactions,
        });
      }

      // Process modified transactions (skip pending)
      const updatedTransactions = modified
        .filter((txn) => !txn.pending)
        .map((txn) => {
          const plaidAccount = accountMap.get(txn.account_id);
          const isCreditCard = plaidAccount?.type === "credit";
          let type: "expense" | "income" | "cc_payment";
          if (isCreditCard) {
            type = txn.amount >= 0 ? "expense" : "cc_payment";
          } else {
            type = txn.amount >= 0 ? "expense" : "income";
          }
          return {
            plaidTransactionId: txn.transaction_id,
            type,
            amount: Math.abs(txn.amount),
            description: txn.merchant_name || txn.name,
            date: txn.date,
            month: txn.date.slice(0, 7),
            plaidAccountId: plaidAccount?._id,
          };
        });

      if (updatedTransactions.length > 0) {
        await ctx.runMutation(internal.plaid.queries.updatePlaidTransactions, {
          transactions: updatedTransactions,
        });
      }

      // Process removed transactions
      const removedIds = removed.map((txn) => txn.transaction_id);
      if (removedIds.length > 0) {
        await ctx.runMutation(internal.plaid.queries.removePlaidTransactions, {
          plaidTransactionIds: removedIds,
        });
      }

      // Save cursor after each page
      cursor = next_cursor;
      await ctx.runMutation(internal.plaid.queries.updatePlaidItemCursor, {
        plaidItemId,
        cursor: next_cursor,
        syncedAt: Date.now(),
      });

      hasMore = has_more;
    }

    return { success: true };
  },
});

export const syncBalances = action({
  args: { plaidItemId: v.id("plaidItems") },
  handler: async (ctx, { plaidItemId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Verify ownership and get access token
    const plaidItem = await ctx.runQuery(internal.plaid.queries.getPlaidItemById, {
      plaidItemId,
    });
    if (!plaidItem || plaidItem.userId !== userId) {
      throw new Error("Plaid item not found");
    }

    const plaidClient = getPlaidClient();
    const balanceResponse = await plaidClient.accountsBalanceGet({
      access_token: plaidItem.accessToken,
    });

    const now = Date.now();
    const accounts = balanceResponse.data.accounts.map((account) => ({
      userId,
      plaidItemId,
      accountId: account.account_id,
      name: account.name,
      officialName: account.official_name ?? undefined,
      type: account.type,
      subtype: account.subtype ?? undefined,
      mask: account.mask ?? undefined,
      balanceCurrent: account.balances.current ?? undefined,
      balanceAvailable: account.balances.available ?? undefined,
      balanceLimit: account.balances.limit ?? undefined,
      isoCurrencyCode: account.balances.iso_currency_code ?? undefined,
      lastSyncedAt: now,
    }));

    await ctx.runMutation(internal.plaid.queries.saveAccounts, {
      accounts,
      plaidItemId,
    });

    await ctx.runMutation(internal.plaid.queries.markItemSynced, {
      plaidItemId,
      syncedAt: now,
    });

    return { success: true };
  },
});

