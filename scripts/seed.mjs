import { randomUUID } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { hashPassword } from "better-auth/crypto";

const now = Date.now();
const dbPath = process.env.DEV_DB_PATH ?? "dev.sqlite";
const db = new DatabaseSync(dbPath);

function user(id, name, email, role, password) {
  db.prepare(
    `INSERT INTO user (id, name, email, emailVerified, createdAt, updatedAt, role)
     VALUES (?, ?, ?, 1, ?, ?, ?)`
  ).run(id, name, email, now, now, role);
  db.prepare(
    `INSERT INTO account (id, accountId, providerId, userId, password, createdAt, updatedAt)
     VALUES (?, ?, 'credential', ?, ?, ?, ?)`
  ).run(randomUUID(), id, id, password, now, now);
}

const adminId = randomUUID();
const teacherId = randomUUID();

const pw = await hashPassword("Password123!");
user(adminId, "School Admin", "admin@school.local", "school_admin", pw);
user(teacherId, "John Dela Cruz", "teacher@school.local", "teacher", pw);

db.close();
console.log("Seeded: admin@school.local / Password123! (school_admin)");
console.log("Seeded: teacher@school.local / Password123! (teacher)");
