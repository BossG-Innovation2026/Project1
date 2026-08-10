"use client";

import { useActionState } from "react";
import { addOtherSubject, type ActionState } from "./actions";

export function AddOtherSubjectForm({
  classId,
  teachers,
}: {
  classId: string;
  teachers: { id: string; name: string }[];
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(addOtherSubject, {});

  return (
    <form action={action} className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-4 sm:items-end">
      <input type="hidden" name="classId" value={classId} />
      <label>
        <span className="text-xs text-muted">Code</span>
        <input
          name="code"
          required
          placeholder="e.g. PE-11"
          className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-subtle focus:border-accent focus:outline-none"
        />
      </label>
      <label className="sm:col-span-2">
        <span className="text-xs text-muted">Title</span>
        <input
          name="title"
          required
          placeholder="e.g. Physical Education"
          className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-subtle focus:border-accent focus:outline-none"
        />
      </label>
      <label>
        <span className="text-xs text-muted">Subject teacher</span>
        <select
          name="teacherId"
          defaultValue=""
          className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
        >
          <option value="">— assign later —</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-on-accent hover:bg-accent-strong disabled:opacity-50 sm:col-span-1"
      >
        {pending ? "Adding…" : "Add subject"}
      </button>
      {state.error && (
        <p className="rounded-md bg-accent-soft px-3 py-2 text-sm text-foreground sm:col-span-4">
          {state.error}
        </p>
      )}
    </form>
  );
}
