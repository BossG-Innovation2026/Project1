"use client";

import { useActionState } from "react";
import { removeClassSubject, type ActionState } from "./actions";
import { PasswordConfirmForm } from "./password-confirm-form";

export function RemoveClassSubjectButton({ id }: { id: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(removeClassSubject, {});

  return (
    <PasswordConfirmForm action={action} className="flex flex-col items-end gap-1">
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        className="text-sm text-muted hover:text-foreground hover:underline disabled:opacity-50"
      >
        Remove
      </button>
      {state.error && <p className="text-xs text-muted">{state.error}</p>}
    </PasswordConfirmForm>
  );
}