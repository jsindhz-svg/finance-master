import { useState } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import { formatCurrency } from "@/lib/utils";
import { useCategories } from "./hooks";
import { Archive, CheckCircle2, AlertCircle, CircleMinus, Calendar, CalendarOff, CreditCard } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";

interface CategoryRowProps {
  category: {
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
  };
  month: string;
  isSelected?: boolean;
  onSelect?: () => void;
}

function getTargetProgress(category: CategoryRowProps["category"]) {
  if (!category.targetType || !category.targetAmount || category.targetAmount <= 0) {
    return null;
  }

  let filled = 0;

  if (category.targetType === "monthly_spending") {
    filled = category.assigned / category.targetAmount;
  } else if (category.targetType === "monthly_savings") {
    filled = Math.max(0, category.available) / category.targetAmount;
  } else if (category.targetType === "balance_by_date") {
    filled = Math.max(0, category.available) / category.targetAmount;
  }

  return Math.min(1, Math.max(0, filled));
}

function getStatusLabel(category: CategoryRowProps["category"]) {
  if (!category.targetType) return null;

  if (category.targetStatus === "met") {
    if (category.targetType === "monthly_spending" && category.activity !== 0 && category.available === 0) {
      return { label: "Fully Spent", color: "text-gray-500 bg-gray-100" };
    }
    return { label: "Funded", color: "text-emerald-700 bg-emerald-50" };
  }
  if (category.targetStatus === "underfunded") {
    return { label: `Underfunded by ${formatCurrency(category.targetNeeded)}`, color: "text-amber-700 bg-amber-50" };
  }
  return null;
}

function getTargetTypeIndicator(targetType?: string) {
  if (targetType === "monthly_savings") return "S";
  if (targetType === "balance_by_date") return "S";
  return "";
}

export function CategoryRow({ category, month, isSelected, onSelect }: CategoryRowProps) {
  const [isEditingAssigned, setIsEditingAssigned] = useState(false);
  const [assignedInput, setAssignedInput] = useState("");

  const { assignBudget, deleteCategory } = useCategories();

  const handleAssignedClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAssignedInput(category.assigned === 0 ? "" : category.assigned.toString());
    setIsEditingAssigned(true);
  };

  const handleAssignedBlur = async () => {
    setIsEditingAssigned(false);
    const value = parseFloat(assignedInput);
    if (isNaN(value) || value < 0) return;
    if (value === category.assigned) return;
    await assignBudget(category._id, month, value);
  };

  const handleAssignedKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    } else if (e.key === "Escape") {
      setIsEditingAssigned(false);
    }
  };

  const [archiveOpen, setArchiveOpen] = useState(false);

  const handleArchive = async (e: React.MouseEvent, fromMonth?: string) => {
    e.stopPropagation();
    setArchiveOpen(false);
    await deleteCategory(category._id, fromMonth);
  };

  const progress = getTargetProgress(category);
  const status = getStatusLabel(category);
  const isMet = category.targetStatus === "met";
  const typeIndicator = getTargetTypeIndicator(category.targetType);

  // Available indicator colors
  const availableStyles =
    category.available < 0
      ? "text-red-700 bg-red-50"
      : category.available > 0 && isMet
        ? "text-emerald-700 bg-emerald-50"
        : category.available > 0 && category.targetStatus === "underfunded"
          ? "text-amber-700 bg-amber-50"
          : category.available > 0
            ? "text-gray-700"
            : "text-gray-400";

  const AvailableIcon =
    category.available < 0
      ? AlertCircle
      : isMet && category.available > 0
        ? CheckCircle2
        : category.targetStatus === "underfunded" && category.available > 0
          ? CircleMinus
          : null;

  return (
    <tr
      onClick={onSelect}
      className={`border-t border-gray-100 group transition-colors duration-100 ${
        onSelect ? "cursor-pointer" : ""
      } ${
        isSelected
          ? "bg-primary/5 hover:bg-primary/8"
          : "hover:bg-gray-50/60"
      }`}
    >
      {/* Category name + progress bar */}
      <td className="px-4 py-2 text-sm">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {category.isCreditCardPayment && (
              <CreditCard className="h-3.5 w-3.5 text-blue-500 shrink-0" />
            )}
            <span className={`font-medium truncate ${isSelected ? "text-primary" : "text-gray-900"}`}>
              {category.name}
            </span>

            {/* Status badge inline */}
            {status && (
              <span className={`shrink-0 text-[10px] font-semibold px-1.5 py-[1px] rounded ${status.color}`}>
                {status.label}
              </span>
            )}

            {!category.isCreditCardPayment && <Popover open={archiveOpen} onOpenChange={setArchiveOpen}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-100 ml-auto"
                      >
                        <Archive className="h-3.5 w-3.5 text-gray-300 hover:text-amber-500 transition-colors" />
                      </button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    Archive category
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <PopoverContent side="bottom" align="end" className="w-52 p-1.5" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={(e) => handleArchive(e, month)}
                  className="flex items-center gap-2 w-full px-2.5 py-1.5 text-sm text-gray-700 rounded hover:bg-gray-100 transition-colors"
                >
                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                  This month forward
                </button>
                <button
                  onClick={(e) => handleArchive(e)}
                  className="flex items-center gap-2 w-full px-2.5 py-1.5 text-sm text-gray-700 rounded hover:bg-gray-100 transition-colors"
                >
                  <CalendarOff className="h-3.5 w-3.5 text-gray-400" />
                  All months
                </button>
              </PopoverContent>
            </Popover>}
          </div>

          {/* Progress bar under name */}
          {progress !== null && (
            <div className="mt-1 h-1 bg-gray-100 rounded-full overflow-hidden w-full max-w-[180px]">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  isMet
                    ? "bg-emerald-400"
                    : progress > 0.5
                      ? "bg-amber-400"
                      : "bg-amber-300"
                }`}
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          )}
        </div>
      </td>

      {/* Target */}
      <td className="px-3 py-2 text-sm text-right w-28">
        <span className="tabular-nums text-gray-500">
          {category.targetAmount ? (
            <span>
              <span className={category.targetStatus === "underfunded" ? "text-amber-600" : ""}>
                {formatCurrency(category.targetAmount)}
              </span>
              {typeIndicator && (
                <span className="ml-1 text-[10px] text-gray-400">{typeIndicator}</span>
              )}
            </span>
          ) : (
            <span className="text-gray-300 text-xs">&mdash;</span>
          )}
        </span>
      </td>

      {/* Assigned (editable) */}
      <td className="px-3 py-2 text-sm text-right w-28" onClick={(e) => e.stopPropagation()}>
        {isEditingAssigned ? (
          <Input
            type="number"
            step="0.01"
            value={assignedInput}
            onChange={(e) => setAssignedInput(e.target.value)}
            onBlur={handleAssignedBlur}
            onKeyDown={handleAssignedKeyDown}
            autoFocus
            className="w-full text-right h-7 text-sm"
          />
        ) : (
          <button
            onClick={handleAssignedClick}
            className="w-full text-right hover:bg-primary/5 rounded px-1.5 py-0.5 transition-colors tabular-nums text-gray-900"
          >
            {formatCurrency(category.assigned)}
          </button>
        )}
      </td>

      {/* Activity */}
      <td className="px-3 py-2 text-sm text-right w-28 text-gray-500 tabular-nums">
        {formatCurrency(category.activity)}
      </td>

      {/* Available with colored indicator */}
      <td className="px-3 py-2 text-sm text-right w-32">
        <span
          className={`inline-flex items-center gap-1 tabular-nums font-medium px-2 py-0.5 rounded-full ${availableStyles}`}
        >
          {AvailableIcon && <AvailableIcon className="h-3.5 w-3.5 shrink-0" />}
          {formatCurrency(category.available)}
        </span>
      </td>
    </tr>
  );
}
