import { DatabaseSync } from "node:sqlite";
import { buildSeedSql } from "./seed-sql.mjs";

const dbPath = process.env.DEV_DB_PATH ?? "dev.sqlite";
const db = new DatabaseSync(dbPath);
db.exec(await buildSeedSql());
db.close();

console.log("Local seed complete (school_settings only; no demo accounts).");