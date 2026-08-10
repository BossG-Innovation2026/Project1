"use client";

import { useActionState, useState } from "react";
import { createClass, type ActionState } from "./actions";

export interface CreateClassData {
  gradeLevels: { id: string; name: string }[];
  subjectsByGrade: Record<string, { id: string; code: string; title: string }[]>;
  classCounts: Record<string, number>;
  teachers: { id: string; name: string }[];
}

interface SubjectRow {
  key: number;
  subjectId: string;
  description: string;
  teacherId: string;
}

function nextSectionName(gradeName: string, count: number): string {
  return `${gradeName} - ${String.fromCharCode(65 + count)}`;
}

export function CreateClassForm({ data }: { data: CreateClassData }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(createClass, {});

  const [gradeLevelId, setGradeLevelId] = useState("");
  const [sectionName, setSectionName] = useState("");
  const [nameEdited, setNameEdited] = useState(false);
  const [rows, setRows] = useState<SubjectRow[]>([]);

  const subjects = gradeLevelId ? data.subjectsByGrade[gradeLevelId] ?? [] : [];
  const gradeName = data.gradeLevels.find((g) => g.id === gradeLevelId)?.name ?? "";

  function onGradeChange(next: string) {
    setGradeLevelId(next);
    setRows([]);
    if (!nameEdited) {
      setSectionName(nextSectionName(
        data.gradeLevels.find((g) => g.id === next)?.name ?? "",
        data.classCounts[next] ?? 0
      ));
    }
  }

  const chosenIds = new Set(rows.map((r) => r.subjectId));
  const available = subjects.filter((s) => !chosenIds.has(s.id));

  function addRow() {
    setRows((prev) => [
      ...prev,
      { key: Date.now() + Math.floor(Math.random() * 1000), subjectId: "", description: "", teacherId: "" },
    ]);
  }

  function updateRow(key: number, patch: Partial<SubjectRow>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function removeRow(key: number) {
    setRows((prev) => prev.filter((r) => r.key !== key));
  }

  return (
    <form action={action} className="max-w-3xl space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="gradeLevelId" className="mb-1 block text-sm font-medium text-foreground">
            Grade level
          </label>
          <select
            id="gradeLevelId"
            name="gradeLevelId"
            required
            value={gradeLevelId}
            onChange={(e) => onGradeChange(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
          >
            <option value="" disabled>
              Select…
            </option>
            {data.gradeLevels.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-foreground">
            Section name
          </label>
          <input
            id="name"
            name="name"
            value={sectionName}
            onChange={(e) => {
              setSectionName(e.target.value);
              setNameEdited(true);
            }}
            placeholder="e.g. Grade 11 - A"
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-subtle focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      {gradeLevelId && (
        <div className="rounded-lg border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Term 1 subjects</h2>
              <p className="mt-0.5 text-xs text-muted">
                Subjects taught in Term 1, picked from the {gradeName} curriculum. Terms 2 and 3
                can be set up later on the class page.
              </p>
            </div>
            <button
              type="button"
              onClick={addRow}
              disabled={available.length === 0}
              className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground hover:bg-panel-hover disabled:opacity-50"
            >
              Add subject
            </button>
          </div>
          {rows.length === 0 ? (
            <p className="px-4 py-6 text-sm text-subtle">
              No Term 1 subjects added yet. Click “Add subject” to pick from the curriculum.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {rows.map((row, i) => (
                <div key={row.key} className="grid grid-cols-1 gap-3 px-4 py-3 sm:grid-cols-[1fr_2fr_1fr_auto] sm:items-end">
                  <label>
                    <span className="mb-1 block text-xs text-muted">Subject</span>
                    <select
                      name={`subject_${row.key}`}
                      value={row.subjectId}
                      onChange={(e) => updateRow(row.key, { subjectId: e.target.value })}
                      className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
                    >
                      <option value="" disabled>
                        Select…
                      </option>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id} disabled={chosenIds.has(s.id)}>
                          {s.code} — {s.title}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span className="mb-1 block text-xs text-muted">Description</span>
                    <input
                      name={`desc_${row.key}`}
                      value={row.description}
                      onChange={(e) => updateRow(row.key, { description: e.target.value })}
                      placeholder="e.g. Covers functions and probability"
                      className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-subtle focus:border-accent focus:outline-none"
                    />
                  </label>
                  <label>
                    <span className="mb-1 block text-xs text-muted">Subject teacher</span>
                    <select
                      name={`teacher_${row.key}`}
                      value={row.teacherId}
                      onChange={(e) => updateRow(row.key, { teacherId: e.target.value })}
                      className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
                    >
                      <option value="">— assign later —</option>
                      {data.teachers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    onClick={() => removeRow(row.key)}
                    className="rounded-md border border-border px-3 py-2 text-sm text-muted hover:bg-panel-hover hover:text-foreground"
                  >
                    Remove
                  </button>
                  {i === rows.length - 1 && null}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {state.needsConfirm && (
        <label className="flex items-start gap-2 rounded-md border border-border bg-accent-soft p-3 text-sm text-foreground">
          <input type="checkbox" name="confirm" value="1" className="mt-0.5" />
          <span>
            I understand I will advise {gradeName} in addition to my existing class, and I still want to create it.
          </span>
        </label>
      )}
      {state.error && !state.needsConfirm && (
        <p className="rounded-md bg-accent-soft px-3 py-2 text-sm text-foreground">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-on-accent hover:bg-accent-strong disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create class"}
      </button>
    </form>
  );
}
