"use client";

import { LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function SignOutButton({ className, compact = false }: { className?: string; compact?: boolean }) {
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  if (compact) {
    return (
      <button
        onClick={handleSignOut}
        title="Sign out"
        className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-700 text-white hover:bg-slate-600"
      >
        <LogOut size={16} />
      </button>
    );
  }

  return (
    <button
      onClick={handleSignOut}
      className={`rounded-md bg-slate-700 px-3 py-2 text-sm text-white hover:bg-slate-600 ${className ?? ""}`}
    >
      Sign out
    </button>
  );
}