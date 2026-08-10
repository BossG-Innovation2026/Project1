export const ROLE_SUPER_ADMIN = "super_admin";
export const ROLE_ADMIN = "admin";
export const ROLE_TEACHER = "teacher";
export const ROLE_REGISTRAR = "registrar";
export const ROLE_COORDINATOR = "coordinator";
export const ROLE_STUDENT = "student";

export const ROLE_LABELS: Record<string, string> = {
  [ROLE_SUPER_ADMIN]: "Super Admin",
  [ROLE_ADMIN]: "Admin",
  [ROLE_TEACHER]: "Teacher",
  [ROLE_REGISTRAR]: "Registrar",
  [ROLE_COORDINATOR]: "Coordinator",
  [ROLE_STUDENT]: "Student",
};

export const MODULES = [
  { key: "accounts", label: "Account Management" },
  { key: "curriculum", label: "Curriculum Setup (Grade Levels, Tracks, Subjects)" },
  { key: "classes", label: "Class Creation" },
  { key: "grades_submit", label: "Grade Submission" },
  { key: "grades_approve", label: "Grades Approval & Reports" },
  { key: "registrar", label: "School Registrar (SF10)" },
  { key: "codes", label: "Login Codes Generation" },
] as const;

export type ModuleKey = (typeof MODULES)[number]["key"];

export const NAV_LINKS: {
  module: ModuleKey;
  href: string;
  label: string;
  implemented: boolean;
}[] = [
  { module: "accounts", href: "/accounts", label: "Account Management", implemented: true },
  { module: "curriculum", href: "/curriculum", label: "Curriculum Setup", implemented: false },
  { module: "classes", href: "/classes", label: "Class Creation", implemented: false },
  { module: "grades_submit", href: "/grades", label: "Grade Submission", implemented: false },
  { module: "grades_approve", href: "/grades/approval", label: "Grades Approval", implemented: false },
  { module: "registrar", href: "/registrar", label: "School Registrar", implemented: false },
  { module: "codes", href: "/codes", label: "Login Codes", implemented: false },
];

export interface PermissionsLike {
  role: string;
  permissions?: string | null;
}

export function parsePermissions(raw: string | null | undefined): ModuleKey[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((k) => MODULES.some((m) => m.key === k)) as ModuleKey[];
  } catch {
    return [];
  }
}

export function getPermissions(user: PermissionsLike): ModuleKey[] {
  if (user.role === ROLE_SUPER_ADMIN) {
    return MODULES.map((m) => m.key);
  }
  return parsePermissions(user.permissions);
}

export function can(user: PermissionsLike, module: ModuleKey): boolean {
  return getPermissions(user).includes(module);
}

export function isAdmin(user: Pick<PermissionsLike, "role">): boolean {
  return user.role === ROLE_SUPER_ADMIN || user.role === ROLE_ADMIN;
}

export function rolesCreatableBy(user: Pick<PermissionsLike, "role">): string[] {
  const common = [ROLE_TEACHER, ROLE_REGISTRAR, ROLE_COORDINATOR];
  if (user.role === ROLE_SUPER_ADMIN) return [...common, ROLE_ADMIN];
  if (user.role === ROLE_ADMIN) return common;
  return [];
}