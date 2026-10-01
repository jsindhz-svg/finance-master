import { useState } from "react";
import { useCategories } from "./hooks";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function AddCategoryRow() {
  const [name, setName] = useState("");
  const { createCategory } = useCategories();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await createCategory(name);
    if (success) {
      setName("");
    }
  };

  return (
    <tr className="border-t border-gray-100">
      <td colSpan={5} className="px-4 py-2.5">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="text"
            placeholder="New category name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 h-8 text-sm"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!name.trim()}
            className="gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        </form>
      </td>
    </tr>
  );
}
