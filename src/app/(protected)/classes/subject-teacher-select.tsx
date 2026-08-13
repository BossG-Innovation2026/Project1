"use client";

import { setSubjectTeacher } from "./actions";

export function SubjectTeacherSelect({
  classSubjectId,
  teacherId,
  teachers,
}: {
  classSubjectId: string;
  teacherId: string | null;
  teachers: { id: string; name: string }[];
}) {
  return (
    <form action={setSubjectTeacher} className="flex items-center gap-2">
      <input type="hidden" name="classSubjectId" value={classSubjectId} />
      <select
        name="teacherId"
        defaultValue={teacherId ?? ""}
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
    </form>
  );
}
