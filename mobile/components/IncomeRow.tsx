import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { Id } from "@convex/_generated/dataModel";
import { formatCurrency } from "../lib/utils";

interface IncomeRowProps {
  entry: {
    _id: Id<"incomeEntries">;
    description: string;
    amount: number;
    date: string;
  };
  onDelete: (id: Id<"incomeEntries">) => void;
}

export function IncomeRow({ entry, onDelete }: IncomeRowProps) {
  const handleDelete = () => {
    Alert.alert("Delete Income", `Delete "${entry.description}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => onDelete(entry._id),
      },
    ]);
  };

  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.description} numberOfLines={1}>
          {entry.description}
        </Text>
        <Text style={styles.date}>{entry.date}</Text>
      </View>
      <Text style={styles.amount}>{formatCurrency(entry.amount)}</Text>
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
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: "#f9fafb",
    borderRadius: 6,
    marginBottom: 4,
  },
  info: { flex: 1, marginRight: 8 },
  description: { fontSize: 14, color: "#374151" },
  date: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  amount: { fontSize: 14, fontWeight: "600", color: "#15803d", marginRight: 8 },
  deleteBtn: { padding: 4 },
  deleteText: { fontSize: 18, color: "#ef4444" },
});
