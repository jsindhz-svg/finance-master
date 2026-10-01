import { View, Text, StyleSheet } from "react-native";

interface StatCardProps {
  label: string;
  value: string;
  sublabel?: string;
  variant?: "green" | "amber" | "red";
}

const colorMap = {
  green: "#15803d",
  amber: "#b45309",
  red: "#b91c1c",
};

export function StatCard({ label, value, sublabel, variant }: StatCardProps) {
  const valueColor = variant ? colorMap[variant] : "#111827";

  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
      {sublabel && <Text style={styles.sublabel}>{sublabel}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 12,
    flex: 1,
  },
  label: { fontSize: 11, color: "#6b7280", marginBottom: 4 },
  value: { fontSize: 18, fontWeight: "700" },
  sublabel: { fontSize: 11, color: "#6b7280", marginTop: 2 },
});
