import { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { getCurrentMonth, addMonths, formatMonth, formatCurrency } from "../../../lib/utils";
import { useTransactionsPageData } from "../../../hooks/useTransactionsPage";
import { useTransactions } from "../../../hooks/useTransactions";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import { AddTransactionForm } from "../../../components/AddTransactionForm";
import { TransactionRow } from "../../../components/TransactionRow";

export default function TransactionsScreen() {
  const [monthFilter, setMonthFilter] = useState<string | undefined>(undefined);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState("");

  const data = useTransactionsPageData(monthFilter);
  const { deleteTransaction } = useTransactions();

  const monthOptions = useMemo(() => {
    const current = getCurrentMonth();
    const months: { value: string; label: string }[] = [];
    for (let i = 0; i < 12; i++) {
      const m = addMonths(current, -i);
      months.push({ value: m, label: formatMonth(m) });
    }
    return months;
  }, []);

  if (data === undefined) return <LoadingSpinner />;
  if (data === null) return null;

  const { transactions, categories, categoryMap } = data;

  const filtered = transactions
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .filter((tx) => {
      if (categoryFilter && tx.categoryId !== categoryFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const catName = (categoryMap[tx.categoryId] ?? "").toLowerCase();
        if (
          !tx.description.toLowerCase().includes(q) &&
          !catName.includes(q)
        )
          return false;
      }
      return true;
    });

  const total = filtered.reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View>
        <Text style={styles.title}>Transactions</Text>
        <Text style={styles.subtitle}>
          {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}
          {" \u00B7 "}
          {formatCurrency(total)} total
        </Text>
      </View>

      <AddTransactionForm categories={categories} />

      {/* Filters */}
      <View style={styles.filters}>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={monthFilter ?? ""}
            onValueChange={(v) => setMonthFilter(v || undefined)}
            style={styles.picker}
          >
            <Picker.Item label="All Months" value="" />
            {monthOptions.map((m) => (
              <Picker.Item key={m.value} label={m.label} value={m.value} />
            ))}
          </Picker>
        </View>

        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={categoryFilter}
            onValueChange={(v) => setCategoryFilter(v)}
            style={styles.picker}
          >
            <Picker.Item label="All Categories" value="" />
            {categories.map((cat) => (
              <Picker.Item key={cat._id} label={cat.name} value={cat._id} />
            ))}
          </Picker>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* List */}
      <View style={styles.listContainer}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No transactions found.</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TransactionRow
                transaction={item}
                categoryName={categoryMap[item.categoryId] ?? "Unknown"}
                onDelete={deleteTransaction}
              />
            )}
            scrollEnabled={false}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  title: { fontSize: 22, fontWeight: "700", color: "#111827" },
  subtitle: { fontSize: 13, color: "#6b7280", marginTop: 4 },
  filters: { gap: 8 },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  picker: { height: 44 },
  searchInput: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  listContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
  },
  empty: { padding: 32, alignItems: "center" },
  emptyText: { fontSize: 14, color: "#9ca3af" },
});
