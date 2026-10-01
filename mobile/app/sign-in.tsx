import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SignInForm } from "../components/SignInForm";

export default function SignInScreen() {
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inner}>
          <SignInForm />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  scroll: { flexGrow: 1, justifyContent: "center" },
  inner: { padding: 24, alignItems: "center" },
});
