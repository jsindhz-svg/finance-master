import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Id } from "@convex/_generated/dataModel";
import { todayString } from "../lib/utils";
import { useTransactions } from "../hooks/useTransactions";

interface Category {
  _id: Id<"categories">;
  name: string;
}

interface AddTransactionFormProps {
  categories: Category[];
}

export function AddTransactionForm({ categories }: AddTransactionFormProps) {
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayString());

  const { addTransaction } = useTransactions();

  const handleSubmit = async () => {
    const amountNum = parseFloat(amount);
    const success = await addTransaction(
      categoryId as Id<"categories">,
      description,
      amountNum,
      date
    );
    if (success) {
      setDescription("");
      setAmount("");
      setDate(todayString());
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Transaction</Text>

      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={categoryId}
          onValueChange={(v) => setCategoryId(v)}
          style={styles.picker}
        >
          <Picker.Item label="Category..." value="" />
          {categories.map((cat) => (
            <Picker.Item key={cat._id} label={cat.name} value={cat._id} />
          ))}
        </Picker>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />

      <View style={styles.row}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="YYYY-MM-DD"
          value={date}
          onChangeText={setDate}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Add Transaction</Text>
      </TouchableOpacity>
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
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 8,
  },
  picker: { height: 50 },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 8,
  },
  row: { flexDirection: "row", gap: 8 },
  button: {
    backgroundColor: "#dc2626",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
