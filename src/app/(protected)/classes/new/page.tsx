import Link from "next/link";
import { requireModule } from "@/lib/access";
import { listActiveTeachers, listClasses, listGradeLevels, listSubjectsByGrade } from "../actions";
import { CreateClassForm, type CreateClassData } from "../create-class-form";

export const dynamic = "force-dynamic";

export default async function NewClassPage() {
  await requireModule("classes");

  const [gradeLevels, classes, teachers] = await Promise.all([
    listGradeLevels(),
    listClasses(),
    listActiveTeachers(),
  ]);

  const subjectsByGrade: Record<string, { id: string; code: string; title: string }[]> = {};
  for (const g of gradeLevels) {
    subjectsByGrade[g.id] = await listSubjectsByGrade(g.id);
  }

  const classCounts: Record<string, number> = {};
  for (const c of classes) {
    classCounts[c.gradeLevelId] = (classCounts[c.gradeLevelId] ?? 0) + 1;
  }

  const data: CreateClassData = { gradeLevels, subjectsByGrade, classCounts, teachers };

  return (
    <div className="max-w-3xl">
      <Link href="/classes" className="text-sm text-accent-strong hover:underline">
        ← Back to classes
      </Link>
      <h1 className="mt-2 text-xl font-bold text-foreground">Create class</h1>
      <p className="mt-1 text-sm text-muted">
        You will be the class adviser. Subjects load automatically from the grade level&apos;s
        curriculum.
      </p>
      <div className="mt-6">
        <CreateClassForm data={data} />
      </div>
    </div>
  );
}
