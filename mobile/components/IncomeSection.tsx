import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { Id } from "@convex/_generated/dataModel";
import { todayString } from "../lib/utils";
import { useIncome } from "../hooks/useIncome";
import { IncomeRow } from "./IncomeRow";

interface IncomeEntry {
  _id: Id<"incomeEntries">;
  description: string;
  amount: number;
  date: string;
}

interface IncomeSectionProps {
  entries: IncomeEntry[];
}

export function IncomeSection({ entries }: IncomeSectionProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayString());

  const { addIncome, deleteIncome } = useIncome();

  const handleSubmit = async () => {
    const amountNum = parseFloat(amount);
    const success = await addIncome(description, amountNum, date);
    if (success) {
      setDescription("");
      setAmount("");
      setDate(todayString());
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Income</Text>

      <View style={styles.form}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
        />
        <TextInput
          style={[styles.input, { width: 90 }]}
          placeholder="Amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />
        <TextInput
          style={[styles.input, { width: 110 }]}
          placeholder="YYYY-MM-DD"
          value={date}
          onChangeText={setDate}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleSubmit}>
          <Text style={styles.addText}>Add</Text>
        </TouchableOpacity>
      </View>

      {entries.length > 0 && (
        <FlatList
          data={entries}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <IncomeRow entry={item} onDelete={deleteIncome} />
          )}
          scrollEnabled={false}
          style={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 16,
  },
  title: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 12 },
  form: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  addButton: {
    backgroundColor: "#16a34a",
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    justifyContent: "center",
  },
  addText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  list: { marginTop: 4 },
});
