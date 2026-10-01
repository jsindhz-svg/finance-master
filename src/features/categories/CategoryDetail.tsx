import { useState } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import { formatCurrency } from "@/lib/utils";
import { useCategories } from "./hooks";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { X, Target, Trash2, Plus, CreditCard } from "lucide-react";

interface CategoryData {
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
  targetStatus: "met" | "underfunded" | "none";
  isCreditCardPayment?: boolean;
}

interface CategoryDetailProps {
  category: CategoryData;
  onClose: () => void;
}

const targetTypeLabels: Record<string, string> = {
  monthly_spending: "Monthly Spending",
  monthly_savings: "Monthly Savings",
  balance_by_date: "Save Up (by date)",
};

const frequencyLabels: Record<string, string> = {
  monthly: "Monthly",
  yearly: "Yearly",
  custom_date: "Custom Date",
};

export function CategoryDetail({ category, onClose }: CategoryDetailProps) {
  const [editingTarget, setEditingTarget] = useState(false);
  const [targetType, setTargetType] = useState(category.targetType ?? "monthly_spending");
  const [targetAmount, setTargetAmount] = useState(category.targetAmount?.toString() ?? "");
  const [targetFrequency, setTargetFrequency] = useState(category.targetFrequency ?? "monthly");
  const [targetDate, setTargetDate] = useState(category.targetDate ?? "");

  const { setTarget, removeTarget } = useCategories();

  const handleSaveTarget = async () => {
    const amount = parseFloat(targetAmount);
    const success = await setTarget(
      category._id,
      targetType as "monthly_spending" | "monthly_savings" | "balance_by_date",
      amount,
      targetFrequency as "monthly" | "yearly" | "custom_date",
      targetFrequency === "custom_date" ? targetDate || undefined : undefined,
    );
    if (success) {
      setEditingTarget(false);
    }
  };

  const handleRemoveTarget = async () => {
    const success = await removeTarget(category._id);
    if (success) {
      setEditingTarget(false);
    }
  };

  // Reset form when opening editor
  const openTargetEditor = () => {
    setTargetType(category.targetType ?? "monthly_spending");
    setTargetAmount(category.targetAmount?.toString() ?? "");
    setTargetFrequency(category.targetFrequency ?? "monthly");
    setTargetDate(category.targetDate ?? "");
    setEditingTarget(true);
  };

  const availableColor =
    category.available < 0
      ? "text-red-600"
      : category.available > 0
        ? "text-emerald-600"
        : "text-gray-500";

  return (
    <div className="w-80 border-l border-gray-200 bg-white flex flex-col overflow-y-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-900 truncate">{category.name}</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Available Balance section */}
        <div className="px-5 py-4">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Available Balance
          </div>
          <div className={`text-2xl font-bold tabular-nums mb-4 ${availableColor}`}>
            {formatCurrency(category.available)}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Assigned This Month</span>
              <span className="tabular-nums font-medium text-gray-700">
                +{formatCurrency(category.assigned)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Activity</span>
              <span className="tabular-nums font-medium text-gray-700">
                {formatCurrency(category.activity)}
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Target section */}
        <div className="px-5 py-4">
          {category.isCreditCardPayment ? (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Credit Card Payment
                </span>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 space-y-2">
                <p className="text-sm text-blue-800">
                  This category is automatically funded as you spend on linked credit cards.
                  The available balance reflects how much you need to set aside for your credit card bill.
                </p>
                <p className="text-xs text-blue-600">
                  When you pay your credit card, categorize the payment to this category to reduce the available balance.
                </p>
              </div>
            </div>
          ) : (
          <div>
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Target
            </span>
          </div>

          {editingTarget ? (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Target Type</Label>
                <select
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value)}
                  className="w-full h-9 px-3 text-sm border border-gray-200 rounded-md bg-white focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                >
                  <option value="monthly_spending">Monthly Spending</option>
                  <option value="monthly_savings">Monthly Savings</option>
                  <option value="balance_by_date">Save Up (by date)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="0.00"
                  className="h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Frequency</Label>
                <select
                  value={targetFrequency}
                  onChange={(e) => setTargetFrequency(e.target.value)}
                  className="w-full h-9 px-3 text-sm border border-gray-200 rounded-md bg-white focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="custom_date">Custom Date</option>
                </select>
              </div>

              {targetFrequency === "custom_date" && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Target Month (YYYY-MM)</Label>
                  <Input
                    type="text"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    placeholder="2026-12"
                    className="h-9"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <Button onClick={handleSaveTarget} size="sm" className="flex-1">
                  Save
                </Button>
                {category.targetType && (
                  <Button
                    onClick={handleRemoveTarget}
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button onClick={() => setEditingTarget(false)} variant="outline" size="sm">
                  Cancel
                </Button>
              </div>
            </div>
          ) : category.targetType ? (
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Type</span>
                  <span className="font-medium text-gray-700">
                    {targetTypeLabels[category.targetType] ?? category.targetType}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Amount</span>
                  <span className="tabular-nums font-medium text-gray-700">
                    {formatCurrency(category.targetAmount ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Frequency</span>
                  <span className="font-medium text-gray-700">
                    {frequencyLabels[category.targetFrequency ?? "monthly"] ?? "Monthly"}
                  </span>
                </div>
                {category.targetFrequency === "custom_date" && category.targetDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">By</span>
                    <span className="font-medium text-gray-700">{category.targetDate}</span>
                  </div>
                )}
                {category.targetNeeded > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Still Needed</span>
                    <span className="tabular-nums font-medium text-amber-600">
                      {formatCurrency(category.targetNeeded)}
                    </span>
                  </div>
                )}
                {category.targetStatus === "met" && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Status</span>
                    <span className="font-medium text-emerald-600">Funded</span>
                  </div>
                )}
              </div>

              <Button
                onClick={openTargetEditor}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Edit Target
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-500 mb-3">
                When you create a target, we'll let you know how much money to set aside to stay on track.
              </p>
              <Button
                onClick={openTargetEditor}
                size="sm"
                className="w-full gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                Create Target
              </Button>
            </div>
          )}
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
