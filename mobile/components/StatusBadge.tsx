import { View, Text, StyleSheet } from "react-native";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  if (status === "met") {
    return (
      <View style={[styles.badge, styles.funded]}>
        <Text style={[styles.text, styles.fundedText]}>Funded</Text>
      </View>
    );
  }
  if (status === "underfunded") {
    return (
      <View style={[styles.badge, styles.underfunded]}>
        <Text style={[styles.text, styles.underfundedText]}>Underfunded</Text>
      </View>
    );
  }
  return <Text style={styles.dash}>{"\u2014"}</Text>;
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: "center",
  },
  text: { fontSize: 11, fontWeight: "600" },
  funded: { backgroundColor: "#dcfce7" },
  fundedText: { color: "#15803d" },
  underfunded: { backgroundColor: "#fef3c7" },
  underfundedText: { color: "#b45309" },
  dash: { fontSize: 12, color: "#9ca3af", textAlign: "center" },
});
