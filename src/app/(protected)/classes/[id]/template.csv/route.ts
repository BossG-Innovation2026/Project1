import { requireModule } from "@/lib/access";

export const dynamic = "force-dynamic";

export async function GET() {
  await requireModule("classes");
  return new Response("LRN,Surname,Firstname,Middlename,Sex", {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="student-template.csv"',
    },
  });
}
