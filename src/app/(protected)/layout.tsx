import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { NAV_LINKS, getPermissions, ROLE_LABELS } from "@/lib/access";
import { Sidebar } from "@/components/sidebar";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const permissions = getPermissions(user);
  const links = NAV_LINKS.filter((l) => permissions.includes(l.module)).map((l) => ({
    href: l.href,
    label: l.label,
    module: l.module,
    implemented: l.implemented,
  }));

  return (
    <div className="flex min-h-full flex-1">
      <Sidebar
        userName={user.name}
        userEmail={user.email}
        roleLabel={ROLE_LABELS[user.role] ?? user.role}
        links={links}
      />
      <main className="min-w-0 flex-1">
        <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6">
          <p className="text-sm text-slate-600">School Portal</p>
          <p className="text-sm text-slate-400">Signed in as {user.email}</p>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}