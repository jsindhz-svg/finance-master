import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Alert } from "react-native";

export function useCategories() {
  const createCategoryMutation = useMutation(api.categories.functions.createCategory);
  const deleteCategoryMutation = useMutation(api.categories.functions.deleteCategory);
  const setTargetMutation = useMutation(api.categories.functions.setTarget);
  const removeTargetMutation = useMutation(api.categories.functions.removeTarget);
  const assignBudgetMutation = useMutation(api.categoryBudgets.functions.assignBudget);

  const createCategory = async (name: string): Promise<boolean> => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert("Error", "Enter a category name");
      return false;
    }
    try {
      await createCategoryMutation({ name: trimmed });
      return true;
    } catch {
      Alert.alert("Error", "Failed to create category");
      return false;
    }
  };

  const deleteCategory = async (categoryId: Id<"categories">): Promise<boolean> => {
    try {
      await deleteCategoryMutation({ categoryId });
      return true;
    } catch {
      Alert.alert("Error", "Failed to delete category");
      return false;
    }
  };

  const setTarget = async (
    categoryId: Id<"categories">,
    targetType: "monthly_spending" | "monthly_savings" | "balance_by_date",
    targetAmount: number,
    targetFrequency: "monthly" | "yearly" | "custom_date",
    targetDate?: string,
  ): Promise<boolean> => {
    if (isNaN(targetAmount) || targetAmount <= 0) {
      Alert.alert("Error", "Enter a valid target amount");
      return false;
    }
    try {
      await setTargetMutation({
        categoryId,
        targetType,
        targetAmount,
        targetFrequency,
        targetDate: targetFrequency === "custom_date" ? targetDate || undefined : undefined,
      });
      return true;
    } catch {
      Alert.alert("Error", "Failed to set target");
      return false;
    }
  };

  const removeTarget = async (categoryId: Id<"categories">): Promise<boolean> => {
    try {
      await removeTargetMutation({ categoryId });
      return true;
    } catch {
      Alert.alert("Error", "Failed to remove target");
      return false;
    }
  };

  const assignBudget = async (
    categoryId: Id<"categories">,
    month: string,
    assigned: number,
  ): Promise<boolean> => {
    try {
      await assignBudgetMutation({ categoryId, month, assigned });
      return true;
    } catch {
      Alert.alert("Error", "Failed to assign budget");
      return false;
    }
  };

  return { createCategory, deleteCategory, setTarget, removeTarget, assignBudget };
}
