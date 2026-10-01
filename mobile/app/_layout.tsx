import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { Slot } from "expo-router";
import { convex } from "../lib/convex";
import { secureStorage } from "../lib/secureStorage";

export default function RootLayout() {
  return (
    <ConvexAuthProvider client={convex} storage={secureStorage}>
      <Slot />
    </ConvexAuthProvider>
  );
}
