import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { Id } from "@convex/_generated/dataModel";
import { formatCurrency } from "../lib/utils";

interface TransactionRowProps {
  transaction: {
    _id: Id<"transactions">;
    categoryId: Id<"categories">;
    description: string;
    amount: number;
    date: string;
  };
  categoryName: string;
  onDelete: (id: Id<"transactions">) => void;
}

export function TransactionRow({
  transaction,
  categoryName,
  onDelete,
}: TransactionRowProps) {
  const handleDelete = () => {
    Alert.alert("Delete Transaction", `Delete "${transaction.description}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => onDelete(transaction._id),
      },
    ]);
  };

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <View style={styles.topRow}>
          <View style={styles.pill}>
            <Text style={styles.pillText}>{categoryName}</Text>
          </View>
          <Text style={styles.description} numberOfLines={1}>
            {transaction.description}
          </Text>
        </View>
        <Text style={styles.date}>{transaction.date}</Text>
      </View>
      <Text style={styles.amount}>-{formatCurrency(transaction.amount)}</Text>
      <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
        <Text style={styles.deleteText}>{"\u00D7"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  left: { flex: 1, marginRight: 8 },
  topRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  pill: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  pillText: { fontSize: 11, color: "#4b5563" },
  description: { fontSize: 14, color: "#374151", flex: 1 },
  date: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  amount: { fontSize: 14, fontWeight: "600", color: "#dc2626", marginRight: 8 },
  deleteBtn: { padding: 4 },
  deleteText: { fontSize: 18, color: "#ef4444" },
});
