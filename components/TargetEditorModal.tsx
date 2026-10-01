import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Id } from "@convex/_generated/dataModel";
import { useCategories } from "../hooks/useCategories";

interface TargetEditorModalProps {
  visible: boolean;
  categoryId: Id<"categories">;
  currentType?: string;
  currentAmount?: number;
  currentFrequency?: string;
  currentDate?: string;
  onClose: () => void;
}

export function TargetEditorModal({
  visible,
  categoryId,
  currentType,
  currentAmount,
  currentFrequency,
  currentDate,
  onClose,
}: TargetEditorModalProps) {
  const [targetType, setTargetType] = useState(
    currentType ?? "monthly_spending"
  );
  const [targetAmount, setTargetAmount] = useState(
    currentAmount?.toString() ?? ""
  );
  const [targetFrequency, setTargetFrequency] = useState(
    currentFrequency ?? "monthly"
  );
  const [targetDate, setTargetDate] = useState(currentDate ?? "");

  const { setTarget, removeTarget } = useCategories();

  const handleSave = async () => {
    const amount = parseFloat(targetAmount);
    const success = await setTarget(
      categoryId,
      targetType as "monthly_spending" | "monthly_savings" | "balance_by_date",
      amount,
      targetFrequency as "monthly" | "yearly" | "custom_date",
      targetFrequency === "custom_date" ? targetDate || undefined : undefined
    );
    if (success) onClose();
  };

  const handleRemove = async () => {
    const success = await removeTarget(categoryId);
    if (success) onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Set Target</Text>

          <Text style={styles.label}>Target Type</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={targetType}
              onValueChange={(v) => setTargetType(v)}
              style={styles.picker}
            >
              <Picker.Item label="Monthly Spending" value="monthly_spending" />
              <Picker.Item label="Monthly Savings" value="monthly_savings" />
              <Picker.Item label="Save Up (by date)" value="balance_by_date" />
            </Picker>
          </View>

          <Text style={styles.label}>Amount</Text>
          <TextInput
            style={styles.input}
            value={targetAmount}
            onChangeText={setTargetAmount}
            placeholder="0.00"
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Frequency</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={targetFrequency}
              onValueChange={(v) => setTargetFrequency(v)}
              style={styles.picker}
            >
              <Picker.Item label="Monthly" value="monthly" />
              <Picker.Item label="Yearly" value="yearly" />
              <Picker.Item label="Custom Date" value="custom_date" />
            </Picker>
          </View>

          {targetFrequency === "custom_date" && (
            <>
              <Text style={styles.label}>Target Month (YYYY-MM)</Text>
              <TextInput
                style={styles.input}
                value={targetDate}
                onChangeText={setTargetDate}
                placeholder="2026-12"
              />
            </>
          )}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
            {currentType && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={handleRemove}
              >
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 16 },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4b5563",
    marginBottom: 4,
    marginTop: 12,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    overflow: "hidden",
  },
  picker: { height: 50 },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 20,
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#2563eb",
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  removeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  removeText: { color: "#dc2626", fontSize: 14, fontWeight: "600" },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cancelText: { color: "#4b5563", fontSize: 14, fontWeight: "600" },
});
