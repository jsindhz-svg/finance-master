import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Id } from "@convex/_generated/dataModel";
import { todayString } from "../lib/utils";
import { useTransactions } from "../hooks/useTransactions";
import { TransactionRow } from "./TransactionRow";

interface Transaction {
  _id: Id<"transactions">;
  categoryId: Id<"categories">;
  description: string;
  amount: number;
  date: string;
}

interface CategoryOption {
  _id: Id<"categories">;
  name: string;
}

interface TransactionListCompactProps {
  transactions: Transaction[];
  categories: CategoryOption[];
}

export function TransactionListCompact({
  transactions,
  categories,
}: TransactionListCompactProps) {
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayString());

  const { addTransaction, deleteTransaction } = useTransactions();

  const getCategoryName = (catId: Id<"categories">) =>
    categories.find((c) => c._id === catId)?.name ?? "Unknown";

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
      <Text style={styles.title}>Transactions</Text>

      {/* Add form */}
      <View style={styles.form}>
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

      {transactions.length > 0 && (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TransactionRow
              transaction={item}
              categoryName={getCategoryName(item.categoryId)}
              onDelete={deleteTransaction}
            />
          )}
          scrollEnabled={false}
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
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    overflow: "hidden",
    width: "100%",
  },
  picker: { height: 44 },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  addButton: {
    backgroundColor: "#dc2626",
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    justifyContent: "center",
  },
  addText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
