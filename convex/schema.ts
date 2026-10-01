import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";
import {
  monthValidator,
  dateValidator,
  amountValidator,
  categoryNameValidator,
  descriptionValidator,
  targetFields,
  transactionTypeValidator,
} from "./shared/validators";

const applicationTables = {
  categories: defineTable({
    userId: v.id("users"),
    name: categoryNameValidator,
    sortOrder: v.number(),
    isHidden: v.boolean(),
    hiddenFromMonth: v.optional(v.string()),
    isCreditCardPayment: v.optional(v.boolean()),
    ...targetFields,
  }).index("by_user", ["userId"]),

  categoryBudgets: defineTable({
    userId: v.id("users"),
    categoryId: v.id("categories"),
    month: monthValidator,
    assigned: amountValidator,
  })
    .index("by_user_and_month", ["userId", "month"])
    .index("by_category_and_month", ["categoryId", "month"]),

  transactions: defineTable({
    userId: v.id("users"),
    type: transactionTypeValidator,
    categoryId: v.optional(v.id("categories")),
    month: monthValidator,
    description: descriptionValidator,
    amount: amountValidator,
    date: dateValidator,
    plaidTransactionId: v.optional(v.string()),
    plaidAccountId: v.optional(v.id("plaidAccounts")),
  })
    .index("by_user_and_month", ["userId", "month"])
    .index("by_category_and_month", ["categoryId", "month"])
    .index("by_user_type_and_month", ["userId", "type", "month"])
    .index("by_plaid_transaction_id", ["plaidTransactionId"]),

  plaidItems: defineTable({
    userId: v.id("users"),
    itemId: v.string(),
    accessToken: v.string(),
    institutionId: v.optional(v.string()),
    institutionName: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("error")),
    lastSyncedAt: v.optional(v.number()),
    cursor: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_item_id", ["itemId"]),

  plaidAccounts: defineTable({
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
    .index("by_user", ["userId"])
    .index("by_plaid_item", ["plaidItemId"])
    .index("by_account_id", ["accountId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
