import Link from "next/link";
import { requireAdmin, ROLE_LABELS } from "@/lib/access";
import { getAccount } from "../actions";
import { EditAccountForm } from "../edit-account-form";

export const dynamic = "force-dynamic";

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAdmin();
  const { id } = await params;
  const account = await getAccount(id);
  if (!account) {
    return (
      <div>
        <p className="text-sm text-slate-500">Account not found.</p>
        <Link href="/accounts" className="mt-2 inline-block text-sm text-sky-600 hover:underline">
          ← Back to accounts
        </Link>
      </div>
    );
  }

  const editingSelf = user.id === account.id;
  const canEdit =
    user.role === "super_admin" ||
    (user.role === "admin" && account.role !== "admin" && account.role !== "super_admin") ||
    editingSelf;

  return (
    <div className="max-w-2xl">
      <Link href="/accounts" className="text-sm text-sky-600 hover:underline">
        ← Back to accounts
      </Link>
      <div className="mt-2 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-400 text-lg font-bold text-white">
          {account.name.charAt(0)}
        </span>
        <div>
          <h1 className="text-xl font-bold text-slate-800">{account.name}</h1>
          <p className="text-sm text-slate-500">
            {account.email} ·{" "}
            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700">
              {ROLE_LABELS[account.role] ?? account.role}
            </span>{" "}
            {!account.active && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                Deactivated
              </span>
            )}
          </p>
        </div>
      </div>

      {editingSelf && (
        <p className="mt-4 rounded-md bg-sky-50 px-3 py-2 text-sm text-sky-700">
          This is your own account. You can add or remove modules (except Account Management),
          change your password, and update your status.
        </p>
      )}

      <div className="mt-6">
        <EditAccountForm account={account} canEdit={canEdit} editingSelf={editingSelf} />
      </div>
    </div>
  );
}