import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";

export function useCategories() {
  const createCategoryMutation = useMutation(api.categories.functions.createCategory);
  const deleteCategoryMutation = useMutation(api.categories.functions.deleteCategory);
  const unarchiveCategoryMutation = useMutation(api.categories.functions.unarchiveCategory);
  const setTargetMutation = useMutation(api.categories.functions.setTarget);
  const removeTargetMutation = useMutation(api.categories.functions.removeTarget);
  const assignBudgetMutation = useMutation(api.categoryBudgets.functions.assignBudget);

  const createCategory = async (name: string): Promise<boolean> => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Enter a category name");
      return false;
    }
    try {
      await createCategoryMutation({ name: trimmed });
      return true;
    } catch {
      toast.error("Failed to create category");
      return false;
    }
  };

  const deleteCategory = async (categoryId: Id<"categories">, fromMonth?: string): Promise<boolean> => {
    try {
      await deleteCategoryMutation({ categoryId, fromMonth });
      toast.success("Category archived");
      return true;
    } catch {
      toast.error("Failed to archive category");
      return false;
    }
  };

  const unarchiveCategory = async (categoryId: Id<"categories">): Promise<boolean> => {
    try {
      await unarchiveCategoryMutation({ categoryId });
      toast.success("Category restored");
      return true;
    } catch {
      toast.error("Failed to restore category");
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
      toast.error("Enter a valid target amount");
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
      toast.error("Failed to set target");
      return false;
    }
  };

  const removeTarget = async (categoryId: Id<"categories">): Promise<boolean> => {
    try {
      await removeTargetMutation({ categoryId });
      return true;
    } catch {
      toast.error("Failed to remove target");
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
      toast.error("Failed to assign budget");
      return false;
    }
  };

  return { createCategory, deleteCategory, unarchiveCategory, setTarget, removeTarget, assignBudget };
}
