import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">
        Signed in as <span className="font-medium text-slate-700">{user.name}</span> (
        {user.role.replace("_", " ")})
      </p>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {user.role === "school_admin" && (
          <>
            <a
              href="/admin/teachers"
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-sky-400"
            >
              <p className="text-sm font-semibold text-slate-800">Teachers</p>
              <p className="mt-1 text-xs text-slate-500">Register teacher accounts</p>
            </a>
            <a
              href="/admin/grade-levels"
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-sky-400"
            >
              <p className="text-sm font-semibold text-slate-800">Grade Levels</p>
              <p className="mt-1 text-xs text-slate-500">Create grade levels per key stage</p>
            </a>
            <a
              href="/admin/subjects"
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-sky-400"
            >
              <p className="text-sm font-semibold text-slate-800">Subjects</p>
              <p className="mt-1 text-xs text-slate-500">Offer subjects per grade level</p>
            </a>
          </>
        )}
      </div>
    </div>
  );
}
