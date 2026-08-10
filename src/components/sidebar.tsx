"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  PanelLeftClose,
  PanelLeftOpen,
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  PenLine,
  ClipboardCheck,
  Landmark,
  KeyRound,
  type LucideIcon,
} from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";

const MODULE_ICONS: Record<string, LucideIcon> = {
  accounts: Users,
  curriculum: BookOpen,
  classes: GraduationCap,
  grades_submit: PenLine,
  grades_approve: ClipboardCheck,
  registrar: Landmark,
  codes: KeyRound,
};

const STORAGE_KEY = "sidebar-collapsed";

export function Sidebar({
  userName,
  userEmail,
  roleLabel,
  links,
}: {
  userName: string;
  userEmail: string;
  roleLabel: string;
  links: { href: string; label: string; module?: string }[];
}) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  function toggle() {
    setCollapsed((c) => {
      localStorage.setItem(STORAGE_KEY, c ? "0" : "1");
      return !c;
    });
  }

  const navItem =
    "mb-0.5 flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sky-100 hover:bg-slate-700";

  return (
    <aside
      className={`flex flex-col bg-slate-800 text-white transition-all ${
        collapsed ? "w-14" : "w-60"
      }`}
    >
      <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">School Portal</p>
            <p className="truncate text-xs text-sky-300">{roleLabel}</p>
          </div>
        )}
        <button
          onClick={toggle}
          title={collapsed ? "Expand panel" : "Collapse panel"}
          className="rounded-md p-1.5 text-slate-300 hover:bg-slate-700 hover:text-white"
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto p-3">
        <Link
          href="/dashboard"
          title="Dashboard"
          className={`${navItem} ${
            collapsed ? "justify-center px-2" : ""
          } mb-0.5 block bg-sky-500 font-medium text-white hover:bg-sky-600`}
        >
          <LayoutDashboard size={18} className="shrink-0" />
          {!collapsed && "Dashboard"}
        </Link>
        {links.length === 0 && !collapsed && (
          <p className="px-3 py-2 text-xs text-slate-400">
            No other modules assigned yet. Contact an admin.
          </p>
        )}
        {links.map((item) => {
          const Icon = item.module ? MODULE_ICONS[item.module] : null;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`${navItem} ${collapsed ? "justify-center px-2" : ""}`}
            >
              {Icon && <Icon size={18} className="shrink-0" />}
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-700 p-3">
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <span
              title={userName}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-400 text-sm font-bold text-white"
            >
              {userName.charAt(0)}
            </span>
            <SignOutButton compact />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-400 text-sm font-bold text-white">
              {userName.charAt(0)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{userName}</p>
              <p className="truncate text-xs text-sky-300">{userEmail}</p>
            </div>
          </div>
        )}
        {!collapsed && <SignOutButton className="mt-3 w-full" />}
      </div>
    </aside>
  );
}