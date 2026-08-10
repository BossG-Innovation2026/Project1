import { DatabaseSync } from "node:sqlite";
import { buildSeedSql } from "./seed-sql.mjs";

const dbPath = process.env.DEV_DB_PATH ?? "dev.sqlite";
const db = new DatabaseSync(dbPath);
db.exec(await buildSeedSql());
db.close();

console.log("Seeded local DB with:");
console.log("  admin@school.local     / Password123! (super_admin)");
console.log("  admin2@school.local    / Password123! (admin)");
console.log("  teacher@school.local   / Password123! (teacher)");
console.log("  registrar@school.local / Password123! (registrar)");
console.log("  coordinator@school.local / Password123! (coordinator)");