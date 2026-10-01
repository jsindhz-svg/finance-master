import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { Id } from "@convex/_generated/dataModel";
import { formatCurrency } from "../lib/utils";
import { useCategories } from "../hooks/useCategories";
import { TargetEditorModal } from "./TargetEditorModal";

interface CategoryData {
  _id: Id<"categories">;
  name: string;
  assigned: number;
  activity: number;
  available: number;
  targetType?: string;
  targetAmount?: number;
  targetFrequency?: string;
  targetDate?: string;
  targetNeeded: number;
  targetStatus: "met" | "underfunded" | "none";
}

interface CategoryRowProps {
  category: CategoryData;
  month: string;
}

function getTargetProgress(category: CategoryData) {
  if (
    !category.targetType ||
    !category.targetAmount ||
    category.targetAmount <= 0
  ) {
    return null;
  }

  let filled = 0;
  let typeLabel = "";
  let ruleText = "";

  if (category.targetType === "monthly_spending") {
    filled = category.assigned / category.targetAmount;
    typeLabel = "Spending";
    ruleText = `${formatCurrency(category.targetAmount)}/mo`;
  } else if (category.targetType === "monthly_savings") {
    filled = Math.max(0, category.available) / category.targetAmount;
    typeLabel = "Savings";
    ruleText = `${formatCurrency(category.targetAmount)}/mo`;
  } else if (category.targetType === "balance_by_date") {
    filled = Math.max(0, category.available) / category.targetAmount;
    typeLabel = "Goal";
    ruleText = formatCurrency(category.targetAmount);
  }

  return {
    percent: Math.min(1, Math.max(0, filled)),
    typeLabel,
    ruleText,
  };
}

export function CategoryRow({ category, month }: CategoryRowProps) {
  const [isEditingAssigned, setIsEditingAssigned] = useState(false);
  const [assignedInput, setAssignedInput] = useState("");
  const [showTarget, setShowTarget] = useState(false);

  const { assignBudget, deleteCategory } = useCategories();

  const handleAssignedPress = () => {
    setAssignedInput(
      category.assigned === 0 ? "" : category.assigned.toString()
    );
    setIsEditingAssigned(true);
  };

  const handleAssignedBlur = async () => {
    setIsEditingAssigned(false);
    const value = parseFloat(assignedInput);
    if (isNaN(value) || value < 0) return;
    if (value === category.assigned) return;
    await assignBudget(category._id, month, value);
  };

  const handleLongPress = () => {
    Alert.alert("Delete Category", `Delete "${category.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => void deleteCategory(category._id),
      },
    ]);
  };

  const target = getTargetProgress(category);
  const isMet = category.targetStatus === "met";

  const availableColor =
    category.available < 0
      ? "#dc2626"
      : category.available > 0
        ? "#15803d"
        : "#9ca3af";

  return (
    <TouchableOpacity
      style={styles.row}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
    >
      {/* Category name column */}
      <View style={styles.nameCol}>
        <Text style={styles.name} numberOfLines={1}>
          {category.name}
        </Text>

        {target ? (
          <TouchableOpacity
            style={styles.targetRow}
            onPress={() => setShowTarget(true)}
          >
            <View
              style={[
                styles.typePill,
                category.targetType === "monthly_spending"
                  ? styles.pillSpending
                  : category.targetType === "monthly_savings"
                    ? styles.pillSavings
                    : styles.pillGoal,
              ]}
            >
              <Text style={styles.pillText}>{target.typeLabel}</Text>
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${target.percent * 100}%`,
                    backgroundColor: isMet ? "#34d399" : "#fbbf24",
                  },
                ]}
              />
            </View>

            <Text style={styles.ruleText}>{target.ruleText}</Text>

            <Text
              style={[
                styles.statusText,
                { color: isMet ? "#059669" : "#d97706" },
              ]}
            >
              {isMet ? "Funded" : `Need ${formatCurrency(category.targetNeeded)}`}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => setShowTarget(true)}>
            <Text style={styles.setTarget}>+ Set target</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Assigned (editable) */}
      <View style={styles.numCol}>
        {isEditingAssigned ? (
          <TextInput
            style={styles.assignedInput}
            value={assignedInput}
            onChangeText={setAssignedInput}
            onBlur={handleAssignedBlur}
            autoFocus
            keyboardType="decimal-pad"
            selectTextOnFocus
          />
        ) : (
          <TouchableOpacity onPress={handleAssignedPress}>
            <Text style={styles.numText}>
              {formatCurrency(category.assigned)}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Activity */}
      <View style={styles.numCol}>
        <Text style={[styles.numText, { color: "#6b7280" }]}>
          {formatCurrency(category.activity)}
        </Text>
      </View>

      {/* Available */}
      <View style={styles.numCol}>
        <Text style={[styles.numText, { color: availableColor }]}>
          {formatCurrency(category.available)}
        </Text>
      </View>

      <TargetEditorModal
        visible={showTarget}
        categoryId={category._id}
        currentType={category.targetType}
        currentAmount={category.targetAmount}
        currentFrequency={category.targetFrequency}
        currentDate={category.targetDate}
        onClose={() => setShowTarget(false)}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    alignItems: "flex-start",
  },
  nameCol: { flex: 1, marginRight: 8 },
  name: { fontSize: 14, fontWeight: "600", color: "#111827" },
  targetRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  typePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pillSpending: { backgroundColor: "#f1f5f9" },
  pillSavings: { backgroundColor: "#eef2ff" },
  pillGoal: { backgroundColor: "#f5f3ff" },
  pillText: {
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#64748b",
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: "#f3f4f6",
    borderRadius: 2,
    overflow: "hidden",
    minWidth: 40,
  },
  progressFill: { height: "100%", borderRadius: 2 },
  ruleText: { fontSize: 11, color: "#9ca3af" },
  statusText: { fontSize: 11, fontWeight: "600" },
  setTarget: { fontSize: 11, color: "#d1d5db", marginTop: 4 },
  numCol: { width: 80, alignItems: "flex-end" },
  numText: { fontSize: 13, fontVariant: ["tabular-nums"] },
  assignedInput: {
    borderWidth: 1,
    borderColor: "#93c5fd",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontSize: 13,
    textAlign: "right",
    width: 80,
  },
});
