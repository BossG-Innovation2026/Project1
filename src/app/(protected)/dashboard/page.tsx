import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { MODULES, getPermissions, NAV_LINKS, ROLE_LABELS } from "@/lib/access";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const permissions = getPermissions(user);
  const owned = MODULES.filter((m) => permissions.includes(m.key));

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">
        Signed in as <span className="font-medium text-slate-700">{user.name}</span> (
        {ROLE_LABELS[user.role] ?? user.role})
      </p>

      <div className="mt-6">
        <h2 className="text-sm font-semibold text-slate-700">Your modules</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {owned.map((m) => {
            const link = NAV_LINKS.find((l) => l.module === m.key);
            const isLive = link?.implemented;
            const card = (
              <>
                <p className="text-sm font-semibold text-slate-800">{m.label}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {isLive ? "Open module" : "Coming in a later module"}
                </p>
              </>
            );
            return isLive ? (
              <Link
                key={m.key}
                href={link!.href}
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-sky-400"
              >
                {card}
              </Link>
            ) : (
              <div
                key={m.key}
                className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4"
              >
                {card}
              </div>
            );
          })}
          {owned.length === 0 && (
            <p className="text-sm text-slate-500">
              No modules assigned to your account yet. Contact an admin to add modules.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}