"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function SignOutButton({ variant = "default" }: { variant?: "default" | "sidebar" }) {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();

  if (!isAuthenticated) {
    return null;
  }

  if (variant === "sidebar") {
    return (
      <button
        onClick={() => void signOut()}
        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => void signOut()}
      className="gap-2"
    >
      <LogOut className="h-3.5 w-3.5" />
      Sign out
    </Button>
  );
}
