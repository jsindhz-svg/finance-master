import { useState, useMemo, useEffect } from "react";
import { getCurrentMonth, formatCurrency } from "@/lib/utils";
import { useBudgetData } from "../budget/hooks";
import { MonthNavigator } from "../budget/MonthNavigator";
import { monthDiff } from "../../../convex/shared/budgetMath";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calculator,
  DollarSign,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Target,
} from "lucide-react";

type TargetType = "monthly_spending" | "monthly_savings" | "balance_by_date";

const targetTypeLabel: Record<TargetType, string> = {
  monthly_spending: "Spending",
  monthly_savings: "Savings",
  balance_by_date: "Goal",
};

const targetTypePillClass: Record<TargetType, string> = {
  monthly_spending: "bg-slate-100 text-slate-500",
  monthly_savings: "bg-indigo-50 text-indigo-500",
  balance_by_date: "bg-violet-50 text-violet-500",
};

function computeMonthlyNeed(
  targetType: string,
  targetAmount: number,
  targetDate: string | undefined,
  currentMonth: string,
): number {
  if (targetType === "monthly_spending" || targetType === "monthly_savings") {
    return targetAmount;
  }
  if (targetType === "balance_by_date" && targetDate) {
    const monthsRemaining = Math.max(1, monthDiff(currentMonth, targetDate) + 1);
    return Math.ceil((targetAmount / monthsRemaining) * 100) / 100;
  }
  return targetAmount;
}

export function PlanningPage() {
  const [month, setMonth] = useState(getCurrentMonth);
  const { data: budgetData, isLoading } = useBudgetData(month);

  // Local planning state: categoryId -> planned target amount
  const [plannedTargets, setPlannedTargets] = useState<Record<string, number>>({});
  const [incomeOverride, setIncomeOverride] = useState<number | null>(null);
  const [incomeInput, setIncomeInput] = useState("");

  // Categories with targets
  const targetCategories = useMemo(() => {
    if (!budgetData) return [];
    return budgetData.categories.filter(
      (c) => c.targetType && c.targetAmount != null && c.targetAmount > 0,
    );
  }, [budgetData]);

  // Real monthly income
  const realIncome = useMemo(() => {
    if (!budgetData) return 0;
    return budgetData.incomeEntries.reduce((sum, e) => sum + e.amount, 0);
  }, [budgetData]);

  // Reset planned targets when month changes or data loads
  useEffect(() => {
    if (!targetCategories.length) return;
    const initial: Record<string, number> = {};
    for (const cat of targetCategories) {
      initial[cat._id] = cat.targetAmount!;
    }
    setPlannedTargets(initial);
    setIncomeOverride(null);
    setIncomeInput("");
  }, [month, targetCategories.length > 0 ? budgetData?.month : null]);

  const effectiveIncome = incomeOverride ?? realIncome;

  // Compute totals
  const { totalCurrentNeed, totalPlannedNeed, rows } = useMemo(() => {
    let totalCurrent = 0;
    let totalPlanned = 0;

    const rows = targetCategories.map((cat) => {
      const currentAmount = cat.targetAmount!;
      const plannedAmount = plannedTargets[cat._id] ?? currentAmount;

      const currentNeed = computeMonthlyNeed(
        cat.targetType!,
        currentAmount,
        cat.targetDate,
        month,
      );
      const plannedNeed = computeMonthlyNeed(
        cat.targetType!,
        plannedAmount,
        cat.targetDate,
        month,
      );

      totalCurrent += currentNeed;
      totalPlanned += plannedNeed;

      return {
        id: cat._id,
        name: cat.name,
        targetType: cat.targetType as TargetType,
        targetDate: cat.targetDate,
        currentAmount,
        plannedAmount,
        currentNeed,
        plannedNeed,
        delta: plannedNeed - currentNeed,
      };
    });

    return { totalCurrentNeed: totalCurrent, totalPlannedNeed: totalPlanned, rows };
  }, [targetCategories, plannedTargets, month]);

  const surplus = effectiveIncome - totalPlannedNeed;

  const handlePlannedChange = (categoryId: string, value: string) => {
    const num = parseFloat(value);
    if (value === "" || isNaN(num)) {
      setPlannedTargets((prev) => ({ ...prev, [categoryId]: 0 }));
    } else {
      setPlannedTargets((prev) => ({ ...prev, [categoryId]: num }));
    }
  };

  const handleIncomeBlur = () => {
    if (incomeInput === "") {
      setIncomeOverride(null);
      return;
    }
    const num = parseFloat(incomeInput);
    if (!isNaN(num) && num >= 0) {
      setIncomeOverride(num);
    }
  };

  const handleReset = () => {
    const initial: Record<string, number> = {};
    for (const cat of targetCategories) {
      initial[cat._id] = cat.targetAmount!;
    }
    setPlannedTargets(initial);
    setIncomeOverride(null);
    setIncomeInput("");
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-12 w-48" />
        <div className="flex justify-center">
          <Skeleton className="h-10 w-64 rounded-full" />
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (!budgetData) {
    return (
      <div className="text-center py-12 text-gray-500">
        Unable to load budget data.
      </div>
    );
  }

  const hasChanges =
    incomeOverride !== null ||
    targetCategories.some((cat) => plannedTargets[cat._id] !== cat.targetAmount);

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader
        icon={Calculator}
        title="What-If Planner"
        description="Explore budget scenarios without saving. Edit targets or income to see the impact instantly."
        action={
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                Unsaved scenario
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={!hasChanges}
              className="gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          </div>
        }
      />

      <MonthNavigator month={month} onChange={setMonth} />

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-card">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50">
                <DollarSign className="h-4 w-4 text-indigo-600" />
              </div>
              <span className="text-xs font-medium text-gray-500">Monthly Income</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900 tabular-nums">
                {formatCurrency(effectiveIncome)}
              </span>
              {incomeOverride !== null && (
                <span className="text-xs text-gray-400 line-through tabular-nums">
                  {formatCurrency(realIncome)}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50">
                <Calculator className="h-4 w-4 text-violet-600" />
              </div>
              <span className="text-xs font-medium text-gray-500">Total Monthly Need</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900 tabular-nums">
                {formatCurrency(totalPlannedNeed)}
              </span>
              {totalPlannedNeed !== totalCurrentNeed && (
                <span className="text-xs text-gray-400 line-through tabular-nums">
                  {formatCurrency(totalCurrentNeed)}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className={`shadow-card ${surplus >= 0 ? "border-emerald-200" : "border-red-200"}`}>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${surplus >= 0 ? "bg-emerald-50" : "bg-red-50"}`}>
                {surplus >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </div>
              <span className="text-xs font-medium text-gray-500">
                {surplus >= 0 ? "Surplus" : "Shortfall"}
              </span>
            </div>
            <span
              className={`text-xl font-bold tabular-nums ${
                surplus >= 0 ? "text-emerald-700" : "text-red-700"
              }`}
            >
              {formatCurrency(Math.abs(surplus))}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Main card with income override and planning table */}
      <Card className="shadow-card transition-shadow hover:shadow-card-hover">
        <CardContent className="pt-5">
          {/* Income override */}
          <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100">
            <Label className="text-sm font-medium whitespace-nowrap">
              Simulate income:
            </Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder={realIncome.toString()}
              value={incomeInput}
              onChange={(e) => setIncomeInput(e.target.value)}
              onBlur={handleIncomeBlur}
              onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
              className="w-36 h-9 tabular-nums"
            />
            {incomeOverride !== null && (
              <button
                onClick={() => { setIncomeOverride(null); setIncomeInput(""); }}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                clear
              </button>
            )}
            <span className="text-xs text-gray-400 ml-auto tabular-nums">
              Actual: {formatCurrency(realIncome)}
            </span>
          </div>

          {/* Planning table */}
          {targetCategories.length === 0 ? (
            <EmptyState
              icon={Target}
              title="No categories with targets"
              description="Set targets on your budget categories to start planning."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">
                    <th className="text-left px-3 py-2">Category</th>
                    <th className="text-right px-3 py-2 w-28">Current</th>
                    <th className="text-right px-3 py-2 w-32">Planned</th>
                    <th className="text-right px-3 py-2 w-28">Monthly Need</th>
                    <th className="text-right px-3 py-2 w-28">Delta</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-t border-gray-100 hover:bg-gray-50/60 transition-colors duration-150"
                    >
                      <td className="px-3 py-2.5 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{row.name}</span>
                          <span
                            className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-[1px] rounded ${
                              targetTypePillClass[row.targetType]
                            }`}
                          >
                            {targetTypeLabel[row.targetType]}
                          </span>
                          {row.targetType === "balance_by_date" && row.targetDate && (
                            <span className="text-[10px] text-gray-400">
                              by {row.targetDate}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-sm text-right text-gray-500 tabular-nums">
                        {formatCurrency(row.currentAmount)}
                      </td>
                      <td className="px-3 py-2.5 text-sm text-right">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={row.plannedAmount}
                          onChange={(e) => handlePlannedChange(row.id, e.target.value)}
                          className="w-full text-right h-8 text-sm tabular-nums"
                        />
                      </td>
                      <td className="px-3 py-2.5 text-sm text-right tabular-nums text-gray-700">
                        {formatCurrency(row.plannedNeed)}
                      </td>
                      <td
                        className={`px-3 py-2.5 text-sm text-right tabular-nums font-medium ${
                          row.delta > 0
                            ? "text-red-600"
                            : row.delta < 0
                              ? "text-emerald-600"
                              : "text-gray-400"
                        }`}
                      >
                        {row.delta > 0 ? "+" : ""}
                        {row.delta !== 0 ? formatCurrency(row.delta) : "\u2014"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-200">
                    <td className="px-3 py-2.5 text-sm font-semibold text-gray-900">Total</td>
                    <td className="px-3 py-2.5 text-sm text-right font-semibold text-gray-500 tabular-nums">
                      {formatCurrency(totalCurrentNeed)}
                    </td>
                    <td></td>
                    <td className="px-3 py-2.5 text-sm text-right font-semibold text-gray-900 tabular-nums">
                      {formatCurrency(totalPlannedNeed)}
                    </td>
                    <td
                      className={`px-3 py-2.5 text-sm text-right font-semibold tabular-nums ${
                        totalPlannedNeed - totalCurrentNeed > 0
                          ? "text-red-600"
                          : totalPlannedNeed - totalCurrentNeed < 0
                            ? "text-emerald-600"
                            : "text-gray-400"
                      }`}
                    >
                      {totalPlannedNeed !== totalCurrentNeed
                        ? `${totalPlannedNeed - totalCurrentNeed > 0 ? "+" : ""}${formatCurrency(totalPlannedNeed - totalCurrentNeed)}`
                        : "\u2014"}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
