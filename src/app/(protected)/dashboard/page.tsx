import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { ROLE_LABELS } from "@/lib/access";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <div>
      <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">
        Signed in as <span className="font-medium text-foreground">{user.name}</span> (
        {ROLE_LABELS[user.role] ?? user.role})
      </p>

      <div className="mt-6 rounded-lg border border-dashed border-border bg-panel p-8 text-center">
        <p className="text-sm font-medium text-foreground">Analytics and notifications</p>
        <p className="mt-1 text-xs text-muted">
          Coming in a later module. Your modules are always available in the panel on the left.
        </p>
      </div>
    </div>
  );
}