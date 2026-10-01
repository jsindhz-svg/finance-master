import { useState } from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { getCurrentMonth, formatCurrency } from "../../../lib/utils";
import { useReportData } from "../../../hooks/useReportData";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import { MonthNavigator } from "../../../components/MonthNavigator";
import { StatCard } from "../../../components/StatCard";
import { CategoryBreakdownList } from "../../../components/CategoryBreakdownList";

const targetTypeLabels: Record<string, string> = {
  monthly_spending: "Spending",
  monthly_savings: "Savings",
  balance_by_date: "Save Up",
};

export default function ReportsScreen() {
  const [month, setMonth] = useState(getCurrentMonth);
  const { data, isLoading } = useReportData(month);

  if (isLoading) return <LoadingSpinner />;
  if (!data) return null;

  const { targetSummary, monthlyOverview, categoryBreakdown } = data;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <MonthNavigator month={month} onChange={setMonth} />

      {/* Target Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Target Summary</Text>
        <View style={styles.statGrid}>
          <StatCard
            label="Total Target Amount"
            value={formatCurrency(targetSummary.totalTargetAmount)}
          />
          <StatCard
            label="Funded"
            value={String(targetSummary.funded)}
            sublabel="targets met"
            variant="green"
          />
        </View>
        <View style={styles.statGrid}>
          <StatCard
            label="Underfunded"
            value={String(targetSummary.underfunded)}
            sublabel={formatCurrency(targetSummary.totalNeeded) + " needed"}
            variant="amber"
          />
          <View style={styles.typeCard}>
            <Text style={styles.typeLabel}>By Type</Text>
            {Object.entries(targetSummary.countByType).map(([type, count]) => (
              <View key={type} style={styles.typeRow}>
                <Text style={styles.typeText}>
                  {targetTypeLabels[type] ?? type}
                </Text>
                <Text style={styles.typeCount}>{count as number}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Monthly Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Monthly Overview</Text>
        <View style={styles.statGrid}>
          <StatCard
            label="Income"
            value={formatCurrency(monthlyOverview.totalIncome)}
            variant="green"
          />
          <StatCard
            label="Assigned"
            value={formatCurrency(monthlyOverview.totalAssigned)}
          />
          <StatCard
            label="Activity"
            value={formatCurrency(monthlyOverview.totalActivity)}
            variant={monthlyOverview.totalActivity < 0 ? "red" : undefined}
          />
        </View>
      </View>

      {/* Category Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Category Breakdown</Text>
        <CategoryBreakdownList categories={categoryBreakdown} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  statGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  typeCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 12,
    flex: 1,
  },
  typeLabel: { fontSize: 11, color: "#6b7280", marginBottom: 6 },
  typeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  typeText: { fontSize: 13, color: "#4b5563" },
  typeCount: { fontSize: 13, fontWeight: "600" },
});
