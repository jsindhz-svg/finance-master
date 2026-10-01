import { useState } from "react";
import { getCurrentMonth, addMonths, formatMonth, formatCurrency } from "@/lib/utils";
import { useBudgetData } from "./hooks";
import { BudgetTable } from "../categories/BudgetTable";
import { CategoryDetail } from "../categories/CategoryDetail";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Lightbulb, Plus, Target, ArrowLeftRight, DollarSign } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";

function GettingStartedTip({
  icon: Icon,
  step,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3">
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary shrink-0">
        {step}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-xs font-semibold text-gray-900">{title}</span>
        </div>
        <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export function BudgetApp() {
  const [month, setMonth] = useState(getCurrentMonth);
  const [selectedCategoryId, setSelectedCategoryId] = useState<Id<"categories"> | null>(null);
  const { data: budgetData, isLoading } = useBudgetData(month);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-52" />
          <Skeleton className="h-10 w-48 rounded-full" />
        </div>
        <Skeleton className="h-[500px] w-full rounded-lg" />
      </div>
    );
  }

  if (budgetData === null) {
    return (
      <div className="text-center py-12 text-gray-500">
        Unable to load budget data.
      </div>
    );
  }

  const rta = budgetData.readyToAssign;
  const isPositive = rta >= 0;

  const selectedCategory = selectedCategoryId
    ? budgetData.categories.find((c) => c._id === selectedCategoryId) ?? null
    : null;

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Top bar: month nav + ready to assign */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Month navigator */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => setMonth(addMonths(month, -1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 px-2 min-w-[180px] text-center select-none">
            {formatMonth(month)}
          </h1>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => setMonth(addMonths(month, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Ready to Assign pill */}
        <div
          className={`flex items-center gap-3 px-5 py-2 rounded-full font-semibold text-sm ${
            isPositive
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          <span className="text-xl font-bold tabular-nums">
            {formatCurrency(rta)}
          </span>
          <span className="text-white/80 text-xs font-medium">
            Ready to Assign
          </span>
        </div>
      </div>

      {/* Table + detail panel */}
      <div className="flex gap-0 items-start">
        <div className="flex-1 min-w-0">
          <BudgetTable
            categories={budgetData.categories}
            archivedCategories={budgetData.archivedCategories}
            month={month}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={(id) =>
              setSelectedCategoryId(id === selectedCategoryId ? null : id)
            }
          />
        </div>

        {selectedCategory && (
          <CategoryDetail
            key={selectedCategory._id}
            category={selectedCategory}
            onClose={() => setSelectedCategoryId(null)}
          />
        )}
      </div>

      {/* Getting started tips - show when few categories */}
      {budgetData.categories.length < 5 && (
        <Card className="border-dashed border-gray-300 bg-gray-50/50">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
                <Lightbulb className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Getting Started</h3>
                <p className="text-xs text-gray-500 mt-0.5">Here's how to set up your budget</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <GettingStartedTip
                icon={Plus}
                step="1"
                title="Add categories"
                description="Create categories like Rent, Groceries, Entertainment, Savings"
              />
              <GettingStartedTip
                icon={DollarSign}
                step="2"
                title="Record income"
                description="Add your income on the Transactions page so you have money to assign"
              />
              <GettingStartedTip
                icon={Target}
                step="3"
                title="Set targets"
                description="Click a category to set a monthly, yearly, or by-date savings target"
              />
              <GettingStartedTip
                icon={ArrowLeftRight}
                step="4"
                title="Log transactions"
                description="Record spending as it happens to track your budget in real time"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
