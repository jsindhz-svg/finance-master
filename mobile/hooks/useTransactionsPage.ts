import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

export function useTransactionsPageData(month?: string) {
  return useQuery(api.transactions.queries.getTransactionsPageData, { month });
}
