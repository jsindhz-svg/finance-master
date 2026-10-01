import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Alert } from "react-native";

export function useIncome() {
  const addIncomeMutation = useMutation(api.income.functions.addIncome);
  const deleteIncomeMutation = useMutation(api.income.functions.deleteIncome);

  const addIncome = async (
    description: string,
    amount: number,
    date: string,
  ): Promise<boolean> => {
    if (!description.trim()) {
      Alert.alert("Error", "Enter a description");
      return false;
    }
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Error", "Enter a valid amount");
      return false;
    }
    try {
      await addIncomeMutation({ description: description.trim(), amount, date });
      return true;
    } catch {
      Alert.alert("Error", "Failed to add income");
      return false;
    }
  };

  const deleteIncome = async (incomeId: Id<"incomeEntries">): Promise<boolean> => {
    try {
      await deleteIncomeMutation({ incomeId });
      return true;
    } catch {
      Alert.alert("Error", "Failed to delete income");
      return false;
    }
  };

  return { addIncome, deleteIncome };
}
