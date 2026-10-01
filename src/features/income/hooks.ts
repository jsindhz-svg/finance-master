import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";

export function useIncome() {
  const addIncomeMutation = useMutation(api.transactions.functions.addIncome);
  const deleteIncomeMutation = useMutation(api.transactions.functions.deleteIncome);

  const addIncome = async (
    description: string,
    amount: number,
    date: string,
  ): Promise<boolean> => {
    if (!description.trim()) {
      toast.error("Enter a description");
      return false;
    }
    if (isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid amount");
      return false;
    }
    try {
      await addIncomeMutation({ description: description.trim(), amount, date });
      return true;
    } catch {
      toast.error("Failed to add income");
      return false;
    }
  };

  const deleteIncome = async (transactionId: Id<"transactions">): Promise<boolean> => {
    try {
      await deleteIncomeMutation({ transactionId });
      return true;
    } catch {
      toast.error("Failed to delete income");
      return false;
    }
  };

  return { addIncome, deleteIncome };
}
