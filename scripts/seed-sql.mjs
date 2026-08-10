import { createHash } from "node:crypto";
import { hashPassword } from "better-auth/crypto";

export const SEED_PASSWORD = "Password123!";

export const SEED_ACCOUNTS = [
  {
    name: "School Super Admin",
    email: "admin@school.local",
    role: "super_admin",
    permissions: [],
  },
  {
    name: "Admin User",
    email: "admin2@school.local",
    role: "admin",
    permissions: ["dashboard", "accounts", "curriculum", "classes", "grades_approve", "registrar", "codes"],
  },
  {
    name: "Teacher User",
    email: "teacher@school.local",
    role: "teacher",
    permissions: ["dashboard", "grades_submit"],
  },
  {
    name: "Registrar User",
    email: "registrar@school.local",
    role: "registrar",
    permissions: ["dashboard", "registrar", "codes"],
  },
  {
    name: "Coordinator User",
    email: "coordinator@school.local",
    role: "coordinator",
    permissions: ["dashboard", "curriculum", "classes", "grades_approve"],
  },
];

export function stableId(prefix, value) {
  return `${prefix}_${createHash("sha256").update(value).digest("hex")}`;
}

export async function buildSeedSql() {
  const now = Date.now();
  const pw = await hashPassword(SEED_PASSWORD);

  const emails = SEED_ACCOUNTS.map((a) => `'${a.email}'`).join(", ");
  const accountIds = SEED_ACCOUNTS.map((a) => `'${stableId("a", a.email)}'`).join(", ");

  const parts = [
    `DELETE FROM account
      WHERE providerId = 'credential'
        AND userId IN (SELECT id FROM user WHERE email IN (${emails}))
        AND id NOT IN (${accountIds});`,
  ];

  for (const { name, email, role, permissions } of SEED_ACCOUNTS) {
    const perms = JSON.stringify(permissions);
    parts.push(`INSERT INTO user (id, name, email, emailVerified, createdAt, updatedAt, role, permissions, active)
      VALUES ('${stableId("u", email)}', '${name}', '${email}', 1, ${now}, ${now}, '${role}', '${perms}', 1)
      ON CONFLICT (email) DO UPDATE SET role = excluded.role, permissions = excluded.permissions, active = excluded.active, name = excluded.name;
INSERT INTO account (id, accountId, providerId, userId, password, createdAt, updatedAt)
      SELECT '${stableId("a", email)}', u.id, 'credential', u.id, '${pw}', ${now}, ${now}
      FROM user u WHERE u.email = '${email}'
      ON CONFLICT (id) DO NOTHING;`);
  }

  parts.push(`INSERT INTO school_settings (id, name, address, schoolId, principal, updatedAt)
    VALUES ('school', '', '', '', '', ${now}) ON CONFLICT (id) DO NOTHING;`);

  return parts.join("\n");
}