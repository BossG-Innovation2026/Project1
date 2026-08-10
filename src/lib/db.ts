import { DatabaseSync } from "node:sqlite";
import { getCloudflareContext } from "@opennextjs/cloudflare";

declare global {
  var __devDb: DatabaseSync | undefined;
}

export type Db = DatabaseSync | D1Database;

function getDevDb(): DatabaseSync {
  if (!globalThis.__devDb) {
    const path = process.env.DEV_DB_PATH ?? "dev.sqlite";
    globalThis.__devDb = new DatabaseSync(path);
  }
  return globalThis.__devDb;
}

/**
 * Production (Cloudflare Worker): returns the D1 binding.
 * Local (`next dev` / node): returns a plain SQLite file.
 */
export function getDatabase(): Db {
  try {
    const { env } = getCloudflareContext();
    if (env.DB) return env.DB;
  } catch {
    // not running inside a Cloudflare Worker
  }
  return getDevDb();
}

export function getEnvVar(name: string): string | undefined {
  try {
    const { env } = getCloudflareContext();
    if (name in env) return String(env[name as keyof typeof env]);
  } catch {
    // not running inside a Cloudflare Worker
  }
  return process.env[name];
}
