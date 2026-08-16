"use client";

import { useActionState } from "react";
import { unenrollStudent, type ActionState } from "./actions";
import { PasswordConfirmForm } from "./password-confirm-form";

export function UnenrollStudentButton({
  classId,
  studentId,
}: {
  classId: string;
  studentId: string;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(unenrollStudent, {});

  return (
    <PasswordConfirmForm action={action} className="flex flex-col items-end gap-1">
      <input type="hidden" name="classId" value={classId} />
      <input type="hidden" name="studentId" value={studentId} />
      <button
        type="submit"
        disabled={pending}
        className="text-sm text-muted hover:text-foreground hover:underline disabled:opacity-50"
      >
        Unenroll
      </button>
      {state.error && <p className="text-xs text-muted">{state.error}</p>}
    </PasswordConfirmForm>
  );
}