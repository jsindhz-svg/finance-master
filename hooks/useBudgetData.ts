import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

export function useBudgetData(month: string) {
  const data = useQuery(api.budget.functions.getBudgetData, { month });
  return { data: data ?? null, isLoading: data === undefined };
}
