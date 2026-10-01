import { View, Text, StyleSheet } from "react-native";
import { formatCurrency } from "../lib/utils";

interface ReadyToAssignProps {
  amount: number;
}

export function ReadyToAssign({ amount }: ReadyToAssignProps) {
  const isPositive = amount >= 0;

  return (
    <View
      style={[
        styles.container,
        isPositive ? styles.positive : styles.negative,
      ]}
    >
      <Text style={styles.label}>Ready to Assign</Text>
      <Text
        style={[styles.amount, isPositive ? styles.amountPos : styles.amountNeg]}
      >
        {formatCurrency(amount)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  positive: { backgroundColor: "#f0fdf4", borderWidth: 1, borderColor: "#bbf7d0" },
  negative: { backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fecaca" },
  label: { fontSize: 14, fontWeight: "500", color: "#4b5563" },
  amount: { fontSize: 32, fontWeight: "700", marginTop: 4 },
  amountPos: { color: "#15803d" },
  amountNeg: { color: "#b91c1c" },
});
