"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
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
