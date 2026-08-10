import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuth } from "@/lib/auth";
import { cookies } from "next/headers";
import { SignOutButton } from "@/components/sign-out-button";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  const session = await getAuth().api.getSession({
    headers: new Headers({ cookie: cookieHeader }),
  });
  if (!session) redirect("/login");

  const role = session.user.role as string;

  const items: { href: string; label: string }[] = [];
  if (role === "school_admin") {
    items.push(
      { href: "/admin/teachers", label: "Teachers" },
      { href: "/admin/grade-levels", label: "Grade Levels" },
      { href: "/admin/tracks", label: "Tracks" },
      { href: "/admin/subjects", label: "Subjects" }
    );
  }

  return (
    <div className="flex min-h-full flex-1">
      <aside className="flex w-60 flex-col bg-slate-800 text-white">
        <div className="border-b border-slate-700 px-4 py-4">
          <p className="text-sm font-semibold">School Portal</p>
          <p className="text-xs text-sky-300">Module 0</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-3">
          <Link
            href="/dashboard"
            className="mb-1 block rounded-md bg-sky-500 px-3 py-2 text-sm font-medium text-white hover:bg-sky-600"
          >
            Dashboard
          </Link>
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="mb-0.5 block rounded-md px-3 py-2 text-sm text-sky-100 hover:bg-slate-700"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-700 p-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-400 text-sm font-bold text-white">
              {session.user.name.charAt(0)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{session.user.name}</p>
              <p className="truncate text-xs text-sky-300">{role.replace("_", " ")}</p>
            </div>
          </div>
          <SignOutButton className="mt-3 w-full" />
        </div>
      </aside>
      <main className="flex-1">
        <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6">
          <p className="text-sm text-slate-600">School Portal</p>
          <p className="text-sm text-slate-400">Signed in as {session.user.email}</p>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
