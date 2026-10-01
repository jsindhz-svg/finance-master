import { View, Text, FlatList, StyleSheet } from "react-native";
import { formatCurrency } from "../lib/utils";
import { StatusBadge } from "./StatusBadge";

const targetTypeLabels: Record<string, string> = {
  monthly_spending: "Spending",
  monthly_savings: "Savings",
  balance_by_date: "Save Up",
};

interface CategoryBreakdownItem {
  _id: string;
  name: string;
  targetType?: string;
  targetAmount?: number;
  assigned: number;
  activity: number;
  available: number;
  targetStatus: string;
}

interface CategoryBreakdownListProps {
  categories: CategoryBreakdownItem[];
}

function BreakdownRow({ item }: { item: CategoryBreakdownItem }) {
  return (
    <View style={styles.row}>
      <View style={styles.nameRow}>
        <Text style={styles.name}>{item.name}</Text>
        {item.targetType && (
          <View style={styles.typePill}>
            <Text style={styles.typeText}>
              {targetTypeLabels[item.targetType] ?? item.targetType}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.numbersRow}>
        <View style={styles.numCol}>
          <Text style={styles.numLabel}>Target</Text>
          <Text style={styles.numValue}>
            {item.targetAmount ? formatCurrency(item.targetAmount) : "\u2014"}
          </Text>
        </View>
        <View style={styles.numCol}>
          <Text style={styles.numLabel}>Assigned</Text>
          <Text style={styles.numValue}>{formatCurrency(item.assigned)}</Text>
        </View>
        <View style={styles.numCol}>
          <Text style={styles.numLabel}>Activity</Text>
          <Text style={styles.numValue}>{formatCurrency(item.activity)}</Text>
        </View>
        <View style={styles.numCol}>
          <Text style={styles.numLabel}>Available</Text>
          <Text style={styles.numValue}>{formatCurrency(item.available)}</Text>
        </View>
      </View>
      <View style={styles.statusRow}>
        <StatusBadge status={item.targetStatus} />
      </View>
    </View>
  );
}

export function CategoryBreakdownList({
  categories,
}: CategoryBreakdownListProps) {
  if (categories.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No categories yet.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={categories}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => <BreakdownRow item={item} />}
      scrollEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  name: { fontSize: 14, fontWeight: "600", color: "#111827" },
  typePill: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: { fontSize: 11, color: "#4b5563" },
  numbersRow: {
    flexDirection: "row",
    gap: 4,
  },
  numCol: { flex: 1 },
  numLabel: { fontSize: 10, color: "#9ca3af", marginBottom: 2 },
  numValue: { fontSize: 12, fontVariant: ["tabular-nums"], color: "#374151" },
  statusRow: { marginTop: 6, alignItems: "flex-start" },
  empty: { padding: 24, alignItems: "center" },
  emptyText: { fontSize: 14, color: "#9ca3af" },
});
