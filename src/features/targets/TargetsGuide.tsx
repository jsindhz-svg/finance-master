import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, ShoppingCart, PiggyBank, CalendarCheck } from "lucide-react";

export function TargetsGuide() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
      <PageHeader
        icon={Target}
        title="Targets Guide"
        description="Learn how to use budget targets to reach your financial goals."
      />

      <div className="flex flex-col gap-5">
        <Card className="shadow-card transition-shadow hover:shadow-card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2.5 text-base">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                <ShoppingCart className="h-4 w-4 text-slate-600" />
              </div>
              Monthly Spending
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-gray-500 leading-relaxed">
              Set a cap for how much you want to spend per month in a category.
              This is useful for recurring expenses like groceries, dining out, or
              entertainment. Each month the target resets, so you can track
              whether you're staying within your limit.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card transition-shadow hover:shadow-card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2.5 text-base">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
                <PiggyBank className="h-4 w-4 text-indigo-600" />
              </div>
              Monthly Savings
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-gray-500 leading-relaxed">
              Set how much you want to save each month toward a category. Unlike
              spending targets, unspent money rolls over into the next month. Use
              this for things like an emergency fund or vacation savings where you
              contribute a fixed amount regularly.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card transition-shadow hover:shadow-card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2.5 text-base">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50">
                <CalendarCheck className="h-4 w-4 text-violet-600" />
              </div>
              Save Up (by Date)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-gray-500 leading-relaxed">
              Set a total amount and a deadline. The app calculates how much you
              need to assign each month to reach your goal on time. Great for
              large purchases or annual expenses like insurance premiums or
              holiday gifts.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
