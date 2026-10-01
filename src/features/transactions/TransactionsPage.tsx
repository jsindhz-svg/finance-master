import { useState, useMemo } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import { formatCurrency, todayString, getCurrentMonth, addMonths, formatMonth } from "@/lib/utils";
import { useTransactionsPageData } from "./useTransactionsPage";
import { useTransactions } from "./hooks";
import { IncomeSection } from "../income/IncomeSection";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowLeftRight, Plus, Search, Trash2, Receipt } from "lucide-react";

export function TransactionsPage() {
  const [monthFilter, setMonthFilter] = useState<string | undefined>(undefined);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState("");

  const data = useTransactionsPageData(monthFilter);
  const { addTransaction, deleteTransaction, updateTransactionCategory } = useTransactions();
  const [editingCategoryTxId, setEditingCategoryTxId] = useState<string | null>(null);

  // Add-transaction form state
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayString());

  // Generate last 12 months for the month dropdown
  const monthOptions = useMemo(() => {
    const current = getCurrentMonth();
    const months: { value: string; label: string }[] = [];
    for (let i = 0; i < 12; i++) {
      const m = addMonths(current, -i);
      months.push({ value: m, label: formatMonth(m) });
    }
    return months;
  }, []);

  if (data === undefined) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (data === null) return null;

  const { transactions, categories, categoryMap } = data;

  // Sort newest-first, then apply client-side filters
  const filtered = transactions
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .filter((tx) => {
      if (categoryFilter) {
        if (tx.type === "income" || tx.type === "cc_payment") return false;
        if (tx.categoryId !== categoryFilter) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        const catName = (tx.categoryId ? categoryMap[tx.categoryId] ?? "" : "").toLowerCase();
        if (
          !tx.description.toLowerCase().includes(q) &&
          !catName.includes(q)
        )
          return false;
      }
      return true;
    });

  const expenseTotal = filtered.filter((tx) => tx.type === "expense").reduce((sum, tx) => sum + tx.amount, 0);
  const incomeTotal = filtered.filter((tx) => tx.type === "income").reduce((sum, tx) => sum + tx.amount, 0);
  const ccPaymentTotal = filtered.filter((tx) => tx.type === "cc_payment").reduce((sum, tx) => sum + tx.amount, 0);

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

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <PageHeader
        icon={ArrowLeftRight}
        title="Transactions"
        description={`${filtered.length} transaction${filtered.length !== 1 ? "s" : ""} \u00b7 +${formatCurrency(incomeTotal)} income \u00b7 -${formatCurrency(expenseTotal)} spent${ccPaymentTotal > 0 ? ` \u00b7 ${formatCurrency(ccPaymentTotal)} CC payments` : ""}`}
      />

      {/* Income */}
      <IncomeSection />

      {/* Add transaction form */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="h-4 w-4 text-primary" />
            Add Transaction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Category</Label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full h-9 px-3 text-sm border border-gray-200 rounded-md bg-white focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                >
                  <option value="">Select category...</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Description</Label>
                <Input
                  type="text"
                  placeholder="What was this for?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Date</Label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-9 flex-1"
                  />
                  <Button type="submit" size="sm" className="h-9 gap-1.5 shrink-0">
                    <Plus className="h-3.5 w-3.5" />
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-end">
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">Month</Label>
          <select
            value={monthFilter ?? ""}
            onChange={(e) => setMonthFilter(e.target.value || undefined)}
            className="h-9 px-3 text-sm border border-gray-200 rounded-md bg-white focus:ring-1 focus:ring-primary focus:border-primary outline-none"
          >
            <option value="">All Months</option>
            {monthOptions.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">Category</Label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 px-3 text-sm border border-gray-200 rounded-md bg-white focus:ring-1 focus:ring-primary focus:border-primary outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5 flex-1 min-w-[200px]">
          <Label className="text-xs text-gray-500">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <Card className="shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50/80 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      icon={Receipt}
                      title="No transactions found"
                      description="Add a transaction above or adjust your filters."
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => {
                  const isIncome = tx.type === "income";
                  const isCCPayment = tx.type === "cc_payment";
                  return (
                    <tr key={tx._id} className="border-b last:border-0 hover:bg-gray-50/60 group transition-colors duration-150">
                      <td className="px-4 py-2.5 text-gray-500 tabular-nums">{tx.date}</td>
                      <td className="px-4 py-2.5 text-gray-700 font-medium">{tx.description}</td>
                      <td className="px-4 py-2.5">
                        {isIncome ? (
                          <Badge className="font-normal bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-0">
                            Income
                          </Badge>
                        ) : isCCPayment ? (
                          <Badge className="font-normal bg-blue-50 text-blue-700 hover:bg-blue-100 border-0">
                            CC Payment
                          </Badge>
                        ) : editingCategoryTxId === tx._id ? (
                          <select
                            autoFocus
                            defaultValue={tx.categoryId ?? ""}
                            onChange={async (e) => {
                              const newCatId = e.target.value as Id<"categories">;
                              if (newCatId && newCatId !== tx.categoryId) {
                                await updateTransactionCategory(tx._id, newCatId);
                              }
                              setEditingCategoryTxId(null);
                            }}
                            onBlur={() => setEditingCategoryTxId(null)}
                            className="h-7 px-2 text-xs border border-gray-200 rounded-md bg-white focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                          >
                            <option value="" disabled>
                              Select category...
                            </option>
                            {categories.map((cat) => (
                              <option key={cat._id} value={cat._id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <button
                            onClick={() => setEditingCategoryTxId(tx._id)}
                            className="cursor-pointer"
                          >
                            <Badge variant="secondary" className="font-normal hover:bg-gray-200 transition-colors">
                              {tx.categoryId ? categoryMap[tx.categoryId] ?? "Unknown" : "Unknown"}
                            </Badge>
                          </button>
                        )}
                      </td>
                      <td className={`px-4 py-2.5 text-right font-semibold tabular-nums ${isIncome ? "text-emerald-600" : isCCPayment ? "text-blue-600" : "text-red-600"}`}>
                        {isIncome ? "+" : isCCPayment ? "" : "-"}{formatCurrency(tx.amount)}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => deleteTransaction(tx._id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-red-300 hover:text-red-500 transition-colors" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">
                              Delete transaction
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
