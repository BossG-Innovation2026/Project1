import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { NAV_LINKS, getPermissions, ROLE_LABELS } from "@/lib/access";
import { Sidebar } from "@/components/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

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
        <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-6">
          <p className="text-sm font-medium text-foreground">School Portal</p>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <p className="text-sm text-muted">Signed in as {user.email}</p>
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}