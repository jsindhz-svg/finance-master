import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { addMonths, formatMonth } from "../lib/utils";

interface MonthNavigatorProps {
  month: string;
  onChange: (month: string) => void;
}

export function MonthNavigator({ month, onChange }: MonthNavigatorProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.arrow}
        onPress={() => onChange(addMonths(month, -1))}
      >
        <Text style={styles.arrowText}>{"\u2190"}</Text>
      </TouchableOpacity>
      <Text style={styles.month}>{formatMonth(month)}</Text>
      <TouchableOpacity
        style={styles.arrow}
        onPress={() => onChange(addMonths(month, 1))}
      >
        <Text style={styles.arrowText}>{"\u2192"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingVertical: 8,
  },
  arrow: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#f3f4f6",
  },
  arrowText: { fontSize: 18, fontWeight: "500", color: "#4b5563" },
  month: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    width: 200,
    textAlign: "center",
  },
});
