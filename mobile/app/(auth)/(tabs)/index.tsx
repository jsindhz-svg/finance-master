import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { getCurrentMonth } from "../../../lib/utils";
import { useBudgetData } from "../../../hooks/useBudgetData";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import { MonthNavigator } from "../../../components/MonthNavigator";
import { ReadyToAssign } from "../../../components/ReadyToAssign";
import { BudgetCategoryList } from "../../../components/BudgetCategoryList";
import { IncomeSection } from "../../../components/IncomeSection";
import { TransactionListCompact } from "../../../components/TransactionListCompact";

export default function BudgetScreen() {
  const [month, setMonth] = useState(getCurrentMonth);
  const { data: budgetData, isLoading } = useBudgetData(month);

  if (isLoading) return <LoadingSpinner />;

  if (budgetData === null) return null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <MonthNavigator month={month} onChange={setMonth} />
      <ReadyToAssign amount={budgetData.readyToAssign} />
      <BudgetCategoryList categories={budgetData.categories} month={month} />
      <IncomeSection entries={budgetData.incomeEntries} />
      <TransactionListCompact
        transactions={budgetData.transactions}
        categories={budgetData.categories}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
});
