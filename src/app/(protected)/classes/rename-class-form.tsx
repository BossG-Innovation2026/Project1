"use client";

import { useActionState } from "react";
import { renameClass, type ActionState } from "./actions";

export function RenameClassForm({ classId, name }: { classId: string; name: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(renameClass, {});

  return (
    <form action={action} className="mt-3 flex items-end gap-2">
      <input type="hidden" name="classId" value={classId} />
      <label className="flex-1">
        <span className="text-xs text-muted">Section name</span>
        <input
          name="name"
          defaultValue={name}
          required
          className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-on-accent hover:bg-accent-strong disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save"}
      </button>
      {state.error && (
        <p className="rounded-md bg-accent-soft px-3 py-2 text-sm text-foreground">{state.error}</p>
      )}
    </form>
  );
}
