import { QueryCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import * as CategoriesModel from "../categories/model";
import * as CategoryBudgetsModel from "../categoryBudgets/model";
import * as TransactionsModel from "../transactions/model";
import { computeTargetNeeded, type TargetStatus } from "../shared/budgetMath";

export { computeTargetNeeded, monthDiff } from "../shared/budgetMath";
export type { TargetStatus } from "../shared/budgetMath";

interface CategoryBudgetRow {
  _id: Id<"categories">;
  name: string;
  assigned: number;
  activity: number;
  available: number;
  targetType?: string;
  targetAmount?: number;
  targetFrequency?: string;
  targetDate?: string;
  targetNeeded: number;
  targetStatus: TargetStatus;
  isCreditCardPayment?: boolean;
}

export async function getBudgetData(ctx: QueryCtx, userId: Id<"users">, month: string) {
  // Fetch all data in parallel
  const ccAccountIdsPromise = TransactionsModel.getCreditCardAccountIds(ctx, userId);
  const [categories, allBudgets, allTransactions, allIncome, monthTransactions, monthIncome, archivedCategoriesRaw] =
    await Promise.all([
      CategoriesModel.getVisibleCategoriesForUser(ctx, userId, month),
      CategoryBudgetsModel.getAllBudgetsForUser(ctx, userId),
      TransactionsModel.getAllTransactionsForUser(ctx, userId),
      TransactionsModel.getAllIncomeForUser(ctx, userId),
      TransactionsModel.getTransactionsForUserAndMonth(ctx, userId, month),
      TransactionsModel.getIncomeForUserAndMonth(ctx, userId, month),
      CategoriesModel.getArchivedCategoriesForUser(ctx, userId, month),
    ]);
  const ccAccountIds = await ccAccountIdsPromise;

  // Compute cumulative totals up to and including current month
  const totalIncome = allIncome
    .filter((i) => i.month <= month)
    .reduce((sum, i) => sum + i.amount, 0);

  const totalAssigned = allBudgets
    .filter((b) => b.month <= month)
    .reduce((sum, b) => sum + b.assigned, 0);

  const readyToAssign = totalIncome - totalAssigned;

  // Compute cumulative CC expenses up to current month (expenses on credit card accounts)
  const ccExpensesUpToMonth = allTransactions
    .filter(
      (t) =>
        t.month <= month &&
        t.plaidAccountId !== undefined &&
        ccAccountIds.has(t.plaidAccountId),
    )
    .reduce((sum, t) => sum + t.amount, 0);

  // Build per-category rows
  const categoryRows: CategoryBudgetRow[] = categories.map((cat) => {
    // Assigned this month
    const budgetThisMonth = allBudgets.find(
      (b) => b.categoryId === cat._id && b.month === month,
    );
    const assigned = budgetThisMonth?.assigned ?? 0;

    // Activity this month (sum of transactions)
    const activity = monthTransactions
      .filter((t) => t.categoryId === cat._id)
      .reduce((sum, t) => sum + t.amount, 0);

    // Available = cumulative assigned - cumulative spent (rollover)
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

    // Target calculations
    const { needed, status } = computeTargetNeeded(
      cat,
      assigned,
      available,
      month,
    );

    return {
      _id: cat._id,
      name: cat.name,
      assigned,
      activity: -activity, // show as negative
      available,
      targetType: cat.targetType,
      targetAmount: cat.targetAmount,
      targetFrequency: cat.targetFrequency,
      targetDate: cat.targetDate,
      targetNeeded: needed,
      targetStatus: status,
      isCreditCardPayment: cat.isCreditCardPayment ?? undefined,
    };
  });

  const archivedCategories = archivedCategoriesRaw.map((c) => ({
    _id: c._id,
    name: c.name,
  }));

  return {
    month,
    readyToAssign,
    categories: categoryRows,
    archivedCategories,
    incomeEntries: monthIncome,
    transactions: monthTransactions,
  };
}
