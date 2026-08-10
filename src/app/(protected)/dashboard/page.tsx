import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { ROLE_LABELS } from "@/lib/access";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">
        Signed in as <span className="font-medium text-slate-700">{user.name}</span> (
        {ROLE_LABELS[user.role] ?? user.role})
      </p>

      <div className="mt-6 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
        <p className="text-sm font-medium text-slate-700">Analytics and notifications</p>
        <p className="mt-1 text-xs text-slate-500">
          Coming in a later module. Your modules are always available in the panel on the left.
        </p>
      </div>
    </div>
  );
}