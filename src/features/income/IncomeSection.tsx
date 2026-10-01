import { useState } from "react";
import { todayString } from "@/lib/utils";
import { useIncome } from "./hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DollarSign, Plus } from "lucide-react";

export function IncomeSection() {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayString());

  const { addIncome } = useIncome();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    const success = await addIncome(description, amountNum, date);
    if (success) {
      setDescription("");
      setAmount("");
      setDate(todayString());
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <DollarSign className="h-4 w-4 text-emerald-600" />
          Income
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-1 space-y-1.5">
              <Label className="text-xs">Description</Label>
              <Input
                type="text"
                placeholder="Salary, freelance..."
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
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs invisible">Action</Label>
              <Button type="submit" size="sm" className="h-9 w-full gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-3.5 w-3.5" />
                Add Income
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
