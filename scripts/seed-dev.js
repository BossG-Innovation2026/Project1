// Dev/bootstrap seed for the password-confirmation repro flow.
// Usage (from repo root, after `npm run db:migrate`):
//   node scripts/seed-dev.js
// Env overrides: SEED_EMAIL, SEED_PASSWORD, SEED_NAME.
const { DatabaseSync } = require("node:sqlite");
const { randomUUID } = require("node:crypto");
const { join } = require("node:path");
const { hashPassword } = require("better-auth/crypto");

const EMAIL = (process.env.SEED_EMAIL || "repro2@school.local").toLowerCase();
const PASSWORD = process.env.SEED_PASSWORD || "ReproPass123!";
const NAME = process.env.SEED_NAME || "Repro Two";
const CLASS_ID = "22222222-3333-4444-5555-666666666666";

(async () => {
  const db = new DatabaseSync(join(__dirname, "..", "dev.sqlite"));

  const existing = db.prepare("SELECT id FROM user WHERE email = ?").get(EMAIL);
  let userId;
  if (existing) {
    userId = existing.id;
    db.prepare("UPDATE user SET role = 'teacher', permissions = ?, active = 1 WHERE id = ?").run(
      JSON.stringify(["classes", "curriculum"]),
      userId
    );
    console.log("user exists; role/permissions refreshed ->", userId);
  } else {
    userId = randomUUID();
    const now = Date.now();
    const passwordHash = await hashPassword(PASSWORD);
    db.prepare(
      "INSERT INTO user (id, name, email, emailVerified, createdAt, updatedAt, role, permissions, active) VALUES (?, ?, ?, 1, ?, ?, 'teacher', ?, 1)"
    ).run(userId, NAME, EMAIL, now, now, JSON.stringify(["classes", "curriculum"]));
    db.prepare(
      "INSERT INTO account (id, accountId, providerId, userId, password, createdAt, updatedAt) VALUES (?, ?, 'credential', ?, ?, ?, ?)"
    ).run(randomUUID(), EMAIL, userId, passwordHash, now, now);
    console.log("user created ->", userId);
  }

  for (const [id, code, title] of [
    ["sub-a", "OC11", "Oral Communication"],
    ["sub-b", "GM11", "General Mathematics"],
    ["sub-c", "ES11", "Earth and Life Science"],
  ]) {
    db.prepare(
      "INSERT OR REPLACE INTO subject (id, gradeLevelId, code, title, createdAt) VALUES (?, 'grade-11', ?, ?, ?)"
    ).run(id, code, title, Date.now());
  }

  db.prepare("DELETE FROM enrollment WHERE classId = ?").run(CLASS_ID);
  db.prepare("DELETE FROM class_subject WHERE classId = ?").run(CLASS_ID);
  db.prepare("DELETE FROM class WHERE id = ?").run(CLASS_ID);
  const now = Date.now();
  db.prepare(
    "INSERT INTO class (id, name, gradeLevelId, adviserId, createdAt) VALUES (?, 'Grade 11 - B', 'grade-11', ?, ?)"
  ).run(CLASS_ID, userId, now);
  db.prepare(
    "INSERT INTO class_subject (id, classId, subjectId, code, title, description, teacherId, term, createdAt) VALUES ('cs-a', ?, 'sub-a', 'OC11', 'Oral Communication', '', NULL, 1, ?)"
  ).run(CLASS_ID, now);
  db.prepare(
    "INSERT INTO class_subject (id, classId, subjectId, code, title, description, teacherId, term, createdAt) VALUES ('cs-b', ?, 'sub-b', 'GM11', 'General Mathematics', '', NULL, 1, ?)"
  ).run(CLASS_ID, now);

  db.close();
  console.log("seeded: subjects OC11/GM11/ES11, class 'Grade 11 - B' + 2 class_subject rows");
  console.log(`login  -> ${EMAIL} / ${PASSWORD}`);
})();