import { ScrollView, View, Text, StyleSheet } from "react-native";

const sections = [
  {
    title: "Monthly Spending",
    body: "Set a cap for how much you want to spend per month in a category. This is useful for recurring expenses like groceries, dining out, or entertainment. Each month the target resets, so you can track whether you're staying within your limit.",
  },
  {
    title: "Monthly Savings",
    body: "Set how much you want to save each month toward a category. Unlike spending targets, unspent money rolls over into the next month. Use this for things like an emergency fund or vacation savings where you contribute a fixed amount regularly.",
  },
  {
    title: "Save Up (by Date)",
    body: "Set a total amount and a deadline. The app calculates how much you need to assign each month to reach your goal on time. Great for large purchases or annual expenses like insurance premiums or holiday gifts.",
  },
];

export default function GuideScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>Targets Guide</Text>

      {sections.map((section) => (
        <View key={section.title} style={styles.card}>
          <Text style={styles.cardTitle}>{section.title}</Text>
          <Text style={styles.cardBody}>{section.body}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  title: { fontSize: 22, fontWeight: "700", color: "#111827" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 20,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 22,
    color: "#6b7280",
  },
});
