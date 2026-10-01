import { useState } from "react";
import { getCurrentMonth, formatCurrency } from "@/lib/utils";
import { MonthNavigator } from "../budget/MonthNavigator";
import { useReportData } from "./hooks";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3,
  Target,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Layers,
  type LucideIcon,
} from "lucide-react";

const targetTypeLabels: Record<string, string> = {
  monthly_spending: "Spending",
  monthly_savings: "Savings",
  balance_by_date: "Save Up",
};

export function ReportsPage() {
  const [month, setMonth] = useState(getCurrentMonth);
  const { data, isLoading } = useReportData(month);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-12 w-48" />
        <div className="flex justify-center">
          <Skeleton className="h-10 w-64 rounded-full" />
        </div>
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-gray-500">
        Unable to load report data.
      </div>
    );
  }

  const { targetSummary, monthlyOverview, categoryBreakdown } = data;

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader
        icon={BarChart3}
        title="Reports"
        description="Monthly overview and target progress"
      />

      <MonthNavigator month={month} onChange={setMonth} />

      {/* Target Summary */}
      <Card className="shadow-card transition-shadow hover:shadow-card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4 text-primary" />
            Target Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={Target}
              label="Total Target Amount"
              value={formatCurrency(targetSummary.totalTargetAmount)}
              iconBg="bg-indigo-50"
              iconColor="text-indigo-600"
            />
            <StatCard
              icon={CheckCircle}
              label="Funded"
              value={String(targetSummary.funded)}
              sublabel="targets met"
              variant="green"
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
            />
            <StatCard
              icon={AlertTriangle}
              label="Underfunded"
              value={String(targetSummary.underfunded)}
              sublabel={formatCurrency(targetSummary.totalNeeded) + " needed"}
              variant="amber"
              iconBg="bg-amber-50"
              iconColor="text-amber-600"
            />
            <div className="rounded-xl bg-gray-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100">
                  <Layers className="h-3.5 w-3.5 text-slate-600" />
                </div>
                <span className="text-xs font-medium text-gray-500">By Type</span>
              </div>
              {Object.entries(targetSummary.countByType).map(([type, count]) => (
                <div key={type} className="flex justify-between text-sm py-0.5">
                  <span className="text-gray-600">{targetTypeLabels[type] ?? type}</span>
                  <span className="font-semibold tabular-nums">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Overview */}
      <Card className="shadow-card transition-shadow hover:shadow-card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-primary" />
            Monthly Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <StatCard
              icon={DollarSign}
              label="Income"
              value={formatCurrency(monthlyOverview.totalIncome)}
              variant="green"
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
            />
            <StatCard
              icon={Target}
              label="Assigned"
              value={formatCurrency(monthlyOverview.totalAssigned)}
              iconBg="bg-indigo-50"
              iconColor="text-indigo-600"
            />
            <StatCard
              icon={TrendingUp}
              label="Activity"
              value={formatCurrency(monthlyOverview.totalActivity)}
              variant={monthlyOverview.totalActivity < 0 ? "red" : undefined}
              iconBg="bg-rose-50"
              iconColor="text-rose-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card className="shadow-card transition-shadow hover:shadow-card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Layers className="h-4 w-4 text-primary" />
            Category Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="pb-3 text-left">Category</th>
                  <th className="pb-3 text-right">Target</th>
                  <th className="pb-3 text-right">Assigned</th>
                  <th className="pb-3 text-right">Activity</th>
                  <th className="pb-3 text-right">Available</th>
                  <th className="pb-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {categoryBreakdown.map((cat) => (
                  <tr key={cat._id} className="border-b last:border-0 hover:bg-gray-50/60 transition-colors duration-150">
                    <td className="py-2.5">
                      <span className="font-medium text-gray-900">{cat.name}</span>
                      {cat.targetType && (
                        <Badge variant="secondary" className="ml-2 font-normal text-[10px]">
                          {targetTypeLabels[cat.targetType] ?? cat.targetType}
                        </Badge>
                      )}
                    </td>
                    <td className="py-2.5 text-right tabular-nums">
                      {cat.targetAmount ? formatCurrency(cat.targetAmount) : "\u2014"}
                    </td>
                    <td className="py-2.5 text-right tabular-nums">{formatCurrency(cat.assigned)}</td>
                    <td className="py-2.5 text-right tabular-nums">{formatCurrency(cat.activity)}</td>
                    <td className="py-2.5 text-right tabular-nums">{formatCurrency(cat.available)}</td>
                    <td className="py-2.5 text-center">
                      <StatusBadge status={cat.targetStatus} />
                    </td>
                  </tr>
                ))}
                {categoryBreakdown.length === 0 && (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState
                        icon={Layers}
                        title="No categories yet"
                        description="Create categories in the Budget page to see breakdowns."
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
  variant,
  iconBg = "bg-gray-100",
  iconColor = "text-gray-600",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sublabel?: string;
  variant?: "green" | "amber" | "red";
  iconBg?: string;
  iconColor?: string;
}) {
  const colorMap = {
    green: "text-emerald-700",
    amber: "text-amber-700",
    red: "text-red-700",
  };
  const valueColor = variant ? colorMap[variant] : "text-gray-900";

  return (
    <div className="rounded-xl bg-gray-50 p-4 transition-shadow hover:shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className={`flex h-6 w-6 items-center justify-center rounded-md ${iconBg}`}>
          <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
        </div>
        <span className="text-xs font-medium text-gray-500">{label}</span>
      </div>
      <div className={`text-xl font-bold tabular-nums ${valueColor}`}>{value}</div>
      {sublabel && <div className="text-xs text-gray-500 mt-0.5">{sublabel}</div>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "met") {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 gap-1 font-medium">
        <CheckCircle className="h-3 w-3" />
        Funded
      </Badge>
    );
  }
  if (status === "underfunded") {
    return (
      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 gap-1 font-medium">
        <AlertTriangle className="h-3 w-3" />
        Underfunded
      </Badge>
    );
  }
  return <span className="text-xs text-gray-400">{"\u2014"}</span>;
}
