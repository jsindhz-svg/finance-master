import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useAuthActions } from "@convex-dev/auth/react";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    setSubmitting(true);
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("flow", flow);
    void signIn("password", formData).catch((error: Error) => {
      let message = "";
      if (error.message.includes("Invalid password")) {
        message = "Invalid password. Please try again.";
      } else {
        message =
          flow === "signIn"
            ? "Could not sign in, did you mean to sign up?"
            : "Could not sign up, did you mean to sign in?";
      }
      Alert.alert("Error", message);
      setSubmitting(false);
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Zero-Based Budget</Text>
      <Text style={styles.subtitle}>
        Give every dollar a job. Sign in to start budgeting.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        textContentType="emailAddress"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        textContentType="password"
      />
      <TouchableOpacity
        style={[styles.button, submitting && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text style={styles.buttonText}>
          {flow === "signIn" ? "Sign In" : "Sign Up"}
        </Text>
      </TouchableOpacity>

      <View style={styles.toggleRow}>
        <Text style={styles.toggleText}>
          {flow === "signIn"
            ? "Don't have an account? "
            : "Already have an account? "}
        </Text>
        <TouchableOpacity
          onPress={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
        >
          <Text style={styles.toggleLink}>
            {flow === "signIn" ? "Sign up instead" : "Sign in instead"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity
        style={styles.anonButton}
        onPress={() => void signIn("anonymous")}
      >
        <Text style={styles.buttonText}>Sign in anonymously</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", maxWidth: 400 },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2563eb",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  toggleText: { fontSize: 14, color: "#6b7280" },
  toggleLink: { fontSize: 14, color: "#2563eb", fontWeight: "600" },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#e5e7eb" },
  dividerText: { marginHorizontal: 16, color: "#6b7280", fontSize: 14 },
  anonButton: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
});
