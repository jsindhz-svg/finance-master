import { useState } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import { useCategories } from "./hooks";
import { ChevronRight, ArchiveRestore } from "lucide-react";

interface ArchivedCategory {
  _id: Id<"categories">;
  name: string;
}

interface ArchivedCategoriesSectionProps {
  archivedCategories: ArchivedCategory[];
}

export function ArchivedCategoriesSection({ archivedCategories }: ArchivedCategoriesSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { unarchiveCategory } = useCategories();

  if (archivedCategories.length === 0) return null;

  return (
    <>
      <tr
        onClick={() => setIsExpanded(!isExpanded)}
        className="border-t border-gray-200 cursor-pointer hover:bg-gray-50/60 transition-colors"
      >
        <td colSpan={5} className="px-4 py-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400 uppercase tracking-wider">
            <ChevronRight
              className={`h-3.5 w-3.5 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
            />
            Archived ({archivedCategories.length})
          </div>
        </td>
      </tr>
      {isExpanded &&
        archivedCategories.map((cat) => (
          <tr
            key={cat._id}
            className="border-t border-gray-100 group hover:bg-gray-50/60 transition-colors"
          >
            <td colSpan={5} className="px-4 py-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="italic text-gray-400">{cat.name}</span>
                <button
                  onClick={() => unarchiveCategory(cat._id)}
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-100 flex items-center gap-1 text-xs text-gray-400 hover:text-primary"
                >
                  <ArchiveRestore className="h-3.5 w-3.5" />
                  Restore
                </button>
              </div>
            </td>
          </tr>
        ))}
    </>
  );
}
