import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { categoryNameValidator, targetTypeValidator, targetFrequencyValidator, amountValidator, monthValidator, validateString, validateAmount, validateMonth } from "../shared/validators";
import * as CategoriesModel from "./model";

export const createCategory = mutation({
  args: { name: categoryNameValidator },
  handler: async (ctx, { name }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    validateString(name, "Category name");
    const existing = await CategoriesModel.getCategoriesForUser(ctx, userId);
    const maxOrder = existing.reduce((max, c) => Math.max(max, c.sortOrder), 0);
    return CategoriesModel.insertCategory(ctx, {
      userId,
      name,
      sortOrder: maxOrder + 1,
      isHidden: false,
    });
  },
});

export const deleteCategory = mutation({
  args: {
    categoryId: v.id("categories"),
    fromMonth: v.optional(v.string()),
  },
  handler: async (ctx, { categoryId, fromMonth }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const category = await CategoriesModel.getCategory(ctx, categoryId);
    if (!category || category.userId !== userId) {
      throw new Error("Category not found");
    }
    if (fromMonth) {
      await CategoriesModel.hideCategoryFromMonth(ctx, categoryId, fromMonth);
    } else {
      await CategoriesModel.hideCategory(ctx, categoryId);
    }
  },
});

export const setTarget = mutation({
  args: {
    categoryId: v.id("categories"),
    targetType: targetTypeValidator,
    targetAmount: amountValidator,
    targetFrequency: targetFrequencyValidator,
    targetDate: v.optional(monthValidator),
  },
  handler: async (ctx, { categoryId, targetType, targetAmount, targetFrequency, targetDate }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    validateAmount(targetAmount);
    if (targetDate) validateMonth(targetDate);
    const category = await CategoriesModel.getCategory(ctx, categoryId);
    if (!category || category.userId !== userId) {
      throw new Error("Category not found");
    }
    await CategoriesModel.setTarget(ctx, categoryId, {
      targetType,
      targetAmount,
      targetFrequency,
      targetDate: targetFrequency === "custom_date" ? targetDate : undefined,
    });
  },
});

export const unarchiveCategory = mutation({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, { categoryId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const category = await CategoriesModel.getCategory(ctx, categoryId);
    if (!category || category.userId !== userId) {
      throw new Error("Category not found");
    }
    await CategoriesModel.unhideCategory(ctx, categoryId);
  },
});

export const removeTarget = mutation({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, { categoryId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const category = await CategoriesModel.getCategory(ctx, categoryId);
    if (!category || category.userId !== userId) {
      throw new Error("Category not found");
    }
    await CategoriesModel.removeTarget(ctx, categoryId);
  },
});
