import { v } from "convex/values";

// Primitives
export const monthValidator = v.string(); // "YYYY-MM"
export const dateValidator = v.string(); // "YYYY-MM-DD"
export const amountValidator = v.number(); // positive dollar amount
export const categoryNameValidator = v.string();
export const descriptionValidator = v.string();

// Runtime validation helpers (Convex validators only check types, not formats)
const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
const DATE_RE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const MAX_STRING_LENGTH = 500;

export function validateMonth(value: string): string {
  if (!MONTH_RE.test(value)) throw new Error("Invalid month format, expected YYYY-MM");
  return value;
}

export function validateDate(value: string): string {
  if (!DATE_RE.test(value)) throw new Error("Invalid date format, expected YYYY-MM-DD");
  return value;
}

export function validateAmount(value: number): number {
  if (value < 0) throw new Error("Amount must not be negative");
  return value;
}

export function validateString(value: string, field: string): string {
  if (value.length === 0) throw new Error(`${field} must not be empty`);
  if (value.length > MAX_STRING_LENGTH) throw new Error(`${field} is too long (max ${MAX_STRING_LENGTH} chars)`);
  return value;
}

// Enums
export const transactionTypeValidator = v.union(
  v.literal("income"),
  v.literal("expense"),
  v.literal("cc_payment"),
);

export const targetTypeValidator = v.union(
  v.literal("monthly_spending"),
  v.literal("monthly_savings"),
  v.literal("balance_by_date"),
);

export const targetFrequencyValidator = v.union(
  v.literal("monthly"),
  v.literal("yearly"),
  v.literal("custom_date"),
);

// Composite — reused in schema.ts table defs AND function args
export const targetFields = {
  targetType: v.optional(targetTypeValidator),
  targetAmount: v.optional(amountValidator),
  targetFrequency: v.optional(targetFrequencyValidator),
  targetDate: v.optional(monthValidator), // used when frequency is "custom_date"
};

export const transactionFields = {
  categoryId: v.id("categories"),
  description: descriptionValidator,
  amount: amountValidator,
  date: dateValidator,
};

export const incomeFields = {
  description: descriptionValidator,
  amount: amountValidator,
  date: dateValidator,
};
