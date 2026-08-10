import Link from "next/link";
import { requireAdmin } from "@/lib/access";
import { ROLE_LABELS } from "@/lib/access";
import { listAccounts } from "./actions";

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  const user = await requireAdmin();
  const accounts = await listAccounts();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Account Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Accounts show only the modules ticked at registration.
          </p>
        </div>
        <Link
          href="/accounts/new"
          className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
        >
          Register account
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Modules</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {accounts.map((a) => {
              const perms = JSON.parse(a.permissions || "[]") as string[];
              return (
                <tr key={a.id} className={a.active ? "" : "bg-slate-50 text-slate-400"}>
                  <td className="px-4 py-3 font-medium text-slate-800">{a.name}</td>
                  <td className="px-4 py-3">{a.email}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700">
                      {ROLE_LABELS[a.role] ?? a.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{perms.length} modules</td>
                  <td className="px-4 py-3">
                    {a.active ? (
                      <span className="text-xs font-medium text-emerald-600">Active</span>
                    ) : (
                      <span className="text-xs font-medium text-red-600">Deactivated</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {a.id === user.id ? (
                      <Link href={`/accounts/${a.id}`} className="text-sky-600 hover:underline">
                        Your account
                      </Link>
                    ) : (
                      <Link href={`/accounts/${a.id}`} className="text-sky-600 hover:underline">
                        Manage
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
            {accounts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  No accounts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}