import { useState } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import { formatCurrency, todayString } from "@/lib/utils";
import { useTransactions } from "./hooks";

interface Transaction {
  _id: Id<"transactions">;
  categoryId: Id<"categories">;
  description: string;
  amount: number;
  date: string;
}

interface CategoryOption {
  _id: Id<"categories">;
  name: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  categories: CategoryOption[];
}

export function TransactionList({ transactions, categories }: TransactionListProps) {
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayString());

  const { addTransaction, deleteTransaction } = useTransactions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    const success = await addTransaction(
      categoryId as Id<"categories">,
      description,
      amountNum,
      date,
    );
    if (success) {
      setDescription("");
      setAmount("");
      setDate(todayString());
    }
  };

  const handleDelete = async (id: Id<"transactions">) => {
    await deleteTransaction(id);
  };

  const getCategoryName = (catId: Id<"categories">) =>
    categories.find((c) => c._id === catId)?.name ?? "Unknown";

  return (
    <div className="bg-white rounded-lg border shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Transactions</h3>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-3 flex-wrap">
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 outline-none"
        >
          <option value="">Category...</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="flex-1 min-w-[120px] px-3 py-1.5 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 outline-none"
        />
        <input
          type="number"
          step="0.01"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-28 px-3 py-1.5 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 outline-none"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 outline-none"
        />
        <button
          type="submit"
          className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Add
        </button>
      </form>

      {transactions.length > 0 && (
        <div className="space-y-1">
          {transactions.map((tx) => (
            <div
              key={tx._id}
              className="flex items-center justify-between px-2 py-1.5 text-sm bg-gray-50 rounded group"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded">
                  {getCategoryName(tx.categoryId)}
                </span>
                <span className="text-gray-700">{tx.description}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">{tx.date}</span>
                <span className="font-medium text-red-600">
                  -{formatCurrency(tx.amount)}
                </span>
                <button
                  onClick={() => handleDelete(tx._id)}
                  className="text-xs text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  &times;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
