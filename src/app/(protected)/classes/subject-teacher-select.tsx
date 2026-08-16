"use client";

import { useActionState } from "react";
import { setSubjectTeacher, type ActionState } from "./actions";
import { PasswordConfirmForm } from "./password-confirm-form";

export function SubjectTeacherSelect({
  classSubjectId,
  teacherId,
  teachers,
}: {
  classSubjectId: string;
  teacherId: string | null;
  teachers: { id: string; name: string }[];
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(setSubjectTeacher, {});

  return (
    <PasswordConfirmForm action={action} className="flex flex-col items-start gap-1">
      <input type="hidden" name="classSubjectId" value={classSubjectId} />
      <select
        key={teacherId ?? "none"}
        name="teacherId"
        defaultValue={teacherId ?? ""}
        disabled={pending}
        onChange={(e) => e.target.form?.requestSubmit()}
        className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-foreground focus:border-accent focus:outline-none"
      >
        <option value="">— unassigned —</option>
        {teachers.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
      {state.error && (
        <p className="text-xs text-muted">{state.error}</p>
      )}
    </PasswordConfirmForm>
  );
}