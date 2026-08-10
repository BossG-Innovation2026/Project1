"use client";

import { useActionState } from "react";
import { addClassSubject, type ActionState } from "./actions";

export function AddClassSubjectForm({
  classId,
  subjects,
  teachers,
}: {
  classId: string;
  subjects: { id: string; code: string; title: string }[];
  teachers: { id: string; name: string }[];
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(addClassSubject, {});

  return (
    <form action={action} className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-4 sm:items-end">
      <input type="hidden" name="classId" value={classId} />
      <label className="sm:col-span-1">
        <span className="text-xs text-muted">Subject</span>
        <select
          name="subjectId"
          required
          defaultValue=""
          className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
        >
          <option value="" disabled>
            Select…
          </option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.code} — {s.title}
            </option>
          ))}
        </select>
      </label>
      <label className="sm:col-span-2">
        <span className="text-xs text-muted">Description</span>
        <input
          name="description"
          placeholder="e.g. Covers functions and probability"
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
