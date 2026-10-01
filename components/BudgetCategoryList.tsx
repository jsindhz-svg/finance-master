import { View, Text, FlatList, StyleSheet } from "react-native";
import { Id } from "@convex/_generated/dataModel";
import { CategoryRow } from "./CategoryRow";
import { AddCategoryInput } from "./AddCategoryInput";

interface CategoryData {
  _id: Id<"categories">;
  name: string;
  assigned: number;
  activity: number;
  available: number;
  targetType?: string;
  targetAmount?: number;
  targetDate?: string;
  targetNeeded: number;
  targetStatus: "met" | "underfunded" | "none";
}

interface BudgetCategoryListProps {
  categories: CategoryData[];
  month: string;
}

export function BudgetCategoryList({
  categories,
  month,
}: BudgetCategoryListProps) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerText, { flex: 1 }]}>Category</Text>
        <Text style={[styles.headerText, styles.numHeader]}>Assigned</Text>
        <Text style={[styles.headerText, styles.numHeader]}>Activity</Text>
        <Text style={[styles.headerText, styles.numHeader]}>Available</Text>
      </View>

      {categories.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            No categories yet. Add one below.
          </Text>
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <CategoryRow category={item} month={month} />
          )}
          scrollEnabled={false}
        />
      )}

      <AddCategoryInput />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#f9fafb",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  numHeader: { width: 80, textAlign: "right" },
  empty: { padding: 24, alignItems: "center" },
  emptyText: { fontSize: 14, color: "#9ca3af" },
});
