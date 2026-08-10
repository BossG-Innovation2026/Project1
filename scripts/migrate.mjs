import { DatabaseSync } from "node:sqlite";
import { mkdirSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const migrationsDir = join(root, "migrations");
const dbPath = process.env.DEV_DB_PATH ?? join(root, "dev.sqlite");
const table = "d1_migrations";

mkdirSync(dirname(dbPath), { recursive: true });
const db = new DatabaseSync(dbPath);

db.exec(
  `CREATE TABLE IF NOT EXISTS ${table} (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     name TEXT NOT NULL UNIQUE,
     applied_at INTEGER NOT NULL
   )`
);

const applied = new Set(
  db.prepare(`SELECT name FROM ${table}`).all().map((r) => String(r.name))
);

const files = readdirSync(migrationsDir)
  .filter((f) => /^\d+_.*\.sql$/.test(f))
  .sort();

let count = 0;
for (const file of files) {
  if (applied.has(file)) continue;
  const sql = readFileSync(join(migrationsDir, file), "utf8");
  db.exec(sql);
  db.prepare(`INSERT INTO ${table} (name, applied_at) VALUES (?, ?)`).run(file, Date.now());
  console.log(`Applied ${file}`);
  count += 1;
}

if (count === 0) console.log("Already up to date.");
db.close();
