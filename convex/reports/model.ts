import { QueryCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import * as CategoriesModel from "../categories/model";
import * as CategoryBudgetsModel from "../categoryBudgets/model";
import * as TransactionsModel from "../transactions/model";
import { computeTargetNeeded } from "../budget/model";

export async function getReportData(ctx: QueryCtx, userId: Id<"users">, month: string) {
  const ccAccountIdsPromise = TransactionsModel.getCreditCardAccountIds(ctx, userId);
  const [categories, allBudgets, allTransactions, monthTransactions, monthIncome] =
    await Promise.all([
      CategoriesModel.getVisibleCategoriesForUser(ctx, userId, month),
      CategoryBudgetsModel.getAllBudgetsForUser(ctx, userId),
      TransactionsModel.getAllTransactionsForUser(ctx, userId),
      TransactionsModel.getTransactionsForUserAndMonth(ctx, userId, month),
      TransactionsModel.getIncomeForUserAndMonth(ctx, userId, month),
    ]);
  const ccAccountIds = await ccAccountIdsPromise;

  // Compute cumulative CC expenses up to current month
  const ccExpensesUpToMonth = allTransactions
    .filter(
      (t) =>
        t.month <= month &&
        t.plaidAccountId !== undefined &&
        ccAccountIds.has(t.plaidAccountId),
    )
    .reduce((sum, t) => sum + t.amount, 0);

  // Monthly overview
  const totalIncome = monthIncome.reduce((sum, i) => sum + i.amount, 0);

  const totalAssigned = allBudgets
    .filter((b) => b.month === month)
    .reduce((sum, b) => sum + b.assigned, 0);

  const totalActivity = -monthTransactions.reduce((sum, t) => sum + t.amount, 0);

  // Per-category breakdown
  const countByType: Record<string, number> = {
    monthly_spending: 0,
    monthly_savings: 0,
    balance_by_date: 0,
  };
  let totalTargetAmount = 0;
  let funded = 0;
  let underfunded = 0;
  let totalNeeded = 0;

  const categoryBreakdown = categories.map((cat) => {
    const budgetThisMonth = allBudgets.find(
      (b) => b.categoryId === cat._id && b.month === month,
    );
    const assigned = budgetThisMonth?.assigned ?? 0;

    const activity = -monthTransactions
      .filter((t) => t.categoryId === cat._id)
      .reduce((sum, t) => sum + t.amount, 0);

    const cumulativeAssigned = allBudgets
      .filter((b) => b.categoryId === cat._id && b.month <= month)
      .reduce((sum, b) => sum + b.assigned, 0);

    const cumulativeSpent = allTransactions
      .filter((t) => t.categoryId === cat._id && t.month <= month)
      .reduce((sum, t) => sum + t.amount, 0);

    let available = cumulativeAssigned - cumulativeSpent;

    // For the CC Payment category, auto-fund with cumulative CC expenses
    if (cat.isCreditCardPayment) {
      available += ccExpensesUpToMonth;
    }

    const { needed, status } = computeTargetNeeded(cat, assigned, available, month);

    // Accumulate target summary stats
    if (cat.targetType && cat.targetAmount) {
      totalTargetAmount += cat.targetAmount;
      countByType[cat.targetType] = (countByType[cat.targetType] ?? 0) + 1;
    }
    if (status === "met") funded++;
    if (status === "underfunded") underfunded++;
    totalNeeded += needed;

    return {
      _id: cat._id,
      name: cat.name,
      targetType: cat.targetType,
      targetAmount: cat.targetAmount,
      targetFrequency: cat.targetFrequency,
      targetDate: cat.targetDate,
      assigned,
      activity,
      available,
      targetNeeded: needed,
      targetStatus: status,
    };
  });

  return {
    month,
    targetSummary: {
      totalTargetAmount,
      countByType,
      funded,
      underfunded,
      totalNeeded,
    },
    monthlyOverview: {
      totalIncome,
      totalAssigned,
      totalActivity,
    },
    categoryBreakdown,
  };
}
