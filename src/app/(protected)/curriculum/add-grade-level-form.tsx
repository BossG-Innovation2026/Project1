"use client";

import { useActionState } from "react";
import { addGradeLevel, type ActionState } from "./actions";

export function AddGradeLevelForm({
  k12Names,
  existing,
}: {
  k12Names: string[];
  existing: string[];
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(addGradeLevel, {});

  return (
    <form action={action} className="mt-3 flex items-end gap-2">
      <label className="flex-1">
        <span className="text-xs text-muted">Grade level</span>
        <select
          name="name"
          required
          defaultValue=""
          className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
        >
          <option value="" disabled>
            Select…
          </option>
          {k12Names.map((name) => (
            <option key={name} value={name} disabled={existing.includes(name)}>
              {name}
              {existing.includes(name) ? " (already added)" : ""}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-on-accent hover:bg-accent-strong disabled:opacity-50"
      >
        {pending ? "Adding…" : "Add"}
      </button>
      {state.error && (
        <p className="rounded-md bg-accent-soft px-3 py-2 text-sm text-foreground">{state.error}</p>
      )}
    </form>
  );
}
