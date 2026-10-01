import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Alert } from "react-native";

export function useTransactions() {
  const addTransactionMutation = useMutation(api.transactions.functions.addTransaction);
  const deleteTransactionMutation = useMutation(api.transactions.functions.deleteTransaction);

  const addTransaction = async (
    categoryId: Id<"categories">,
    description: string,
    amount: number,
    date: string,
  ): Promise<boolean> => {
    if (!categoryId) {
      Alert.alert("Error", "Select a category");
      return false;
    }
    if (!description.trim()) {
      Alert.alert("Error", "Enter a description");
      return false;
    }
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Error", "Enter a valid amount");
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
      Alert.alert("Error", "Failed to add transaction");
      return false;
    }
  };

  const deleteTransaction = async (transactionId: Id<"transactions">): Promise<boolean> => {
    try {
      await deleteTransactionMutation({ transactionId });
      return true;
    } catch {
      Alert.alert("Error", "Failed to delete transaction");
      return false;
    }
  };

  return { addTransaction, deleteTransaction };
}
