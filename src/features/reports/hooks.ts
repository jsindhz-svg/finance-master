import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function useReportData(month: string) {
  const data = useQuery(api.reports.functions.getReportData, { month });
  return { data: data ?? null, isLoading: data === undefined };
}
