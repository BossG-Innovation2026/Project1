"use client";

import { useActionState } from "react";
import {
  updatePermissions,
  resetPassword,
  setActive,
  type ActionState,
  type AccountRow,
} from "./actions";
import { ModuleCheckboxes } from "@/components/module-checkboxes";
import { parsePermissions } from "@/lib/modules";

function Notice({ state }: { state: ActionState }) {
  if (!state.error && !state.ok) return null;
  return (
    <p
      className={`rounded-md px-3 py-2 text-sm ${
        state.error ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
      }`}
    >
      {state.error ?? "Saved."}
    </p>
  );
}

export function EditAccountForm({
  account,
  canEdit,
  editingSelf,
}: {
  account: AccountRow;
  canEdit: boolean;
  editingSelf: boolean;
}) {
  const [permState, permAction, permPending] = useActionState(
    updatePermissions.bind(null, account.id),
    {}
  );
  const [pwState, pwAction, pwPending] = useActionState(resetPassword.bind(null, account.id), {});
  const [activeState, activeAction, activePending] = useActionState(
    setActive.bind(null, account.id),
    {}
  );

  const locked = editingSelf ? ["accounts"] : [];
  const disabled = !canEdit ? ["dashboard", "accounts", "curriculum", "classes", "grades_submit", "grades_approve", "registrar", "codes"] : [];

  return (
    <div className="space-y-8">
      <section className="max-w-xl">
        <h2 className="text-sm font-semibold text-slate-800">Modules</h2>
        {!canEdit && (
          <p className="mt-1 text-xs text-slate-500">
            Only the super admin can manage this account.
          </p>
        )}
        <form action={permAction} className="mt-3 space-y-3">
          <ModuleCheckboxes value={parsePermissions(account.permissions)} locked={locked} disabled={disabled} />
          <Notice state={permState} />
          {canEdit && (
            <button
              type="submit"
              disabled={permPending}
              className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
            >
              {permPending ? "Saving…" : "Save modules"}
            </button>
          )}
        </form>
      </section>

      <section className="max-w-xl">
        <h2 className="text-sm font-semibold text-slate-800">Reset password</h2>
        <form action={pwAction} className="mt-3 flex items-end gap-3">
          <div className="flex-1">
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
              New password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              disabled={!canEdit}
              placeholder="At least 8 characters"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none disabled:bg-slate-50"
            />
          </div>
          {canEdit && (
            <button
              type="submit"
              disabled={pwPending}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              {pwPending ? "Saving…" : "Reset password"}
            </button>
          )}
        </form>
        <div className="mt-2">
          <Notice state={pwState} />
        </div>
      </section>

      <section className="max-w-xl">
        <h2 className="text-sm font-semibold text-slate-800">Account status</h2>
        <form action={activeAction} className="mt-3">
          <input type="hidden" name="active" value={account.active ? 0 : 1} />
          {canEdit && !editingSelf && account.role !== "super_admin" ? (
            <button
              type="submit"
              disabled={activePending}
              className={`rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${
                account.active ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {activePending ? "Saving…" : account.active ? "Deactivate account" : "Activate account"}
            </button>
          ) : (
            <p className="text-sm text-slate-500">
              {account.active ? "Active" : "Deactivated"}
              {editingSelf && " — you cannot deactivate your own account."}
            </p>
          )}
          <div className="mt-2">
            <Notice state={activeState} />
          </div>
        </form>
      </section>
    </div>
  );
}