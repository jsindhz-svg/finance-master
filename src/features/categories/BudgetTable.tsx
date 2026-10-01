import { Id } from "../../../convex/_generated/dataModel";
import { CategoryRow } from "./CategoryRow";
import { AddCategoryRow } from "./AddCategoryRow";
import { ArchivedCategoriesSection } from "./ArchivedCategoriesSection";
import { EmptyState } from "@/components/EmptyState";
import { LayoutGrid } from "lucide-react";

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

interface ArchivedCategory {
  _id: Id<"categories">;
  name: string;
}

interface BudgetTableProps {
  categories: CategoryData[];
  archivedCategories?: ArchivedCategory[];
  month: string;
  selectedCategoryId?: Id<"categories"> | null;
  onSelectCategory?: (id: Id<"categories">) => void;
}

export function BudgetTable({ categories, archivedCategories, month, selectedCategoryId, onSelectCategory }: BudgetTableProps) {
  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-gray-50/80 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            <th className="px-4 py-2.5 text-left">Category</th>
            <th className="px-3 py-2.5 text-right w-28">Target</th>
            <th className="px-3 py-2.5 text-right w-28">Assigned</th>
            <th className="px-3 py-2.5 text-right w-28">Activity</th>
            <th className="px-3 py-2.5 text-right w-32">Available</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <CategoryRow
              key={cat._id}
              category={cat}
              month={month}
              isSelected={cat._id === selectedCategoryId}
              onSelect={onSelectCategory ? () => onSelectCategory(cat._id) : undefined}
            />
          ))}
          {categories.length === 0 && (
            <tr>
              <td colSpan={5}>
                <EmptyState
                  icon={LayoutGrid}
                  title="No categories yet"
                  description="Add your first category below to start budgeting."
                />
              </td>
            </tr>
          )}
          <AddCategoryRow />
          {archivedCategories && (
            <ArchivedCategoriesSection archivedCategories={archivedCategories} />
          )}
        </tbody>
      </table>
    </div>
  );
}
