import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";

export function useTransactions() {
  const addTransactionMutation = useMutation(api.transactions.functions.addTransaction);
  const deleteTransactionMutation = useMutation(api.transactions.functions.deleteTransaction);
  const updateCategoryMutation = useMutation(api.transactions.functions.updateTransactionCategory);

  const addTransaction = async (
    categoryId: Id<"categories">,
    description: string,
    amount: number,
    date: string,
  ): Promise<boolean> => {
    if (!categoryId) {
      toast.error("Select a category");
      return false;
    }
    if (!description.trim()) {
      toast.error("Enter a description");
      return false;
    }
    if (isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid amount");
      return false;
    }
    try {
      await addTransactionMutation({
        categoryId,
        description: description.trim(),
        amount,
        date,
      });
      return true;
    } catch {
      toast.error("Failed to add transaction");
      return false;
    }
  };

  const deleteTransaction = async (transactionId: Id<"transactions">): Promise<boolean> => {
    try {
      await deleteTransactionMutation({ transactionId });
      return true;
    } catch {
      toast.error("Failed to delete transaction");
      return false;
    }
  };

  const updateTransactionCategory = async (
    transactionId: Id<"transactions">,
    categoryId: Id<"categories">,
  ): Promise<boolean> => {
    try {
      await updateCategoryMutation({ transactionId, categoryId });
      return true;
    } catch {
      toast.error("Failed to update category");
      return false;
    }
  };

  return { addTransaction, deleteTransaction, updateTransactionCategory };
}
