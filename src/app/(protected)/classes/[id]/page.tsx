import Link from "next/link";
import { requireModule } from "@/lib/access";
import { isAdmin } from "@/lib/access";
import {
  deleteClass,
  getClass,
  listActiveTeachers,
  listClassSubjects,
  removeClassSubject,
  setSubjectTeacher,
} from "../actions";
import { RenameClassForm } from "../rename-class-form";
import { AddOtherSubjectForm } from "../add-other-subject-form";

export const dynamic = "force-dynamic";

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireModule("classes");
  const { id } = await params;

  const [cls, subjects, teachers] = await Promise.all([
    getClass(id),
    listClassSubjects(id),
    listActiveTeachers(),
  ]);
  if (!cls) {
    return (
      <div>
        <p className="text-sm text-muted">Class not found.</p>
        <Link href="/classes" className="mt-2 inline-block text-sm text-accent-strong hover:underline">
          ← Back to classes
        </Link>
      </div>
    );
  }

  const canEdit = isAdmin(user) || cls.adviserId === user.id;

  return (
    <div>
      <Link href="/classes" className="text-sm text-accent-strong hover:underline">
        ← Back to classes
      </Link>
      <div className="mt-2 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">{cls.name}</h1>
          <p className="mt-1 text-sm text-muted">
            {cls.gradeLevelName} · Adviser: <span className="text-foreground">{cls.adviserName}</span>
          </p>
        </div>
        {canEdit && (
          <form action={deleteClass}>
            <input type="hidden" name="id" value={cls.id} />
            <button
              type="submit"
              className="rounded-md border border-border px-3 py-1.5 text-sm text-muted hover:bg-panel-hover hover:text-foreground"
            >
              Delete class
            </button>
          </form>
        )}
      </div>

      {canEdit && (
        <div className="mt-6 max-w-md rounded-lg border border-border bg-surface p-4">
          <h2 className="text-sm font-semibold text-foreground">Rename section</h2>
          <RenameClassForm classId={cls.id} name={cls.name} />
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">Subjects</h2>
          <p className="mt-0.5 text-xs text-muted">
            {canEdit
              ? "Assign a subject teacher to each subject."
              : "Class roster with subject teachers."}
          </p>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-panel text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Subject</th>
              <th className="px-4 py-3">Subject teacher</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {subjects.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-3 font-medium text-accent-strong">{s.code}</td>
                <td className="px-4 py-3 text-foreground">{s.title}</td>
                <td className="px-4 py-3">
                  {canEdit ? (
                    <form action={setSubjectTeacher} className="flex items-center gap-2">
                      <input type="hidden" name="classSubjectId" value={s.id} />
                      <select
                        name="teacherId"
                        defaultValue={s.teacherId ?? ""}
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
                  ) : (
                    <span className="text-sm text-foreground">{s.teacherName ?? "—"}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {canEdit && s.subjectId === null && (
                    <form action={removeClassSubject}>
                      <input type="hidden" name="id" value={s.id} />
                      <button
                        type="submit"
                        className="text-sm text-muted hover:text-foreground hover:underline"
                      >
                        Remove
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
            {subjects.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-subtle">
                  No subjects in this class.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {canEdit && (
        <div className="mt-6 max-w-3xl rounded-lg border border-border bg-surface p-4">
          <h2 className="text-sm font-semibold text-foreground">Add other subject</h2>
          <AddOtherSubjectForm classId={cls.id} teachers={teachers} />
        </div>
      )}
    </div>
  );
}
