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

type DbValue = string | number | bigint | null | Uint8Array;

export async function runSql(sql: string, ...params: DbValue[]): Promise<unknown> {
  const db = getDatabase();
  if ("batch" in db) {
    return await db.prepare(sql).bind(...params).run();
  }
  return db.prepare(sql).run(...params);
}

export async function queryAll<T>(sql: string, ...params: DbValue[]): Promise<T[]> {
  const db = getDatabase();
  if ("batch" in db) {
    return (await db.prepare(sql).bind(...params).all()).results as T[];
  }
  const rows = db.prepare(sql).all(...params) as T[];
  return rows.map((row) => ({ ...(row as Record<string, unknown>) }) as T);
}

export async function queryOne<T>(sql: string, ...params: DbValue[]): Promise<T | undefined> {
  const rows = await queryAll<T>(sql, ...params);
  return rows[0];
}
