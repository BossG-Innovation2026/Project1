"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { queryAll, queryOne, runSql } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { isAdmin } from "@/lib/modules";

export interface ActionState {
  error?: string;
  needsConfirm?: boolean;
  ok?: boolean;
}

export interface ClassRow {
  id: string;
  name: string;
  gradeLevelId: string;
  gradeLevelName: string;
  adviserId: string;
  adviserName: string;
  createdAt: number;
}

export interface ClassSubjectRow {
  id: string;
  classId: string;
  subjectId: string | null;
  code: string;
  title: string;
  teacherId: string | null;
  teacherName: string | null;
  createdAt: number;
}

async function currentUser() {
  return getSessionUser();
}

async function canManageClass(user: NonNullable<Awaited<ReturnType<typeof currentUser>>>, classId: string) {
  if (isAdmin(user)) return true;
  const cls = await getClass(classId);
  return cls?.adviserId === user.id;
}

export async function listClasses(): Promise<ClassRow[]> {
  return queryAll<ClassRow>(
    `SELECT c.id, c.name, c.gradeLevelId, g.name AS gradeLevelName,
            c.adviserId, u.name AS adviserName, c.createdAt
     FROM class c
     JOIN grade_level g ON g.id = c.gradeLevelId
     JOIN user u ON u.id = c.adviserId
     ORDER BY g.sortOrder, c.name COLLATE NOCASE`
  );
}

export async function getClass(id: string): Promise<ClassRow | undefined> {
  return queryOne<ClassRow>(
    `SELECT c.id, c.name, c.gradeLevelId, g.name AS gradeLevelName,
            c.adviserId, u.name AS adviserName, c.createdAt
     FROM class c
     JOIN grade_level g ON g.id = c.gradeLevelId
     JOIN user u ON u.id = c.adviserId
     WHERE c.id = ?`,
    id
  );
}

export async function listClassSubjects(classId: string): Promise<ClassSubjectRow[]> {
  return queryAll<ClassSubjectRow>(
    `SELECT cs.id, cs.classId, cs.subjectId, cs.code, cs.title, cs.teacherId, u.name AS teacherName, cs.createdAt
     FROM class_subject cs
     LEFT JOIN user u ON u.id = cs.teacherId
     WHERE cs.classId = ?
     ORDER BY cs.title COLLATE NOCASE`,
    classId
  );
}

export async function listActiveTeachers(): Promise<{ id: string; name: string }[]> {
  return queryAll<{ id: string; name: string }>(
    `SELECT id, name FROM user WHERE role = 'teacher' AND active = 1
     ORDER BY name COLLATE NOCASE`
  );
}

export async function listGradeLevels(): Promise<{ id: string; name: string }[]> {
  return queryAll<{ id: string; name: string }>(
    `SELECT id, name FROM grade_level ORDER BY sortOrder`
  );
}

export async function listSubjectsByGrade(gradeLevelId: string): Promise<{ id: string; code: string; title: string }[]> {
  return queryAll<{ id: string; code: string; title: string }>(
    `SELECT id, code, title FROM subject WHERE gradeLevelId = ? ORDER BY title COLLATE NOCASE`,
    gradeLevelId
  );
}

async function countExisting(gradeLevelId: string): Promise<number> {
  const row = await queryOne<{ c: number }>(
    "SELECT COUNT(*) AS c FROM class WHERE gradeLevelId = ?",
    gradeLevelId
  );
  return Number(row?.c ?? 0);
}

function nextSectionName(gradeLevelName: string, count: number): string {
  const letter = String.fromCharCode(65 + count); // A, B, C...
  return `${gradeLevelName} - ${letter}`;
}

export async function createClass(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await currentUser();
  if (!user) return { error: "You are not signed in." };

  const gradeLevelId = String(formData.get("gradeLevelId") ?? "");
  const level = await queryOne<{ id: string; name: string }>(
    "SELECT id, name FROM grade_level WHERE id = ?",
    gradeLevelId
  );
  if (!level) return { error: "Choose a grade level." };

  const existingCount = await countExisting(gradeLevelId);
  const name = String(formData.get("name") ?? "").trim() || nextSectionName(level.name, existingCount);

  const existingClass = await queryOne<{ id: string }>(
    "SELECT id FROM class WHERE gradeLevelId = ? AND name = ?",
    gradeLevelId,
    name
  );
  if (existingClass) return { error: `${level.name} - ${name} already exists.` };

  const confirming = formData.get("confirm") === "1";
  const advisory = await queryOne<{ id: string; name: string }>(
    `SELECT c.id, c.name FROM class c
     JOIN grade_level g ON g.id = c.gradeLevelId
     WHERE c.adviserId = ? AND c.gradeLevelId != ?
     ORDER BY g.sortOrder LIMIT 1`,
    user.id,
    gradeLevelId
  );
  if (advisory && !confirming) {
    return {
      error: `You already advise a class (${advisory.name}). Creating this class will make you adviser of two classes.`,
      needsConfirm: true,
    };
  }

  const now = Date.now();

  const validTeacherIds = new Set((await listActiveTeachers()).map((t) => t.id));
  const assignedTeacher = (raw: string | null): string | null =>
    raw && validTeacherIds.has(raw) ? raw : null;

  const subjects = await listSubjectsByGrade(gradeLevelId);
  const curriculumCodes = new Set(subjects.map((s) => s.code));

  const otherEntries = Array.from(formData.keys())
    .filter((k) => k.startsWith("other_code_"))
    .map((k) => ({
      key: k.slice("other_code_".length),
      code: String(formData.get(k) ?? "").trim(),
    }))
    .filter((o) => o.code);
  for (const { code } of otherEntries) {
    if (curriculumCodes.has(code)) {
      return { error: `Subject ${code} already exists in ${level.name}.` };
    }
  }

  const classId = randomUUID();
  await runSql(
    "INSERT INTO class (id, name, gradeLevelId, adviserId, createdAt) VALUES (?, ?, ?, ?, ?)",
    classId,
    name,
    gradeLevelId,
    user.id,
    now
  );

  const usedCodes = new Set(curriculumCodes);

  for (const s of subjects) {
    const teacherId = assignedTeacher(String(formData.get(`teacher_${s.id}`) ?? "") || null);
    await runSql(
      "INSERT INTO class_subject (id, classId, subjectId, code, title, teacherId, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
      randomUUID(),
      classId,
      s.id,
      s.code,
      s.title,
      teacherId,
      now
    );
  }

  for (const { key, code } of otherEntries) {
    usedCodes.add(code);
    const title = String(formData.get(`other_title_${key}`) ?? "").trim();
    const teacherId = assignedTeacher(String(formData.get(`other_teacher_${key}`) ?? "") || null);
    await runSql(
      "INSERT INTO class_subject (id, classId, subjectId, code, title, teacherId, createdAt) VALUES (?, ?, NULL, ?, ?, ?, ?)",
      randomUUID(),
      classId,
      code,
      title,
      teacherId,
      now
    );
  }

  revalidatePath("/classes");
  revalidatePath("/classes/new");
  return { ok: true };
}

export async function setSubjectTeacher(formData: FormData): Promise<void> {
  const user = await currentUser();
  if (!user) return;

  const classSubjectId = String(formData.get("classSubjectId") ?? "");
  const teacherId = String(formData.get("teacherId") ?? "") || null;

  const row = await queryOne<{ classId: string }>(
    "SELECT classId FROM class_subject WHERE id = ?",
    classSubjectId
  );
  if (!row) return;
  if (!(await canManageClass(user, row.classId))) return;

  await runSql("UPDATE class_subject SET teacherId = ? WHERE id = ?", teacherId, classSubjectId);
  revalidatePath(`/classes/${row.classId}`);
}

export async function addOtherSubject(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await currentUser();
  if (!user) return { error: "You are not signed in." };

  const classId = String(formData.get("classId") ?? "");
  if (!(await canManageClass(user, classId))) {
    return { error: "You can only manage classes you advise." };
  }

  const code = String(formData.get("code") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const teacherId = String(formData.get("teacherId") ?? "") || null;

  if (!code) return { error: "Subject code is required." };
  if (!title) return { error: "Subject title is required." };

  const clash = await queryOne<{ id: string }>(
    "SELECT id FROM class_subject WHERE classId = ? AND code = ?",
    classId,
    code
  );
  if (clash) return { error: `Subject ${code} already exists in this class.` };

  await runSql(
    "INSERT INTO class_subject (id, classId, subjectId, code, title, teacherId, createdAt) VALUES (?, ?, NULL, ?, ?, ?, ?)",
    randomUUID(),
    classId,
    code,
    title,
    teacherId,
    Date.now()
  );

  revalidatePath(`/classes/${classId}`);
  return { ok: true };
}

export async function removeClassSubject(formData: FormData): Promise<void> {
  const user = await currentUser();
  if (!user) return;

  const id = String(formData.get("id") ?? "");
  const row = await queryOne<{ classId: string }>("SELECT classId FROM class_subject WHERE id = ?", id);
  if (!row) return;
  if (!(await canManageClass(user, row.classId))) return;

  await runSql("DELETE FROM class_subject WHERE id = ?", id);
  revalidatePath(`/classes/${row.classId}`);
}

export async function deleteClass(formData: FormData): Promise<void> {
  const user = await currentUser();
  if (!user) return;

  const id = String(formData.get("id") ?? "");
  if (!(await canManageClass(user, id))) return;

  await runSql("DELETE FROM class WHERE id = ?", id);
  revalidatePath("/classes");
}

export async function renameClass(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await currentUser();
  if (!user) return { error: "You are not signed in." };

  const classId = String(formData.get("classId") ?? "");
  const cls = await getClass(classId);
  if (!cls) return { error: "Class not found." };
  if (!(await canManageClass(user, classId))) {
    return { error: "You can only manage classes you advise." };
  }

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Section name is required." };

  const clash = await queryOne<{ id: string }>(
    "SELECT id FROM class WHERE gradeLevelId = ? AND name = ? AND id != ?",
    cls.gradeLevelId,
    name,
    classId
  );
  if (clash) return { error: `A class named ${name} already exists in ${cls.gradeLevelName}.` };

  await runSql("UPDATE class SET name = ? WHERE id = ?", name, classId);
  revalidatePath("/classes");
  revalidatePath(`/classes/${classId}`);
  return { ok: true };
}
