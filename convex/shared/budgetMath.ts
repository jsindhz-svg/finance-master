export type TargetStatus = "met" | "underfunded" | "none";

export function monthDiff(a: string, b: string): number {
  const [ay, am] = a.split("-").map(Number);
  const [by, bm] = b.split("-").map(Number);
  return (by - ay) * 12 + (bm - am);
}

/**
 * Compute the monthly "needed" amount for a category target.
 *
 * targetFrequency controls the time horizon:
 *   - "monthly"     → targetAmount is per-month (divisor = 1)
 *   - "yearly"      → targetAmount is per-year  (divisor = 12)
 *   - "custom_date" → targetAmount is total, spread over months until targetDate
 *
 * targetType controls *what* we compare against:
 *   - "monthly_spending"  → compare assigned this month vs monthly need
 *   - "monthly_savings"   → compare available balance vs monthly need
 *   - "balance_by_date"   → compare available balance vs monthly need
 */
export function computeTargetNeeded(
  category: {
    targetType?: string;
    targetAmount?: number;
    targetFrequency?: string;
    targetDate?: string;
  },
  assignedThisMonth: number,
  available: number,
  currentMonth: string,
): { needed: number; status: TargetStatus } {
  if (!category.targetType || !category.targetAmount) {
    return { needed: 0, status: "none" };
  }

  const freq = category.targetFrequency ?? "monthly";

  // Determine the per-month target amount based on frequency
  let monthlyTarget: number;
  if (freq === "yearly") {
    monthlyTarget = Math.ceil((category.targetAmount / 12) * 100) / 100;
  } else if (freq === "custom_date" && category.targetDate) {
    const monthsRemaining = Math.max(1, monthDiff(currentMonth, category.targetDate) + 1);
    const shortfall = Math.max(0, category.targetAmount - available);
    monthlyTarget = Math.ceil((shortfall / monthsRemaining) * 100) / 100;
  } else {
    // monthly (default)
    monthlyTarget = category.targetAmount;
  }

  let needed = 0;

  if (category.targetType === "monthly_spending") {
    // How much more needs to be assigned this month
    if (freq === "custom_date") {
      needed = monthlyTarget; // already accounts for available via shortfall calc
    } else {
      needed = Math.max(0, monthlyTarget - assignedThisMonth);
    }
  } else if (category.targetType === "monthly_savings" || category.targetType === "balance_by_date") {
    // How much more is needed to reach the target balance
    if (freq === "custom_date") {
      needed = monthlyTarget; // already accounts for available via shortfall calc
    } else if (freq === "yearly") {
      const shortfall = Math.max(0, category.targetAmount - available);
      needed = Math.ceil((shortfall / 12) * 100) / 100;
    } else {
      needed = Math.max(0, monthlyTarget - available);
    }
  }

  const status: TargetStatus = needed <= 0 ? "met" : "underfunded";

  return { needed, status };
}
