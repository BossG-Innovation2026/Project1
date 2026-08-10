import { execFileSync } from "node:child_process";
import { writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildSeedSql } from "./seed-sql.mjs";

const sql = await buildSeedSql();
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

console.log("Remote seed complete.");