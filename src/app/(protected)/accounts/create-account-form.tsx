"use client";

import { useActionState } from "react";
import { createAccount, type ActionState } from "./actions";
import { ModuleCheckboxes } from "@/components/module-checkboxes";
import { ROLE_LABELS } from "@/lib/modules";

export function CreateAccountForm({ roleOptions }: { roleOptions: string[] }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(createAccount, {});

  return (
    <form action={action} className="max-w-xl space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
            Full name
          </label>
          <input
            id="name"
            name="name"
            required
            placeholder="Juan Dela Cruz"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="name@school.local"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="role" className="mb-1 block text-sm font-medium text-slate-700">
            Role
          </label>
          <select
            id="role"
            name="role"
            defaultValue={roleOptions[0]}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none"
          >
            {roleOptions.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r] ?? r}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
            Temporary password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="At least 8 characters"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none"
          />
        </div>
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Modules this account can access</p>
        <ModuleCheckboxes value={["dashboard"]} />
      </div>
      {state.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create account"}
      </button>
    </form>
  );
}