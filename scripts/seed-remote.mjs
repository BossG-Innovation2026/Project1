import { randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import { writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { hashPassword } from "better-auth/crypto";

const now = Date.now();

function user(id, name, email, role, password) {
  return [
    `INSERT INTO user (id, name, email, emailVerified, createdAt, updatedAt, role)
     VALUES ('${id}', '${name}', '${email}', 1, ${now}, ${now}, '${role}')
     ON CONFLICT (email) DO UPDATE SET role = excluded.role, name = excluded.name;`,
    `INSERT INTO account (id, accountId, providerId, userId, password, createdAt, updatedAt)
     VALUES ('${randomUUID()}', '${id}', 'credential', '${id}', '${password}', ${now}, ${now})
     ON CONFLICT DO NOTHING;`,
  ].join("\n");
}

const adminId = randomUUID();
const teacherId = randomUUID();

const pw = await hashPassword("Password123!");
const sql =
  user(adminId, "School Admin", "admin@school.local", "school_admin", pw) +
  "\n" +
  user(teacherId, "John Dela Cruz", "teacher@school.local", "teacher", pw);

const tmp = join(tmpdir(), `seed-${Date.now()}.sql`);
writeFileSync(tmp, sql);

try {
  execFileSync(
    process.execPath,
    [
      "node_modules/wrangler/bin/wrangler.js",
      "d1",
      "execute",
      "shs-db",
      "--remote",
      "--file",
      tmp,
    ],
    { stdio: "inherit", env: process.env }
  );
} finally {
  unlinkSync(tmp);
}

console.log("Remote seed complete: admin@school.local / Password123! (school_admin)");
console.log("Remote seed complete: teacher@school.local / Password123! (teacher)");